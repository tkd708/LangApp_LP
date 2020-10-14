const speech = require('@google-cloud/speech');    
const axios = require('axios')
require('dotenv').config();

const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const fsp = fs.promises;

module.exports.handler = async function(event, context) {
  
    // in env settings of Netlify UI line breaks are forced to become \\n... converting them back by .replace(s)
    const keys = {
        type: process.env.GATSBY_type,
        project_id: process.env.GATSBY_project_id,
        private_key_id: process.env.GATSBY_private_key_id,
        private_key: process.env.GATSBY_private_key.replace(/\\n/gm, "\n"), 
        client_email: process.env.GATSBY_client_email,
        client_id: process.env.GATSBY_client_id,
        auth_uri: process.env.GATSBY_auth_uri,
        token_uri: process.env.GATSBY_token_uri,
        auth_provider_x509_cert_url: process.env.GATSBY_auth_provider_x509_cert_url,
        client_x509_cert_url: process.env.GATSBY_client_x509_cert_url
    };

    const client = new speech.SpeechClient({credentials: keys});

    // filesystem example
    //const resolved = "/tmp/test.json";
    //const testJSON = {'text':'test test test'}
    //await fsp.writeFile(resolved, JSON.stringify(testJSON));
    //const testText = await fsp.readFile(resolved);
    //const testParsed = JSON.parse(testText)
    //await fsp.unlink(resolved)

    // test locally
    //const resolved = "./lambda/api/Recording (5).m4a";
    //const testFile = await fsp.readFile(resolved);
    //const test64 = testFile.toString('base64');
    //const decodedAudio = new Buffer(test64, 'base64');
    //const decodedPath = './lambda/api/decodedTest.m4a';
    //await fsp.writeFile(decodedPath, decodedAudio);
    //const encodedPath = './lambda/api/encodedTest.m4a';

    // in Netlify functions
    //console.log(event.body.audio.content.slice(0, 100))
    const decodedAudio = new Buffer.from(JSON.parse(event.body).audio.content, 'base64');
    const decodedPath = '/tmp/decoded.wav';
    await fsp.writeFile(decodedPath, decodedAudio);
    const decodedFile = await fsp.readFile(decodedPath);
    console.log('received and read audio: '+ decodedFile.toString('base64').slice(0,100))
    const encodedPath = '/tmp/encoded.wav';

    ffmpeg()
        .input(decodedPath)
        .outputOptions([
            '-f s16le',
            '-acodec pcm_s16le',
            '-vn',
            '-ac 1',
            '-ar 41k',
            '-map_metadata -1',
        ])
        .save(encodedPath)
        .on('end', async (resolve) => {
            console.log('resolve: ' + resolve)
            // encoded file cannot be read outside of the scope?
            const savedFile = await fsp.readFile(encodedPath);
            console.log('encoded audio: '+ savedFile.toString('base64').slice(0,100))
            const audioBytes = savedFile.toString('base64');
            console.log(audioBytes.slice(0,100))

            const audio = {
                content: audioBytes
            };

            const sttConfig = {
        enableAutomaticPunctuation: false,
        encoding: 'LINEAR16',
        sampleRateHertz: 41000,
        languageCode: 'en_US', // ja-JP, en-US, es-CO, fr-FR
        model: 'default', // default, phone_call
    };

        const request = {
            audio: audio,
            config: sttConfig,
        };
    //const [response] = await client.recognize(request);
    //console.log(response);

    //const transcription = response.results
    //    .map((result) => result.alternatives[0].transcript)
    //    .join('\n');

    //console.log(`Transcription: ${transcription}`);
        })
    //await fsp.unlink(decodedPath)
    //await fsp.unlink(encodedPath)



    const audio = {
            content:'audioBytes',
        };

    const sttConfig = {
        enableAutomaticPunctuation: false,
        encoding: 'LINEAR16',
        sampleRateHertz: 41000,
        languageCode: 'en_US', // ja-JP, en-US, es-CO, fr-FR
        //enableSpeakerDiarization: true,
        //diarizationSpeakerCount: 2, // no. of speakers
        model: 'default', // default, phone_call
    };

        const request = {
            audio: audio,
            config: sttConfig,
        };

    //const [response] = await client.recognize(event.body);
    const [response] = await client.recognize(request);
    //console.log(response);

    const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join('\n');

    //console.log(`Transcription: ${transcription}`);
        

  return {
    statusCode: 200, // http status code
    body: JSON.stringify({
        //test: decodedFile,
        //keys: keys,
        //encode: buff,
        //filePath: revolved,
        request: event.body,
        //client: client,
        //response: response,
      transcript: transcription
    })
  }
}


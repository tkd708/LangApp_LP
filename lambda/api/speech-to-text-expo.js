const speech = require('@google-cloud/speech');    
const axios = require('axios')
require('dotenv').config();

const path = require("path")
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);


module.exports.handler = async function(event, context) {
  //console.log("queryStringParameters", event.queryStringParameters)

  
    //const fileName = "Encoded.m4a"
    //const resolved = (process.env.LAMBDA_TASK_ROOT)? path.resolve(process.env.LAMBDA_TASK_ROOT, fileName): './lambda/api/'+ fileName
    //console.log(resolved)
    
    //const savedFile = fs.readFileSync(require.resolve('./Encoded.m4a'))
    //const buff = new Buffer(event.body.audio.content, 'base64');
    //console.log(buff);
    //var snd = new Audio("data:audio/wav;base64," + event.body.audio.content);
    //snd.play();
    //console.log(snd);
    //const savedFile = fs.readFileSync(resolved);
    //const savedFile = fs.readFileSync(encodedPath);
    //const audioBytes = savedFile.toString('base64');
    //const audio = {
    //    content: audioBytes,
    //};

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

    //console.log('test' + keys)
    const client = new speech.SpeechClient({credentials: keys});

    const audio = {
            content: 'recordString',
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


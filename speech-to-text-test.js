// For more info, check https://www.netlify.com/docs/functions/#javascript-lambda-functions
module.exports.handler = async function(event, context) {
  //console.log("queryStringParameters", event.queryStringParameters)

    const keysEnvVar = process.env['CREDS'];
    console.log(keysEnvVar)

    //const speech = require('@google-cloud/speech');
    const fs = require('fs');
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg.setFfmpegPath(ffmpegPath);
    const axios = require('axios');

    // Creates a client
    //const client = new speech.SpeechClient();
    //const client = new speech.SpeechClient({credentials: keys});

    // The name of the audio file to transcribe
    const path = './Recording (5).m4a';
    const encodedPath = './Encoded.m4a';
    //const file = fs.createWriteStream(path);

    //file.on('error', (err) => console.error(err));

    //console.log(file);

    ffmpeg()
        .input(path)
        .outputOptions([
            '-f s16le',
            '-acodec pcm_s16le',
            '-vn',
            '-ac 1',
            '-ar 41k',
            '-map_metadata -1',
        ])
        .save(encodedPath)
        .on('end', async () => {
            const savedFile = fs.readFileSync(encodedPath);

            //console.log(savedFile);

            const audioBytes = savedFile.toString('base64');
            const audio = {
                content: audioBytes,
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

            //const [response] = await client.recognize(request);
            //console.log(response.results.alternatives[0]);

            //const transcription = response.results
            //    .map((result) => result.alternatives[0].transcript)
            //    .join('\n');

            //console.log(`Transcription: ${transcription}`);



  return {
    statusCode: 200, // http status code
    body: JSON.stringify({
      msg: "Hello, World! This is better " + Math.round(Math.random() * 10),
      txt: "sample text"
    })
  }
}

// Now you are ready to access this API from anywhere in your Gatsby app! For example, in any event handler or lifecycle method, insert:
// fetch("/.netlify/functions/hello")
//    .then(response => response.json())
//    .then(console.log)
// For more info see: https://www.gatsbyjs.org/blog/2018-12-17-turning-the-static-dynamic/#static-dynamic-is-a-spectrum

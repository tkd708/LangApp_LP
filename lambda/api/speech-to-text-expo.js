const speech = require('@google-cloud/speech');    
const axios = require('axios')
require('dotenv').config();

const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

module.exports.handler = async function(event, context) {
  //console.log("queryStringParameters", event.queryStringParameters)

    const keys = {
        type: process.env['type'],
        project_id: process.env['project_id'],
        private_key_id: process.env['private_key_id'],
        private_key: process.env['private_key'],
        client_email: process.env['client_email'],
        client_id: process.env['client_id'],
        auth_uri: process.env['auth_uri'],
        token_uri: process.env['token_uri'],
        auth_provider_x509_cert_url: process.env['auth_provider_x509_cert_url'],
        client_x509_cert_url: process.env['client_x509_cert_url']
    };
    
    //console.log('test' + keys)
    const client = new speech.SpeechClient({credentials: keys});
    //console.log(client)

    ffmpeg.setFfmpegPath(ffmpegPath);
    const path = './lambda/api/Recording (5).m4a';
    const encodedPath = './lambda/api/Encoded.m4a';
    const file = fs.readFileSync(path);

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
                audio: 'audio',
                config: sttConfig,
            };

            const [response] = await client.recognize(request);
            //console.log(response.results.alternatives[0]);

            const transcription = response.results
                .map((result) => result.alternatives[0].transcript)
                .join('\n');

            console.log(`Transcription: ${transcription}`);
        

  return {
    statusCode: 200, // http status code
    body: JSON.stringify({
      eventHeaders: event.headers,
      eventBody: event.body,
      eventRequest: event.queryStringParameters,
      msg: "google api keys",
      Transcription: transcription
    })
  }
}


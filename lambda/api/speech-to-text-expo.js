require('dotenv').config();
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fsp = fs.promises;
const speech = require('@google-cloud/speech');    

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

    const decodedAudio = new Buffer.from(JSON.parse(event.body).audio.content, 'base64');
    const decodedPath = '/tmp/decoded.wav';
    await fsp.writeFile(decodedPath, decodedAudio);
    //fs.writeFileSync(decodedPath, decodedAudio);
    const decodedFile = await fsp.readFile(decodedPath);
    console.log('received and read audio: '+ decodedFile.toString('base64').slice(0,100))
    const encodedPath = '/tmp/encoded.wav';

    const getTranscript = async() => {
        const ffmpeg_encode_audio = () => {
            return new Promise((resolve, reject)=>{
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
            })
        }
    
        await ffmpeg_encode_audio()
    
        //const audio_encoded = fs.readFileSync(encodedPath).toString('base64');
        const audio_encoded = await fsp.readFile(encodedPath).toString('base64');
        console.log('encoded audio: ' + audio_encoded.slice(0,100));

            const audio = {
                content: audio_encoded
            };

            const sttConfig = {
                enableAutomaticPunctuation: false,
                encoding: 'LINEAR16',
                sampleRateHertz: 41000,
                languageCode: 'en_US', // ja-JP, en-US, es-CO, fr-FR
                model: 'default', // default, phone_call
            }

            const request = {
                audio: audio,
                config: sttConfig,
            };
            const [response] = await client.recognize(request);
            console.log(response);

            const transcription = response.results
                .map((result) => result.alternatives[0].transcript)
                .join('\n');

            console.log(`Transcription: ${transcription}`);
        }
    //await fsp.unlink(decodedPath)
    //await fsp.unlink(encodedPath)    

    getTranscript()

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
      transcript: "transcription"
    })
  }
}


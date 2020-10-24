require('dotenv').config();
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fsp = fs.promises;
const speech = require('@google-cloud/speech');    

module.exports.handler = async function(event, context) {
    var t = new Date
    console.log('API started on: ' + t.toLocaleTimeString({ second: '2-digit' }))

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
   
    const decodedAudio = new Buffer.from(JSON.parse(event.body).audio, 'base64');
    const decodedPath = '/tmp/decoded.wav';
    await fsp.writeFile(decodedPath, decodedAudio);
    fs.writeFileSync(decodedPath, decodedAudio);
    const decodedFile = await fsp.readFile(decodedPath);
    console.log('received and read audio: '+ decodedFile.toString('base64').slice(0,100))
    const encodedPath = '/tmp/encoded.wav';

    const getTranscript = async() => {
            var t = new Date
            console.log('Encoding started on: ' + t.toLocaleTimeString({ second: '2-digit' }))

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
                    .on('end', async () => {
                        console.log('encoding done');
                        resolve();
                    })
            })
        }
            
        await ffmpeg_encode_audio()
        
        var t = new Date
        console.log('Encoding done: ' + t.toLocaleTimeString({ second: '2-digit' }))

        const audio_encoded = await fsp.readFile(encodedPath);
        //console.log('encoded audio: ' + audio_encoded.toString('base64').slice(0,100));

        const audio = {
            content: audio_encoded.toString('base64')
        };

        const sttConfig = {
            enableAutomaticPunctuation: false,
            encoding: 'LINEAR16',
            sampleRateHertz: 41000,
            languageCode: JSON.parse(event.body).lang, // ja-JP, en-US, es-CO, fr-FR
            model: 'default', // default, phone_call
        }

        const request = {
            audio: audio,
            config: sttConfig,
        };

        var t = new Date
        console.log('Transcription started on: ' + t.toLocaleTimeString({ second: '2-digit' }))
        const [response] = await client.recognize(request);
        console.log(response);

        const transcription = response.results
            .map((result) => result.alternatives[0].transcript)
            .join('\n');

        //console.log(`Transcription: ${transcription}`);
        var t = new Date
        console.log('Transcription done: ' + t.toLocaleTimeString({ second: '2-digit' }))
        
        return transcription
    }
    const transcript = await getTranscript()
    //console.log(`Transcription out of the scope: ${transcript}`);
    //await fsp.unlink(decodedPath)
    //await fsp.unlink(encodedPath)    

  return {
    statusCode: 200, // http status code
    body: JSON.stringify({
        request: event.body,
        transcript: transcript
    })
  }
}


require( 'dotenv' ).config();
const fs = require( 'fs' );
const ffmpegPath = require( '@ffmpeg-installer/ffmpeg' ).path;
const ffmpeg = require( 'fluent-ffmpeg' );
ffmpeg.setFfmpegPath( ffmpegPath );
const fsp = fs.promises;
const speech = require( '@google-cloud/speech' ).v1p1beta1;

module.exports.handler = async function ( event, context ) {

    // avoid CORS errors
    if( event.httpMethod == "OPTIONS" ) {
        console.log( "OPTIONS query received" );
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            'body': "Done"
        }
    }

    // for actual POST query
    if( event.httpMethod == "POST" ) {

        var t = new Date
        console.log( 'API started on: ' + t.toLocaleTimeString( { second: '2-digit' } ) )

        // in env settings of Netlify UI line breaks are forced to become \\n... converting them back by .replace(s)
        const keys = {
            type: process.env.GATSBY_type,
            project_id: process.env.GATSBY_project_id,
            private_key_id: process.env.GATSBY_private_key_id,
            private_key: process.env.GATSBY_private_key.replace( /\\n/gm, "\n" ),
            client_email: process.env.GATSBY_client_email,
            client_id: process.env.GATSBY_client_id,
            auth_uri: process.env.GATSBY_auth_uri,
            token_uri: process.env.GATSBY_token_uri,
            auth_provider_x509_cert_url: process.env.GATSBY_auth_provider_x509_cert_url,
            client_x509_cert_url: process.env.GATSBY_client_x509_cert_url
        };

        const client = new speech.SpeechClient( { credentials: keys } );

        const decodedAudio = new Buffer.from( JSON.parse( event.body ).audio, 'base64' );
        const decodedPath = '/tmp/decoded.wav';
        await fsp.writeFile( decodedPath, decodedAudio );
        fs.writeFileSync( decodedPath, decodedAudio );
        const decodedFile = await fsp.readFile( decodedPath );
        console.log( 'received and read audio: ' + decodedFile.toString( 'base64' ).slice( 0, 100 ) )
        const encodedPath = '/tmp/encoded.wav';


        const getTranscript = async () => {
            var t = new Date
            console.log( 'Encoding started on: ' + t.toLocaleTimeString( { second: '2-digit' } ) )

            const ffmpeg_encode_audio = () => {
                return new Promise( ( resolve, reject ) => {
                    ffmpeg()
                        .input( decodedPath )
                        .outputOptions( [
                            '-f s16le',
                            '-acodec pcm_s16le',
                            '-vn',
                            '-ac 1',
                            '-ar 41k',
                            '-map_metadata -1',
                        ] )
                        .save( encodedPath )
                        .on( 'end', async () => {
                            console.log( 'encoding done' );
                            resolve();
                        } )
                } )
            }

            await ffmpeg_encode_audio()

            var t = new Date
            console.log( 'Encoding done: ' + t.toLocaleTimeString( { second: '2-digit' } ) )

            const audio_encoded = await fsp.readFile( encodedPath );
            //console.log('encoded audio: ' + audio_encoded.toString('base64').slice(0,100));

            const audio = {
                content: audio_encoded.toString( 'base64' )
            };

            const sttConfig = {
                enableAutomaticPunctuation: false,
                encoding: 'LINEAR16',
                sampleRateHertz: 41000,
                languageCode: JSON.parse( event.body ).lang, // ja-JP, en-US, es-CO, fr-FR
                enableSpeakerDiarization: true,
                diarizationSpeakerCount: 2, // no. of speakers
                model: 'phone_call', // default, phone_call
            }

            const request = {
                audio: audio,
                config: sttConfig,
            };

            console.log( '---------------------------------------------------------' );
            var t = new Date
            console.log( 'Transcription started on: ' + t.toLocaleTimeString( { second: '2-digit' } ) )

            const [ response ] = await client.recognize( request );

            console.log( '---------------------------------------------------------' );
            const transcription = response.results
                .map( ( result ) => result.alternatives[ 0 ].transcript )
                .join( '\n' );

            console.log( `Transcription: ${ transcription }` );

            console.log( '---------------------------------------------------------' );
            console.log( 'Speaker Diarization:' );
            const result = response.results[ response.results.length - 1 ];
            const wordsInfo = result.alternatives[ 0 ].words;
            const transcript1 = [];
            const transcript2 = [];
            wordsInfo.forEach( ( a ) =>
                //console.log(a)
                //console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}, start: ${a.startTime.seconds}.${a.startTime.nanos}, end: ${a.endTime.seconds}.${a.endTime.nanos}`)
                ( a.speakerTag == 1 )
                    ? transcript1.push( a.word )
                    : transcript2.push( a.word )
            );
            console.log( 'Speaker 1: ' + transcript1.join( ' ' ) )
            console.log( 'Speaker 2: ' + transcript2.join( ' ' ) )

            console.log( '---------------------------------------------------------' );
            console.log( 'Word analysis:' );
            console.log( transcript1.length );
            const uniq1 = [ ...new Set( transcript1 ) ];
            const uniq2 = [ ...new Set( transcript2 ) ];
            console.log( uniq1.length );
            console.log( uniq2.length );

            //console.log(`Transcription: ${transcription}`);
            console.log( '---------------------------------------------------------' );
            var t = new Date
            console.log( 'Transcription done: ' + t.toLocaleTimeString( { second: '2-digit' } ) )

            const transcription_both = {
                speaker1: transcript1.join( ' ' ),
                speaker2: transcript2.join( ' ' )
            }

            return transcription_both
        }


        const transcript_both = await getTranscript()
        //console.log(`Transcription out of the scope: ${transcript}`);
        //await fsp.unlink(decodedPath)
        //await fsp.unlink(encodedPath)    

        return {
            statusCode: 200, // http status code
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify( {
                request: event.body,
                transcript: transcript_both
            } )
        }

    }
}


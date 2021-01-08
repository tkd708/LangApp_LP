require( 'dotenv' ).config();
const line = require( '@line/bot-sdk' );
const client = new line.Client( {
    channelAccessToken: process.env.GATSBY_LINE_accesstoken,
    channelSecret: process.env.GATSBY_LINE_channelsecret
} );

const fs = require( 'fs' );
const ffmpegPath = require( '@ffmpeg-installer/ffmpeg' ).path;
const ffmpeg = require( 'fluent-ffmpeg' );
ffmpeg.setFfmpegPath( ffmpegPath );
const fsp = fs.promises;


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

    let body = JSON.parse( event.body );

    console.log( 'received audio...', body.audioString );
    console.log( 'ffmpeg path >>>> ', ffmpegPath );

    // Encoding wav audio to m4a
    const decodedAudio = new Buffer.from( JSON.parse( event.body ).audioString, 'base64' );
    const decodedPath = '/tmp/decoded.wav';
    await fsp.writeFile( decodedPath, decodedAudio );

    const decodedFile = await fsp.readFile( decodedPath );
    console.log( 'received and read audio: ' + decodedFile.toString( 'base64' ).slice( 0, 100 ) )

    const encodedPath = '/tmp/encoded.m4a';
    const ffmpeg_encode_audio = () => {
        return new Promise( ( resolve, reject ) => {
            ffmpeg()
                .input( decodedPath )
                .outputOptions( [
                    '-f s16le',
                    '-acodec pcm_s16le',
                    '-vn',
                    '-ac 1',
                    '-ar 16k', //41k or 16k
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



    const audio = {
        'type': 'audio',
        'originalContentUrl': body.transcript,
        'duration': 10000,
    };
    //await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", audio )
    //    .then( ( response ) => {
    //        console.log( 'audio push message attempted...', response );
    //    } )
    //    .catch( ( err ) => console.log( 'error in audio push message...', err ) );
    //console.log( 'audio push message event executed' );


    console.log( 'received transcript...', body.transcript );
    const message = {
        'type': 'text',
        'text': body.transcript
    };
    await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", message )
        .then( ( response ) => {
            console.log( 'transcript push message attempted...', response );
        } )
        .catch( ( err ) => console.log( 'error in transcript push message...', err ) );
    console.log( 'transcript push message event executed' );


    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );
};
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

const AWS = require( 'aws-sdk' );


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

    const body = JSON.parse( event.body );

    console.log( 'app ID...', body.appID );
    console.log( 'recording ID...', body.recordingID );
    console.log( 'received audio...', body.audioString );

    // Encoding wav audio to m4a... maybe not necessary
    const decodedAudio = new Buffer.from( body.audioString, 'base64' );
    const decodedPath = '/tmp/decoded.wav';
    await fsp.writeFile( decodedPath, decodedAudio );

    const encodedPath = '/tmp/encoded.m4a';
    const ffmpeg_encode_audio = () => {
        return new Promise( ( resolve, reject ) => {
            ffmpeg()
                .input( decodedPath )
                .outputOptions( [
                    '-f s16le',
                    '-acodec pcm_s16le', /// GCP >> pcm_s16le, LINE(m4a) >> libfaac?
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

    // initialise AWS
    AWS.config = new AWS.Config( {
        accessKeyId: process.env.GATSBY_AWS_accessKey,
        secretAccessKey: process.env.GATSBY_AWS_secretKey,
        region: 'us-east-2',
    } );

    // Create S3 service object
    const s3 = new AWS.S3( {
        apiVersion: '2006-03-01',
        params: { Bucket: 'langapp-audio-analysis' }
    } );

    // S3 Upload parameters
    const uploadParams = { Bucket: 'langapp-audio-analysis', Key: '', Body: '' };

    const date = new Date().toISOString().substr( 0, 19 ).replace( 'T', ' ' ).slice( 0, 10 );
    const time = new Date().toISOString().substr( 0, 19 ).replace( 'T', ' ' ).slice( -8 );
    uploadParams.Key = `${ date }-${ body.appID }-${ body.recordingID }/audio-${ time }.m4a`;

    const encodedFile = await fsp.readFile( encodedPath );
    uploadParams.Body = encodedFile;

    // call S3 to retrieve upload file to specified bucket
    const fileURL = await s3.upload( uploadParams )
        .promise()
        .then( ( data ) => {
            console.log( "Successfully uploaded", data )
            return ( data.Location );
        } )
        .catch(
            ( err ) => {
                console.error( "Upload error", err );
            } );
    console.log( 's3 file url...', fileURL );


    // push message of audio
    const audio = {
        'type': 'audio',
        'originalContentUrl': fileURL,
        'duration': 30000,
    };
    const audioPushRes = await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", audio, notificationDisabled = true )
        .then( ( res ) => {
            console.log( 'audio push message attempted...', res );
            return ( res )
        } )
        .catch( ( err ) => {
            console.log( 'error in audio push message...', err )
            return ( err )
        } );
    console.log( 'audio push message event executed...', audioPushRes );


    // push message of transcript
    console.log( 'received transcript...', body.transcript );
    const message = {
        'type': 'text',
        'text': body.transcript
    };
    await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", message, notificationDisabled = true )
        .then( ( response ) => {
            console.log( 'transcript push message attempted...', response );
        } )
        .catch( ( err ) => console.log( 'error in transcript push message...', err ) );
    console.log( 'transcript push message event executed' );


    // success of API
    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );
};
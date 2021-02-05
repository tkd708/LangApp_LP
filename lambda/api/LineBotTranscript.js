require( 'dotenv' ).config();
const axios = require( 'axios' );

const line = require( '@line/bot-sdk' );
const client = new line.Client( {
    channelAccessToken: process.env.GATSBY_LINE_accesstoken,
    channelSecret: process.env.GATSBY_LINE_channelsecret
} );

const fs = require( 'fs' );
const fsp = fs.promises;

const ffmpegPath = require( '@ffmpeg-installer/ffmpeg' ).path;
const ffmpeg = require( 'fluent-ffmpeg' );
ffmpeg.setFfmpegPath( ffmpegPath );
const ffprobePath = require( '@ffprobe-installer/ffprobe' ).path;
ffmpeg.setFfprobePath( ffprobePath );

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

    console.log( 'line id token...', body.lineIdToken );
    console.log( 'recording ID...', body.recordingID );
    console.log( 'received audio...', body.audioString );
    console.log( 'received audio string length...' + body.audioString.length );

    ///////////////// Get LINE user info using ID token
    var qs = require( 'qs' );
    const userLineData = await axios
        .request( {
            url: 'https://api.line.me/oauth2/v2.1/verify',
            method: 'POST',
            data: qs.stringify( {
                id_token: body.lineIdToken,
                client_id: process.env.GATSBY_LINE_LIFF_Channel_ID,
            } ),
        } )
        .then( res => {
            console.log( 'Success in geting LINE user info using id token...' + res.data )
            return ( res.data )
        } )
        .catch( err => {
            console.log( 'Error in geting LINE user info using id token...', err )
            return ( err )
        } );
    const userLineId = userLineData.sub;
    const userLineName = userLineData.name;




    /////////////////////// Encoding wav audio to m4a
    const decodedAudio = new Buffer.from( body.audioString, 'base64' );
    const decodedPath = '/tmp/decoded.wav';
    await fsp.writeFile( decodedPath, decodedAudio );
    const decodedFile = await fsp.readFile( decodedPath );
    console.log( 'received and read audio: ' + decodedFile.toString( 'base64' ) )
    console.log( 'received and read audio length: ' + decodedFile.toString( 'base64' ).length )

    const ffmpeg_checkMetaData = ( filePath ) => {
        return new Promise( ( resolve, reject ) => {
            ffmpeg()
                .input( filePath )
                .ffprobe( ( err, data ) => {
                    if( err ) resolve( err );
                    //console.log( data );
                    resolve( data );
                } )
        } )
    }
    const metadata = await ffmpeg_checkMetaData( decodedPath );
    console.log( 'ffmpeg metadata of decoded audio...', metadata );

    const encodedPath = '/tmp/encoded.m4a';
    const ffmpeg_encode_audio = () => {
        return new Promise( ( resolve, reject ) => {
            ffmpeg()
                .input( decodedPath )
                .outputOptions( [
                    //'-f s16le',
                    '-acodec aac', /// GCP >> pcm_s16le, LINE(m4a) >> aac
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
    const encodedFile = await fsp.readFile( encodedPath );
    console.log( 'converted audio: ' + encodedFile.toString( 'base64' ).slice( 0, 100 ) )
    console.log( 'converted audio length: ' + encodedFile.toString( 'base64' ).length )

    const metadata1 = await ffmpeg_checkMetaData( encodedPath );
    console.log( 'ffmpeg metadata of encoded audio...', metadata1 );


    ////////////////////////// initialise AWS
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
    uploadParams.Key = `${ date }-${ userLineName }-${ body.recordingID }/audio-${ time }.m4a`;
    uploadParams.Body = encodedFile;

    // call S3 to retrieve upload file to specified bucket and obtain the file url
    const fileURL = await s3.upload( uploadParams )
        .promise()
        .then( ( data ) => {
            console.log( "Audio chunk successfully uploaded to S3", data )
            return ( data.Location );
        } )
        .catch( err => console.log( "Audio chunk upload to S3 error", err ) );
    console.log( 's3 file url...', fileURL );




    ///////////////// push message of audio
    const audio = {
        'type': 'audio',
        'originalContentUrl': fileURL, //fileURL,
        'duration': metadata.streams[ 0 ].duration, //body.audioInterval,
    };
    await client.pushMessage( userLineId, audio, notificationDisabled = true )
        .then( res => console.log( 'audio push message successful...', res ) )
        .catch( err => console.log( 'error in audio push message...', err ) );


    /////////////// push message of transcript
    console.log( 'received transcript...', body.transcript );
    const message = {
        'type': 'text',
        'text': body.transcript
    };
    await client.pushMessage( userLineId, message, notificationDisabled = true )
        .then( res => console.log( 'transcript push message successful...', res ) )
        .catch( err => console.log( 'error in transcript push message...', err ) );


    // success of API
    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );
};
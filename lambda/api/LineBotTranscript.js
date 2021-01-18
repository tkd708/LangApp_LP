require( 'dotenv' ).config();
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


    ///////////////// Get LINE user ID from dynamoDB corresponding to the user name (appID) input by the user on LP
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: 'LangAppUsers',
        KeyConditionExpression: 'UserName = :UserName ',
        ExpressionAttributeValues: { ':UserName': body.appID, }
    };
    const userLineId = await docClient.query( params )
        .promise()
        .then( ( data ) => {
            console.log( 'LINE user ID fetch from dynamoDB was successful...', data );
            return ( data.Items[ 0 ].UserLineId );
        } )
        .catch( err => console.log( 'LINE user ID fetch from dynamoDB failed...', err ) );
    console.log( 'fetched line id...', userLineId )


    ///////////////// push message of audio
    const audio = {
        'type': 'audio',
        'originalContentUrl': fileURL,
        'duration': ( body.audioInterval !== undifined ) ? body.audioInterval : 30000,
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
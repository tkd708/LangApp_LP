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
    const userLineId_token = userLineData.sub;
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




    /////////////////////////////////////////////////////////////////////////////////////////// tentatively tests.... just delete the section later
    console.log( 'received audio buffer...', JSON.stringify( body.audioBuffer ) );
    console.log( 'received audio buffer in base64: ' + body.audioBuffer.toString( 'base64' ) )
    console.log( 'received audio buffer in base64 length: ' + body.audioBuffer.toString( 'base64' ).length )
    const audioBufferPath = '/tmp/audioBuffer.mp4';
    await fsp.writeFile( audioBufferPath, body.audioBuffer );
    const audioBufferFile = await fsp.readFile( audioBufferPath );
    console.log( 'received and read audio buffer: ' + audioBufferFile.toString( 'base64' ) )
    console.log( 'received and read audio buffer length: ' + audioBufferFile.toString( 'base64' ).length )
    const bufferMetadata = await ffmpeg_checkMetaData( audioBufferPath );
    console.log( 'ffmpeg metadata of audio buffer...', bufferMetadata );


    const audioBuffer64Path = '/tmp/audioBuffer64.mp4';
    await fsp.writeFile( audioBuffer64Path, body.audioBuffer.toString( 'base64' ) );
    const audioBuffer64File = await fsp.readFile( audioBuffer64Path );
    console.log( 'received and read audio buffer in base64: ' + audioBuffer64File.toString( 'base64' ) )
    console.log( 'received and read audio buffer in base64 length: ' + audioBuffer64File.toString( 'base64' ).length )
    const buffer64Metadata = await ffmpeg_checkMetaData( audioBuffer64Path );
    console.log( 'ffmpeg metadata of audio buffer in base64...', buffer64Metadata );


    const uploadParamsB = { Bucket: 'langapp-audio-analysis', Key: '', Body: '' };
    uploadParamsB.Key = `${ date }-${ userLineName }-${ body.recordingID }/audioBuffer-${ time }.mp4`;
    uploadParamsB.Body = audioBufferFile;
    const fileURLB = await s3.upload( uploadParamsB )
        .promise()
        .then( ( data ) => {
            console.log( "Audio buffer successfully uploaded to S3", data )
            return ( data.Location );
        } )
        .catch( err => console.log( "Audio buffer upload to S3 error", err ) );
    console.log( 's3 audio buffer file url...', fileURLB );

    const uploadParams0 = { Bucket: 'langapp-audio-analysis', Key: '', Body: '' };
    uploadParams0.Key = `${ date }-${ userLineName }-${ body.recordingID }/audioNoEncode-${ time }.mp4`;
    uploadParams0.Body = decodedFile;
    const fileURL0 = await s3.upload( uploadParams0 )
        .promise()
        .then( ( data ) => {
            console.log( "Not encoded Audio chunk successfully uploaded to S3", data )
            return ( data.Location );
        } )
        .catch( err => console.log( "Not encoded Audio chunk upload to S3 error", err ) );
    console.log( 's3 not encoded file url...', fileURL0 );


    /////////////////////////////////////////////////////////
    const encodedPath2 = '/tmp/encodedT15.m4a';
    const ffmpeg_encode_audio2 = () => {
        return new Promise( ( resolve, reject ) => {
            ffmpeg()
                .input( decodedPath )
                .inputFormat( 'mp4' )
                .outputOptions( [
                    //'-f s16le',
                    '-acodec copy', /// GCP >> pcm_s16le, LINE(m4a) >> aac... audio from ios >> copy?
                    '-t 15',
                    //'-ac 1',
                    //'-ar 16k', //41k or 16k
                    //'-map_metadata -1',
                ] )
                .loop( 15 )
                .save( encodedPath2 )
                .on( 'end', async () => {
                    console.log( 'encoding done' );
                    resolve();
                } )
        } )
    }
    await ffmpeg_encode_audio2()
    const encodedFile2 = await fsp.readFile( encodedPath2 );
    console.log( 'converted audio acodec copy t15 extention set m4a audio: ' + encodedFile2.toString( 'base64' ).slice( 0, 100 ) )
    console.log( 'converted audio acodec copy t15 extention set m4a audio length: ' + encodedFile2.toString( 'base64' ).length )

    const metadata2 = await ffmpeg_checkMetaData( encodedPath2 );
    console.log( 'ffmpeg metadata of acodec copy t15 extention set m4a audio...', metadata2 );

    const uploadParams2 = { Bucket: 'langapp-audio-analysis', Key: '', Body: '' };
    uploadParams2.Key = `${ date }-${ userLineName }-${ body.recordingID }/audioT15-${ time }.m4a`;
    uploadParams2.Body = encodedFile2;
    const fileURL2 = await s3.upload( uploadParams2 )
        .promise()
        .then( ( data ) => {
            console.log( "audio acodec copy t15 extention set m4a audio chunk successfully uploaded to S3", data )
            return ( data.Location );
        } )
        .catch( err => console.log( "audio acodec copy t15 extention set m4a audio chunk upload to S3 error", err ) );
    console.log( 's3 audio acodec copy t15 extention set m4a audio file url...', fileURL2 );


    /////////////////////////////////////////////////////////
    const encodedPath3 = '/tmp/encodedDurationNA.m4a';
    const ffmpeg_encode_audio3 = () => {
        return new Promise( ( resolve, reject ) => {
            ffmpeg()
                .input( decodedPath )
                .inputFormat( 'mp4' )
                .outputOptions( [
                    //'-f s16le',
                    '-acodec copy', /// GCP >> pcm_s16le, LINE(m4a) >> aac... audio from ios >> copy?
                    //'-ac 1',
                    //'-ar 16k', //41k or 16k
                    //'-map_metadata -1',
                ] )
                .save( encodedPath3 )
                .on( 'end', async () => {
                    console.log( 'encoding done' );
                    resolve();
                } )
        } )
    }
    await ffmpeg_encode_audio3()
    const encodedFile3 = await fsp.readFile( encodedPath3 );
    console.log( 'encoded audio acodec copy set duration 15: ' + encodedFile3.toString( 'base64' ).slice( 0, 100 ) )
    console.log( 'encoded audio acodec copy set duration 15 length: ' + encodedFile3.toString( 'base64' ).length )

    const metadata3 = await ffmpeg_checkMetaData( encodedPath3 );
    console.log( 'ffmpeg metadata of acodec copy set duration 15, extention change to m4a audio...', metadata3 );

    const uploadParams3 = { Bucket: 'langapp-audio-analysis', Key: '', Body: '' };
    uploadParams3.Key = `${ date }-${ userLineName }-${ body.recordingID }/audioDuration15-${ time }.m4a`;
    uploadParams3.Body = encodedFile3;
    const fileURL3 = await s3.upload( uploadParams3 )
        .promise()
        .then( ( data ) => {
            console.log( "Duration 15 Audio chunk successfully uploaded to S3", data )
            return ( data.Location );
        } )
        .catch( err => console.log( "Duration 15 Audio chunk upload to S3 error", err ) );
    console.log( 's3 audio duration 15 file url...', fileURL3 );


    ///////////////////////////////////////////////////////////////////////////////






    ///////////////// Get LINE user ID from dynamoDB corresponding to the user name (appID) input by the user on LP
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: 'LangAppUsers',
        KeyConditionExpression: 'UserName = :UserName ',
        ExpressionAttributeValues: { ':UserName': body.appID, }
    };
    const userLineId_dynamo = await docClient.query( params )
        .promise()
        .then( ( data ) => {
            console.log( 'LINE user ID fetch from dynamoDB was successful...', data );
            return ( data.Items[ 0 ].UserLineId );
        } )
        .catch( err => {
            console.log( 'LINE user ID fetch from dynamoDB failed...', err )
            return ( err )
        } );
    //console.log( 'fetched line id...', userLineId )



    const userLineId = ( body.lineIdToken === undefined ) ? userLineId_dynamo : userLineId_token;


    ///////////////// push message of audio
    const audio = {
        'type': 'audio',
        'originalContentUrl': fileURL, //fileURL,
        'duration': body.audioInterval,
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
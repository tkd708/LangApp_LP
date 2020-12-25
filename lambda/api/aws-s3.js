require( 'dotenv' ).config();
const AWS = require( 'aws-sdk' );
const fs = require( 'fs' );
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

    //console.log( 'received audio', JSON.parse( event.body ).audio );

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

    s3.listObjects( ( err, data ) => {
        if( err ) {
            console.log( "AWS list objects Error", err );
        } else {
            console.log( "AWS list objects Success", data );
        }
    } );

    const uploadParams = { Bucket: 'langapp-audio-analysis', Key: '/', Body: '' };

    const decodedAudio = new Buffer.from( JSON.parse( event.body ).audio, 'base64' );
    const decodedPath = '/tmp/decoded.wav';
    await fsp.writeFile( decodedPath, decodedAudio );
    const decodedFile = await fsp.readFile( decodedPath );
    console.log( 'received and read audio: ' + decodedFile.toString( 'base64' ).slice( 0, 100 ) )

    const fileStream = fsp.createReadStream( decodedPath );
    fileStream.on( 'error', function ( err ) {
        console.log( 'File read before AWS upload Error', err );
    } );
    uploadParams.Body = fileStream;

    // call S3 to retrieve upload file to specified bucket
    s3.upload( uploadParams, function ( err, data ) {
        if( err ) {
            console.log( "AWS S3 Upload Error", err );
        } if( data ) {
            console.log( "AWS S3 Upload Success", data.Location );
        }
    } );

    return {
        statusCode: 200, // http status code
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify( {
            status: 'file uploaded',
        } )
    }

}



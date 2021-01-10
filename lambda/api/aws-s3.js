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
    //console.log( '----------- aws config -------------', AWS.config )

    // Create S3 service object
    const s3 = new AWS.S3( {
        apiVersion: '2006-03-01',
        params: { Bucket: 'langapp-audio-analysis' }
    } );
    //console.log( '----------- s3 object -------------', s3 );

    //const methods1 = Object.getOwnPropertyNames( AWS.S3.prototype )
    //console.log( '-------------- list of methods AWS S3 ------------------', methods1 )
    //const methods2 = Object.getOwnPropertyNames( s3 )
    //console.log( '-------------- list of methods s3 object ------------------', methods2 )

    //s3.listObjects( ( err, data ) => {
    //    console.log( 'list object excecuted' );
    //    if( err ) {
    //        console.log( "List object Error", err );
    //    } else {
    //        console.log( "List object Success", data );
    //    }
    //} );


    ////////////////////////// S3 upload parameters
    const uploadParams = { Bucket: 'langapp-audio-analysis', Key: '', Body: '' };
    //const now = new Date();
    //const dateTimeNow = `${ now.getFullYear() }-${ now.getMonth() + 1 }-${ now.getDate() } ${ now.getHours() }:${ now.getMinutes() }:${ now.getSeconds() }`;
    const date = new Date().toISOString().substr( 0, 19 ).replace( 'T', ' ' ).slice( 0, 10 );

    uploadParams.Key = `${ date }-${ JSON.parse( event.body ).appID }-${ JSON.parse( event.body ).recordingID }/audioFull.wav`;

    console.log( 'received audio: ', JSON.parse( event.body ).audio.slice( 0, 100 ) )
    const decodedAudio = new Buffer.from( JSON.parse( event.body ).audio, 'base64' );
    const decodedPath = '/tmp/decoded.wav';
    await fsp.writeFile( decodedPath, decodedAudio );
    const decodedFile = await fsp.readFile( decodedPath );
    console.log( 'received and read audio: ' + decodedFile.toString( 'base64' ).slice( 0, 100 ) )

    uploadParams.Body = decodedFile;

    console.log( '----------- aws upload params -------------', uploadParams );

    ////////////////////////////// call S3 to retrieve upload file to specified bucket
    await s3.upload( uploadParams )
        .promise()
        .then( ( data ) => {
            console.log( "Successfully uploaded", data )
        } )
        .catch(
            ( err ) => {
                console.error( "Upload error", err );
            } );

    // Create a promise on S3 service object
    //const uploadPromise = new AWS.S3( {
    //    apiVersion: '2006-03-01',
    //    params: { Bucket: 'langapp-audio-analysis' }
    //} ).upload( uploadParams ).promise();
    //console.log( "-------------------- Upload promise object ------------------", uploadPromise );

    // Handle promise fulfilled/rejected states
    //await uploadPromise.then( ( data ) => {
    //    console.log( "Successfully uploaded", data )
    //} )
    //    .catch(
    //        ( err ) => {
    //            console.error( "Upload error", err );
    //        } );

    //const [ response ] = await uploadPromise.then();
    //console.log( "---------------- promise response --------------------", response );

    console.log( '----------- end aws upload -------------' );


    //////////////// Finish the api
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



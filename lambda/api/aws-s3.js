require( 'dotenv' ).config();
const fs = require( 'fs' );
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

    console.log( 'received audio', JSON.parse( event.body ).audio );

    // initialise AWS
    AWS.config = new AWS.Config( {
        accessKeyId: process.env.GATSBY_AWS_accessKey,
        secretAccessKey: process.env.GATSBY_AWS_secretKey,
        region: 'us-east-2',
    } );

    // Create S3 service object
    const s3 = new AWS.S3( { apiVersion: '2006-03-01' } );

    // Call S3 to list the buckets
    s3.listBuckets( ( err, data ) => {
        if( err ) {
            console.log( "AWS Error", err );
        } else {
            console.log( "AWS Success", data.Buckets );
        }
    } );


    return {
        statusCode: 200, // http status code
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify( {
            request: event.body,
        } )
    }

}



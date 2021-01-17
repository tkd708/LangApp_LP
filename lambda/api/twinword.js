require( 'dotenv' ).config();

const axios = require( 'axios' );

const AWS = require( 'aws-sdk' );
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
//console.log( '----------- s3 object -------------', s3 );

const docClient = new AWS.DynamoDB.DocumentClient();

const line = require( '@line/bot-sdk' );
const client = new line.Client( {
    channelAccessToken: process.env.GATSBY_LINE_accesstoken,
    channelSecret: process.env.GATSBY_LINE_channelsecret
} );


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


    ///////////////////////////// // Twinword api
    const urlAssociation = 'https://api.twinword.com/api/word/association/latest/';
    const urlExamples = 'https://api.twinword.com/api/word/example/latest/';
    const word = 'Awesome' //
    const headers = {
        'Content-Type': 'application/json',
        'Host': 'api.twinword.com',
        'X-Twaip-Key': process.env.GATSBY_Twinword_API_KEY,
    }

    const twinwordAssociation =
        await axios
            .request( {
                url: urlAssociation,
                method: 'GET',
                params: { entry: word },
                headers: headers,
                //data: { entry: word }
            } )
            .then( res => {
                //console.log( 'Twinword success...', res )
                return ( res.data )
            } )
            .catch( err => console.log( 'ERROR in Twinword api...', err ) );
    console.log( twinwordAssociation );

    const twinwordExamples =
        await axios
            .request( {
                url: urlExamples,
                method: 'GET',
                params: { entry: word },
                headers: headers,
                //data: { entry: word }
            } )
            .then( res => {
                //console.log( 'Twinword success...', res )
                return ( res.data )
            } )
            .catch( err => console.log( 'ERROR in Twinword api...', err ) );
    console.log( twinwordExamples );

    !( twinwordAssociation.result_code === "200" && twinwordExamples.result_code === "200" ) && console.log( 'cannot find the word' );

    //////////////// Finish the api
    return {
        statusCode: 200, // http status code
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify( {
            resExample: twinwordExamples,
            resAssociation: twinwordAssociation,
        } )
    }

}
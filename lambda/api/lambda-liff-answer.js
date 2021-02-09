require( 'dotenv' ).config();
const axios = require( 'axios' );

const line = require( '@line/bot-sdk' );
const client = new line.Client( {
    channelAccessToken: process.env.GATSBY_LINE_accesstoken,
    channelSecret: process.env.GATSBY_LINE_channelsecret
} );

const AWS = require( 'aws-sdk' );
// initialise AWS
AWS.config = new AWS.Config( {
    accessKeyId: process.env.GATSBY_AWS_accessKey,
    secretAccessKey: process.env.GATSBY_AWS_secretKey,
    region: 'us-east-2',
} );
const s3 = new AWS.S3( {
    apiVersion: '2006-03-01',
    params: { Bucket: 'langapp-audio-analysis' }
} );
const docClient = new AWS.DynamoDB.DocumentClient();



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
    console.log( 'received answer...', body );



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



    ////////////////////////////// Store the analysis results to dynamoDB (atm from LP but analysis will be moved to this netlify functions)
    const date = new Date().toISOString().substr( 0, 19 ).replace( 'T', ' ' ).slice( 0, 10 );

    const params = {
        TableName: 'LangAppRevision',
        Item: {
            taskId: body.taskId,
            userLineId: userLineId,
            userLineName: userLineName,
            date: body.date,
            question: body.question,
            answer: body.answer,
            answerComplete: 'Y',
            practiceComplete: 'N',
        }
    };
    await docClient.put( params )
        .promise()
        .then( res => console.log( 'Uploading answer to dynamoDB was successful...', res ) )
        .catch( err => console.log( 'Uploading asnwer to dynamoDB failed...', err ) );



    //////////// Finish the api
    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );
};
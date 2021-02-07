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
    console.log( 'received question...', body );



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



    ////////////////////////////// Fetch tasks from dynamoDB
    const params = {
        TableName: 'LangAppRevision',
        IndexName: 'UserLineID-index',
        KeyConditionExpression: 'UserLineID = :UserLineID ',
        ExpressionAttributeValues: { ':UserLineID': userLineId, } //
    };

    const userTasks = await docClient.query( params )
        .promise()
        .then( data => data.Items )
        .catch( err => {
            console.log( 'Fetch tasks from dynamoDB failed...', err );
            return ( [] );
        } );

    // in case of error or an empty array...
    if( userTasks == [] ) return {
        statusCode: 200, // http status code
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify( {
            request: event.body,
            tasks: userTasks
        } )
    }

    // if not empty, select data and return
    userTasks.sort( function ( a, b ) {
        return a.Date < b.Date ? -1 : 1;
    } );
    const userTasksSelected = userTasks.map( x => ( {
        taskId: x.taskId,
        date: x.date,
        question: x.question,
        answer: x.answer,
        answerComplete: x.answerComplete,
        practiceComplete: x.practiceComplete
    } ) )

    return {
        statusCode: 200, // http status code
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify( {
            request: event.body,
            tasks: userTasksSelected
        } )
    }
};
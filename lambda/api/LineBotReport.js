require( 'dotenv' ).config();
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
    console.log( 'received report...', body );


    ///////////// Fetch the LINE user id from dynamoDB
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
        .catch(
            ( err ) => {
                console.log( 'LINE user ID fetch from dynamoDB failed...', err );
            } );
    console.log( 'fetched line id...', userLineId )


    ///////////// Store the analysis results to dynamoDB
    const date = new Date().toISOString().substr( 0, 19 ).replace( 'T', ' ' ).slice( 0, 10 );

    const paramsReport = {
        TableName: 'LangAppData',
        Item: {
            UserName: body.appID,
            RecordingID: body.recordingID,
            Date: date,
            LengthMinute: body.lengthMinute,
            WordsTotal: body.wordsTotal,
            WordsPerMinute: body.wordsPerMinute,
            VocabSize: body.vocab,
            Transcript: body.transcript,
        }
    };
    docClient.put( paramsReport, ( err, data ) => {
        if( err ) console.log( 'Adding the conversation analysis to dynamoDB failed...', err )
        else console.log( 'Adding the conversation analysis to dynamoDB was successful...', data )
    } );

    ///////////////// Push message to LINE bot the analysis resutls
    const message = {
        'type': 'text',
        'text': `話した単語の総数は${ body.wordsTotal }、流暢さ(words per minute)は${ body.wordsPerMinute }、単語の種類数は${ body.vocab }でした！ 話した回数の多い単語TOP３は、${ body.topWord1.word }が${ body.topWord1.count }回、${ body.topWord2.word }が${ body.topWord2.count }回、${ body.topWord3.word }が${ body.topWord3.count }回でした！`
    };
    await client.pushMessage( userLineId, message )
        .then( ( response ) => {
            console.log( 'report push message attempted...', response );
        } )
        .catch( ( err ) => console.log( 'error in report push message...', err ) );
    console.log( 'report push message event executed' );



    //////////// Finish the api
    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );
};
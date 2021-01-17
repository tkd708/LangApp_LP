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
                return ( null )
            } );
    console.log( 'fetched line id...', userLineId )


    ////////////////////////////// Prompt to registration
    const paramsIdCheck = {
        TableName: 'LangAppUsers',
        KeyConditionExpression: 'UserLineId = :UserLineId ',
        ExpressionAttributeValues: { ':UserLineId': body.events[ 0 ].source.userId, } //
    };
    const userLineIdBoolean = await docClient.query( paramsIdCheck )
        .promise()
        .then( ( data ) => {
            console.log( 'LINE user ID fetch from dynamoDB was successful...', data );
            return ( true );
        } )
        .catch( ( err ) => {
            console.log( 'LINE user ID fetch from dynamoDB failed...', err );
            return ( false )
        } );

    ( !userLineIdBoolean ) && await client.replyMessage(
        body.events[ 0 ].replyToken,
        {
            'type': 'text',
            'text': `ウェブサイトとの連動のため、下記に「登録」という言葉を送信してください！`,
        }
    )
        .then( ( res ) => {
            console.log( 'user id for registration reply attempted...', res );
        } )
        .catch( ( err ) => console.log( 'error in user id for registration reply...', err ) );


    ///////////////// Push message to LINE bot to confirm the ID
    const message = {
        'type': 'text',
        'text': `録音が開始されました！これから録音された音声とその書き起こし、会話の分析が届きます！`
    };
    await client.pushMessage( userLineId, message )
        .then( ( response ) => {
            console.log( 'report push message attempted...', response );
        } )
        .catch( ( err ) => console.log( 'error in report push message...', err ) );
    console.log( 'report push message event executed' );


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

};
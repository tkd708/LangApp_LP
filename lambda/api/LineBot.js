require( 'dotenv' ).config();
const line = require( '@line/bot-sdk' );
const crypto = require( 'crypto' );
const client = new line.Client( {
    channelAccessToken: process.env.GATSBY_LINE_accesstoken,
    channelSecret: process.env.GATSBY_LINE_channelsecret
} );

const AWS = require( 'aws-sdk' );




module.exports.handler = async function ( event, context ) {

    //const methods = Object.getOwnPropertyNames( client )
    //console.log( '-------------- list of methods line client object ------------------', methods )

    //let signature = crypto.createHmac( 'sha256', process.env.GATSBY_LINE_channelsecret ).update( event.body ).digest( 'base64' );
    //let checkHeader = ( event.headers || {} )[ 'X-Line-Signature' ];
    let body = JSON.parse( event.body );
    console.log( event );


    /////////////// initialise AWS
    AWS.config = new AWS.Config( {
        accessKeyId: process.env.GATSBY_AWS_accessKey,
        secretAccessKey: process.env.GATSBY_AWS_secretKey,
        region: 'us-east-2',
    } );
    const docClient = new AWS.DynamoDB.DocumentClient();


    //if( signature === checkHeader ) {
    if( body.events[ 0 ].replyToken === '00000000000000000000000000000000' ) { //接続確認エラー回避

        let lambdaResponse = {
            statusCode: 200,
            headers: { "X-Line-Status": "OK" },
            body: '{"result":"connect check"}'
        };
        context.succeed( lambdaResponse );
        return
    } else {

        let text = body.events[ 0 ].message.text;
        console.log( 'received text...', text );



        ////////////////////////////// Reply messages below /////////////////////////////////////



        //////////////////////////// Registration
        if( text == '登録' ) {
            console.log( 'the user to be registered...', body.events[ 0 ].source.userId )

            // Get the user profile
            const userProfile = await client.getProfile( body.events[ 0 ].source.userId )
                .then( ( res ) => {
                    console.log( 'get profile attempted...', res );
                    return ( res )
                } )
                .catch( ( err ) => console.log( 'get profile failed...', err ) );
            console.log( 'get profile event executed' );

            // Store the user name and ID in the dynamoDB
            const params = {
                TableName: 'LangAppUsers',
                Item: {
                    UserName: userProfile.displayName,
                    UserLineId: body.events[ 0 ].source.userId,
                }
            };
            await docClient.put( params )
                .promise()
                .then( res => console.log( 'Adding the user name and id on dynamoDB was successful...', res ) )
                .catch( err => console.log( 'Adding the user name and id on dynamoDB failed...', err ) );

            // Notify the user that the ID is registered
            const message = {
                'type': 'text',
                'text': `ご登録どうもありがとうございます！LangAppのウェブサイトで英会話を録音される際に、「お名前」の項目にLINEの表示名「 ${ userProfile.displayName }」をご入力ください。音声とその書き起こし、英会話の分析結果をLangAppBotよりお届けいたします！`,
            };

            await client.replyMessage( body.events[ 0 ].replyToken, message )
                .then( ( res ) => {
                    console.log( 'user id for registration reply attempted...', res );
                } )
                .catch( ( err ) => console.log( 'error in user id for registration reply...', err ) );
            console.log( 'user id for registration reply event executed' );

        }



        //////// Reply the same message
        //const message = {
        //    'type': 'text',
        //    'text': text
        //};
        //await client.replyMessage( body.events[ 0 ].replyToken, message )
        //    .then( ( response ) => {
        //        console.log( 'reply attempted...', response );
        //    } )
        //    .catch( ( err ) => console.log( 'error in reply...', err ) );
        //console.log( 'reply event executed' );


        ////// Transfer the message to me
        //await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", message )
        //    .then( ( response ) => {
        //        console.log( 'additional push message attempted...', response );
        //    } )
        //    .catch( ( err ) => console.log( 'error in additional push message...', err ) );
        //console.log( 'additional push message event executed' );





        ///// Finish the api
        let lambdaResponse = {
            statusCode: 200,
            headers: { "X-Line-Status": "OK" },
            body: '{"result":"completed"}'
        };
        context.succeed( lambdaResponse );


        // trying a promise object
        // const replyPromise = client.replyMessage( body.events[ 0 ].replyToken, message ).promise();
        // const [ response ] = await replyPromise
        //     .then( ( response ) => {
        //       console.log( 'reply attempted by the promise object...', response );
        //        let lambdaResponse = {
        //            statusCode: 200,
        //            headers: { "X-Line-Status": "OK" },
        //            body: '{"result":"completed"}'
        //        };
        //        context.succeed( lambdaResponse );
        //    } )
        //    .catch( ( err ) => console.log( 'error in the promise object...', err ) );
    }
    //} else {
    //    console.log( '署名認証エラー' );
    //}
};
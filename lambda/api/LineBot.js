require( 'dotenv' ).config();
const line = require( '@line/bot-sdk' );
const crypto = require( 'crypto' );
const client = new line.Client( {
    channelAccessToken: process.env.GATSBY_LINE_accesstoken,
    channelSecret: process.env.GATSBY_LINE_channelsecret
} );


module.exports.handler = async function ( event, context ) {

    //let signature = crypto.createHmac( 'sha256', process.env.GATSBY_LINE_channelsecret ).update( event.body ).digest( 'base64' );
    //let checkHeader = ( event.headers || {} )[ 'X-Line-Signature' ];
    let body = JSON.parse( event.body );
    //console.log( event );

    //if( signature === checkHeader ) {
    if( body.events[ 0 ].replyToken === '00000000000000000000000000000000' ) { //接続確認エラー回避

        let lambdaResponse = {
            statusCode: 200,
            headers: { "X-Line-Status": "OK" },
            body: '{"result":"connect check"}'
        };
        context.succeed( lambdaResponse );
    } else {
        let text = body.events[ 0 ].message.text;
        console.log( 'received text...', text );
        const message = {
            'type': 'text',
            'text': text
        };
        await client.replyMessage( body.events[ 0 ].replyToken, message )
            .then( ( response ) => {
                console.log( 'reply attempted...', response );
                let lambdaResponse = {
                    statusCode: 200,
                    headers: { "X-Line-Status": "OK" },
                    body: '{"result":"completed"}'
                };
                context.succeed( lambdaResponse );
            } )
            .catch( ( err ) => console.log( 'error in reply...', err ) );

        console.log( 'reply event executed' );

        // trying a promise object
        const replyPromise = client.replyMessage( body.events[ 0 ].replyToken, message ).promise();
        const [ response ] = await replyPromise
            .then( ( response ) => {
                console.log( 'reply attempted by the promise object...', response );
                let lambdaResponse = {
                    statusCode: 200,
                    headers: { "X-Line-Status": "OK" },
                    body: '{"result":"completed"}'
                };
                context.succeed( lambdaResponse );
            } )
            .catch( ( err ) => console.log( 'error in the promise object...', err ) );
    }
    //} else {
    //    console.log( '署名認証エラー' );
    //}
};
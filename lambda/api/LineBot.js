'use strict';
const line = require( '@line/bot-sdk' );
const crypto = require( 'crypto' );
const client = new line.Client( { channelAccessToken: process.env.GATSBY_LINE_accesstoken } );

console.log( 'Line token', process.env.GATSBY_LINE_accesstoken );

module.exports.handler = async function ( event, context ) {

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        'body': "Done"
    }

    let signature = crypto.createHmac( 'sha256', process.env.CHANNELSECRET ).update( event.body ).digest( 'base64' );
    let checkHeader = ( event.headers || {} )[ 'X-Line-Signature' ];
    let body = JSON.parse( event.body );
    if( signature === checkHeader ) {
        if( body.events[ 0 ].replyToken === '00000000000000000000000000000000' ) { //接続確認エラー回避
            let lambdaResponse = {
                statusCode: 200,
                headers: { "X-Line-Status": "OK" },
                body: '{"result":"connect check"}'
            };
            context.succeed( lambdaResponse );
        } else {
            let text = body.events[ 0 ].message.text;
            const message = {
                'type': 'text',
                'text': text
            };
            client.replyMessage( body.events[ 0 ].replyToken, message )
                .then( ( response ) => {
                    let lambdaResponse = {
                        statusCode: 200,
                        headers: { "X-Line-Status": "OK" },
                        body: '{"result":"completed"}'
                    };
                    context.succeed( lambdaResponse );
                } ).catch( ( err ) => console.log( err ) );
        }
    } else {
        console.log( '署名認証エラー' );
    }
};
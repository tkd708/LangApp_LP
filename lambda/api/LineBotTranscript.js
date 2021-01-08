require( 'dotenv' ).config();
const line = require( '@line/bot-sdk' );
const client = new line.Client( {
    channelAccessToken: process.env.GATSBY_LINE_accesstoken,
    channelSecret: process.env.GATSBY_LINE_channelsecret
} );



module.exports.handler = async function ( event, context ) {

    let body = JSON.parse( event.body );
    console.log( 'received transcript...', body.transcript );

    const message = {
        'type': 'text',
        'text': body.transcript
    };

    await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", message )
        .then( ( response ) => {
            console.log( 'transcript push message attempted...', response );
        } )
        .catch( ( err ) => console.log( 'error in transcript push message...', err ) );
    console.log( 'transcript push message event executed' );

    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );
};
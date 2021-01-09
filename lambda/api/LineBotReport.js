require( 'dotenv' ).config();
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

    let body = JSON.parse( event.body );
    console.log( 'received report...', body );

    const message = {
        'type': 'text',
        'text': `話した単語の総数は${ body.wordsTotal }、流暢さ(word per minute)は${ body.wordsPerMinute }、単語の種類数は${ body.vocab }でした！ 話した回数の多い単語TOP３は、${ body.topWord1.word }が${ body.topWord1.count }回、${ body.topWord2.word }が${ body.topWord2.count }回、${ body.topWord3.word }が${ body.topWord3.count }回でした！`
    };

    await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", message )
        .then( ( response ) => {
            console.log( 'report push message attempted...', response );
        } )
        .catch( ( err ) => console.log( 'error in report push message...', err ) );
    console.log( 'report push message event executed' );

    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );
};
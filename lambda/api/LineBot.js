require( 'dotenv' ).config();
const line = require( '@line/bot-sdk' );
const crypto = require( 'crypto' );
const client = new line.Client( {
    channelAccessToken: process.env.GATSBY_LINE_accesstoken,
    channelSecret: process.env.GATSBY_LINE_channelsecret
} );



module.exports.handler = async function ( event, context ) {

    //const methods = Object.getOwnPropertyNames( client )
    //console.log( '-------------- list of methods line client object ------------------', methods )

    //let signature = crypto.createHmac( 'sha256', process.env.GATSBY_LINE_channelsecret ).update( event.body ).digest( 'base64' );
    //let checkHeader = ( event.headers || {} )[ 'X-Line-Signature' ];
    let body = JSON.parse( event.body );
    console.log( event );

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

        ///// Registration
        if( text == '登録' ) {
            console.log( 'the user to be registered...', body.events[ 0 ].source.userId )

            const userProfile = await client.getProfile( body.events[ 0 ].source.userId )
                .then( ( res ) => {
                    console.log( 'get profile attempted...', res );
                } )
                .catch( ( err ) => console.log( 'get profile failed...', err ) );
            console.log( 'get profile event executed' );

            const message = {
                'type': 'text',
                'text': `Are you ${ userProfile.displayName }? Your ID is ${ body.events[ 0 ].source.userId }`,
            };

            //getProfile( userId: string ): Promise < Profile >
            await client.replyMessage( body.events[ 0 ].replyToken, message )
                .then( ( res ) => {
                    console.log( 'user id for registration reply attempted...', res );
                } )
                .catch( ( err ) => console.log( 'error in user id for registration reply...', err ) );
            console.log( 'user id for registration reply event executed' );

        }



        //////// Reply the same message
        const message = {
            'type': 'text',
            'text': text
        };

        await client.replyMessage( body.events[ 0 ].replyToken, message )
            .then( ( response ) => {
                console.log( 'reply attempted...', response );
            } )
            .catch( ( err ) => console.log( 'error in reply...', err ) );
        console.log( 'reply event executed' );


        ////// Transfer the message to me
        await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", message )
            .then( ( response ) => {
                console.log( 'additional push message attempted...', response );
            } )
            .catch( ( err ) => console.log( 'error in additional push message...', err ) );
        console.log( 'additional push message event executed' );





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
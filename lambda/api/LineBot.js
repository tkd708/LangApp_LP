require( 'dotenv' ).config();
const axios = require( 'axios' );

const line = require( '@line/bot-sdk' );
const client = new line.Client( {
    channelAccessToken: process.env.GATSBY_LINE_accesstoken,
    channelSecret: process.env.GATSBY_LINE_channelsecret
} );

/////////////// initialise AWS
const AWS = require( 'aws-sdk' );
AWS.config = new AWS.Config( {
    accessKeyId: process.env.GATSBY_AWS_accessKey,
    secretAccessKey: process.env.GATSBY_AWS_secretKey,
    region: 'us-east-2',
} );
const docClient = new AWS.DynamoDB.DocumentClient();



module.exports.handler = async function ( event, context ) {

    console.log( event );
    const body = JSON.parse( event.body );


    //////////////////////////// Registration
    if( body.events[ 0 ].message.text == '登録' ) {
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

        ///// Finish the api
        let lambdaResponse = {
            statusCode: 200,
            headers: { "X-Line-Status": "OK" },
            body: '{"result":"completed"}'
        };
        context.succeed( lambdaResponse );

    }


    ///////////////////////////// LINE ID check >> Prompt to registration
    const paramsIdCheck = {
        TableName: 'LangAppUsers',
        IndexName: 'UserLineId-index',
        KeyConditionExpression: 'UserLineId = :UserLineId ',
        ExpressionAttributeValues: { ':UserLineId': body.events[ 0 ].source.userId, } //
    };
    const userLineIdCheck = await docClient.query( paramsIdCheck )
        .promise()
        .then( ( data ) => {
            console.log( 'LINE user ID fetch from dynamoDB was successful...', data );
            return ( data.Count );
        } )
        .catch( err => console.log( 'LINE user ID fetch from dynamoDB failed...', err ) );
    console.log( "LINE ID registered?... YES: 1, NO: 0", userLineIdCheck );

    ( userLineIdCheck === 0 ) && await client.replyMessage(
        body.events[ 0 ].replyToken,
        {
            'type': 'text',
            'text': `ウェブサイトとの連動のため、下記に「登録」という言葉を送信してください！`,
        }
    )
        .then( res => console.log( 'registration prompt message sent...', res ) )
        .catch( err => console.log( 'error in registration prompt message...', err ) );


    //////////////////////////////// LINE ID confirmed >> Twinword API
    if( userLineIdCheck === 1 ) {

        ///////////////////////////// // Twinword api
        const urlAssociation = 'https://api.twinword.com/api/word/association/latest/';
        const urlExamples = 'https://api.twinword.com/api/word/example/latest/';
        const word = body.events[ 0 ].message.text;
        const headers = {
            'Content-Type': 'application/json',
            'Host': 'api.twinword.com',
            'X-Twaip-Key': process.env.GATSBY_Twinword_API_KEY,
        }

        const twinwordAssociation =
            await axios
                .request( {
                    url: urlAssociation,
                    method: 'GET',
                    params: { entry: word },
                    headers: headers,
                    //data: { entry: word }
                } )
                .then( res => {
                    //console.log( 'Twinword success...', res )
                    return ( res.data )
                } )
                .catch( err => console.log( 'ERROR in Twinword api...', err ) );
        //console.log( twinword.data );

        const twinwordExamples =
            await axios
                .request( {
                    url: urlExamples,
                    method: 'GET',
                    params: { entry: word },
                    headers: headers,
                    //data: { entry: word }
                } )
                .then( res => {
                    //console.log( 'Twinword success...', res )
                    return ( res.data )
                } )
                .catch( err => console.log( 'ERROR in Twinword api...', err ) );
        //console.log( twinword.data );


        ///////////// LINE reply message

        // Word not found
        const messageTwinwordNotFound = {
            'type': 'text',
            'text': `"${ word }" は見つかりませんでした。動詞は原型に、名詞は単数形にして検索してみてください！`
        };
        !( twinwordAssociation.result_code === "200" && twinwordExamples.result_code === "200" ) && await client.replyMessage( body.events[ 0 ].replyToken, messageTwinwordNotFound )
            .then( res => console.log( 'Twinword reply message successful...', res ) )
            .catch( err => console.log( 'Error in Twinword reply message...', err ) );

        // Word found    
        const messageTwinword = {
            'type': 'text',
            'text': `"${ word }" は "${ twinwordExamples.example[ 0 ] }" や "${ twinwordExamples.example[ 1 ] }" などの使い方ができます。関連語として、${ twinwordAssociation.assoc_word[ 0 ] }、${ twinwordAssociation.assoc_word[ 1 ] }、${ twinwordAssociation.assoc_word[ 2 ] }などがあります！` //data.example[], data.assoc_word[]
        };
        ( twinwordAssociation.result_code === "200" && twinwordExamples.result_code === "200" ) && await client.replyMessage( body.events[ 0 ].replyToken, messageTwinword )
            .then( res => console.log( 'Twinword reply message successful...', res ) )
            .catch( err => console.log( 'Error in Twinword reply message...', err ) );

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

};
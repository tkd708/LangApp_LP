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

    const userLineId = body.events[ 0 ].source.userId;
    const userLineName = await client.getProfile( userLineId )
        .then( res => {
            console.log( 'get profile attempted...', res );
            return ( res.displayName )
        } )
        .catch( err => {
            console.log( 'get profile failed...', err )
            return ( 'NotFound' )
        } );



    ////////////////////////////////////////////// on postback actions /////////////////////////////////////////////
    if( body.events[ 0 ].type == 'postback' ) {
        //body.events[ 0 ].replyToken == '登録'
        //body.events[ 0 ].postback.data == "action=buy&itemid=222"

    }



    ////////////////////////////////////// Fetch user tasks and push message a carousel /////////////////////////////
    if( body.events[ 0 ].message.text == ':一覧' ) {

        const params = {
            TableName: 'LangAppRevision',
            IndexName: 'userLineId-index',
            KeyConditionExpression: 'userLineId = :userLineId ',
            ExpressionAttributeValues: { ':userLineId': userLineId, } //
        };
        const userTaskList = await docClient.query( params )
            .promise()
            .then( data => data.Items )
            .catch( err => {
                console.log( 'Fetch tasks from dynamoDB failed...', err );
                return ( [] );
            } );
        userTaskList.sort( function ( a, b ) {
            return a.date < b.date ? -1 : 1;
        } );
        console.log( 'User task list object...', userTaskList )

        const userTaskColumnList = userTaskList.map( task =>
        ( {
            //"thumbnailImageUrl": "https://example.com/bot/images/item1.jpg",
            "imageBackgroundColor": "#FFFFFF",
            "title": task.question,
            "text": `In Englsih: ${ task.answer } `,
            "defaultAction": {
                "type": "uri",
                "label": "View detail",
                "uri": "http://example.com/page/123"
            },
            "actions": [
                {
                    "type": "postback",
                    "label": "Answer",
                    "uri": `https://liff.line.me/1655583943-EoWpj6aB?taskId=${ task.taskId }&date=${ task.date }&question=${ task.question }`
                },
                {
                    "type": "postback",
                    "label": `ID: ${ task.taskId }`,
                    "data": "action=add&itemid=111"
                },
                {
                    "type": "uri",
                    "label": `Made on ${ task.date } `,
                    "uri": "http://example.com/page/111"
                }
            ]
        } )
        )
        console.log( 'User task list object in columns...', userTaskColumnList )

        const messageCarousel = {
            "type": "template",
            "altText": "Here is the list of taks",
            "template": {
                "type": "carousel",
                "columns": userTaskColumnList,
                "imageAspectRatio": "rectangle",
                "imageSize": "cover"
            }
        }
        console.log( 'User task carousel message...', messageCarousel )

        await client.pushMessage( userLineId, messageCarousel )
            //await client.replyMessage( body.events[ 0 ].replyToken, messageCarousel )
            .then( res => console.log( 'User tasks in a caroucsel message successful...', res ) )
            .catch( err => console.log( 'User tasks in a carousel message error...', err ) )

        ///// Finish the api
        let lambdaResponse = {
            statusCode: 200,
            headers: { "X-Line-Status": "OK" },
            body: '{"result":"completed"}'
        };
        context.succeed( lambdaResponse );
    }



    //////////////////////////////////////////////  Twinword api ///////////////////////////////////////////////
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
    // Word found    
    const messageTwinword = {
        'type': 'text',
        'text': `"${ word }" は "${ twinwordExamples.example[ 0 ] }" や "${ twinwordExamples.example[ 1 ] }" などの使い方ができます。関連語として、${ twinwordAssociation.assoc_word[ 0 ] }、${ twinwordAssociation.assoc_word[ 1 ] }、${ twinwordAssociation.assoc_word[ 2 ] }などがあります！` //data.example[], data.assoc_word[]
    };
    // Word not found
    const messageTwinwordNotFound = {
        'type': 'text',
        'text': `"${ word }" は見つかりませんでした。動詞は原型に、名詞は単数形にして検索してみてください！`
    };
    ( twinwordAssociation.result_code === "200" && twinwordExamples.result_code === "200" )
        ? await client.replyMessage( body.events[ 0 ].replyToken, messageTwinword )
            .then( res => console.log( 'Twinword reply message successful...', res ) )
            .catch( err => console.log( 'Error in Twinword reply message...', err ) )
        : await client.replyMessage( body.events[ 0 ].replyToken, messageTwinwordNotFound )
            .then( res => console.log( 'Twinword reply message successful...', res ) )
            .catch( err => console.log( 'Error in Twinword reply message...', err ) );

    ///// Finish the api
    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );

};
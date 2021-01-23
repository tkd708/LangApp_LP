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
const s3 = new AWS.S3( {
    apiVersion: '2006-03-01',
    params: { Bucket: 'langapp-audio-analysis' }
} );
const docClient = new AWS.DynamoDB.DocumentClient();

const QuickChart = require( 'quickchart-js' );


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

    ////////////////////////// Conversation analysis (duplicate from LP atm) /////////////////////////////

    // total words
    const transcriptWordArray = body.transcript.replace( /[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "" ).split( " " );
    const wordsTotal = transcriptWordArray.length;

    // words per minute
    //const conversationLength = ( endTime - startTime ) / 1000 / 60;
    const wordsPerMinute = ( transcriptWordArray.length / body.lengthMinute ).toFixed( 1 );

    // size of vocab
    const uniq = [ ...new Set( transcriptWordArray ) ];
    const vocabSize = uniq.length;

    // vocab counts... removing articles, prepositions and pronouns etc.
    const WORDS_UNCOUNTED = [
        'yes', 'no', 'yeah', 'ok', 'okay',
        '', 'a', 'the',
        'i', 'my', 'me', 'mine', 'you', 'your', 'yours',
        'he', 'him', 'his', 'she', 'her', 'hers',
        'we', 'us', 'our', 'ours', 'they', 'them', 'thier', 'thiers',
        'it', 'this', 'that', 'there',
        'and', 'but',
        'at', 'in', 'on', 'of', 'from', 'for', 'to',
        'am', 'are', 'is', 'be'
    ]
    const vocabCounts = [];
    transcriptWordArray.forEach( ( word ) => {
        const lowerWord = word.toLowerCase();
        if( WORDS_UNCOUNTED.includes( lowerWord ) ) return
        vocabCounts[ lowerWord ] = ( vocabCounts[ lowerWord ] || 0 ) + 1;
    } );
    const vocabCountArray = [];
    Object.entries( vocabCounts ).forEach( ( [ key, value ] ) => {
        const wordCount = { word: key, count: value }
        vocabCountArray.push( wordCount )
    } );
    vocabCountArray.sort( function ( a, b ) {
        return a.count > b.count ? -1 : 1;
    } );




    ///////////// Fetch the LINE user id from dynamoDB for push messages
    //const params = {
    //    TableName: 'LangAppUsers',
    //    KeyConditionExpression: 'UserName = :UserName ',
    //    ExpressionAttributeValues: { ':UserName': body.appID, }
    //};
    //const userLineId = await docClient.query( params )
    //    .promise()
    //    .then( ( data ) => {
    //        console.log( 'LINE user ID fetch from dynamoDB was successful...', data );
    //        return ( data.Items[ 0 ].UserLineId );
    //    } )
    //    .catch(
    //        ( err ) => {
    //            console.log( 'LINE user ID fetch from dynamoDB failed...', err );
    //        } );
    //console.log( 'fetched line id...', userLineId )



    ///////////////// Get LINE user info using ID token
    var qs = require( 'qs' );
    const userLineData = await axios
        .request( {
            url: 'https://api.line.me/oauth2/v2.1/verify',
            method: 'POST',
            data: qs.stringify( {
                id_token: body.lineIdToken,
                client_id: process.env.GATSBY_LINE_LIFF_Channel_ID,
            } ),
        } )
        .then( res => {
            console.log( 'Trying to get LINE user info using id token...' + res.data )
            return ( res.data )
        } )
        .catch( err => {
            console.log( 'login id verify...', err )
            return ( err )
        } );
    const userLineId = userLineData.sub;
    const userLineName = userLineData.name;



    ////////////////////////////// Store the analysis results to dynamoDB (atm from LP but analysis will be moved to this netlify functions)
    const date = new Date().toISOString().substr( 0, 19 ).replace( 'T', ' ' ).slice( 0, 10 );

    const paramsReport = {
        TableName: 'LangAppData',
        Item: {
            UserName: userLineName,
            RecordingID: body.recordingID,
            UserLineID: userLineId,
            Date: date,
            LengthMinute: body.lengthMinute,
            WordsTotal: body.wordsTotal,
            WordsPerMinute: body.wordsPerMinute,
            VocabSize: body.vocab,
            Transcript: body.transcript,
        }
    };
    await docClient.put( paramsReport )
        .promise()
        .then( res => console.log( 'Uploading the conversation analysis to dynamoDB was successful...', res ) )
        .catch( err => console.log( 'Uploading the conversation analysis to dynamoDB failed...', err ) );


    //////////////////////////////////////// Fetch the past records from dynamoDB by UserName
    const paramsDynamo = {
        TableName: 'LangAppData',
        IndexName: 'UserLineID-index',
        KeyConditionExpression: 'UserLineID = :UserLineID ',
        ExpressionAttributeValues: { ':UserLineID': userLineId, } //
    };

    const userRecords = await docClient.query( paramsDynamo )
        .promise()
        .then( data => data.Items )
        .catch( err => console.log( 'Fetch records from dynamoDB failed...', err ) );
    userRecords.sort( function ( a, b ) {
        return a.Date < b.Date ? -1 : 1;
    } );

    //////////// record dates array
    const recordDateArray = [];
    userRecords.forEach( ( record ) => {
        recordDateArray.push( record.Date )
    } );
    console.log( 'record dates array...', recordDateArray )

    //////////// total words data
    const wordsTotalDataArray = [];
    userRecords.forEach( ( record ) => {
        const wordsTotalData = { "x": record.Date, "y": record.WordsTotal }
        wordsTotalDataArray.push( wordsTotalData )
    } );
    console.log( 'fetched user records sorted by date...for words per minute', wordsTotalDataArray )

    //////////// words per minute data
    const wordsPerMinuteDataArray = [];
    userRecords.forEach( ( record ) => {
        const wordsPerMinuteData = { "x": record.Date, "y": record.WordsPerMinute }
        wordsPerMinuteDataArray.push( wordsPerMinuteData )
    } );
    console.log( 'fetched user records sorted by date...for words per minute', wordsPerMinuteDataArray )

    //////////// vocab size data
    const vocabSizeDataArray = [];
    userRecords.forEach( ( record ) => {
        const vocabSizeData = { "x": record.Date, "y": record.VocabSize }
        vocabSizeDataArray.push( vocabSizeData )
    } );
    console.log( 'fetched user records sorted by date...for vocab size', vocabSizeDataArray )



    ////////////////////////////////////////////////////// QuickChart

    // Total words
    const chartWordsTotal = new QuickChart();
    chartWordsTotal.setConfig( {
        "type": "line",
        "data": {
            "labels": recordDateArray,
            "datasets": [
                {
                    "label": "Total words in a conversation",
                    "backgroundColor": "rgba(255, 99, 132, 0.5)",
                    "borderColor": "rgb(255, 99, 132)",
                    "fill": 'start',
                    "data": wordsTotalDataArray
                }
            ]
        },
        "options": {
            "title": {
                "text": "Total words in a conversation"
            },
            "scales": {
                "xAxes": [ {
                    "type": "time",
                    "time": {
                        "unit": "day",
                        "parser": "YYYY-MM-DD",
                    },
                    "scaleLabel": {
                        "display": true,
                        "labelString": "Date"
                    }
                } ],
                "yAxes": [ {
                    "scaleLabel": {
                        "display": true,
                        "labelString": "Words"
                    }
                } ]
            }
        }
    } );
    //const url = await chartWordsTotal.getShortUrl();
    //console.log( url );
    const imageWordsTotal = await chartWordsTotal.toBinary()
    console.log( imageWordsTotal )

    // Words per minute
    const chartWordsPerMinute = new QuickChart();
    chartWordsPerMinute.setConfig( {
        "type": "line",
        "data": {
            "labels": recordDateArray,
            "datasets": [
                {
                    "label": "Words per minute",
                    "backgroundColor": "rgba(54, 162, 235, 0.5)",
                    "borderColor": "rgb(54, 162, 235)",
                    "fill": 'start',
                    "data": wordsPerMinuteDataArray
                }
            ]
        },
        "options": {
            "title": {
                "text": "Words per minute"
            },
            "scales": {
                "xAxes": [ {
                    "type": "time",
                    "time": {
                        "unit": "day",
                        "parser": "YYYY-MM-DD",
                    },
                    "scaleLabel": {
                        "display": true,
                        "labelString": "Date"
                    }
                } ],
                "yAxes": [ {
                    "scaleLabel": {
                        "display": true,
                        "labelString": "Words"
                    }
                } ]
            }
        }
    } );
    const imageWordsPerMinute = await chartWordsPerMinute.toBinary()
    console.log( imageWordsPerMinute )

    // Vocab size
    const chartVocabSize = new QuickChart();
    chartVocabSize.setConfig( {
        "type": "line",
        "data": {
            "labels": recordDateArray,
            "datasets": [
                {
                    "label": "Vocabulary in a coversation",
                    "backgroundColor": "rgba(75, 192, 192, 0.5)",
                    "borderColor": "rgb(75, 192, 192)",
                    "fill": 'start',
                    "data": vocabSizeDataArray
                }
            ]
        },
        "options": {
            "title": {
                "text": "Vocabulary in a coversation"
            },
            "scales": {
                "xAxes": [ {
                    "type": "time",
                    "time": {
                        "unit": "day",
                        "parser": "YYYY-MM-DD",
                    },
                    "scaleLabel": {
                        "display": true,
                        "labelString": "Date"
                    }
                } ],
                "yAxes": [ {
                    "scaleLabel": {
                        "display": true,
                        "labelString": "Words"
                    }
                } ]
            }
        }
    } );
    const imageVocabSize = await chartVocabSize.toBinary()
    console.log( imageVocabSize )



    ///////////////////////////////////////// Upload to S3

    // Total words
    const paramsS3WordsTotal = {
        Bucket: 'langapp-audio-analysis',
        Key: `${ date }-${ userLineName }-${ body.recordingID }/wordsTotal.png`,
        Body: imageWordsTotal, // buffer or base
        ContentType: 'image/png',
        ACL: 'public-read',
    };
    const dataURLWordsTotal = await s3.upload( paramsS3WordsTotal )
        .promise()
        .then( ( data ) => {
            console.log( "Full graph successfully uploaded to S3", data )
            return ( data.Location )
        } )
        .catch( err => console.log( "Full graph upload to S3 error", err ) );

    // Words per minute
    const paramsS3WordsPerMinute = {
        Bucket: 'langapp-audio-analysis',
        Key: `${ date }-${ userLineName }-${ body.recordingID }/wordsPerMinute.png`,
        Body: imageWordsPerMinute, // buffer or base
        ContentType: 'image/png',
        ACL: 'public-read',
    };
    const dataURLWordsPerMinute = await s3.upload( paramsS3WordsPerMinute )
        .promise()
        .then( ( data ) => {
            console.log( "Full graph successfully uploaded to S3", data )
            return ( data.Location )
        } )
        .catch( err => console.log( "Full graph upload to S3 error", err ) );

    // Vocab size
    const paramsS3VocabSize = {
        Bucket: 'langapp-audio-analysis',
        Key: `${ date }-${ userLineName }-${ body.recordingID }/vocabSize.png`,
        Body: imageVocabSize, // buffer or base
        ContentType: 'image/png',
        ACL: 'public-read',
    };
    const dataURLVocabSize = await s3.upload( paramsS3VocabSize )
        .promise()
        .then( ( data ) => {
            console.log( "Full graph successfully uploaded to S3", data )
            return ( data.Location )
        } )
        .catch( err => console.log( "Full graph upload to S3 error", err ) );



    ////////////////////////// Push message to LINE bot the analysis resutls

    // Conversation summary
    const message = {
        'type': 'text',
        'text': `話した単語の総数は${ body.wordsTotal }、流暢さ(words per minute)は${ body.wordsPerMinute }、単語の種類数は${ body.vocab }でした！`
    };
    await client.pushMessage( userLineId, message )
        .then( res => console.log( 'report push message successful...', res ) )
        .catch( ( err ) => console.log( 'error in report push message...', err ) );


    // Progress charts
    const pushImage1 = {
        'type': 'image',
        'originalContentUrl': dataURLWordsTotal,
        'previewImageUrl': dataURLWordsTotal,
    };
    await client.pushMessage( userLineId, pushImage1, notificationDisabled = true )
        .then( res => console.log( 'image 1 push message successful...', res ) )
        .catch( err => console.log( 'error in image 1 push message...', err ) );

    const pushImage2 = {
        'type': 'image',
        'originalContentUrl': dataURLWordsPerMinute,
        'previewImageUrl': dataURLWordsPerMinute,
    };
    await client.pushMessage( userLineId, pushImage2, notificationDisabled = true )
        .then( res => console.log( 'image 2 push message successful...', res ) )
        .catch( err => console.log( 'error in image 2 push message...', err ) );

    const pushImage3 = {
        'type': 'image',
        'originalContentUrl': dataURLVocabSize,
        'previewImageUrl': dataURLVocabSize,
    };
    await client.pushMessage( userLineId, pushImage3, notificationDisabled = true )
        .then( res => console.log( 'image 3 push message successful...', res ) )
        .catch( err => console.log( 'error in image 3 push message...', err ) );


    // vocab counts
    const messageVocabCount = {
        'type': 'text',
        'text': `今回の会話で話した回数の多い単語TOP10は、
        ${ vocabCountArray[ 0 ].word }が${ vocabCountArray[ 0 ].count }回、
        ${ vocabCountArray[ 1 ].word }が${ vocabCountArray[ 1 ].count }回、
        ${ vocabCountArray[ 2 ].word }が${ vocabCountArray[ 2 ].count }回、
        ${ vocabCountArray[ 3 ].word }が${ vocabCountArray[ 3 ].count }回、
        ${ vocabCountArray[ 4 ].word }が${ vocabCountArray[ 4 ].count }回、
        ${ vocabCountArray[ 5 ].word }が${ vocabCountArray[ 5 ].count }回、
        ${ vocabCountArray[ 6 ].word }が${ vocabCountArray[ 6 ].count }回、
        ${ vocabCountArray[ 7 ].word }が${ vocabCountArray[ 7 ].count }回、
        ${ vocabCountArray[ 8 ].word }が${ vocabCountArray[ 8 ].count }回、
        ${ vocabCountArray[ 9 ].word }が${ vocabCountArray[ 9 ].count }回、
        でした！`
    };
    await client.pushMessage( userLineId, messageVocabCount )
        .then( res => console.log( 'vocab counts push message successful...', res ) )
        .catch( ( err ) => console.log( 'error in vocab counts push message...', err ) );


    // A messege prompting review
    const messagePromptReview = {
        'type': 'text',
        'text': `書き起こしを見ながら、気になった部分の録音を確認してみましょう！また、単語を送信していただければその単語を使った例文や関連語をお届けします！`
    };
    await client.pushMessage( userLineId, messagePromptReview )
        .then( res => console.log( 'review prompt message successful...', res ) )
        .catch( ( err ) => console.log( 'error in review prompt message...', err ) );




    //////////// Finish the api
    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );
};
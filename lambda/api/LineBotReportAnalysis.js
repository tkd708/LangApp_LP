require( 'dotenv' ).config();
const axios = require( 'axios' );

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
            console.log( 'Success in geting LINE user info using id token...' + res.data )
            return ( res.data )
        } )
        .catch( err => {
            console.log( 'Error in geting LINE user info using id token...', err )
            return ( err )
        } );
    const userLineId = userLineData.sub;
    const userLineName = userLineData.name;




    ////////////////////////// Conversation analysis /////////////////////////////

    // dynamics of the word counts in the conversation
    const wordDynamicsArray = body.transcriptArray.map( ( x, index ) => ( { transcript: x, chunkNo: index + 1, wordCount: x.split( " " ).length } ) )
    wordDynamicsArray.sort( function ( a, b ) {
        return a.wordCount > b.wordCount ? -1 : 1;
    } );

    // all joined transcript
    const transcript = body.transcriptArray.join( ' ' );

    // total words
    const transcriptWordArray = transcript.replace( /[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "" ).split( " " );
    const wordsTotal = transcriptWordArray.length;
    console.log( wordsTotal );

    // words per minute
    //const conversationLength = ( endTime - startTime ) / 1000 / 60;
    const wordsPerMinute = ( transcriptWordArray.length / body.lengthMinute ).toFixed( 1 );
    console.log( wordsPerMinute );

    // size of vocab
    const uniq = [ ...new Set( transcriptWordArray ) ];
    const vocabSize = uniq.length;
    console.log( vocabSize );

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
            Transcript: transcript,
            //TranscriptArray: body.transcriptArray, //...too many object >> error in dynamoDB upload
            WordDynamicsArray: wordDynamicsArray,
            WordsTotal: wordsTotal,
            WordsPerMinute: wordsPerMinute,
            VocabSize: vocabSize,
            Errors: body.errors,
        }
    };
    await docClient.put( paramsReport )
        .promise()
        .then( res => console.log( 'Uploading the conversation analysis to dynamoDB was successful...', res ) )
        .catch( err => console.log( 'Uploading the conversation analysis to dynamoDB failed...', err ) );




    ////////////////////////// Push message to LINE bot the analysis resutls //////////////////////

    // Conversation summary
    const message = {
        'type': 'text',
        'text': `話した単語の総数は${ wordsTotal }、流暢さ(words per minute)は${ wordsPerMinute }、単語の種類数は${ vocabSize }でした！`
    };
    await client.pushMessage( userLineId, message )
        .then( res => console.log( 'report push message successful...', res ) )
        .catch( ( err ) => console.log( 'error in report push message...', err ) );



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
        'text': `分析による会話のハイライトはこちらになります！`
    };
    await client.pushMessage( userLineId, messagePromptReview )
        .then( res => console.log( 'review prompt message successful...', res ) )
        .catch( ( err ) => console.log( 'review prompt message error...', err ) );




    /////// highlights from the conversation.... word count top 3

    // push messages of highlight audio & transcript 1
    const recordChunkCountPadding1 = ( '000' + wordDynamicsArray[ 0 ].chunkNo ).slice( -3 );
    const audioHighlightUrl1 = `https://langapp-audio-analysis.s3.us-east-2.amazonaws.com/${ date }-${ body.recordingID }/audio-${ body.recordingID }-${ recordChunkCountPadding1 }.m4a`
    const audio1 = {
        'type': 'audio',
        'originalContentUrl': audioHighlightUrl1, //fileURL,
        'duration': 30 * 1000, //body.audioInterval, ... in mill seconds
    };
    await client.pushMessage( userLineId, audio1, notificationDisabled = true )
        .then( res => console.log( 'audio 1 push message successful...', res ) )
        .catch( err => console.log( 'audio 1 push message error...', err ) );

    const transcript1 = {
        'type': 'text',
        'text': wordDynamicsArray[ 0 ].transcript
    };
    await client.pushMessage( userLineId, transcript1, notificationDisabled = true )
        .then( res => console.log( 'transcript 1 push message successful...', res ) )
        .catch( err => console.log( 'transcript 1 push message error...', err ) );


    // push messages of highlight audio & transcript 2
    const recordChunkCountPadding2 = ( '000' + wordDynamicsArray[ 1 ].chunkNo ).slice( -3 );
    const audioHighlightUrl2 = `https://langapp-audio-analysis.s3.us-east-2.amazonaws.com/${ date }-${ body.recordingID }/audio-${ body.recordingID }-${ recordChunkCountPadding2 }.m4a`
    const audio2 = {
        'type': 'audio',
        'originalContentUrl': audioHighlightUrl2, //fileURL,
        'duration': 30 * 1000, //body.audioInterval, ... in mill seconds
    };
    await client.pushMessage( userLineId, audio2, notificationDisabled = true )
        .then( res => console.log( 'audio 1 push message successful...', res ) )
        .catch( err => console.log( 'audio 1 push message error...', err ) );

    const transcript2 = {
        'type': 'text',
        'text': wordDynamicsArray[ 1 ].transcript
    };
    await client.pushMessage( userLineId, transcript2, notificationDisabled = true )
        .then( res => console.log( 'transcript 1 push message successful...', res ) )
        .catch( err => console.log( 'transcript 1 push message error...', err ) );

    // push messages of highlight audio & transcript 2
    const recordChunkCountPadding3 = ( '000' + wordDynamicsArray[ 2 ].chunkNo ).slice( -3 );
    const audioHighlightUrl3 = `https://langapp-audio-analysis.s3.us-east-2.amazonaws.com/${ date }-${ body.recordingID }/audio-${ body.recordingID }-${ recordChunkCountPadding3 }.m4a`
    const audio3 = {
        'type': 'audio',
        'originalContentUrl': audioHighlightUrl3, //fileURL,
        'duration': 30 * 1000, //body.audioInterval, ... in mill seconds
    };
    await client.pushMessage( userLineId, audio3, notificationDisabled = true )
        .then( res => console.log( 'audio 1 push message successful...', res ) )
        .catch( err => console.log( 'audio 1 push message error...', err ) );

    const transcript3 = {
        'type': 'text',
        'text': wordDynamicsArray[ 2 ].transcript
    };
    await client.pushMessage( userLineId, transcript3, notificationDisabled = true )
        .then( res => console.log( 'transcript 1 push message successful...', res ) )
        .catch( err => console.log( 'transcript 1 push message error...', err ) );



    // A messege prompting review
    const messagePromptReview = {
        'type': 'text',
        'text': `気になった部分の録音を確認して、メニューから言いたいことを日本語で登録してみましょう！`
    };
    await client.pushMessage( userLineId, messagePromptReview )
        .then( res => console.log( 'review prompt message successful...', res ) )
        .catch( ( err ) => console.log( 'review prompt message error...', err ) );



    //////////// Finish the api
    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: '{"result":"completed"}'
    };
    context.succeed( lambdaResponse );
};
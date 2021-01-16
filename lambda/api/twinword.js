require( 'dotenv' ).config();

const axios = require( 'axios' );

const AWS = require( 'aws-sdk' );
// initialise AWS
AWS.config = new AWS.Config( {
    accessKeyId: process.env.GATSBY_AWS_accessKey,
    secretAccessKey: process.env.GATSBY_AWS_secretKey,
    region: 'us-east-2',
} );

// Create S3 service object
const s3 = new AWS.S3( {
    apiVersion: '2006-03-01',
    params: { Bucket: 'langapp-audio-analysis' }
} );
//console.log( '----------- s3 object -------------', s3 );

const docClient = new AWS.DynamoDB.DocumentClient();

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

    ///////////// Fetch the records from dynamoDB by UserName
    const paramsDynamo = {
        TableName: 'LangAppData',
        KeyConditionExpression: 'UserName = :UserName ',
        ExpressionAttributeValues: { ':UserName': "Naoya Takeda", } // body.appID
    };
    const userRecords = await docClient.query( paramsDynamo )
        .promise()
        .then( ( data ) => {
            //console.log( 'Fetch records from dynamoDB was successful...', data );
            return ( data.Items );
        } )
        .catch( err => console.log( 'Fetch records from dynamoDB failed...', err ) );
    userRecords.sort( function ( a, b ) {
        return a.Date < b.Date ? -1 : 1;
    } );


    // axios config
    const axiosBase = axios.create( {
        baseURL: 'https://api.twinword.com/api/word',
        headers: {
            'Content-Type': 'application/json',
            //'X-Requested-With': 'XMLHttpRequest',
            'Host': 'api.twinword.com',
            'X-Twaip-Key': 'BqSLVGtlCsC1lkeF+8ky3AD5n80MbvoNvkR8Py8xLtS2ZJ82WFYqOuacLeWNroBOsDP6mylYisaPaLIHIsKGfw=='
        },
        responseType: 'json'
    } );

    const urlExamples = 'https://api.twinword.com/api/word/example/latest/';

    // Twinword api
    const word = 'test'
    const url = 'https://api.twinword.com/api/word/example/latest/' + `entry=${ word }/`
    const headers = {
        'Content-Type': 'application/json',
        'Host': 'api.twinword.com',
        'X-Twaip-Key': 'BqSLVGtlCsC1lkeF+8ky3AD5n80MbvoNvkR8Py8xLtS2ZJ82WFYqOuacLeWNroBOsDP6mylYisaPaLIHIsKGfw==',
        //'X-Requested-With': 'XMLHttpRequest',

        //'accept-encoding': 'gzip, deflate, br',
        //'accept-language': 'ja,en-GB;q=0.9,en;q=0.8,en-US;q=0.7,es;q=0.6',
        //'content-length': '14',
        //'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        //'origin': 'https://www.twinword.com',
        //'referer': 'https://www.twinword.com/api/word-dictionary.php',
        //'sec-fetch-dest': 'empty',
        //'sec-fetch-mode': 'cors',
        //'sec-fetch-site': 'same-origin',
        //'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
        //'x-requested-with': 'XMLHttpRequest'
    }

    const twinword =
        await axios
            .request( {
                url: urlExamples,
                method: 'POST',
                headers: headers,
                data: { entry: word }
            } )
            .then( res => res.data )
            .catch( err => console.log( 'ERROR in Twinword api...', err ) );
    console.log( twinword );

    //////////////////////////////// LINE push messages
    const message = {
        'type': 'text',
        'text': twinword
    };
    //await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", message, notificationDisabled = true ) //userLineId
    //    .then( res => console.log( 'push message successful...', res ) )
    //    .catch( err => console.log( 'error in push message...', err ) );




    //////////////// Finish the api
    return {
        statusCode: 200, // http status code
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify( {
            res: twinword
        } )
    }

}
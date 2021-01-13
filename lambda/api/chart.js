require( 'dotenv' ).config();

const { CanvasRenderService } = require( 'chartjs-node-canvas' );

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

module.exports.handler = async function ( event, context, callback ) {

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

    const renderService = new CanvasRenderService( 800, 600 );
    console.log( 'graph render service...', renderService );

    const options = {
        type: 'bar',
        data: {
            labels: [ "Red", "Blue", "Yellow", "Green", "Purple", "Orange" ],
            datasets: [ {
                label: '# of Votes',
                data: [ 12, 19, 3, 5, 2, 3 ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            } ]
        },
        options: {
            scales: {
                yAxes: [ {
                    ticks: {
                        beginAtZero: true
                    }
                } ]
            }
        }
    };
    const buffer = await renderService.renderToBuffer( options )
    console.log( 'rendered graph...', buffer );

    const params = {
        Bucket: 'langapp-audio-analysis',
        Key: 'hoge.png',
        Body: buffer,
        ContentType: 'image/png',
        ACL: 'public-read',
    };

    const data = await s3.upload( params )
        .promise()
        .then( ( data ) => {
            console.log( "Full graph successfully uploaded to S3", data )
            return ( data )
        } )
        .catch(
            ( err ) => {
                console.error( "Full graph upload to S3 error", err );
            } );


    //////////// Finish the api
    let lambdaResponse = {
        statusCode: 200,
        headers: { "X-Line-Status": "OK" },
        body: JSON.stringify( { url: data.Location } ),
    };
    context.succeed( lambdaResponse );
}
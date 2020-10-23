require('dotenv').config();
const twilio = require('twilio');
const AccessToken = twilio.jwt.AccessToken;
const { VideoGrant } = AccessToken;


module.exports.handler = async function(event, context) {
    console.log('headers: '+ event.headers)
    console.log('method: ' + event.httpMethod)

    // to avoid CORS issues... but not functioning atm, to be updated
    //if (event.httpMethod == "OPTIONS"){
    //    console.log("OPTIONS")
    //    return ({
    //    'statusCode': 200,
    //    'headers': {
    //        "Test-Header": "Test",
    //        "Access-Control-Allow-Origin": "*",
    //        "Access-Control-Allow-Headers": "Content-Type",
    //        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
    //    },
    //    'body': "Done"
    //    })
    //}

    const generateToken = () => {
        return new AccessToken(
            process.env.GATSBY_TWILIO_ACCOUNT_SID,
            process.env.GATSBY_TWILIO_API_KEY,
            process.env.GATSBY_TWILIO_API_SECRET
        );
    };

    const videoToken = (identity, room) => {
        let videoGrant;
        if (typeof room !== 'undefined') {
            videoGrant = new VideoGrant({ room });
        } else {
            videoGrant = new VideoGrant();
        }
        const token = generateToken();
        token.addGrant(videoGrant);
        token.identity = identity;
        return token;
    };

    //console.log('request: ' + event.body);
    const token = videoToken(JSON.parse(event.body).identity, JSON.parse(event.body).room)

    return {
    // return null to show no errors
    statusCode: 200, // http status code
    body: JSON.stringify({
      //eventBody: event.body,
      token: token.toJwt()
    })
  }

}
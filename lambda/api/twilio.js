require('dotenv').config();
const twilio = require('twilio');
const AccessToken = twilio.jwt.AccessToken;
const { VideoGrant } = AccessToken;


module.exports.handler = async function(event, context) {

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

    console.log('request: ' + event.body);
    console.log('request: ' + JSON.stringify(event.body));

    const token = videoToken(event.body.identity, event.body.room)

    console.log('raw token: ' + token);
    console.log('raw token: ' + JSON.stringify(token));
    console.log('jwt token: ' + token.toJwt());
    console.log('jwt token: ' + JSON.stringify(token.toJwt()));

    return {
    // return null to show no errors
    statusCode: 200, // http status code
    body: JSON.stringify({
      //eventBody: event.body,
      token: token.toJwt()
    })
  }

}
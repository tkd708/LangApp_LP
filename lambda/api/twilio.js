require('dotenv').config();
const twilio = require('twilio');
const AccessToken = twilio.jwt.AccessToken;
const { VideoGrant } = AccessToken;

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

module.exports.handler = async function(event, context) {

    const token = videoToken(event.body.identity, event.body.room)

    return {
    // return null to show no errors
    statusCode: 200, // http status code
    body: JSON.stringify({
      //eventBody: event.body,
      token: token.toJwt()
    })
  }


}
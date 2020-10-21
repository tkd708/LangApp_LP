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



const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);

const sendTokenResponse = (token, res) => {
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

module.exports.handler = async function(event, context) {

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.get('/video/token', (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room);
  sendTokenResponse(token, res);

});
app.post('/video/token', (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room);
  sendTokenResponse(token, res);
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);

  return {
    // return null to show no errors
    statusCode: 200, // http status code
    body: JSON.stringify({
      //eventAll: event,
      //event64: event.isBase64Encoded,
      //eventHeaders: event.headers,
      //eventBody: event.body,
      //eventRequest: event.queryStringParameters,
      //msg: "Hello, World! This is better " + Math.round(Math.random() * 10),
      txt: "sample text"
    })
  }


}
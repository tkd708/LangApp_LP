//const speech = require('@google-cloud/speech');    
const axios = require('axios');

module.exports.handler = async function(event, context) {
  //console.log("queryStringParameters", event.queryStringParameters)

    const keys = {
        type: process.env['type'],
        project_id: process.env['project_id'],
        private_key_id: process.env['private_key_id'],
        private_key: process.env['private_key'],
        client_email: process.env['client_email'],
        client_id: process.env['client_id'],
        auth_uri: process.env['auth_uri'],
        token_uri: process.env['token_uri'],
        auth_provider_x509_cert_url: process.env['auth_provider_x509_cert_url'],
        client_x509_cert_url: process.env['client_x509_cert_url']
    };
    //console.log(keys)
    //const client = new speech.SpeechClient({credentials: keys});
    //console.log(client)


  return {
    statusCode: 200, // http status code
    body: JSON.stringify({
      msg: "google api keys",
      audio: keys
    })
  }
}


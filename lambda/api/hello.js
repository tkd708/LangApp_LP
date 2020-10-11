// For more info, check https://www.netlify.com/docs/functions/#javascript-lambda-functions
module.exports.handler = async function(event, context) {
  console.log("queryStringParameters", event.queryStringParameters)
  //const body = JSON.parse(event.body);
  console.log(event.body)

  return {
    // return null to show no errors
    statusCode: 200, // http status code
    body: JSON.stringify({
      eventAll: event,
      eventHeaders: event.headers,
      eventBody: event.body,
      eventRequest: event.queryStringParameters,
      msg: "Hello, World! This is better " + Math.round(Math.random() * 10),
      txt: "sample text"
    })
  }
}


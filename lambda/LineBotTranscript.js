(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./LineBotTranscript.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./LineBotTranscript.js":
/*!******************************!*\
  !*** ./LineBotTranscript.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! dotenv */ "dotenv").config();

const line = __webpack_require__(/*! @line/bot-sdk */ "@line/bot-sdk");

const client = new line.Client({
  channelAccessToken: process.env.GATSBY_LINE_accesstoken,
  channelSecret: process.env.GATSBY_LINE_channelsecret
});

const fs = __webpack_require__(/*! fs */ "fs");

const fsp = fs.promises;

const ffmpegPath = __webpack_require__(/*! @ffmpeg-installer/ffmpeg */ "@ffmpeg-installer/ffmpeg").path;

const ffmpeg = __webpack_require__(/*! fluent-ffmpeg */ "fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);

const AWS = __webpack_require__(/*! aws-sdk */ "aws-sdk");

module.exports.handler = async function (event, context) {
  // avoid CORS errors
  if (event.httpMethod == "OPTIONS") {
    console.log("OPTIONS query received");
    return {
      'statusCode': 200,
      'headers': {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      'body': "Done"
    };
  }

  const body = JSON.parse(event.body);
  console.log('app ID...', body.appID);
  console.log('recording ID...', body.recordingID);
  console.log('received audio...', body.audioString); // Encoding wav audio to m4a... maybe not necessary

  const decodedAudio = new Buffer.from(body.audioString, 'base64');
  const decodedPath = '/tmp/decoded.wav';
  await fsp.writeFile(decodedPath, decodedAudio);
  const encodedPath = '/tmp/encoded.m4a';

  const ffmpeg_encode_audio = () => {
    return new Promise((resolve, reject) => {
      ffmpeg().input(decodedPath).outputOptions([//'-f s16le',
      '-acodec aac', /// GCP >> pcm_s16le, LINE(m4a) >> aac
      '-vn', '-ac 1', '-ar 16k', //41k or 16k
      '-map_metadata -1']).save(encodedPath).on('end', async () => {
        console.log('encoding done');
        resolve();
      });
    });
  };

  await ffmpeg_encode_audio();
  const encodedFile = await fsp.readFile(encodedPath);
  console.log('converted audio: ' + encodedFile.toString('base64').slice(0, 100)); // initialise AWS

  AWS.config = new AWS.Config({
    accessKeyId: process.env.GATSBY_AWS_accessKey,
    secretAccessKey: process.env.GATSBY_AWS_secretKey,
    region: 'us-east-2'
  }); // Create S3 service object

  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {
      Bucket: 'langapp-audio-analysis'
    }
  }); // S3 Upload parameters

  const uploadParams = {
    Bucket: 'langapp-audio-analysis',
    Key: '',
    Body: ''
  };
  const date = new Date().toISOString().substr(0, 19).replace('T', ' ').slice(0, 10);
  const time = new Date().toISOString().substr(0, 19).replace('T', ' ').slice(-8);
  uploadParams.Key = `${date}-${body.appID}-${body.recordingID}/audio-${time}.m4a`;
  uploadParams.Body = encodedFile; // call S3 to retrieve upload file to specified bucket and obtain the file url

  const fileURL = await s3.upload(uploadParams).promise().then(data => {
    console.log("Audio chunk successfully uploaded to S3", data);
    return data.Location;
  }).catch(err => {
    console.error("Audio chunk upload to S3 error", err);
  });
  console.log('s3 file url...', fileURL); ///////////////// Get LINE user ID from dynamoDB corresponding to the user name (appID) input by the user on LP

  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'LangAppUsers',
    KeyConditionExpression: 'UserName = :UserName ',
    ExpressionAttributeValues: {
      ':UserName': body.appID
    }
  };
  const userLineId = await docClient.query(params).promise().then(data => {
    console.log('LINE user ID fetch from dynamoDB was successful...', data);
    return data.Items[0].UserLineId;
  }).catch(err => {
    console.log('LINE user ID fetch from dynamoDB failed...', err);
  });
  console.log('fetched line id...', userLineId); ///////////////// push message of audio.... tentatively omitted, need to work on ffmpeg first to convert the audio into m4a

  const audio = {
    'type': 'audio',
    'originalContentUrl': fileURL,
    'duration': 30000
  };
  const audioPushRes = await client.pushMessage(userLineId, audio, notificationDisabled = true).then(res => {
    console.log('audio push message successful...', res);
    return res;
  }).catch(err => {
    console.log('error in audio push message...', err);
    return err;
  });
  console.log('audio push message event executed...', audioPushRes); /////////////// push message of transcript

  console.log('received transcript...', body.transcript);
  const message = {
    'type': 'text',
    'text': body.transcript
  };
  await client.pushMessage(userLineId, message, notificationDisabled = true).then(response => {
    console.log('transcript push message successful...', response);
  }).catch(err => console.log('error in transcript push message...', err));
  console.log('transcript push message event executed'); // success of API

  let lambdaResponse = {
    statusCode: 200,
    headers: {
      "X-Line-Status": "OK"
    },
    body: '{"result":"completed"}'
  };
  context.succeed(lambdaResponse);
};

/***/ }),

/***/ "@ffmpeg-installer/ffmpeg":
/*!*******************************************!*\
  !*** external "@ffmpeg-installer/ffmpeg" ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@ffmpeg-installer/ffmpeg");

/***/ }),

/***/ "@line/bot-sdk":
/*!********************************!*\
  !*** external "@line/bot-sdk" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@line/bot-sdk");

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "fluent-ffmpeg":
/*!********************************!*\
  !*** external "fluent-ffmpeg" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fluent-ffmpeg");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })

/******/ })));
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./aws-s3.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./aws-s3.js":
/*!*******************!*\
  !*** ./aws-s3.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! dotenv */ "dotenv").config();

const AWS = __webpack_require__(/*! aws-sdk */ "aws-sdk");

const fs = __webpack_require__(/*! fs */ "fs");

const fsp = fs.promises;

const ffmpegPath = __webpack_require__(/*! @ffmpeg-installer/ffmpeg */ "@ffmpeg-installer/ffmpeg").path;

const ffmpeg = __webpack_require__(/*! fluent-ffmpeg */ "fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);

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
  } //console.log( 'received audio', JSON.parse( event.body ).audio );
  // initialise AWS


  AWS.config = new AWS.Config({
    accessKeyId: process.env.GATSBY_AWS_accessKey,
    secretAccessKey: process.env.GATSBY_AWS_secretKey,
    region: 'us-east-2'
  }); //console.log( '----------- aws config -------------', AWS.config )
  // Create S3 service object

  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {
      Bucket: 'langapp-audio-analysis'
    }
  }); //console.log( '----------- s3 object -------------', s3 );
  //const methods1 = Object.getOwnPropertyNames( AWS.S3.prototype )
  //console.log( '-------------- list of methods AWS S3 ------------------', methods1 )
  //const methods2 = Object.getOwnPropertyNames( s3 )
  //console.log( '-------------- list of methods s3 object ------------------', methods2 )
  //s3.listObjects( ( err, data ) => {
  //    console.log( 'list object excecuted' );
  //    if( err ) {
  //        console.log( "List object Error", err );
  //    } else {
  //        console.log( "List object Success", data );
  //    }
  //} );
  ////////////////////////// S3 upload parameters

  const uploadParams = {
    Bucket: 'langapp-audio-analysis',
    Key: '',
    Body: ''
  }; //const now = new Date();
  //const dateTimeNow = `${ now.getFullYear() }-${ now.getMonth() + 1 }-${ now.getDate() } ${ now.getHours() }:${ now.getMinutes() }:${ now.getSeconds() }`;

  const date = new Date().toISOString().substr(0, 19).replace('T', ' ').slice(0, 10);
  uploadParams.Key = `${date}-${JSON.parse(event.body).appID}-${JSON.parse(event.body).recordingID}/audioFull.m4a`;
  console.log('received audio: ', JSON.parse(event.body).audio.slice(0, 100));
  const decodedAudio = new Buffer.from(JSON.parse(event.body).audio, 'base64');
  const decodedPath = '/tmp/decoded.weba';
  await fsp.writeFile(decodedPath, decodedAudio);
  const decodedFile = await fsp.readFile(decodedPath);
  console.log('received and read audio: ' + decodedFile.toString('base64').slice(0, 100));
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
  console.log('converted audio: ' + encodedFile.toString('base64').slice(0, 100));
  uploadParams.Body = encodedFile;
  console.log('----------- aws upload params -------------', uploadParams); ////////////////////////////// call S3 to retrieve upload file to specified bucket

  await s3.upload(uploadParams).promise().then(data => {
    console.log("Full audio successfully uploaded to S3", data);
  }).catch(err => {
    console.error("Full audio upload to S3 error", err);
  }); // Create a promise on S3 service object
  //const uploadPromise = new AWS.S3( {
  //    apiVersion: '2006-03-01',
  //    params: { Bucket: 'langapp-audio-analysis' }
  //} ).upload( uploadParams ).promise();
  //console.log( "-------------------- Upload promise object ------------------", uploadPromise );
  // Handle promise fulfilled/rejected states
  //await uploadPromise.then( ( data ) => {
  //    console.log( "Successfully uploaded", data )
  //} )
  //    .catch(
  //        ( err ) => {
  //            console.error( "Upload error", err );
  //        } );
  //const [ response ] = await uploadPromise.then();
  //console.log( "---------------- promise response --------------------", response );

  console.log('----------- end aws upload -------------'); //////////////// Finish the api

  return {
    statusCode: 200,
    // http status code
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify({
      status: 'file uploaded'
    })
  };
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
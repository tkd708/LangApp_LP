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
/******/ 	return __webpack_require__(__webpack_require__.s = "./speech-to-text-expo.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./speech-to-text-expo.js":
/*!********************************!*\
  !*** ./speech-to-text-expo.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const speech = __webpack_require__(/*! @google-cloud/speech */ "@google-cloud/speech");

const axios = __webpack_require__(/*! axios */ "axios");

__webpack_require__(/*! dotenv */ "dotenv").config();

const fs = __webpack_require__(/*! fs */ "fs");

const ffmpegPath = __webpack_require__(/*! @ffmpeg-installer/ffmpeg */ "@ffmpeg-installer/ffmpeg").path;

const ffmpeg = __webpack_require__(/*! fluent-ffmpeg */ "fluent-ffmpeg");

module.exports.handler = async function (event, context) {
  //console.log("queryStringParameters", event.queryStringParameters)
  const keys = {
    type: process.env.GATSBY_type,
    project_id: process.env.GATSBY_project_id,
    private_key_id: process.env.GATSBY_private_key_id,
    private_key: process.env.GATSBY_private_key,
    client_email: process.env.GATSBY_client_email,
    client_id: process.env.GATSBY_client_id,
    auth_uri: process.env.GATSBY_auth_uri,
    token_uri: process.env.GATSBY_token_uri,
    auth_provider_x509_cert_url: process.env.GATSBY_auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.GATSBY_client_x509_cert_url
  }; //console.log('test' + keys)

  const client = new speech.SpeechClient({
    credentials: keys
  }); //console.log(client)

  const sttConfig = {
    enableAutomaticPunctuation: false,
    encoding: 'LINEAR16',
    sampleRateHertz: 41000,
    languageCode: 'en_US',
    // ja-JP, en-US, es-CO, fr-FR
    //enableSpeakerDiarization: true,
    //diarizationSpeakerCount: 2, // no. of speakers
    model: 'default' // default, phone_call

  };
  const request = {
    audio: {
      content: 'audioBytes'
    },
    config: sttConfig
  };
  const [response] = await client.recognize(event.body); //const [response] = await client.recognize(request);
  //console.log(response.results.alternatives[0]);
  //const transcription = response.results
  //    .map((result) => result.alternatives[0].transcript)
  //    .join('\n');
  //console.log(`Transcription: ${transcription}`);

  return {
    statusCode: 200,
    // http status code
    body: JSON.stringify({
      keys: keys,
      request: event.body,
      response: response,
      transcription: 'response to be here'
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

/***/ "@google-cloud/speech":
/*!***************************************!*\
  !*** external "@google-cloud/speech" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@google-cloud/speech");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("axios");

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
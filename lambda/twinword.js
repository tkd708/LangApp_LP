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
/******/ 	return __webpack_require__(__webpack_require__.s = "./twinword.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./twinword.js":
/*!*********************!*\
  !*** ./twinword.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! dotenv */ "dotenv").config();

const axios = __webpack_require__(/*! axios */ "axios");

const AWS = __webpack_require__(/*! aws-sdk */ "aws-sdk"); // initialise AWS


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
}); //console.log( '----------- s3 object -------------', s3 );

const docClient = new AWS.DynamoDB.DocumentClient();

const line = __webpack_require__(/*! @line/bot-sdk */ "@line/bot-sdk");

const client = new line.Client({
  channelAccessToken: process.env.GATSBY_LINE_accesstoken,
  channelSecret: process.env.GATSBY_LINE_channelsecret
});

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
  } ///////////////////////////// // Twinword api


  const urlAssociation = 'https://api.twinword.com/api/word/association/latest/';
  const urlExamples = 'https://api.twinword.com/api/word/example/latest/';
  const word = 'doubt'; //

  const headers = {
    'Content-Type': 'application/json',
    'Host': 'api.twinword.com',
    'X-Twaip-Key': process.env.GATSBY_Twinword_API_KEY
  };
  const twinwordAssociation = await axios.request({
    url: urlAssociation,
    method: 'GET',
    params: {
      entry: word
    },
    headers: headers //data: { entry: word }

  }).then(res => {
    //console.log( 'Twinword success...', res )
    return res.data;
  }).catch(err => console.log('ERROR in Twinword api...', err)); //console.log( twinword.data );

  const twinwordExamples = await axios.request({
    url: urlExamples,
    method: 'GET',
    params: {
      entry: word
    },
    headers: headers //data: { entry: word }

  }).then(res => {
    //console.log( 'Twinword success...', res )
    return res.data;
  }).catch(err => console.log('ERROR in Twinword api...', err)); //console.log( twinword.data );
  //////////////// Finish the api

  return {
    statusCode: 200,
    // http status code
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify({
      resExample: twinwordExamples,
      resAssociation: twinwordAssociation
    })
  };
};

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

/***/ })

/******/ })));
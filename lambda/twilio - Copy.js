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
/******/ 	return __webpack_require__(__webpack_require__.s = "./twilio - Copy.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./twilio - Copy.js":
/*!**************************!*\
  !*** ./twilio - Copy.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! dotenv */ "dotenv").config();

const twilio = __webpack_require__(/*! twilio */ "twilio");

const AccessToken = twilio.jwt.AccessToken;
const {
  VideoGrant
} = AccessToken;

const generateToken = () => {
  return new AccessToken(process.env.GATSBY_TWILIO_ACCOUNT_SID, process.env.GATSBY_TWILIO_API_KEY, process.env.GATSBY_TWILIO_API_SECRET);
};

const videoToken = (identity, room) => {
  let videoGrant;

  if (typeof room !== 'undefined') {
    videoGrant = new VideoGrant({
      room
    });
  } else {
    videoGrant = new VideoGrant();
  }

  const token = generateToken();
  token.addGrant(videoGrant);
  token.identity = identity;
  return token;
};

const express = __webpack_require__(/*! express */ "express");

const bodyParser = __webpack_require__(/*! body-parser */ "body-parser");

const pino = __webpack_require__(/*! express-pino-logger */ "express-pino-logger")();

const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(pino);

const sendTokenResponse = (token, res) => {
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify({
    token: token.toJwt()
  }));
};

module.exports.handler = async function (event, context) {
  app.get('/api/greeting', (req, res) => {
    const name = req.query.name || 'World';
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      greeting: `Hello ${name}!`
    }));
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
  app.listen(3001, () => console.log('Express server is running on localhost:3001'));
  return {
    // return null to show no errors
    statusCode: 200,
    // http status code
    body: JSON.stringify({
      //eventAll: event,
      //event64: event.isBase64Encoded,
      //eventHeaders: event.headers,
      //eventBody: event.body,
      //eventRequest: event.queryStringParameters,
      //msg: "Hello, World! This is better " + Math.round(Math.random() * 10),
      txt: "sample text"
    })
  };
};

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "express-pino-logger":
/*!**************************************!*\
  !*** external "express-pino-logger" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-pino-logger");

/***/ }),

/***/ "twilio":
/*!*************************!*\
  !*** external "twilio" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("twilio");

/***/ })

/******/ })));
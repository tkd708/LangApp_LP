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
/******/ 	return __webpack_require__(__webpack_require__.s = "./twilio.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./twilio.js":
/*!*******************!*\
  !*** ./twilio.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! dotenv */ "dotenv").config();

const twilio = __webpack_require__(/*! twilio */ "twilio");

const AccessToken = twilio.jwt.AccessToken;
const {
  VideoGrant
} = AccessToken;

module.exports.handler = async function (event, context) {
  console.log('headers: ' + event.headers);
  console.log('method: ' + event.httpMethod); // to avoid CORS issues... but not functioning atm, to be updated
  //if (event.httpMethod == "OPTIONS"){
  //    console.log("OPTIONS")
  //    return ({
  //    'statusCode': 200,
  //    'headers': {
  //        "Test-Header": "Test",
  //        "Access-Control-Allow-Origin": "*",
  //        "Access-Control-Allow-Headers": "Content-Type",
  //        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
  //    },
  //    'body': "Done"
  //    })
  //}

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
  }; //console.log('request: ' + event.body);


  const token = videoToken(JSON.parse(event.body).identity, JSON.parse(event.body).room);
  return {
    // return null to show no errors
    statusCode: 200,
    // http status code
    body: JSON.stringify({
      //eventBody: event.body,
      token: token.toJwt()
    })
  };
};

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

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
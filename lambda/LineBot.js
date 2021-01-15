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
/******/ 	return __webpack_require__(__webpack_require__.s = "./LineBot.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./LineBot.js":
/*!********************!*\
  !*** ./LineBot.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! dotenv */ "dotenv").config();

const line = __webpack_require__(/*! @line/bot-sdk */ "@line/bot-sdk");

const crypto = __webpack_require__(/*! crypto */ "crypto");

const client = new line.Client({
  channelAccessToken: process.env.GATSBY_LINE_accesstoken,
  channelSecret: process.env.GATSBY_LINE_channelsecret
});

const AWS = __webpack_require__(/*! aws-sdk */ "aws-sdk");

module.exports.handler = async function (event, context) {
  //const methods = Object.getOwnPropertyNames( client )
  //console.log( '-------------- list of methods line client object ------------------', methods )
  //let signature = crypto.createHmac( 'sha256', process.env.GATSBY_LINE_channelsecret ).update( event.body ).digest( 'base64' );
  //let checkHeader = ( event.headers || {} )[ 'X-Line-Signature' ];
  let body = JSON.parse(event.body);
  console.log(event); /////////////// initialise AWS

  AWS.config = new AWS.Config({
    accessKeyId: process.env.GATSBY_AWS_accessKey,
    secretAccessKey: process.env.GATSBY_AWS_secretKey,
    region: 'us-east-2'
  });
  const docClient = new AWS.DynamoDB.DocumentClient(); //if( signature === checkHeader ) {

  if (body.events[0].replyToken === '00000000000000000000000000000000') {
    //接続確認エラー回避
    let lambdaResponse = {
      statusCode: 200,
      headers: {
        "X-Line-Status": "OK"
      },
      body: '{"result":"connect check"}'
    };
    context.succeed(lambdaResponse);
    return;
  } else {
    let text = body.events[0].message.text;
    console.log('received text...', text); ////////////////////////////// Reply messages below /////////////////////////////////////
    //////////////////////////// Registration

    if (text == '登録') {
      console.log('the user to be registered...', body.events[0].source.userId); // Get the user profile

      const userProfile = await client.getProfile(body.events[0].source.userId).then(res => {
        console.log('get profile attempted...', res);
        return res;
      }).catch(err => console.log('get profile failed...', err));
      console.log('get profile event executed'); // Store the user name and ID in the dynamoDB

      const params = {
        TableName: 'LangAppUsers',
        Item: {
          UserName: userProfile.displayName,
          UserLineId: body.events[0].source.userId
        }
      };
      await docClient.put(params).promise().then(res => console.log('Adding the user name and id on dynamoDB was successful...', res)).catch(err => console.log('Adding the user name and id on dynamoDB failed...', err)); // Notify the user that the ID is registered

      const message = {
        'type': 'text',
        'text': `ご登録どうもありがとうございます！LangAppのウェブサイトで英会話を録音される際に、「お名前」の項目にLINEの表示名「 ${userProfile.displayName}」をご入力ください。音声とその書き起こし、英会話の分析結果をLangAppBotよりお届けいたします！`
      };
      await client.replyMessage(body.events[0].replyToken, message).then(res => {
        console.log('user id for registration reply attempted...', res);
      }).catch(err => console.log('error in user id for registration reply...', err));
      console.log('user id for registration reply event executed');
    } //////// Reply the same message
    //const message = {
    //    'type': 'text',
    //    'text': text
    //};
    //await client.replyMessage( body.events[ 0 ].replyToken, message )
    //    .then( ( response ) => {
    //        console.log( 'reply attempted...', response );
    //    } )
    //    .catch( ( err ) => console.log( 'error in reply...', err ) );
    //console.log( 'reply event executed' );
    ////// Transfer the message to me
    //await client.pushMessage( "Udad2da023a7d6c812ae68b2c6e5ea858", message )
    //    .then( ( response ) => {
    //        console.log( 'additional push message attempted...', response );
    //    } )
    //    .catch( ( err ) => console.log( 'error in additional push message...', err ) );
    //console.log( 'additional push message event executed' );
    ///// Finish the api


    let lambdaResponse = {
      statusCode: 200,
      headers: {
        "X-Line-Status": "OK"
      },
      body: '{"result":"completed"}'
    };
    context.succeed(lambdaResponse); // trying a promise object
    // const replyPromise = client.replyMessage( body.events[ 0 ].replyToken, message ).promise();
    // const [ response ] = await replyPromise
    //     .then( ( response ) => {
    //       console.log( 'reply attempted by the promise object...', response );
    //        let lambdaResponse = {
    //            statusCode: 200,
    //            headers: { "X-Line-Status": "OK" },
    //            body: '{"result":"completed"}'
    //        };
    //        context.succeed( lambdaResponse );
    //    } )
    //    .catch( ( err ) => console.log( 'error in the promise object...', err ) );
  } //} else {
  //    console.log( '署名認証エラー' );
  //}

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

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("crypto");

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
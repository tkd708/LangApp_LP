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
/******/ 	return __webpack_require__(__webpack_require__.s = "./chart.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./chart.js":
/*!******************!*\
  !*** ./chart.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! dotenv */ "dotenv").config();

const QuickChart = __webpack_require__(/*! quickchart-js */ "quickchart-js");

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
  } ///////////// Fetch the records from dynamoDB by UserName


  const paramsDynamo = {
    TableName: 'LangAppData',
    KeyConditionExpression: 'UserName = :UserName ',
    ExpressionAttributeValues: {
      ':UserName': "Naoya Takeda"
    } // body.appID

  };
  const userRecords = await docClient.query(paramsDynamo).promise().then(data => {
    //console.log( 'Fetch records from dynamoDB was successful...', data );
    return data.Items;
  }).catch(err => console.log('Fetch records from dynamoDB failed...', err));
  userRecords.sort(function (a, b) {
    return a.Date < b.Date ? -1 : 1;
  }); //////////// record dates array

  const recordDateArray = [];
  userRecords.forEach(record => {
    recordDateArray.push(record.Date);
  });
  console.log('record dates array...', recordDateArray); //////////// total words data

  const wordsTotalDataArray = [];
  userRecords.forEach(record => {
    const wordsTotalData = {
      "x": record.Date,
      "y": record.WordsTotal
    };
    wordsTotalDataArray.push(wordsTotalData);
  });
  console.log('fetched user records sorted by date...for words per minute', wordsTotalDataArray); //////////// words per minute data

  const wordsPerMinuteDataArray = [];
  userRecords.forEach(record => {
    const wordsPerMinuteData = {
      "x": record.Date,
      "y": record.WordsPerMinute
    };
    wordsPerMinuteDataArray.push(wordsPerMinuteData);
  });
  console.log('fetched user records sorted by date...for words per minute', wordsPerMinuteDataArray); //////////// vocab size data

  const vocabSizeDataArray = [];
  userRecords.forEach(record => {
    const vocabSizeData = {
      "x": record.Date,
      "y": record.VocabSize
    };
    vocabSizeDataArray.push(vocabSizeData);
  });
  console.log('fetched user records sorted by date...for vocab size', vocabSizeDataArray); /////////////////////////////////////QuickCHart
  // Total words

  const chartWordsTotal = new QuickChart();
  chartWordsTotal.setConfig({
    "type": "line",
    "data": {
      "labels": recordDateArray,
      "datasets": [{
        "label": "Total words in a conversation",
        "backgroundColor": "rgba(255, 99, 132, 0.5)",
        "borderColor": "rgb(255, 99, 132)",
        "fill": 'start',
        "data": wordsTotalDataArray
      }]
    },
    "options": {
      "title": {
        "text": "Total words in a conversation"
      },
      "scales": {
        "xAxes": [{
          "type": "time",
          "time": {
            "unit": "day",
            "parser": "YYYY-MM-DD"
          },
          "scaleLabel": {
            "display": true,
            "labelString": "Date"
          }
        }],
        "yAxes": [{
          "scaleLabel": {
            "display": true,
            "labelString": "Words"
          }
        }]
      }
    }
  }); //const url = await chartWordsTotal.getShortUrl();
  //console.log( url );

  const imageWordsTotal = await chartWordsTotal.toBinary();
  console.log(imageWordsTotal); // Words per minute

  const chartWordsPerMinute = new QuickChart();
  chartWordsPerMinute.setConfig({
    "type": "line",
    "data": {
      "labels": recordDateArray,
      "datasets": [{
        "label": "Words per minute",
        "backgroundColor": "rgba(54, 162, 235, 0.5)",
        "borderColor": "rgb(54, 162, 235)",
        "fill": 'start',
        "data": wordsPerMinuteDataArray
      }]
    },
    "options": {
      "title": {
        "text": "Words per minute"
      },
      "scales": {
        "xAxes": [{
          "type": "time",
          "time": {
            "unit": "day",
            "parser": "YYYY-MM-DD"
          },
          "scaleLabel": {
            "display": true,
            "labelString": "Date"
          }
        }],
        "yAxes": [{
          "scaleLabel": {
            "display": true,
            "labelString": "Words"
          }
        }]
      }
    }
  });
  const imageWordsPerMinute = await chartWordsPerMinute.toBinary();
  console.log(imageWordsPerMinute); // Vocab size

  const chartVocabSize = new QuickChart();
  chartVocabSize.setConfig({
    "type": "line",
    "data": {
      "labels": recordDateArray,
      "datasets": [{
        "label": "Vocabulary in a coversation",
        "backgroundColor": "rgba(75, 192, 192, 0.5)",
        "borderColor": "rgb(75, 192, 192)",
        "fill": 'start',
        "data": vocabSizeDataArray
      }]
    },
    "options": {
      "title": {
        "text": "Vocabulary in a coversation"
      },
      "scales": {
        "xAxes": [{
          "type": "time",
          "time": {
            "unit": "day",
            "parser": "YYYY-MM-DD"
          },
          "scaleLabel": {
            "display": true,
            "labelString": "Date"
          }
        }],
        "yAxes": [{
          "scaleLabel": {
            "display": true,
            "labelString": "Words"
          }
        }]
      }
    }
  });
  const imageVocabSize = await chartVocabSize.toBinary();
  console.log(imageVocabSize); ///////////////////////////////////////// Upload to S3
  // Total words

  const paramsS3WordsTotal = {
    Bucket: 'langapp-audio-analysis',
    Key: 'wordsTotal.png',
    Body: imageWordsTotal,
    // buffer or base
    ContentType: 'image/png',
    ACL: 'public-read'
  };
  const dataURLWordsTotal = await s3.upload(paramsS3WordsTotal).promise().then(data => {
    console.log("Full graph successfully uploaded to S3", data);
    return data.Location;
  }).catch(err => console.log("Full graph upload to S3 error", err)); // Words per minute

  const paramsS3WordsPerMinute = {
    Bucket: 'langapp-audio-analysis',
    Key: 'wordsPerMinute.png',
    Body: imageWordsPerMinute,
    // buffer or base
    ContentType: 'image/png',
    ACL: 'public-read'
  };
  const dataURLWordsPerMinute = await s3.upload(paramsS3WordsPerMinute).promise().then(data => {
    console.log("Full graph successfully uploaded to S3", data);
    return data.Location;
  }).catch(err => console.log("Full graph upload to S3 error", err)); // Vocab size

  const paramsS3VocabSize = {
    Bucket: 'langapp-audio-analysis',
    Key: 'vocabSize.png',
    Body: imageVocabSize,
    // buffer or base
    ContentType: 'image/png',
    ACL: 'public-read'
  };
  const dataURLVocabSize = await s3.upload(paramsS3VocabSize).promise().then(data => {
    console.log("Full graph successfully uploaded to S3", data);
    return data.Location;
  }).catch(err => console.log("Full graph upload to S3 error", err)); //////////////////////////////// LINE push messages

  const pushImage1 = {
    'type': 'image',
    'originalContentUrl': dataURLWordsTotal,
    'previewImageUrl': dataURLWordsTotal
  };
  await client.pushMessage("Udad2da023a7d6c812ae68b2c6e5ea858", pushImage1, notificationDisabled = true) //userLineId
  .then(res => console.log('image 1 push message successful...', res)).catch(err => console.log('error in image 1 push message...', err));
  const pushImage2 = {
    'type': 'image',
    'originalContentUrl': dataURLWordsPerMinute,
    'previewImageUrl': dataURLWordsPerMinute
  };
  await client.pushMessage("Udad2da023a7d6c812ae68b2c6e5ea858", pushImage2, notificationDisabled = true) //userLineId
  .then(res => console.log('image 2 push message successful...', res)).catch(err => console.log('error in image 2 push message...', err));
  const pushImage3 = {
    'type': 'image',
    'originalContentUrl': dataURLVocabSize,
    'previewImageUrl': dataURLVocabSize
  };
  await client.pushMessage("Udad2da023a7d6c812ae68b2c6e5ea858", pushImage3, notificationDisabled = true) //userLineId
  .then(res => console.log('image 3 push message successful...', res)).catch(err => console.log('error in image 3 push message...', err)); //////////////// Finish the api

  return {
    statusCode: 200,
    // http status code
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify({
      ur12: dataURLWordsTotal,
      url2: dataURLWordsPerMinute,
      url3: dataURLVocabSize //records: userRecords

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

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "quickchart-js":
/*!********************************!*\
  !*** external "quickchart-js" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("quickchart-js");

/***/ })

/******/ })));
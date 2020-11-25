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
/******/ 	return __webpack_require__(__webpack_require__.s = "./kuromoji.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./kuromoji.js":
/*!*********************!*\
  !*** ./kuromoji.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const kuromoji = __webpack_require__(/*! kuromoji */ "kuromoji"); // インプットとなる文章(長文につき一部省略)


const text = `
そこも場合もうその病気らに対して旨の時がしんませ。
単に事実に使用方はどうかその応用たないでもが思いてならないがも発展思いうべきて、あいにくにもなるだなですた。
`; // kuromoji.jsにバンドルされている辞書のフォルダパス
// kuromoji.jsは形態素解析用関数を生成する際に辞書を読み込む

const DIC_URL = '../../node_modules/kuromoji/dict'; // WordCloudの情報として抽出する品詞（助詞、助動詞などは意味がないので拾わない）

const TARGET_POS = ['名詞', '動詞', '形容詞']; // kuromoji.jsの解析結果の値で特に値がない場合は以下の文字が設定される

const NO_CONTENT = '*'; //module.exports.handler = async function(event, context) {

async function main() {
  // kuromoji.jsによる解析処理
  const words = await new Promise((resolve, reject) => {
    // 辞書を読み混んでトークナイザー（形態素解析するための関数）を生成
    kuromoji.builder({
      dicPath: DIC_URL
    }).build((err, tokenizer) => {
      if (err) {
        return reject(err);
      } // テキストを引数にして形態素解析


      resolve(tokenizer.tokenize(text) // pos（品詞）を参照し、'名詞', '動詞', '形容詞'のみを抽出
      .filter(t => TARGET_POS.includes(t.pos)) // 単語を抽出(basic_formかsurface_formに単語が存在する)
      .map(t => t.basic_form === NO_CONTENT ? t.surface_form : t.basic_form) // [{text: 単語, size: 出現回数}]の形にReduce
      .reduce((data, text) => {
        const target = data.find(c => c.text === text);

        if (target) {
          target.size = target.size + 1;
        } else {
          data.push({
            text,
            size: 1
          });
        }

        return data;
      }, []));
    });
  });
  console.log(words);
}

main();

/***/ }),

/***/ "kuromoji":
/*!***************************!*\
  !*** external "kuromoji" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("kuromoji");

/***/ })

/******/ })));
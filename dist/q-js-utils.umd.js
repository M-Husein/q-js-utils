(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["q-js-utils"] = {}));
})(this, (function (exports) { 'use strict';

	function cached(fn) {
	  var cache = Object.create(null);
	  return function cachedFn(s) {
	    var hit = cache[s];
	    return hit || (cache[s] = fn(s));
	  };
	}

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	  }, _typeof(obj);
	}

	function _slicedToArray(arr, i) {
	  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	function _iterableToArrayLimit(arr, i) {
	  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

	  if (_i == null) return;
	  var _arr = [];
	  var _n = true;
	  var _d = false;

	  var _s, _e;

	  try {
	    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
	      _arr.push(_s.value);

	      if (i && _arr.length === i) break;
	    }
	  } catch (err) {
	    _d = true;
	    _e = err;
	  } finally {
	    try {
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	/** 
	 @FROM: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#real-world_usage 
	*/
	function typeOf(obj, showFull) {
	  var toStr = Object.prototype.toString.call(obj); // get toPrototypeString() of obj (handles all types)

	  if (showFull && _typeof(obj) === "object") {
	    return toStr;
	  } // implicit toString() conversion


	  if (obj == null) {
	    return (obj + '').toLowerCase();
	  }

	  var deepType = toStr.slice(8, -1).toLowerCase();

	  if (deepType === 'generatorfunction') {
	    return 'function';
	  } // Prevent overspecificity (for example, [object HTMLDivElement], etc).
	  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
	  // String.prototype.match is universally supported.


	  return deepType.match(/^(array|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType : _typeof(obj) === 'object' || typeof obj === 'function' ? 'object' : _typeof(obj);
	}

	var darkOrLight = cached(function (color) {
	  var r, g, b, hsp; // Check the format of the color, HEX or RGB?

	  if (color.match(/^rgb/)) {
	    // If HEX --> store the red, green, blue values in separate variables
	    color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
	    r = color[1];
	    g = color[2];
	    b = color[3];
	  } else {
	    // If RGB --> Convert it to HEX: http://gist.github.com/983661
	    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
	    r = color >> 16;
	    g = color >> 8 & 255;
	    b = color & 255;
	  } // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html


	  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)); // Using the HSP value, determine whether the color is light or dark

	  if (hsp > 127.5) return 'light';
	  return 'dark';
	});

	function str2Hex(str) {
	  var no = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '5a6268';
	  if (!str || (str === null || str === void 0 ? void 0 : str.length) === 0) return no;
	  var hash = 0,
	      sl = str.length;

	  for (var i = 0; i < sl; i++) {
	    hash = str.charCodeAt(i) + ((hash << 5) - hash);
	    hash = hash & hash;
	  }

	  var color = '';

	  for (var j = 0; j < 3; j++) {
	    var val = hash >> j * 8 & 255;
	    color += ('00' + val.toString(16)).substr(-2);
	  }

	  return color;
	}

	function getInitials(name) {
	  var no = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "?";

	  if (!name || !(typeOf(name) === 'string') || name === " " || name.length < 1) {
	    return no;
	  } // Destruct 


	  var _name$split = name.split(" "),
	      _name$split2 = _slicedToArray(_name$split, 2),
	      first = _name$split2[0],
	      last = _name$split2[1];

	  if (first && last) {
	    return first[0] + last[0];
	  }

	  return first[0];
	}

	exports.cached = cached;
	exports.darkOrLight = darkOrLight;
	exports.getInitials = getInitials;
	exports.str2Hex = str2Hex;
	exports.typeOf = typeOf;

	Object.defineProperty(exports, '__esModule', { value: true });

}));

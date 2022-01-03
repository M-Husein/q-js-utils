/** === Type checking === */

/** 
 @FROM: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#real-world_usage 
*/
export function typeOf(obj, showFull) {
  let toStr = Object.prototype.toString.call(obj);
  // get toPrototypeString() of obj (handles all types)
  if (showFull && typeof obj === "object") {
    return toStr;
  }
  // implicit toString() conversion
  if (obj == null) {
    return (obj + '').toLowerCase();
  }

  let deepType = toStr.slice(8, -1).toLowerCase();
  if (deepType === 'generatorfunction') {
    return 'function';
  }

  // Prevent overspecificity (for example, [object HTMLDivElement], etc).
  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
  // String.prototype.match is universally supported.
  return deepType.match(/^(array|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType : (typeof obj === 'object' || typeof obj === 'function') ? 'object' : typeof obj;
}

// export function isStr(v) {
//   return typeof v === 'string' || v instanceof String;
// }

export function isObj(v) {
  return v && typeof v === 'object' && v.constructor === Object;
}

export function isFunc(v) {
  return v && typeof v === 'function';
}

export function isBool(v) {
  return typeof v === 'boolean';
}

export function isNum(v) {
  return typeof v === 'number' && !isNaN(v);
}

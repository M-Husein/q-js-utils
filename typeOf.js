/** 
 @FROM : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#real-world_usage 
*/
function typeOf(obj, showFull) {
  var toStr = Object.prototype.toString.call(obj); // get toPrototypeString() of obj (handles all types)

  if (showFull && typeof obj === "object") {
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


  return deepType.match(/^(array|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType : typeof obj === 'object' || typeof obj === 'function' ? 'object' : typeof obj;
}

export { typeOf as default };

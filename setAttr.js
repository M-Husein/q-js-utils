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

/**
  @el   : Element / node
  @attr : attribute name & value (Object)
*/

function setAttr(el, attr) {
  if (el && attr) {
    if (typeOf(attr) === "object") {
      for (var key in attr) {
        el.setAttribute(key, attr[key]);
      }
    } else if (typeOf(attr) === "string") {
      attr.split(" ").forEach(function (v) {
        return el.removeAttribute(v);
      });
    } // else console.warn('setAttr() : params 2 required Object to add / string to remove, To remove several attributes, separate the attribute names with a space.');

  }
}

export { setAttr as default };

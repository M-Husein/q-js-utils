/**
 * @param {*} obj 
 * @param  {...any} omitKeys 
 * @returns 
*/
function objOmit(obj) {
  var res = {};

  for (var _len = arguments.length, omitKeys = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    omitKeys[_key - 1] = arguments[_key];
  }

  for (var key in obj) {
    if (omitKeys.indexOf(key) === -1) res[key] = obj[key];
  }

  return res;
}

export { objOmit as default };

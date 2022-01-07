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

export { str2Hex as default };

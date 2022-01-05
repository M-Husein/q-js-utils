function obj2FormData(obj) {
  var fd = new FormData();

  for (var key in obj) {
    fd.append(key, obj[key]);
  }

  return fd;
}

export { obj2FormData as default };

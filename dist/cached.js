function cached(fn) {
  var cache = Object.create(null);
  return function cachedFn(s) {
    var hit = cache[s];
    return hit || (cache[s] = fn(s));
  };
}

export { cached as default };

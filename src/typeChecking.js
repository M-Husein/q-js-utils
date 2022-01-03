/** === Type checking === */
export function isStr(v) {
  return typeof v === 'string' || v instanceof String;
}

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

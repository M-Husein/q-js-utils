// IE polyfills
// window.crypto = window.crypto || window.msCrypto;
// OR
// if(!window.crypto){
//   window.crypto = window.msCrypto;
// }
function uid() {
  var wordLength = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
  // let a = new Uint32Array(l); //  Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array
  // String.fromCharCode(97 + Number(wordLength))
  // OPTION strict wordLength: typeOf(wordLength) === "number" && wordLength > 0 ? wordLength : 4;
  return String.fromCharCode(97 + wordLength) + "_" + window.crypto.getRandomValues(new Uint32Array(wordLength)).join("_");
}

export { uid as default };

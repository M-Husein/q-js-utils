// IE polyfills
// window.crypto = window.crypto || window.msCrypto;

// if(!window.crypto){
//   window.crypto = window.msCrypto;
// }

export default function uid(l = 4){
  // let a = new Uint32Array(l); //  Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array
  return String.fromCharCode(97 + Number(l)) + "_" + window.crypto.getRandomValues(new Uint32Array(l)).join("_");
}

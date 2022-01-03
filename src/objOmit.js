/**
 * @param {*} obj 
 * @param  {...any} omitKeys 
 * @returns 
*/

export default function objOmit(obj, ...omitKeys){
  let res = {};
  for (let key in obj) {
    if(omitKeys.indexOf(key) === -1) res[key] = obj[key];
  }
  return res;
}

import typeOf from './typeOf';

export default function jsonParse(val, returnErr = {}){
  try{
    return typeOf(val) === "string" ? JSON.parse(val) : returnErr;
  }catch(e){
    return returnErr;
  }
}

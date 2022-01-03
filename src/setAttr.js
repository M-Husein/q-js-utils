import typeOf from './typeOf';

/**
  @el   : Element / node
  @attr : attribute name & value (Object)
*/

export default function setAttr(el, attr){
  if(el){
    if(typeOf(attr) === "object"){
      for(let key in attr){
        el.setAttribute(key, attr[key]);
      }
    }
    else if(typeOf(attr) === "string"){
      attr.split(" ").forEach(v => el.removeAttribute(v));
    }
    // else console.warn('setAttr() : params 2 required Object to add / string to remove, To remove several attributes, separate the attribute names with a space.');
  }
}

/** USAGE:
  @add    : setClass(element, "btn active");
  @remove : setClass(element, "btn active", 'remove'); 
*/

export default function setClass(el, c, fn = "add"){
  el && c && fn && el.classList[fn](...c.split(" "));
}

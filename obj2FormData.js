export default function obj2FormData(obj){
  let fd = new FormData();
  for(let key in obj){
    fd.append(key, obj[key]);
  }
  return fd;
}


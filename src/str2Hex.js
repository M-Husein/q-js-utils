export default function str2Hex(str, no = '5a6268') {
  if (!str || str?.length === 0) return no;

  let hash = 0, sl = str.length;

  for (let i = 0; i < sl; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  let color = '';
  for (let j = 0; j < 3; j++) {
    let val = (hash >> (j * 8)) & 255;
    color += ('00' + val.toString(16)).substr(-2);
  }

  return color;
}

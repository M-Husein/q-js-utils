/**
 * String (e.g name) to hexa
 * @param str string
 * @param no string
 * @returns 'Hexa string'
 */
export function str2Hex(str: string, no = '5a6268'): string {
  if (!str?.length) return no;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (str.charCodeAt(i) + ((hash << 5) - hash)) | 0; // Force 32-bit int
  }

  let color = '';
  for (let j = 0; j < 3; j++) {
    const val = (hash >> (j * 8)) & 255;
    color += ('00' + val.toString(16)).slice(-2);
  }

  return color;
}

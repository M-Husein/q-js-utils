/**
 * Converts a plain object to FormData
 * @param obj The object to convert
 * @returns FormData containing all enumerable properties of the input object
 */
export const obj2FormData = (obj: Record<string, string | Blob | number | boolean>): FormData => {
  let fd = new FormData();
  
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let value = obj[key];
      // Convert non-string values to string (except Blob which FormData handles natively)
      fd.append(key, value instanceof Blob ? value : '' + value);
    }
  }
  
  return fd;
}

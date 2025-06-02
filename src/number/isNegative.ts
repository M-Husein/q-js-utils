/**
 * Strictly checks if a value is a negative number (including -0 and negative BigInt)
 * @param value - The value to check
 * @returns true if the value is a negative number or bigint
 */
export function isNegative(value: unknown): boolean {
  if (typeof value === 'number') {
    return value < 0 || Object.is(value, -0);
  }
  if (typeof value === 'bigint') {
    return value < 0n;
  }
  return false;
}

/**
 * Alternative Version (if want to include numeric strings)
 * @param value 
 * @returns 
 */
// export function isNegative(value: unknown): boolean {
//   const num = Number(value);
//   if (isNaN(num)) return false;
//   return num < 0 || Object.is(num, -0);
// }

// /**
//  * @param num number
//  * @returns boolean
//  */
// export const isNegative = (num: any) => Math.sign(num) === -1;

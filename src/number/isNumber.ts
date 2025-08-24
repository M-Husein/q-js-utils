/**
 * Check value is number or not
 * @param value number - The value to check
 * @returns boolean -  true if the value is a finite number or bigint
 */
export const isNumber = (value: unknown): value is number | bigint => 
  (typeof value === 'number' && !isNaN(value)) || typeof value === 'bigint';

/**
 * Strictly checks if a value is a finite number (excluding NaN, Infinity, and strings)
 */
// export function isNumber(value: unknown): value is number | bigint {
//   return (typeof value === 'number' && Number.isFinite(value)) || typeof value === 'bigint';
// }

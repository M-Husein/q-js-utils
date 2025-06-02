/**
 * Check value is number or not
 * @param value number
 * @returns boolean
 */
export function isNumber(value: unknown): value is number | bigint {
  return (typeof value === 'number' && !isNaN(value)) || typeof value === 'bigint';
}

/**
 * Strictly checks if a value is a finite number (excluding NaN, Infinity, and strings)
 * @param value - The value to check
 * @returns true if the value is a finite number or bigint
 */
// export function isNumber(value: unknown): value is number | bigint {
//   return (typeof value === 'number' && Number.isFinite(value)) || typeof value === 'bigint';
// }

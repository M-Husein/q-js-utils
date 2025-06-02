/**
 * Adds leading zeros to a number or string to reach a specified length, 
 * while handling null/undefined values gracefully.
 * @param num 
 * @param targetLength 
 * @returns Type: string e.g., "5" → "05" or empty string if falsy
 */
export const padWithLeadingZeros = (
  num: number | string | null | undefined,
  targetLength: number = 2
): string => {
  return num ? ('' + num).padStart(targetLength, '0') : '';
}

/**
 * Capitalizes the first letter of a single text/word.
 * Unicode-safe and locale-aware.
 * 
 * @param text The text to capitalize.
 * @returns The text with the first letter capitalized.
 */
export const capitalize = (text: string): string => 
  text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : '';

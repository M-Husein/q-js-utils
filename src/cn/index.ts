/**
 * Joins class names together, filtering out falsy values.
 * @param {...(string | boolean | number | null | undefined)} classes - Class names or conditional expressions
 * @returns {string} Combined class names as a single string, or undefined (to prevent class="" not render in node).
 * @example
 * cn('btn', isActive && 'active', hasError && 'error');
 * // Returns: "btn active" (when isActive is true and hasError is false)
 */
export const cn = (...classes: (string | boolean | number | null | undefined)[]): string | undefined => {
  let result = classes.filter(cls => typeof cls === 'string' && !!cls.trim());
  if(result.length){
    return result.join(' ');
  }
}

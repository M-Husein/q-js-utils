/**
 * Basic cache decorator for functions with single string/number parameter
 * 
 * @template T The return type of the cached function
 * @param fn Function to cache
 * @returns Cached version of the function
 */
export const cache = <T>(fn: (key: string | number) => T): (key: string | number) => T => {
  let toCache: Record<string | number, T> = Object.create(null);
  
  return (key: string | number): T => toCache[key] || (toCache[key] = fn(key));
}

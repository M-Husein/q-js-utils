/**
 * Basic cache decorator for functions with single string/number parameter
 * Original Vue.js Style (Single String/Numeric Parameter)
 * @template T The return type of the cached function
 * @param fn Function to cache
 * @returns Cached version of the function
 */
export function cachePrimitive<T>(fn: (key: string | number) => T): (key: string | number) => T {
  let cache: Record<string | number, T> = Object.create(null);
  
  return function cachedFn(key: string | number): T {
    let hit = cache[key];
    return hit || (cache[key] = fn(key));
  };
}

// Usage:
// const cachedToUpper = cachePrimitive((str: string) => str.toUpperCase());
// console.log(cachedToUpper('test')); // Caches and returns 'TEST'

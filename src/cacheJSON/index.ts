/**
 * Cache decorator that handles multiple parameters using JSON serialization
 * Multi-Parameter JSON-Serialized Version
 * @template T The return type of the cached function
 * @template Args The argument types of the cached function
 * @param fn Function to cache
 * @returns Cached version of the function
 */
export const cacheJSON = <T, Args extends any[]>(
  fn: (this: unknown, ...args: Args) => T
): (...args: Args) => T => {
  const cache = new Map<string, T>();
  
  return function(this: unknown, ...args: Args): T {
    // Create a consistent cache key
    const key = JSON.stringify(args.length === 1 ? args[0] : args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * @DEV : Option shorter version
 */
// export const cacheJSON = <T, Args extends any[]>(
//   fn: (this: unknown, ...args: Args) => T
// ) => {
//   const cache = new Map<string, T>();
//   return function(this: unknown, ...args: Args): T {
//     const key = JSON.stringify(args.length === 1 ? args[0] : args);
//     return cache.get(key) ?? (cache.set(key, fn.apply(this, args)), cache.get(key)!);
//   };
// }

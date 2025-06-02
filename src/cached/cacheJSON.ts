/**
 * Cache decorator that handles multiple parameters using JSON serialization
 * Multi-Parameter JSON-Serialized Version
 * @template T The return type of the cached function
 * @template Args The argument types of the cached function
 * @param fn Function to cache
 * @returns Cached version of the function
 */
export function cacheJSON<T, Args extends any[]>(
  fn: (this: unknown, ...args: Args) => T
): (...args: Args) => T {
  const cache = new Map<string, T>();
  
  return function(this: unknown, ...args: Args): T {
    // Create a consistent cache key
    const key = args.length === 1 
      ? JSON.stringify(args[0])
      : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Usage:
// const cachedAdd = cacheJSON((a: number, b: number) => a + b);
// console.log(cachedAdd(2, 3)); // Caches and returns 5

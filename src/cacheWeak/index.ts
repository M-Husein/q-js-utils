/**
 * Advanced cache decorator using WeakMap for object keys
 * @template T The return type of the cached function
 * @template Args The argument types of the cached function
 * @param fn Function to cache
 * @returns Cached version of the function
 */
export function cacheWeak<T, Args extends any[]>(
  fn: (this: unknown, ...args: Args) => T
): (...args: Args) => T {
  const primitiveCache = new Map<string, T>();
  const objectCache = new WeakMap<object, T>();
  
  return function(this: unknown, ...args: Args): T {
    // Handle single object argument case
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      const arg = args[0];
      if (!objectCache.has(arg)) {
        objectCache.set(arg, fn.apply(this, args));
      }
      return objectCache.get(arg)!;
    }
    
    // Handle primitive/multiple arguments
    const key = JSON.stringify(args);
    if (!primitiveCache.has(key)) {
      primitiveCache.set(key, fn.apply(this, args));
    }
    return primitiveCache.get(key)!;
  };
}

// Usage:
// const cachedGetId = cacheWeak((obj: { id: number }) => obj.id);
// const myObj = { id: 123 };
// console.log(cachedGetId(myObj)); // Caches using object reference

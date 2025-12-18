// 
const isNonObject = (value: any) => value == null || typeof value !== "object";

/**
 * Deeply clones a value while safely handling circular references.
 * Safely deep clone JSON-like data with circular references, and don’t crash.
 *
 * - Uses native `structuredClone` when available (fast & spec-compliant)
 * - Falls back to a custom deep clone implementation for older environments
 *
 * Supports:
 * - Objects, Arrays, Date
 * - Circular & shared references
 *
 * ❌ Fallback clone does NOT support:
 * - Map / Set
 * - RegExp, Error
 * - Functions, DOM nodes
 *
 * @typeParam T - Type of the value being cloned
 * @param value - The value to deep clone
 * @returns A deep clone of the input value
 *
 * @example
 * ```ts
 * const obj: any = { a: 1 };
 * obj.self = obj;
 *
 * const cloned = safeDeepClone(obj);
 * cloned !== obj;         // true
 * cloned.self === cloned; // true
 * ```
 */
export const safeDeepClone = <T>(value: T): T => {
  // Prefer native structuredClone
  if (typeof globalThis.structuredClone === "function") {
    try {
      return globalThis.structuredClone(value);
    } catch {
      // Fall through to custom clone
    }
  }

  // Primitives
  if (isNonObject(value)) {
    return value;
  }

  const visited = new WeakMap<object, any>();

  const clone = (val: any): any => {
    if (isNonObject(val)) return val;

    // Circular / shared reference
    if (visited.has(val)) {
      return visited.get(val);
    }

    // Date
    if (val instanceof Date) {
      const date = new Date(val.getTime());
      visited.set(val, date);
      return date;
    }

    // Array
    if (Array.isArray(val)) {
      const arr: any[] = [];
      visited.set(val, arr);
      for (const item of val) {
        arr.push(clone(item));
      }
      return arr;
    }

    // Object (preserve prototype)
    const obj = Object.create(Object.getPrototypeOf(val));
    visited.set(val, obj);

    for (const key of Object.keys(val)) {
      obj[key] = clone(val[key]);
    }

    return obj;
  };

  return clone(value);
}

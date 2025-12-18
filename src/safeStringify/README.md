# safeStringify

## Usage
```ts
import { safeStringify } from 'q-js-utils/safeStringify';


```

## Option 1

```ts
const safeStringify = <T = any>(obj: T, space?: number): string => {
  const seen = new WeakSet<object>();

  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    },
    space
  );
}
```

## Option 2

```ts
/**
 * Safely serializes a value to JSON, handling circular references.
 *
 * Circular object references are replaced with the string `"[Circular]"`
 * instead of throwing a `TypeError`.
 *
 * @template T
 * @param {T} value - The value to stringify.
 * @param {number} [space] - Number of spaces for pretty-printing (passed to `JSON.stringify`).
 * @returns {string} A JSON string representation of the value.
 *
 * @example
 * const obj: any = {};
 * obj.self = obj;
 *
 * safeStringify(obj);
 * // → '{"self":"[Circular]"}'
 *
 * @example
 * safeStringify({ a: 1 }, 2);
 * // → '{\n  "a": 1\n}'
 */
export const safeStringify = <T = unknown>(
  value: T,
  space?: number
): string => {
  const seen = new WeakSet<object>();

  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) {
          return "[Circular]";
        }
        seen.add(val);
      }
      return val;
    },
    space
  );
}
```


/**
 * Safely serializes a data to JSON, handling circular references.
 *
 * Circular object references are replaced with the string `"[Circular]"`
 * instead of throwing a `TypeError`.
 *
 * @template T
 * @param {T} data - The data to stringify.
 * @param {number} [space] - Number of spaces for pretty-printing (passed to `JSON.stringify`).
 * @returns {string} A JSON string representation of the data.
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
  data: T,
  space?: number
): string => {
  const seen = new WeakSet<object>();

  return JSON.stringify(
    data,
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

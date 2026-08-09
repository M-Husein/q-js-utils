type Reviver = (this: any, key: string, value: any, context?: { source: string }) => any;

/**
 * Safely parses a JSON string and returns a fallback value on failure.
 *
 * This helper is designed for untrusted sources such as `localStorage`,
 * query params, or API responses. It never throws and guarantees a value
 * of type `T` is returned.
 *
 * Parsing rules:
 * - If `data` is `null`, `undefined`, or an empty string → returns `fallback`
 * - If `JSON.parse` throws → returns `fallback`
 * - If parsed result is `null` or `undefined` → returns `fallback`
 *
 * @template T
 * @param {string | null | undefined} data - The JSON string to parse.
 * @param {Function(key, value, context)} reviver https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver
 * @param {T} [ fallback = {} ] - Value returned when parsing fails or result is nullish. Default `{}`.
 * @returns {T} The parsed JSON value or the fallback.
 *
 * @example
 * safeJsonParse<{ a: number }>('{"a":1}')
 * // => { a: 1 }
 *
 * @example
 * safeJsonParse('invalid json', {})
 * // => {}
 *
 * @example
 * safeJsonParse(null, [])
 * // => []
 *
 * @example
 * safeJsonParse('null', { foo: 'bar' })
 * // => { foo: 'bar' }
 * 
 * @example
 * const bigJSON = '{"gross_gdp": 12345678901234567890}';
 * const bigObj = safeJsonParse(
 *  bigJSON,
 *  {},
 *  (key, value, context) => {
 *    if (key === "gross_gdp" && context) {
 *      return BigInt(context.source);
 *    }
 *    return value;
 *  }
 * );
 * 
 * console.log(bigObj.gross_gdp); // 12345678901234567890n (BigInt)
 */
export const safeJsonParse = <T = Record<string, unknown>>(
  data: string | null | undefined,
  fallback: T = {} as T,
  reviver?: Reviver
): T => {
  if (!data) return fallback;

  try {
    return JSON.parse(data, reviver) ?? fallback;
  } catch {
    return fallback;
  }
};

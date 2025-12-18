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
 * @param {T} [fallback={}] - Value returned when parsing fails or result is nullish.
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
 */
export const safeJsonParse = <T = Record<string, unknown>>(
  data: string | null | undefined,
  fallback: T = {} as T
): T => {
  if (!data) return fallback;

  try {
    return JSON.parse(data) ?? fallback;
  } catch {
    return fallback;
  }
}

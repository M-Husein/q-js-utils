export type ReverseRecord<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};

/**
 * Reverses the keys and values of an object.
 *
 * Creates a new object where each original value becomes a key
 * and each original key becomes its corresponding value.
 *
 * This function is fully type-safe and preserves literal types
 * when used with `as const` objects or enums.
 *
 * @template T - An object type whose keys and values are valid property keys.
 * @param obj - The source object to reverse.
 * @returns A new object with keys and values swapped.
 *
 * @example
 * ```ts
 * const roles = {
 *   student: "1",
 *   admin: "2",
 * } as const;
 *
 * const reversed = reverseObject(roles);
 * // => { "1": "student", "2": "admin" }
 * ```
 */
export const reverseObject = <
  T extends Record<PropertyKey, PropertyKey>
>(
  obj: T
): ReverseRecord<T> =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key])
  ) as ReverseRecord<T>;

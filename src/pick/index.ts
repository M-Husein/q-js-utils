/**
 * Creates a shallow copy of an object including only the specified keys.
 *
 * @template T - The type of the original object.
 * @param obj - The original object to pick keys from.
 * @param pickKeys - Keys to include in the returned object.
 * @returns A new object containing only the specified keys.
 *
 * @example
 * const user = { id: 1, name: "Husein", password: "secret" };
 * const publicUser = pick(user, "id", "name");
 * // Output: { id: 1, name: "Husein" }
 */
export const pick = <T extends Record<string, any>>(
  obj: T,
  ...pickKeys: (keyof T)[]
): Partial<T> => {
  const result: Partial<T> = {};

  for (const key of pickKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

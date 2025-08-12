/**
 * Creates a shallow copy of an object excluding the specified keys.
 *
 * @template T - The type of the original object.
 * @param obj - The original object to omit keys from.
 * @param omitKeys - Keys to exclude from the returned object.
 * @returns A new object without the specified keys.
 *
 * @example
 * const user = { id: 1, name: "Husein", password: "secret" };
 * const safeUser = omit(user, "password");
 * // Output: { id: 1, name: "Husein" }
 */
export const omit = <T extends Record<string, any>>(
  obj: T,
  ...omitKeys: (keyof T)[]
): Partial<T> => {
  const result: Partial<T> = {};

  for (const key in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) && 
      !omitKeys.includes(key as keyof T)
    ) {
      result[key] = obj[key];
    }
  }

  return result;
}

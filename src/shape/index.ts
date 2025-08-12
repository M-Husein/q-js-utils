/**
 * Shapes an object by picking or omitting specified keys,
 * with TypeScript inferring exact key types.
 *
 * @template T - Original object type.
 * @template K - Keys to include or exclude (exact literals inferred).
 * @param obj - Object to shape.
 * @param keys - Array of keys (use `as const` for smart typing).
 * @param action - Determines pick or omit, truthy to omit or falsy to pick (default: undefined = pick).
 * @returns A Partial object with exact types.
 */
export const shape = <
  T extends Record<string, any>,
  K extends keyof T
>(
  obj: T,
  keys: readonly K[],
  action?: boolean | number | string | null | undefined, // "pick" | "omit" = "pick" 
): Partial<Pick<T, K>> | Partial<Omit<T, K>> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => {
      const keysIncluded = keys.includes(key as K);
      return action ? !keysIncluded : keysIncluded;
    })
  ) as Partial<Pick<T, K>> | Partial<Omit<T, K>>;
}

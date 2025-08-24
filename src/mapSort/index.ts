/**
 * Default comparison function for `mapSort`.
 * Compares values as strings using `localeCompare`.
 */
const defaultCompareFn = <U>(a: U, b: U): number => String(a).localeCompare(String(b));

/**
 * Sorts an array using a "map callback" (like Python's `key` argument in `sorted`) 
 * before comparing. This allows you to sort by a derived value instead of the item itself.
 *
 * - Items mapped to `undefined` are always moved to the end.
 * - If `compareFn` is not provided, values are compared as strings using `localeCompare`.
 * - Sorting is stable: items with equal mapped values preserve their original order.
 *
 * @typeParam T - The type of elements in the input array.
 * @typeParam U - The type of the mapped "sortable" values.
 *
 * @param list - The array to sort.
 * @param mapFn - A function that maps each element to a sortable value.
 *                If it returns `undefined`, that element will be placed at the end.
 * @param compareFn - Optional comparison function for the mapped values.
 *                    Defaults to lexicographic string comparison.
 *
 * @returns A new array of the original items, sorted by their mapped values.
 *
 * @example
 * ```ts
 * // Sort numbers by their absolute value
 * const result = mapSort([-5, 3, -2, 8], n => Math.abs(n));
 * // => [-2, 3, -5, 8]
 *
 * // Sort objects by a field
 * const users = [
 *   { name: "Alice", age: 30 },
 *   { name: "Bob", age: 25 },
 *   { name: "Charlie", age: 25 },
 * ];
 *
 * const sorted = mapSort(users, u => u.age);
 * // => Bob (25), Charlie (25), Alice (30)
 * ```
 */
export const mapSort = <T, U>(
  list: T[],
  mapFn: (item: T, index: number, array: T[]) => U | undefined = (x => x as unknown as U),
  compareFn: (a: U, b: U) => number = defaultCompareFn
): T[] => 
  list.map((o, i, arr) => ({
    o, // is mean original
    s: mapFn(o, i, arr), // is mean sortable
    i, // stable sort tie-breaker
  }))
	.toSorted((a, b) => {
    if (a.s == null) return 1;
    if (b.s == null) return -1;
    return compareFn(a.s, b.s) || a.i - b.i;
  })
	.map(entry => entry.o);

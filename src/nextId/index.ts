let lastId: number = 0;

/**
 * Generates a unique, sequentially incremented string ID with an optional prefix.
 * Each call increments an internal counter to ensure uniqueness.
 * @param prefix - An optional string prefix for the ID (defaults to 'q').
 * @returns A unique string ID (e.g., 'q1', 'q2', 'customPrefix123').
 */
export function nextId(prefix: string = 'q'){
  lastId++;
  return prefix + lastId;
}

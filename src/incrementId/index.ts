let lastId: number = 0;

/**
 * Auto indrement id
 * @param prefix string
 * @returns '1 | 2 | 3 ...'
 */
export function incrementId(prefix: string = 'q'){
  lastId++;
  return prefix + lastId;
}

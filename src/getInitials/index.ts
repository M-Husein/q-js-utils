/**
 * Get initial name
 * @param name string
 * @returns 'Initial Name'
 */
export const getInitials = (name: string) => {
  let [first, last] = name.split(" ");

  return first[0] + (last?.[0] || '');
}

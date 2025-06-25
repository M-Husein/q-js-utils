import { cache } from '../cached/cache';

/**
 * Get initial name
 * @param name string
 * @param no string
 * @returns 'Initial Name'
 */
export const getInitials = cache((name: any) => {
  if(name?.trim()){
    let [first, last] = name.split(" ");

    return (first[0] + (last?.[0] || '')).toUpperCase();
  }
}) as (name: string) => string | undefined;

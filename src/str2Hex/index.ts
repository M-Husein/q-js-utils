import { cache } from '../cached/cache';

/**
 * String (e.g name) to hexa
 * @param str string
 * @param no string
 * @returns 'Hexa string' | undefined
 */
export const str2Hex = cache((str: any): string | undefined => {
  if (str?.trim()) {
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      hash = (str.charCodeAt(i) + ((hash << 5) - hash)) | 0; // Force 32-bit int
    }

    let color = '';

    for (let j = 0; j < 3; j++) {
      const val = (hash >> (j * 8)) & 255;
      color += ('00' + val.toString(16)).slice(-2);
    }

    return color;
  }
}) as (str: string) => string | undefined;

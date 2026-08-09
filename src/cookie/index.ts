export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Retrieves the value of a cookie by its name.
 * @param name - The name of the cookie to retrieve.
 *@returns The decoded cookie value as a string, or `undefined` if the cookie
 *         does not exist or is not visible to the current page.
 */
export const getCookie = (name: string): string | undefined => {
  let cookieValue: string | undefined | null = document.cookie;
  
  if(!cookieValue) return;

  // To support cookie name with special character such as [ ] etc
  cookieValue = cookieValue
    .split('; ')
    .find(row => row.startsWith(name + '='));

  // Cookie doesn't exist
  if(!cookieValue) return;

  // Takes everything after the first "="
  cookieValue = cookieValue.substring(name.length + 1);

  return cookieValue && decodeURIComponent(cookieValue);
};

/**
 * Sets a cookie with flexible options.
 *
 * This function encodes the value using `encodeURIComponent` and provides
 * full control over expiration, path, domain, secure, and SameSite attributes.
 * If no `expires` option is provided, a session cookie is created.
 *
 * @param name - The name of the cookie.
 * @param value - The value to store. It will be URI-encoded automatically.
 * @param options - Optional configuration object for the cookie.
 * @param options.expires - Expiration as a `number` of days or a `Date` object.
 *                          Omit for a session cookie.
 * @param options.path - The path where the cookie is accessible. Defaults to `'/'`.
 * @param options.domain - The domain where the cookie is accessible.
 * @param options.secure - If `true`, the cookie is only sent over HTTPS. Defaults to `false`.
 * @param options.sameSite - SameSite attribute ('strict', 'lax', 'none'). Defaults to not set.
 *
 * @throws {Error} If the value exceeds the browser's maximum cookie size (~4KB).
 */
export const setCookie = (
  name: string, 
  value: string, 
  options?: CookieOptions
): void => {
  // Start with name=value and the mandatory path (defaults to '/')
  let cookieString = `${name}=${encodeURIComponent(value)}; path=${options?.path ?? '/'}`;

  // Expiration
  if (options?.expires != null) {
    const expirationDate =
      typeof options.expires === 'number'
        ? new Date(Date.now() + options.expires * 86400000) // days → milliseconds
        : options.expires;
    cookieString += '; expires=' + expirationDate.toUTCString();
  }

  if (options?.domain) {
    cookieString += '; domain=' + options.domain;
  }

  if (options?.secure) cookieString += '; secure';

  if (options?.sameSite) {
    let sameSite = options.sameSite.toLowerCase() as 'strict' | 'lax' | 'none';
    cookieString += '; samesite=' + sameSite;

    // Auto-add Secure for None
    if (sameSite === 'none' && !options.secure) {
      cookieString += '; secure';
    }
  }

  document.cookie = cookieString;
};

/**
 * Deletes a cookie by immediately expiring it.
 * 
 * * ⚠️ **Important:** To successfully delete a cookie, the `path`, `domain`,
 * `secure`, and `sameSite` options must **exactly match** the values used
 * when the cookie was originally set. If they don't match, the browser will
 * not find the cookie and the deletion will silently fail.
 *
 * @param name - The name of the cookie to delete.
 * @param options - The exact options that were used when setting the cookie.
 * @param options.path - The path the cookie was set on. Defaults to `'/'`.
 * @param options.domain - The domain the cookie was set on (if any).
 * @param options.secure - The secure flag used when setting the cookie.
 * @param options.sameSite - The SameSite attribute used when setting the cookie.
 */
export const deleteCookie = (
  name: string,
  options?: Pick<CookieOptions, 'path' | 'domain' | 'secure' | 'sameSite'>
): void => {
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${options?.path ?? '/'}`;
  
  if (options?.domain) cookieString += '; domain=' + options.domain;
  
  if (options?.secure) cookieString += '; secure';

  if (options?.sameSite) {
    cookieString += '; samesite=' + options.sameSite.toLowerCase();
  }
  
  document.cookie = cookieString;
};

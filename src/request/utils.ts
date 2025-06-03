import { QueryParams, RequestBody, OnProgressCallback } from './types';

/**
 * Appends query parameters to a URL.
 * This function builds the query string efficiently without creating a `URL` object.
 * @param url - The base URL string.
 * @param query - An object containing key-value pairs for query parameters.
 * @returns The URL with appended query parameters.
 */
export function appendQueryParams(url: string, query?: QueryParams): string {
  if (!query || !Object.keys(query).length) return url;

  let params = new URLSearchParams();
  for (let key in query) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) continue;

    let value = query[key];
    if (value == null) continue; // Skip null/undefined

    if (Array.isArray(value)) {
      value.forEach(item => params.append(key, '' + item));
    } else {
      params.append(key, value + '');
    }
  }

  const queryString = params.toString();
  return queryString 
    ? url + (url.includes('?') ? '&' : '?') + queryString
    : url;
}

// export function appendQueryParams2(url: string, query?: QueryParams): string {
//   if (!query || !Object.keys(query).length) {
//     return url;
//   }

//   let queryString = '';
//   for (let key in query) {
//     if (Object.prototype.hasOwnProperty.call(query, key)) {
//       let value = query[key];
//       if (Array.isArray(value)) {
//         for (let i = 0; i < value.length; i++) {
//           if (queryString) queryString += '&';
//           queryString += `${encodeURIComponent(key)}=${encodeURIComponent(String(value[i]))}`;
//         }
//       } else {
//         if (queryString) queryString += '&';
//         queryString += `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
//       }
//     }
//   }

//   // Check if URL already has query params without creating URL object
//   return url.indexOf('?') !== -1 ? `${url}&${queryString}` : `${url}?${queryString}`;
// }

/**
 * Processes the request body based on its type and sets the appropriate
 * `Content-Type` header on the `RequestInit` options object.
 * This function directly mutates the `options.headers` and `options.body` for performance.
 * @param options - The `RequestInit` object to be modified.
 * @param body - The request payload.
 */
export function processRequestBody(options: RequestInit, body?: RequestBody): void {
    // Ensure options.headers is a Headers object.
    // If it's undefined, create a new Headers object.
    // If it's something else (like a plain object), convert it to Headers.
    // This makes the function more robust to initial input types.
    // if (!options.headers || !(options.headers instanceof Headers)) {
    //   options.headers = new Headers(options.headers as HeadersInit);
    // }

    // const headers = options.headers as Headers; // Now we can safely cast to Headers

    if (body == null) {
      // options.body = undefined;
      // // Optionally, remove Content-Type if body is null/undefined and no body is sent
      // headers.delete('Content-Type');
      return;
    }

    if (body instanceof FormData) {
      // FormData manages its own Content-Type, do not set explicitly
      options.body = body;
      return;
    }

    const headers = options.headers as Headers; // Now we can safely cast to Headers

    if (body instanceof URLSearchParams) {
      // Use .set() method for Headers object
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
      options.body = body.toString(); // URLSearchParams stringifies like this for fetch
      return;
    }

    if (typeof body === 'object' && body !== null && !(body instanceof Blob) && !(body instanceof ArrayBuffer) && !(body instanceof ReadableStream)) {
      // Assume JSON for plain objects (and check for Blob/ArrayBuffer/ReadableStream specifically)
      // Use .set() method for Headers object
      headers.set('Content-Type', 'application/json');
      options.body = JSON.stringify(body);
      return;
    }

    // For Blob, ArrayBuffer, string, ReadableStream etc., assign directly
    options.body = body as BodyInit;
}

/**
 * Merges specific `HeadersInit` into a new plain object.
 * This simplified version does not handle global default headers.
 * @param specificHeaders - The headers provided for the current request.
 * @returns A new plain object containing the merged headers.
 */
// export function mergeHeaders(
//   specificHeaders?: HeadersInit,
// ): Record<string, string> {
//   // If no headers are provided, return an empty object immediately.
//   if (specificHeaders == null) { // Checks for both undefined and null
//     return {};
//   }

//   // If it's a Headers object, convert it to a plain object.
//   // Headers.prototype.entries() returns an iterator of [key, value] pairs,
//   // which Object.fromEntries can directly consume.
//   if (specificHeaders instanceof Headers) {
//     // @ts-ignore
//     return Object.fromEntries(specificHeaders?.entries());
//   }

//   // If it's an array of [key, value] string pairs, convert it to a plain object.
//   // Object.fromEntries also works directly with arrays of such pairs.
//   if (Array.isArray(specificHeaders)) {
//     return Object.fromEntries(specificHeaders);
//   }
  
//   return { ...specificHeaders };
// }

// export function mergeHeaders(
//   specificHeaders?: HeadersInit,
// ): Record<string, string> {
//   const merged: Record<string, string> = {}; // Start with an empty object

//   if (specificHeaders instanceof Headers) {
//     specificHeaders.forEach((value, key) => (merged[key] = value));
//   } else if (specificHeaders) {
//     Object.assign(merged, specificHeaders); // Fast merge for plain objects
//   }
//   return merged;
// }

/**
 * Simple URL joiner. Does not create URL object.
 * Assumes baseUrl ends with / or url doesn't start with / for direct concatenation.
 */
// export function joinUrlFast(baseUrl: string, relativeUrl: string): string {
//   let baseEnd = baseUrl.endsWith('/'),
//       relativeStart = relativeUrl.startsWith('/');

//   if (baseEnd && relativeStart) {
//     return baseUrl + relativeUrl.substring(1);
//   }
  
//   return !baseEnd && !relativeStart ? baseUrl + '/' + relativeUrl : baseUrl + relativeUrl;
// }

/**
 * Wraps a `Response` object's body with a `ReadableStream` to enable download progress tracking.
 * This allows `onProgress` callbacks to be fired as the response body is being consumed.
 * @param response - The original `Response` object whose body needs progress tracking.
 * @param onProgressCallback - The callback function to be invoked with progress updates.
 * @returns A Promise that resolves to a new `Response` object with the wrapped body.
 */
export async function handleProgress(
  response: Response,
  onProgressCallback: OnProgressCallback,
): Promise<Response> {
  const reader = response.body!.getReader(); // We know body exists here due to checks in `request`
  const contentLength = parseInt(response.headers.get('Content-Length')!, 10);
  let loaded = 0;

  const progressStream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          loaded += value.length;
          onProgressCallback({ loaded, total: contentLength, progress: loaded / contentLength });
          controller.enqueue(value); // Pass the chunk through to the new stream
        }
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  // Important: Return a NEW Response object with the wrapped stream
  return new Response(progressStream, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}

/**
  * Custom error class for non-2xx HTTP responses (e.g., 404, 500).
  * It carries the original `Response` object, allowing consumers to
  * access response details and manually parse the error body if needed.
  * @param status - The HTTP status code (e.g., 404).
  * @param statusText - The HTTP status text (e.g., "Not Found").
  * @param url - The URL that was requested.
  * @param originalResponse - The raw `Response` object received from `fetch`.
  * @param message - An optional custom error message.
 */
// export class FetchError extends Error {
//   constructor(
//     public status: number,
//     public statusText: string,
//     public url: string,
//     public originalResponse: Response,
//     message: string = `Fetch failed: ${status} ${statusText} for ${url}`,
//   ) {
//     super(message);
//     this.name = 'FetchError';
//     // Set the prototype explicitly to ensure `instanceof` works correctly
//     // in environments that might not handle class extension automatically.
//     Object.setPrototypeOf(this, FetchError.prototype);
//   }
// }

/**
 * @DEV : Option
 * Custom error class for aborted requests, which can happen due to a timeout
 * or if the request was manually aborted via an `AbortController`.
 * @param message - A descriptive error message.
 * @param originalError - The original `DOMException` (e.g., 'AbortError') if available.
 */
// export class AbortError extends Error {
//   constructor(message: string, public originalError?: DOMException) {
//     super(message);
//     this.name = 'AbortError';
//     Object.setPrototypeOf(this, AbortError.prototype);
//   }
// }

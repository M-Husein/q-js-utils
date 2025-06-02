import { QueryParams, RequestBody, OnProgressCallback } from './types';

/**
 * Appends query parameters to a URL.
 * This function builds the query string efficiently without creating a `URL` object.
 * @param url - The base URL string.
 * @param query - An object containing key-value pairs for query parameters.
 * @returns The URL with appended query parameters.
 */
export function appendQueryParams(url: string, query?: QueryParams): string {
  if (!query || Object.keys(query).length === 0) {
    return url;
  }

  let queryString = '';
  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      const value = query[key];
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (queryString) queryString += '&';
          queryString += `${encodeURIComponent(key)}=${encodeURIComponent(String(value[i]))}`;
        }
      } else {
        if (queryString) queryString += '&';
        queryString += `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
      }
    }
  }

  // Check if URL already has query params without creating URL object
  return url.indexOf('?') !== -1 ? `${url}&${queryString}` : `${url}?${queryString}`;
}

/**
 * Processes the request body based on its type and sets the appropriate
 * `Content-Type` header on the `RequestInit` options object.
 * This function directly mutates the `options.headers` and `options.body` for performance.
 * @param options - The `RequestInit` object to be modified.
 * @param body - The request payload.
 */
export function processRequestBody(options: RequestInit, body?: RequestBody): void {
  if (body === undefined || body === null) {
    options.body = undefined;
    return;
  }

  // Ensure headers exist as a mutable plain object
  if (!options.headers) {
    options.headers = {};
  } else if (options.headers instanceof Headers) {
    // Convert Headers object to plain object for direct manipulation
    // options.headers = Object.fromEntries(options.headers.entries());

    // FIX: Explicitly cast to Iterable<[string, string]>
    // The Headers object is iterable and yields [key, value] pairs,
    // which Object.fromEntries expects.
    // @ts-ignore
    options.headers = Object.fromEntries(options.headers as Iterable<[string, string]>);
  }

  const headers = options.headers as Record<string, string>; // Cast for easier access

  if (body instanceof FormData) {
    // FormData manages its own Content-Type, do not set explicitly
    options.body = body;
    return;
  }

  if (body instanceof URLSearchParams) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.body = body.toString();
    return;
  }

  if (typeof body === 'object') {
    // Assume JSON for plain objects
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
    return;
  }

  // For Blob, ArrayBuffer, string, etc., assign directly
  options.body = body as BodyInit;
}

/**
 * Merges specific `HeadersInit` into a new plain object.
 * This simplified version does not handle global default headers.
 * @param specificHeaders - The headers provided for the current request.
 * @returns A new plain object containing the merged headers.
 */
export function mergeHeaders(
  specificHeaders?: HeadersInit,
): Record<string, string> {
  const merged: Record<string, string> = {}; // Start with an empty object

  if (specificHeaders instanceof Headers) {
    specificHeaders.forEach((value, key) => (merged[key] = value));
  } else if (specificHeaders) {
    Object.assign(merged, specificHeaders); // Fast merge for plain objects
  }
  return merged;
}

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

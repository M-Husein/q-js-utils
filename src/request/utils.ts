import { QueryParams, OnProgressCallback } from './types'; // , RequestBody

/**
 * Appends query parameters to a URL.
 * This function builds the query string efficiently without creating a `URL` object.
 * @param url - The base URL string.
 * @param query - An object containing key-value pairs for query parameters.
 * @returns The URL with appended query parameters.
 */
export const appendQueryParams = (url: string, query?: QueryParams): string => {
  if (!query || !Object.keys(query).length){
    return url;
  }

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

/**
 * Processes the request body based on its type and sets the appropriate
 * `Content-Type` header on the `RequestInit` options object.
 * This function directly mutates the `options.headers` and `options.body` for performance.
 * @param options - The `RequestInit` object to be modified.
 * @param body - The request payload.
 */
export const processRequestBody = (options: RequestInit): void => {
  // FormData manages its own Content-Type, do not set explicitly
  if (options.body == null || options.body instanceof FormData) {
    // options.body = undefined;
    // // Optionally, remove Content-Type if body is null/undefined and no body is sent
    // headers.delete('Content-Type');
    return;
  }

  const headers = options.headers as Headers; // Now we can safely cast to Headers

  if (options.body instanceof URLSearchParams) {
    // Use .set() method for Headers object
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    // URLSearchParams stringifies like this for fetch
    options.body = '' + options.body; // options.body.toString()
    return;
  }

  if (
    typeof options.body === 'object' &&
    options.body !== null &&
    !(options.body instanceof Blob) &&
    !(options.body instanceof ArrayBuffer) &&
    !(options.body instanceof ReadableStream)
  ) {
    // Assume JSON for plain objects (and check for Blob/ArrayBuffer/ReadableStream specifically)
    // Use .set() method for Headers object
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }
}

/**
 * Wraps a `Response` object's body with a `ReadableStream` to enable download progress tracking.
 * This allows `onProgress` callbacks to be fired as the response body is being consumed.
 * @param response - The original `Response` object whose body needs progress tracking.
 * @param onProgress - The callback function to be invoked with progress updates.
 * @returns A Promise that resolves to a new `Response` object with the wrapped body.
 */
export const handleProgress = async (
  response: Response,
  onProgress: OnProgressCallback,
): Promise<Response> => {
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
          onProgress({ loaded, total: contentLength, progress: loaded / contentLength });
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

  return new Response(progressStream, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}

import { PerformanceFetchOptions, ChainedFetchResponse } from './types';
import { appendQueryParams, processRequestBody, mergeHeaders, handleProgress } from './utils';

// If want to export types specifically from this entry
// export * from './types';

/**
 * Custom error class for non-2xx HTTP responses (e.g., 404, 500).
 * It carries the original `Response` object, allowing consumers to
 * access response details and manually parse the error body if needed.
 */
export class FetchError extends Error {
  /**
   * Creates an instance of FetchError.
   * @param status - The HTTP status code (e.g., 404).
   * @param statusText - The HTTP status text (e.g., "Not Found").
   * @param url - The URL that was requested.
   * @param originalResponse - The raw `Response` object received from `fetch`.
   * @param message - An optional custom error message.
   */
  constructor(
    public status: number,
    public statusText: string,
    public url: string,
    public originalResponse: Response,
    message: string = `Fetch failed: ${status} ${statusText} for ${url}`,
  ) {
    super(message);
    this.name = 'FetchError';
    // Set the prototype explicitly to ensure `instanceof` works correctly
    // in environments that might not handle class extension automatically.
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}

/**
 * @DEV : Option
 * Custom error class for aborted requests, which can happen due to a timeout
 * or if the request was manually aborted via an `AbortController`.
 */
export class AbortError extends Error {
  /**
   * Creates an instance of AbortError.
   * @param message - A descriptive error message.
   * @param originalError - The original `DOMException` (e.g., 'AbortError') if available.
   */
  constructor(message: string, public originalError?: DOMException) {
    super(message);
    this.name = 'AbortError';
    Object.setPrototypeOf(this, AbortError.prototype);
  }
}

/**
 * A wrapper around `Promise<Response>` that provides convenient chained methods
 * for parsing the response body (e.g., `.json()`, `.text()`, etc.).
 * This class implements the `ChainedFetchResponse` interface, offering a consistent API.
 */
class FetchResponse implements ChainedFetchResponse {
  /**
   * @param response - The Promise that resolves to the raw `Response` object from `fetch`.
   */
  constructor(public readonly response: Promise<Response>) {}

  /**
   * Internal helper to abstract the parsing logic, ensuring that any errors
   * during response resolution or parsing are propagated correctly.
   * @template T - The expected type of the parsed response.
   * @param parser - A function that takes a `Response` object and returns a Promise of the parsed data.
   * @returns A Promise that resolves to the parsed data.
   */
  private async parse<T>(parser: (res: Response) => Promise<T>): Promise<T> {
    try {
      const res = await this.response;
      return await parser(res);
    } catch (error) {
      throw error; // Re-throw any parsing or network errors
    }
  }

  /**
   * Parses the response body as JSON.
   * @template T - The expected type of the JSON data.
   * @returns A Promise that resolves to the parsed JSON object.
   */
  json<T = any>(): Promise<T> {
    return this.parse<T>(res => res.json());
  }

  /**
   * Parses the response body as plain text.
   * @returns A Promise that resolves to the response body as a string.
   */
  text(): Promise<string> {
    return this.parse<string>(res => res.text());
  }

  /**
   * Parses the response body as a Blob.
   * @returns A Promise that resolves to the response body as a `Blob`.
   */
  blob(): Promise<Blob> {
    return this.parse<Blob>(res => res.blob());
  }

  /**
   * Parses the response body as an ArrayBuffer.
   * @returns A Promise that resolves to the response body as an `ArrayBuffer`.
   */
  arrayBuffer(): Promise<ArrayBuffer> {
    return this.parse<ArrayBuffer>(res => res.arrayBuffer());
  }

  /**
   * Parses the response body as FormData.
   * @returns A Promise that resolves to the response body as `FormData`.
   */
  formData(): Promise<FormData> {
    return this.parse<FormData>(res => res.formData());
  }
}

/**
 * Performs an HTTP request with extended features, optimized for performance.
 * It provides custom error handling, request timeout, download progress tracking,
 * and pre/post-request hooks.
 *
 * This function returns a `ChainedFetchResponse` object, which allows chaining
 * methods like `.json()`, `.text()`, etc., to conveniently consume the response body.
 *
 * Network errors, request timeouts, and non-2xx HTTP statuses (`response.ok` is false)
 * are handled by throwing custom error classes (`AbortError` or `FetchError`) for easier
 * and more specific error management by the consumer.
 *
 * This version is designed to be minimalist, without global configuration
 * or convenience HTTP method shortcuts.
 *
 * @param url - The URL for the request. Can be a relative path (e.g., '/api/data')
 * which will be resolved against the current origin, or an absolute URL.
 * @param options - An object containing request configuration, extending standard `RequestInit`.
 * @returns A `ChainedFetchResponse` object that wraps a `Promise<Response>`, allowing
 * for chained body parsing methods.
 * @throws {AbortError} If the request is aborted due to a timeout or an external signal.
 * @throws {FetchError} If the response status is not in the 2xx range (e.g., 404, 500).
 * @throws {Error} For other network-related errors (e.g., CORS issues, DNS errors).
 */
export function request(
  url: string,
  {
    query,
    body,
    headers = {}, // Default to an empty object for headers
    signal: externalSignal, // External AbortSignal provided by the caller
    timeout, // Request timeout in milliseconds
    onProgress, // Download progress callback
    beforeHook, // Hook executed before the request
    afterHook, // Hook executed after the response
    ...options // Remaining standard RequestInit properties (e.g., method, cache, credentials)
  }: PerformanceFetchOptions = {} // Default to an empty options object
): ChainedFetchResponse {
  // The core fetch logic is wrapped in an immediately invoked async function
  // which returns a Promise<Response>. This promise is then wrapped by FetchResponse.
  const coreFetchPromise = (async (): Promise<Response> => {
    // Create new objects instead of mutating
    let finalOptions: Omit<RequestInit, 'body'> = {
      ...options,
      headers: mergeHeaders(headers), // New headers object
    };

    // Append query parameters to the URL string
    let finalUrl: string = appendQueryParams(url, query);

    // Process the request body (e.g., JSON.stringify, FormData handling)
    // and set the appropriate Content-Type header. Mutates `finalOptions`.
    processRequestBody(finalOptions, body);

    // Setup AbortController for handling timeouts and external aborts:
    const controller = externalSignal ? null : new AbortController();

    // Set up timeout if effectiveTimeout is positive. If controller is null, abort() will do nothing.
    const timeoutId = timeout && timeout > 0
      ? setTimeout(() => controller?.abort(), timeout)
      : null;

    // Use the provided external signal if available, otherwise use the internally created signal.
    finalOptions.signal = externalSignal || controller?.signal;

    // Execute Before Hook if defined. It can modify `finalOptions`.
    if (beforeHook) {
      /**
       * @DEV :
       * Next release may only await `beforeHook(finalOptions)`,
       * which will directly change the finalOptions data in beforeHook call.
       */
      finalOptions = await beforeHook(finalOptions);
    }

    let response: Response;
    try {
      response = await fetch(finalUrl, finalOptions);

      // Handle Download Progress if a callback is provided and Content-Length header exists.
      // The response body is wrapped in a new stream to enable progress tracking.
      if (onProgress && response.body && response.headers.has('Content-Length')) {
        response = await handleProgress(response, onProgress);
      }

      // Execute After Hook if defined. It can modify the `response` object.
      if (afterHook) {
        response = await afterHook(response, finalOptions);
      }

      /**
       * @DEV : Maybe bot use FetchError class, only using new Error().
       */
      // Handle Non-OK HTTP Responses (e.g., 404, 500).
      // Throw a `FetchError` with the original `Response` object for detailed handling by the consumer.
      if (!response.ok) {
        throw new FetchError(response.status, response.statusText, response.url, response);
      }

      // If the response is OK (2xx or 3xx), return the raw `Response` object.
      // The caller will then use chained methods (`.json()`, `.text()`) to parse the body.
      return response;
    } catch (error) {
      // Ensure timeout is cleared regardless of success or error path
      if (timeoutId) clearTimeout(timeoutId);

      /** @DEV : Option */
      // Identify and re-throw AbortErrors (from timeout or manual abort) as `AbortError`.
      // if (error instanceof DOMException && error.name === 'AbortError') {
      //   throw new AbortError('Request aborted by user or timeout.', error);
      // }

      // Re-throw all other errors (e.g., network connectivity issues, CORS errors).
      throw error;
    } finally {
      // Always clear the timeout if it was set to prevent memory leaks.
      if (timeoutId) clearTimeout(timeoutId);
    }
  })();

  // Wrap the core fetch promise in `FetchResponse` to provide chained parsing methods.
  return new FetchResponse(coreFetchPromise);
}

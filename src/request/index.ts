import { FetchOptions, ChainedFetchResponse, BeforeHookParams } from './types';
import { appendQueryParams, processRequestBody, handleProgress } from './utils';

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
 * Network errors, request timeouts, and non-2xx HTTP statuses (`response.ok` is false).
 *
 * @param url - The URL for the request. Can be a relative path (e.g., '/api/data')
 * which will be resolved against the current origin, or an absolute URL.
 * @param options - An object containing request configuration, extending standard `RequestInit`.
 * @returns A `ChainedFetchResponse` object that wraps a `Promise<Response>`,
 * allowing for chained body parsing methods.
 * @throws {Error} For other network-related errors (e.g., CORS issues, DNS errors).
 */
export const request = (
  url: string,
  {
    headers = {}, // Default to an empty object for headers
    signal: externalSignal, // External AbortSignal provided by the caller
    query = {}, // Query parameters to append to the URL
    timeout, // Request timeout in milliseconds
    beforeHook, // Hook executed before the request
    afterHook, // Hook executed after the response
    onProgress, // Download progress callback
    ...options // Remaining standard RequestInit properties (e.g., method, body, cache, credentials)
  }: FetchOptions = {} // Default to an empty options object
): ChainedFetchResponse => {
  return new FetchResponse(
    (async (): Promise<Response> => {
      let finalOptions = {
        ...options,
        headers: new Headers(headers)
      } as RequestInit;

      let requestParams: BeforeHookParams = { 
        query, 
        headers: finalOptions.headers
      };

      // Execute Before Hook if defined. It can modify `query` or `headers`.
      if (beforeHook) {
        await beforeHook(requestParams);
      }

      // Process the request body (e.g., JSON.stringify, FormData handling)
      // and set the appropriate Content-Type header.
      processRequestBody(finalOptions);

      let internalController: AbortController | undefined;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const hasTimeout = timeout && timeout > 0;

      if (hasTimeout || !!externalSignal) {
        internalController = new AbortController();

        if (externalSignal) {
          externalSignal.addEventListener('abort', () => internalController!.abort());
        }

        if (hasTimeout) {
          timeoutId = setTimeout(() => internalController!.abort(), timeout);
        }
      }

      finalOptions.signal = internalController?.signal;

      let response: Response;
      try {
        response = await fetch(
          appendQueryParams(url, requestParams.query),
          finalOptions
        );

        // Handle Download Progress if a callback is provided and Content-Length header exists.
        // The response body is wrapped in a new stream to enable progress tracking.
        if (onProgress && response.body && response.headers.has('Content-Length')) {
          response = await handleProgress(response, onProgress);
        }

        // Execute After Hook if defined. It can modify the `response` object.
        if (afterHook) {
          response = await afterHook(response, finalOptions);
        }
        
        if (response.ok) {
          return response;
        }

        // Handle Non-OK HTTP Responses (e.g., 404, 500).
        let err: any = new Error('Fetch failed');

        // Attach specific, commonly used properties directly for convenience
        err.name = 'FetchError';
        err.status = response.status;
        err.statusText = response.statusText;
        err.data = await response.json().catch(() => null); // The parsed JSON error body
        // Attach the full response object for comprehensive debugging
        // Note: The body stream of `response` will likely be consumed by `response.json()` above.
        // err.response = response;
        throw err;
      } 
      catch (error) {
        throw error;
      } 
      finally {
        // Always clear the timeout if it was set to prevent memory leaks.
        if (timeoutId) clearTimeout(timeoutId);
      }
    })()
  );
}

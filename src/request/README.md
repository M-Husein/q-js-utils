# request

Performs an HTTP request with extended features, optimized for performance. It provides custom error handling, request timeout, download progress tracking, and pre/post-request hooks.

This function returns a `ChainedFetchResponse` object, which allows chaining methods like `.json()`, `.text()`, etc., to conveniently consume the response body. Network errors, request timeouts, and non-2xx HTTP statuses (`response.ok` is false).

## Code

```ts
/**
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
    query, // Query parameters to append to the URL
    timeout, // Request timeout in milliseconds
    beforeHook, // Hook executed before the request
    afterHook, // Hook executed after the response
    onProgress, // Download progress callback
    ...options // Remaining standard RequestInit properties (e.g., method, body, cache, credentials)
  }: FetchOptions = {} // Default to an empty options object
): ChainedFetchResponse => {
  return new FetchResponse(
    (async (): Promise<Response> => {
      let finalOptions: RequestInit = {
        ...options,
        headers: new Headers(headers),
      };

      // Process the request body (e.g., JSON.stringify, FormData handling)
      // and set the appropriate Content-Type header.
      processRequestBody(finalOptions);

      const hasTimeout = timeout && timeout > 0;

      /**
       * @Old
       // Setup AbortController for handling timeouts and external aborts:
        const controller = externalSignal ? null : new AbortController();

        // Set up timeout if effectiveTimeout is positive. If controller is null, abort() will do nothing.
        const timeoutId = hasTimeout ? setTimeout(() => controller?.abort(), timeout) : null;

        // Use the provided external signal if available, otherwise use the internally created signal.
        finalOptions.signal = externalSignal || controller?.signal;
       */

      /**
       * @Old 2 - Always run new AbortController()
       * 
       const internalController = new AbortController();

        if (externalSignal) {
          // This adds a listener to the external signal.
          // If externalSignal aborts, it tells internalController to abort.
          externalSignal.addEventListener('abort', () => internalController.abort());
        }

        const timeoutId = hasTimeout 
          ? setTimeout(() => internalController.abort(), timeout) // timeout tells internalController to abort
          : null;

        finalOptions.signal = internalController.signal; // Fetch is listening to internalController's signal
       */

      let internalController: AbortController | undefined;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      // OR
      // let internalController: AbortController | null = null;
      // let timeoutId: ReturnType<typeof setTimeout> | null = null;

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

      // Execute Before Hook if defined. It can modify `finalOptions`.
      if (beforeHook) {
        finalOptions = await beforeHook(finalOptions);
      }

      let response: Response;
      try {
        response = await fetch(
          appendQueryParams(url, query), // Append query parameters to the URL string
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
        let err: any = new Error('Fetch failed'); // , { cause: "FetchError" }

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
```

## Option 1

This option with return `url`, `query`, and `options` in `beforeHook`.

```ts
/**
 * Interface for the parameters passed to the beforeHook.
 * This encapsulates all the mutable parts of the request to allow
 * the hook to modify them.
 */
export interface BeforeHookParams {
  url: string;
  query?: QueryParams; // Optional as per your original design
  options: RequestInit;
}

/**
 * Hook function executed before a request is made.
 * It can modify the URL, query parameters, or `RequestInit` options.
 * @param params - An object containing the current url, query, and options.
 * @returns An object containing the (potentially modified) url, query, and options, or a Promise resolving to it.
 */
export type BeforeHook = (params: BeforeHookParams) => BeforeHookParams | Promise<BeforeHookParams>;
```

```ts
import { FetchOptions, ChainedFetchResponse, BeforeHookParams } from './types';
import { appendQueryParams, processRequestBody, handleProgress } from './utils';

export const request = (
  url: string,
  {
    headers = {}, // Default to an empty object for headers
    signal: externalSignal, // External AbortSignal provided by the caller
    query, // Query parameters to append to the URL
    timeout, // Request timeout in milliseconds
    beforeHook, // Hook executed before the request
    afterHook, // Hook executed after the response
    onProgress, // Download progress callback
    ...options // Remaining standard RequestInit properties (e.g., method, body, cache, credentials)
  }: FetchOptions = {} // Default to an empty options object
): ChainedFetchResponse => {
  return new FetchResponse(
    (async (): Promise<Response> => {
      // Step 1: Create the initial RequestInit object
      let finalOptions = {
        ...options,
        headers: new Headers(headers)
      } as RequestInit;
      
      // Step 2: Run the beforeHook to get the final parameters
      // This is the correct placement to allow modification of url, query, and options
      if (beforeHook) {
        const hookResult = await beforeHook({
          url,
          query,
          options: finalOptions
        });
        
        // Reassign the local variables with the modified values from the hook
        url = hookResult.url;
        query = hookResult.query;
        finalOptions = hookResult.options;
      }

      // Step 3: Process the request body. This must run after the hook.
      processRequestBody(finalOptions);

      // Step 4: AbortController and timeout logic
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

      // Step 5: Execute fetch
      let response: Response;
      try {
        response = await fetch(
          appendQueryParams(url, query),
          finalOptions
        );

        // Step 6: Post-fetch logic
        if (onProgress && response.body && response.headers.has('Content-Length')) {
          response = await handleProgress(response, onProgress);
        }

        if (afterHook) {
          response = await afterHook(response, finalOptions);
        }
        
        if (response.ok) {
          return response;
        }

        let err: any = new Error('Fetch failed');
        err.name = 'FetchError';
        err.status = response.status;
        err.statusText = response.statusText;
        err.data = await response.json().catch(() => null);
        throw err;
      } 
      catch (error) {
        throw error;
      } 
      finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    })()
  );
};
```

**OR**

```ts
// File: index.ts

// ... other imports ...
import { FetchOptions, ChainedFetchResponse, BeforeHookParams } from './types'; // Import the new type

export const request = (
  url: string,
  {
    headers = {},
    signal: externalSignal,
    query,
    timeout,
    beforeHook,
    afterHook,
    onProgress,
    ...options
  }: FetchOptions = {}
): ChainedFetchResponse => {
  return new FetchResponse(
    (async (): Promise<Response> => {
      let finalOptions = {
        ...options,
        headers: new Headers(headers)
      } as RequestInit;

      // Process the request body.
      processRequestBody(finalOptions);

      // --- NEW LOGIC FOR THE beforeHook ---
      let finalUrl = url;
      let finalQuery = query;

      if (beforeHook) {
        const hookResult = await beforeHook({
          url: finalUrl,
          query: finalQuery,
          options: finalOptions
        });
        // Update the variables with the modified values returned from the hook
        finalUrl = hookResult.url;
        finalQuery = hookResult.query;
        finalOptions = hookResult.options;
      }
      // --- END OF NEW LOGIC ---

      let internalController: AbortController | undefined;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const hasTimeout = timeout && timeout > 0;
      if(hasTimeout || !!externalSignal){
        internalController = new AbortController();
        if(externalSignal){
          externalSignal.addEventListener('abort', () => internalController!.abort());
        }
        if(hasTimeout){
          timeoutId = setTimeout(() => internalController!.abort(), timeout);
        }
      }
      finalOptions.signal = internalController?.signal;

      let response: Response;
      try {
        response = await fetch(
          appendQueryParams(finalUrl, finalQuery), // Use the potentially modified url and query
          finalOptions
        );
        
        // ... rest of the code is the same ...
        if(onProgress && response.body && response.headers.has('Content-Length')){
          response = await handleProgress(response, onProgress);
        }
        if(afterHook){
          response = await afterHook(response, finalOptions);
        }
        if(response.ok){
          return response;
        }
        let err: any = new Error('Fetch failed');
        err.name = 'FetchError';
        err.status = response.status;
        err.statusText = response.statusText;
        err.data = await response.json().catch(() => null);
        throw err;
      } catch(err) {
        throw err;
      } finally {
        if(timeoutId) clearTimeout(timeoutId);
      }
    })()
  );
}
```

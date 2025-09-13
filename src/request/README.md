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

## Option 2

Using AbortSignal Timeout and Any Methods.

```ts
import { FetchOptions, BeforeHookParams, ResponseType } from './types';
import { appendQueryParams, handleProgress, fetchError } from './utils'; // processRequestBody

export const request = async (
  url: string,
  {
    headers = {},
    signal: externalSignal,
    responseType = "json",
    query = {},
    timeout,
    beforeHook,
    afterHook,
    onProgress,
    ...options
  }: FetchOptions = {}
): Promise<any> => {
  let finalOptions = {
    ...options,
    headers: new Headers(headers)
  } as RequestInit;

  // The logic from processRequestBody is now directly here
  if (finalOptions.body != null && !(finalOptions.body instanceof FormData)) {
    if (finalOptions.body instanceof URLSearchParams) {
      (finalOptions.headers as Headers).set("Content-Type", "application/x-www-form-urlencoded");
    } else if (
      typeof finalOptions.body === "object" &&
      !(finalOptions.body instanceof Blob) &&
      !(finalOptions.body instanceof ArrayBuffer) &&
      !(finalOptions.body instanceof ReadableStream)
    ) {
      (finalOptions.headers as Headers).set("Content-Type", "application/json");
      finalOptions.body = JSON.stringify(finalOptions.body);
    }
  }

  // // OR
  // if (
  //   finalOptions.body && typeof finalOptions.body === 'object' && !(finalOptions.body instanceof FormData || finalOptions.body instanceof URLSearchParams || finalOptions.body instanceof Blob || finalOptions.body instanceof ArrayBuffer || finalOptions.body instanceof URLSearchParams)
  // ) {
  //   finalOptions.body = JSON.stringify(finalOptions.body);
  //   finalOptions.headers = {
  //     'Content-Type': 'application/json',
  //     ...finalOptions.headers
  //   };
  // }

  let requestParams: BeforeHookParams = {
    query,
    headers: finalOptions.headers
  };

  if(beforeHook){
    await beforeHook(requestParams);
  }

  // processRequestBody(finalOptions);

  // The final signal that will be passed to fetch()
  let finalSignal = externalSignal; 

  // This variable is needed for the fallback
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  const hasTimeout = timeout && timeout > 0;

  if (hasTimeout) {
    if (typeof AbortSignal.timeout === 'function') {
      const timeoutSignal = AbortSignal.timeout(timeout);
      if (externalSignal) {
        if (typeof AbortSignal.any === 'function') {
          finalSignal = AbortSignal.any([externalSignal, timeoutSignal]);
        } else {
          const combinedController = new AbortController();
          externalSignal.addEventListener('abort', () => combinedController.abort());
          timeoutSignal.addEventListener('abort', () => combinedController.abort());
          finalSignal = combinedController.signal;
        }
      } else {
        finalSignal = timeoutSignal;
      }
    } else {
      // This is the fallback block where the timeoutId is created
      const internalController = new AbortController();
      if (externalSignal) {
        externalSignal.addEventListener('abort', () => internalController.abort());
      }
      timeoutId = setTimeout(() => internalController.abort(), timeout);
      finalSignal = internalController.signal;
    }
  }

  finalOptions.signal = finalSignal;

  let response: Response;
  try {
    response = await fetch(
      appendQueryParams(url, requestParams.query),
      finalOptions
    );

    if(onProgress && response.body && response.headers.has('Content-Length')){
      response = await handleProgress(response, onProgress);
    }
    
    // Execute After Hook if defined. It can modify the `response` object.
    if(afterHook){
      response = await afterHook(response, finalOptions);
    }
    
    if(response.ok){
      // if(responseType){
      //   return await response[responseType as ResponseType]?.();
      // }

      const parser = response[responseType as ResponseType];
      if(typeof parser === "function"){
        return await parser.call(response);
      }

      // Raw
      return response;
    }

    // Handle Non-OK HTTP Responses (e.g., 404, 500).
    throw await fetchError(response);
  }
  catch(error){
    throw error;
  }
  finally {
    // This finally block is critical to clean up the manual timer
    // created in the fallback logic.
    if(timeoutId) clearTimeout(timeoutId);
  }
}
```

## Examples

```ts
import { request } from 'q-js-utils/request';

// 1. Basic GET request (defaults to GET)
try {
  const data = await request('https://jsonplaceholder.typicode.com/todos/1');
  console.log('1. Basic GET (title):', data.title);
} catch (error) {
  console.error('1. Basic GET (Error):', error);
}

// 2. GET with query parameters
try {
  const text = await request('https://jsonplaceholder.typicode.com/todos', {
    query: { userId: 1, completed: false },
  });
  // console.log('2. GET with query params (first 100 chars of text):', text.substring(0, 100) + '...');
  console.log('2. GET with query params json:', text);
} catch (error) {
  console.error('2. GET with query params Error:', error);
}

// 3. POST request with JSON body and explicit method
try {
  const newPost = await request(
    'https://jsonplaceholder.typicode.com/posts',
    {
      method: 'POST', // Explicit method required
      body: {
        title: 'Simplified Post',
        body: 'This is a test post body.',
        userId: 99,
      },
      headers: { 'X-Request-Specific': 'Hello' }, // Explicit headers for this request
    },
  );
  console.log('3. POST JSON (new post ID):', newPost.id, newPost.title);
} catch (error) {
  console.error('3. POST JSON Error:', error);
}

// 4. Download progress
console.log('4. Download Progress');
try {
  const blob = await request('https://httpbin.org/bytes/1048576', {
    // @ts-ignore
    // responseType: "hell",
    responseType: "blob",
    onProgress: (progress) => {
      console.log('progress:', progress);
      if (progress.total) {
        console.log(
          `Progress: ${progress.loaded} / ${progress.total} bytes (${(
            progress.progress! * 100
          ).toFixed(2)}%)`,
        );
      } else {
        console.log(`Progress: ${progress.loaded} bytes loaded (total unknown)`);
      }
    },
  });

  console.log('Download blob: ', blob);
  console.log('Download complete. Blob size:', blob?.size, 'bytes');
} catch (error: any) {
  console.error('4. Download Progress Error:', error);
  for(let err in error){
    console.error('err:', err);
  }
}

// 5. Request timeout
console.log('5. Request Timeout (should fail)');
try {
  await request('https://httpbin.org/delay/2', { timeout: 100 });
  console.log('Timeout test succeeded (unexpected)');
} catch (error) {
  console.error('Other Error during timeout test:', error);
}

// 6. Abort request manually
console.log('6. Abort Request Manually (should fail)');
const abortController = new AbortController();
const abortTimeout = setTimeout(() => {
  abortController.abort();
  // console.log('Manual abort triggered!');
}, 50);

try {
  await request('https://httpbin.org/delay/2', { signal: abortController.signal });
  console.log('Manual abort test succeeded (unexpected)');
} catch (error: any) {
  console.log('Error:', error);
  console.log('Error name:', error.name);
} finally {
  clearTimeout(abortTimeout);
}

// 7. Custom error handling for non-2xx status (404 Not Found)
console.log('7. Custom Error Handling (404 Not Found)');
try {
  await request('https://jsonplaceholder.typicode.com/non-existent-path-12345');
} catch (error: any) {
  console.log('Error:', error);
  console.log('Error name:', error.name);
  console.log('Error status:', error.status);
  console.log('Error statusText:', error.statusText);
  console.log('Error message:', error.message);
  console.log('Error response:', error.response);
  console.log('Error data:', error.data);
}

// 8. Error during JSON parsing (invalid JSON from server for 200 OK)
console.log('8. Error during JSON parsing (invalid JSON from server for 200 OK)');
try {
  const validResponse = await request('https://jsonplaceholder.typicode.com/todos/1');
  console.log('Valid JSON parsed successfully:', validResponse.title);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('SyntaxError during JSON parsing (from .json() call):', error.message);
  } else {
    console.error('Other Error during parsing test:', error);
  }
}

// 9. Using before and after hooks for a specific request
console.log('9. Using before and after hooks for a specific request');
try {
  const response = await request('https://jsonplaceholder.typicode.com/comments/5', {
    // credentials: "include",
    query: {
      q: "Cool"
    },
    // url, 
    beforeHook: async ({ query, headers }) => { // requestOptions: RequestInit, query?: QueryParams | RequestInit | FetchOptions
      console.log('[Specific Before Hook] Preparing request headers:', headers);
      
      // requestOptions.headers.Authorization = 'Bearer';
      // (requestOptions.headers as Record<string, string>).Authorization = 'Bearer';
      // requestOptions.headers.set('Authorization', 'Bearer ');

      // let token = await getToken();
      // if (token) {
      //   requestOptions.headers.set('Authorization', 'Bearer ' + token);
      // }

      (headers as Headers).set('Authorization', 'Bearer DUMMY_TOKEN');

      /** @OPTION : For csrf token */
      // request.credentials === "include" && 
      // if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)){
      //   const csrfToken = Cookies.get('XSRF-TOKEN') as string;
      //   if(csrfToken){
      //     request.headers.set('X-XSRF-TOKEN', decodeURIComponent(csrfToken));
      //   }
      // }

      // const setAppLang = (): { ['lang']: string } | {} => {
      //   const lang = new URLSearchParams(location.search).get('lang') as string;
      //   return lang ? { lang } : {};
      // }

      // console.log('query: ', query);

      const lang = new URLSearchParams(location.search).get('lang') as string;
      if(lang){
        if(query){
          query.lang = lang;
        }else{
          query = { lang };
        }
      }

      // console.log('query: ', query);

      // Return the modified object
      // return { url, query, options };

      // return requestOptions;
    },
    afterHook: async (response) => { // , options
      console.log(`[Specific After Hook] Received response with status ${response.status}`);

      if (response.status === 401) {
        // Handle token refresh logic here
        console.warn('Token expired, refreshing...');
      }
      return response;
    }
  });
  
  console.log('Hooked request data:', response.name);
} catch (error) {
  console.error('9. Hooked request error:', error);
}
```

import { FetchOptions, BeforeHookParams, ResponseType } from './types';
import { appendQueryParams, handleProgress, fetchError } from './utils';

/**
 * A highly configurable fetch wrapper that simplifies making HTTP requests.
 * It supports query parameters, a request timeout, and a flexible hook system.
 * The function can either return the parsed response data directly or the raw Response object,
 * depending on the 'responseType' option.
 *
 * @param {string} url The URL of the resource to fetch.
 * @param {FetchOptions} [options={}] An object containing custom and standard fetch options.
 * @param {object} [options.headers={}] Headers to be included in the request.
 * @param {AbortSignal} [options.signal] An AbortSignal instance for canceling the request.
 * @param {ResponseType} [options.responseType] The desired format for the response body. If omitted, returns the raw Response object.
 * @param {object} [options.query={}] Query parameters to be appended to the URL.
 * @param {number} [options.timeout] The request timeout in milliseconds.
 * @param {BeforeHook} [options.beforeHook] A hook executed before the request is made.
 * @param {OnProgressCallback} [options.onProgress] A callback for monitoring download progress.
 * @param {object} options.body The request body.
 * @param {string} options.method The request method.
 * @returns {Promise<any | Response>} A Promise that resolves to the parsed response data if `responseType` is provided,
 * otherwise, it resolves to the raw `Response` object.
 * @throws {FetchError} Throws a `FetchError` for HTTP status codes outside of the 200-299 range,
 * or for network failures. The error object includes status and parsed error data.
 *
 * @example
 * // Returns the raw Response object for manual handling
 * const response = await request('https://api.example.com/data');
 * const data = await response.json();
 */
export const request = async (
  url: string,
  {
    headers = {},
    signal: externalSignal, // External AbortSignal provided by the caller
    responseType = "json",
    query = {},
    timeout,
    beforeHook,
    afterHook,
    onProgress,
    ...options // Remaining standard RequestInit properties (e.g., method, body, cache, credentials)
  }: FetchOptions = {}
): Promise<any> => {
  let finalOptions = {
    ...options,
    headers: new Headers(headers)
  } as RequestInit;

  // FormData manages its own Content-Type, so do nothing.
  // Null or undefined bodies don't need Content-Type either.
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

  let requestParams: BeforeHookParams = { 
    query, 
    headers: finalOptions.headers
  };

  // Execute Before Hook if defined. It can modify `query` or `headers`.
  if(beforeHook){
    await beforeHook(requestParams);
  }

  // let internalController: AbortController | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const hasTimeout = timeout && timeout > 0;

  if(hasTimeout || externalSignal){
    let internalController: AbortController = new AbortController();
    finalOptions.signal = internalController.signal;

    if(externalSignal){
      externalSignal.addEventListener("abort", () => internalController!.abort());
    }

    if(hasTimeout){
      timeoutId = setTimeout(() => internalController!.abort(), timeout);
    }
  }

  // finalOptions.signal = internalController?.signal;

  let response: Response;
  try {
    response = await fetch(
      appendQueryParams(url, requestParams.query),
      finalOptions
    );

    // Handle Download Progress if a callback is provided and Content-Length header exists.
    // The response body is wrapped in a new stream to enable progress tracking.
    if(onProgress && response.body && response.headers.has("Content-Length")){
      response = await handleProgress(response, onProgress);
    }

    // Execute After Hook if defined. It can modify the `response` object.
    if(afterHook){
      response = await afterHook(response, finalOptions);
    }
    
    if(response.ok){
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
  catch(err){
    throw err;
  } 
  finally{
    // Always clear the timeout if it was set to prevent memory leaks.
    if(timeoutId) clearTimeout(timeoutId);
  }
}

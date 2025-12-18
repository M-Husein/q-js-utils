/**
 * Defines the supported HTTP methods.
 * @NOTES : It is strongly recommended to consistently use uppercase HTTP methods.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Represents the different types of response parsing methods.
 * This is used to automatically parse the response body.
 */
export type ResponseType = 'json' | 'text' | 'blob' | 'formData' | 'arrayBuffer';

/**
 * Type for request payload (body).
 * It can be an object (for JSON), FormData, URLSearchParams, binary data (Blob, ArrayBuffer),
 * or a plain string.
 */
export type RequestBody = object | FormData | URLSearchParams | Blob | ArrayBuffer | string | null | undefined;

/**
 * Type for query parameters. Supports a plain object where keys are strings
 * and values can be strings, numbers, booleans, or arrays of strings.
 */
export type QueryParams = Record<string, string | number | boolean | string[]>;

/**
 * Represents the progress of a download.
 */
export interface DownloadProgress {
  /** Bytes loaded so far. */
  loaded: number;
  /** Total bytes to load, if available (e.g., from Content-Length header). */
  total: number | undefined;
  /** Progress percentage (0-1), calculated as loaded / total. Undefined if total is unknown. */
  progress: number | undefined;
}

/**
 * Interface for the parameters passed to the beforeHook.
 * This encapsulates all the mutable parts of the request to allow
 * the hook to modify them.
 */
export interface BeforeHookParams {
  query?: QueryParams;
  headers?: HeadersInit
}

// Options
// export interface BeforeHookParams {
//   url: string;
//   query?: QueryParams; // Optional as per your original design
//   options: RequestInit;
// }

/**
 * Callback function for download progress updates.
 * @param progress - An object containing loaded, total, and progress percentage.
 */
export type OnProgressCallback = (progress: DownloadProgress) => void;

/**
 * Hook function executed before a request is made.
 * It can modify `RequestInit` options or the URL.
 * @param url - The URL to `fetch`.
 * @param query - SearchParam in the URL to `fetch`.
 * @param options - The `RequestInit` object that will be passed to `fetch`.
 * @returns The (potentially modified) `RequestInit` object, or a Promise resolving to it.
 */
export type BeforeHook = (params: BeforeHookParams) => void | Promise<void>;

// Options
// export type BeforeHook = (params: BeforeHookParams) => BeforeHookParams | Promise<BeforeHookParams>;
// export type BeforeHook = (options: RequestInit) => RequestInit | Promise<RequestInit>;

/**
 * Hook function executed after a response is received, but before its body is parsed.
 * It can modify the `Response` object (e.g., to transform headers or status).
 * @param response - The raw `Response` object received from the fetch call.
 * @param options - The `RequestInit` object used for the fetch call.
 * @returns The (potentially modified) `Response` object, or a Promise resolving to it.
 */
export type AfterHook = (response: Response, options: RequestInit) => Response | Promise<Response>;
// export type AfterHook = (url: string, options: RequestInit, response: Response) => Response | Promise<Response>;

/**
 * Options specific to a single fetch request.
 * These extend the standard `RequestInit` interface and add custom functionalities.
 */
export interface FetchOptions extends Omit<RequestInit, 'body' | 'headers' | 'signal'> {
  /** The request payload (body). Can be an object (for JSON), FormData, etc. */
  body?: RequestBody;

  /**
   * An external `AbortSignal` to control the request lifecycle.
   * If provided, your internal timeout will not use this signal; it will create its own
   * `AbortController` if `timeout` is also set.
   */
  signal?: AbortSignal;

  /**
   * You explicitly destructure headers and use `new Headers(headers)`.
   * `HeadersInit` allows string[][], Record<string, string>, or Headers.
   */
  headers?: HeadersInit;

  /** Query parameters to append to the URL. */
  query?: QueryParams;

  /**
   * The desired format for the response body. If provided, the function returns the parsed data.
   * If not provided, the function returns the raw Response object.
   */
  responseType?: ResponseType;

  /**
   * Request timeout in milliseconds. If the request takes longer than this, it will be aborted
   * and an `AbortError` will be thrown. A value of `0` or `undefined` means no timeout.
   */
  timeout?: number;

  /**
   * A hook function executed before this specific request is made.
   * Can modify request options.
   */
  beforeHook?: BeforeHook;

  /**
   * A hook function executed after the response for this specific request is received,
   * but before its body is parsed. Can modify the response.
   */
  afterHook?: AfterHook;

  /**
   * Callback function for download progress updates.
   * This is active only if the response has a `Content-Length` header.
   */
  onProgress?: OnProgressCallback;
}

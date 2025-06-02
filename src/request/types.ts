/**
 * Defines the supported HTTP methods.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Type for request payload (body).
 * It can be an object (for JSON), FormData, URLSearchParams, binary data (Blob, ArrayBuffer),
 * or a plain string.
 */
export type RequestBody =
  | object
  | FormData
  | URLSearchParams
  | Blob
  | ArrayBuffer
  | string
  | null
  | undefined;

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
 * Callback function for download progress updates.
 * @param progress - An object containing loaded, total, and progress percentage.
 */
export type OnProgressCallback = (progress: DownloadProgress) => void;

/**
 * Hook function executed before a request is made.
 * It can modify the URL or `RequestInit` options.
 * @param url - The effective URL for the request.
 * @param options - The `RequestInit` object that will be passed to `fetch`.
 * @returns The (potentially modified) `RequestInit` object, or a Promise resolving to it.
 */
export type BeforeHook = (options: RequestInit) => RequestInit | Promise<RequestInit>;
// export type BeforeHook = (url: string, options: RequestInit) => RequestInit | Promise<RequestInit>;

/**
 * Hook function executed after a response is received, but before its body is parsed.
 * It can modify the `Response` object (e.g., to transform headers or status).
 * @param url - The effective URL of the request.
 * @param options - The `RequestInit` object used for the fetch call.
 * @param response - The raw `Response` object received from the fetch call.
 * @returns The (potentially modified) `Response` object, or a Promise resolving to it.
 */
export type AfterHook = (response: Response, options: RequestInit) => Response | Promise<Response>;
// export type AfterHook = (url: string, options: RequestInit, response: Response) => Response | Promise<Response>;

/**
 * Interface for the object returned by the `request` function,
 * enabling chained response body parsing methods like `.json()`, `.text()`, etc.
 */
export interface ChainedFetchResponse {
  /**
   * The underlying Promise that resolves to the raw `Response` object.
   * Useful if you need to access the raw response without parsing its body.
   */
  readonly response: Promise<Response>;
  /**
   * Parses the response body as JSON.
   * @template T - The expected type of the JSON response.
   * @returns A Promise that resolves to the parsed JSON object.
   */
  json<T = any>(): Promise<T>;
  /**
   * Parses the response body as plain text.
   * @returns A Promise that resolves to the response body as a string.
   */
  text(): Promise<string>;
  /**
   * Parses the response body as a Blob.
   * @returns A Promise that resolves to the response body as a `Blob`.
   */
  blob(): Promise<Blob>;
  /**
   * Parses the response body as an ArrayBuffer.
   * @returns A Promise that resolves to the response body as an `ArrayBuffer`.
   */
  arrayBuffer(): Promise<ArrayBuffer>;
  /**
   * Parses the response body as FormData.
   * @returns A Promise that resolves to the response body as `FormData`.
   */
  formData(): Promise<FormData>;
}

/**
 * Options specific to a single fetch request.
 * These extend the standard `RequestInit` interface and add custom functionalities.
 */
export interface PerformanceFetchOptions extends Omit<RequestInit, 'body'> {
  /** The request payload (body). Can be an object (for JSON), FormData, etc. */
  body?: RequestBody;
  /** Query parameters to append to the URL. */
  query?: QueryParams;
  /**
   * Request timeout in milliseconds. If the request takes longer than this, it will be aborted
   * and an `AbortError` will be thrown. A value of `0` or `undefined` means no timeout.
   */
  timeout?: number;
  /**
   * Callback function for download progress updates.
   * This is active only if the response has a `Content-Length` header.
   */
  onProgress?: OnProgressCallback;
  /**
   * An external `AbortSignal` to control the request lifecycle.
   * If provided, your internal timeout will not use this signal; it will create its own
   * `AbortController` if `timeout` is also set.
   */
  signal?: AbortSignal;
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
}

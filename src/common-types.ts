// Re-exporting from network/types, or if network/types was consolidated here:
export * from './network/request/types'; // Assuming network/types defines HttpMethod, RequestBody, QueryParams, DownloadProgress, OnProgressCallback, BeforeHook, AfterHook, ChainedFetchResponse, PerformanceFetchOptions

// Add any other common types here for your new utilities
export type Primitive = string | number | boolean | symbol | bigint | undefined | null;

export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}

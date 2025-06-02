// Re-exporting from request/types, or if request/types was consolidated here:
// Assuming request/types defines HttpMethod, RequestBody, QueryParams, DownloadProgress, 
// OnProgressCallback, BeforeHook, AfterHook, ChainedFetchResponse, PerformanceFetchOptions
export * from './request/types';

// Add any other common types here for your new utilities
export type Primitive = string | number | boolean | symbol | bigint | undefined | null;

export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}

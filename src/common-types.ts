// Re-exporting from request/types
export * from './request/types';

// Add any other common types for new utilities
export type Primitive = string | number | boolean | symbol | bigint | undefined | null;

export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}

# retryAsync

## Usage
```ts
import { retryAsync } from 'q-js-utils/retryAsync';

retryAsync(() => fetch('https://api.com'))
```

## Option 1

```ts
/**
 * Retry any async or Promise
 * @param action     : () => Promise<T>
 * @param maxRetries : number - default 2
 * @param baseDelay  : number - default 300
 * @returns 
 */
export const retryAsync = <T>(
  action: () => Promise<T>, // T is the expected resolved type
  maxRetries = 2,
  baseDelay = 300 // base delay in ms
): Promise<T> => {
  let attempt = 0;

  const execute = (): Promise<T> => action()
    .catch(async (err: any) => {
      attempt++;

      // Fail after retries are exceeded
      if (attempt > maxRetries) return Promise.reject(err);

      // Calculate exponential backoff delay
      const delay = baseDelay * (2 ** (attempt - 1));
      
      // Wait for the calculated delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry by recursively calling execute()
      return execute();
    });

  return execute();
}
```

## Option 2

```ts
type RetryOptions = {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
  shouldRetry?: (error: unknown) => boolean;
};

export const retryAsync = async <T>(
  action: (attempt: number) => Promise<T>,
  {
    maxRetries = 2,
    baseDelay = 300,
    maxDelay = 5_000,
    jitter = true,
    shouldRetry = () => true,
  }: RetryOptions = {}
): Promise<T> => {
  let attempt = 0;

  while (true) {
    try {
      return await action(attempt);
    } catch (error) {
      attempt++;

      if (attempt > maxRetries || !shouldRetry(error)) {
        throw error;
      }

      let delay = Math.min(
        baseDelay * 2 ** (attempt - 1),
        maxDelay
      );

      if (jitter) {
        delay *= 0.5 + Math.random(); // ±50% jitter
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage:

// Basic retry
await retryAsync(() => fetchData());

// Retry only for network errors
await retryAsync(
  () => apiCall(),
  {
    maxRetries: 3,
    shouldRetry: (err: any) => err?.response?.status >= 500
  }
);

// With logging
await retryAsync(
  (attempt) => {
    console.log(`Attempt ${attempt + 1}`);
    return apiCall();
  }
);
```

## Option 3

```ts
type RetryOptions = {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
  timeoutMs?: number; // per attempt timeout
  shouldRetry?: (error: unknown) => boolean;
  signal?: AbortSignal; // external abort
};

export const retryAsync = async <T>(
  action: (ctx: { attempt: number; signal: AbortSignal }) => Promise<T>,
  {
    maxRetries = 2,
    baseDelay = 300,
    maxDelay = 5_000,
    jitter = true,
    timeoutMs,
    shouldRetry = () => true,
    signal: externalSignal,
  }: RetryOptions = {}
): Promise<T> => {
  let attempt = 0;

  // Combine external abort + per-attempt abort
  const createAttemptSignal = () => {
    const controller = new AbortController();

    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener(
        'abort',
        () => controller.abort(),
        { once: true }
      );
    }

    return controller;
  };

  while (true) {
    const controller = createAttemptSignal();
    const { signal } = controller;

    // Optional timeout per attempt
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }

    try {
      return await action({ attempt, signal });
    } catch (error) {
      if (signal.aborted) {
        throw new DOMException('Operation aborted', 'AbortError');
      }

      attempt++;

      if (attempt > maxRetries || !shouldRetry(error)) {
        throw error;
      }

      let delay = Math.min(
        baseDelay * 2 ** (attempt - 1),
        maxDelay
      );

      if (jitter) {
        delay *= 0.5 + Math.random();
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
};

// Usage:

// fetch with AbortController
const controller = new AbortController();

retryAsync(
  ({ signal }) => fetch('/api/data', { signal }).then(r => r.json()),
  { signal: controller.signal }
);

controller.abort(); // Cancel

// Axios v1+ (supports AbortSignal)
retryAsync(
  ({ signal }) =>
    axios.get('/api/data', { signal }),
  {
    maxRetries: 3,
    timeoutMs: 5_000,
    shouldRetry: err => !axios.isCancel(err),
  }
);

// Cancel on route change (React)
useEffect(() => {
  const controller = new AbortController();

  retryAsync(
    ({ signal }) => fetchData(signal),
    { signal: controller.signal }
  );

  return () => controller.abort();
}, []);

// ✅ Recommended Dexie-safe pattern

// Slightly adapt retryAsync usage
retryAsync(
  async ({ signal }) => {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    return db.users.toArray(); // Dexie call
  },
  {
    maxRetries: 3,
    signal: controller.signal,
    shouldRetry: err => !(err instanceof DOMException),
  }
);

// 🧠 Best practices for Dexie + retry
// ✔ Retry only transient IndexedDB errors
shouldRetry: (err: any) =>
  err?.name === 'QuotaExceededError' ||
  err?.name === 'UnknownError'
```

# checkNetwork

## Usage
```ts
import { checkNetwork } from 'q-js-utils/checkNetwork';


```

## Option

```ts
type InternetCheckOptions = {
  /** Interval in milliseconds between checks (default: 5000) */
  interval?: number;

  /** Request timeout in milliseconds (default: 3000) */
  timeout?: number;

  /** Callback fired when connection state changes */
  onChange?: (isOnline: boolean) => void;
};

/**
 * Periodically checks real internet connectivity using Fetch API.
 *
 * This function performs a lightweight network request to Google's
 * `generate_204` endpoint, which returns HTTP 204 when internet access is available.
 *
 * Unlike `navigator.onLine`, this verifies actual network reachability.
 *
 * @example
 * const checker = checkNetwork({
 *   onChange: (online) => console.log('Online:', online),
 * });
 *
 * checker.start();
 *
 * // later
 * checker.stop();
 */
export const checkNetwork = (
  options: InternetCheckOptions = {}
) => {
  const {
    interval = 5000,
    timeout = 3000,
    onChange,
  } = options;

  let timer: number | null = null;
  let lastStatus: boolean | null = null;

  const checkConnection = async (): Promise<boolean> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(
        'https://clients3.google.com/generate_204',
        {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        }
      );

      return response.status === 204;
    } catch {
      return false;
    } finally {
      clearTimeout(id);
    }
  };

  const start = () => {
    if (timer !== null) return;

    timer = window.setInterval(async () => {
      const isOnline = await checkConnection();

      if (lastStatus !== isOnline) {
        lastStatus = isOnline;
        onChange?.(isOnline);
      }
    }, interval);
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  return {
    start,
    stop,
  };
}
```

## Option 2

```ts
type CheckNetworkOptions = {
  /** Interval in milliseconds between checks (default: 5000) */
  interval?: number;

  /** Request timeout in milliseconds (default: 3000) */
  timeout?: number;

  /**
   * Pause checks when the document becomes hidden and
   * automatically resume when visible again.
   * (default: false)
   */
  pauseOnHidden?: boolean;

  /** Callback fired when network status changes */
  onChange?: (isOnline: boolean) => void;
};

/**
 * Periodically checks real internet connectivity using Fetch API.
 *
 * This function verifies actual internet reachability by calling
 * Google's `https://clients3.google.com/generate_204` endpoint,
 * which returns HTTP 204 when the device has internet access.
 *
 * Supports:
 * - Enable / disable switch
 * - Visibility-aware pause & resume
 * - Timeout protection per request
 *
 * @param enabled - Whether the network checker should run (default: true)
 * @param options - Network checker configuration options
 *
 * @example
 * const network = checkNetwork(true, {
 *   pauseOnHidden: true,
 *   onChange: (online) => console.log('Online:', online),
 * });
 *
 * network.start();
 */
export const checkNetwork = (
  enabled = true,
  {
    interval = 5000,
    timeout = 3000,
    pauseOnHidden = false,
    onChange,
  }: CheckNetworkOptions = {}
) => {
  let timer: number | null = null;
  let lastStatus: boolean | null = null;

  const checkConnection = async (): Promise<boolean> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(
        'https://clients3.google.com/generate_204',
        {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        }
      );

      return response.status === 204;
    } catch {
      return false;
    } finally {
      clearTimeout(id);
    }
  };

  const tick = async () => {
    const isOnline = await checkConnection();

    if (lastStatus !== isOnline) {
      lastStatus = isOnline;
      onChange?.(isOnline);
    }
  };

  const start = () => {
    if (!enabled || timer !== null) return;

    timer = window.setInterval(tick, interval);
    tick(); // immediate check
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const handleVisibilityChange = () => {
    if (!pauseOnHidden || !enabled) return;

    if (document.visibilityState === 'hidden') {
      stop();
    } else {
      start();
    }
  };

  if (pauseOnHidden && typeof document !== 'undefined') {
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
  }

  return {
    /** Start network checking (no-op if disabled) */
    start,

    /** Stop network checking */
    stop,

    /** Run a single network check */
    checkOnce: checkConnection,
  };
}
```

## Option 3

### Worker-Safe TypeScript Implementation

```ts
type CheckNetworkOptions = {
  /** Interval in milliseconds between checks (default: 5000) */
  interval?: number;

  /** Request timeout in milliseconds (default: 3000) */
  timeout?: number;

  /**
   * Pause checks when the document becomes hidden and
   * resume when visible again.
   *
   * ⚠️ Ignored in Service Workers & Web Workers.
   * (default: false)
   */
  pauseOnHidden?: boolean;

  /** Callback fired when network status changes */
  onChange?: (isOnline: boolean) => void;
};

/**
 * Periodically checks real internet connectivity using Fetch API.
 *
 * This implementation is safe for:
 * - Browser Window
 * - Web Worker
 * - Service Worker
 *
 * Uses Google's `generate_204` endpoint to verify actual
 * internet reachability (HTTP 204 = online).
 *
 * @param enabled - Whether the network checker should run (default: true)
 * @param options - Network checker configuration options
 *
 * @example
 * // Window
 * checkNetwork(true, {
 *   pauseOnHidden: true,
 *   onChange: console.log,
 * }).start();
 *
 * @example
 * // Service Worker
 * checkNetwork(true, {
 *   onChange: (online) => {
 *     console.log('[SW] Online:', online);
 *   },
 * }).start();
 */
export const checkNetwork = (
  enabled = true,
  {
    interval = 5000,
    timeout = 3000,
    pauseOnHidden = false,
    onChange,
  }: CheckNetworkOptions = {}
) => {
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastStatus: boolean | null = null;

  const hasVisibilitySupport =
    pauseOnHidden &&
    typeof document !== 'undefined' &&
    typeof document.visibilityState === 'string';

  const checkConnection = async (): Promise<boolean> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(
        'https://clients3.google.com/generate_204',
        {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        }
      );

      return response.status === 204;
    } catch {
      return false;
    } finally {
      clearTimeout(id);
    }
  };

  const tick = async () => {
    const isOnline = await checkConnection();

    if (lastStatus !== isOnline) {
      lastStatus = isOnline;
      onChange?.(isOnline);
    }
  };

  const start = () => {
    if (!enabled || timer !== null) return;

    timer = setInterval(tick, interval);
    tick(); // immediate first check
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const handleVisibilityChange = () => {
    if (!hasVisibilitySupport || !enabled) return;

    if (document.visibilityState === 'hidden') {
      stop();
    } else {
      start();
    }
  };

  // Only attach visibility listener in Window context
  if (hasVisibilitySupport) {
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
  }

  return {
    /** Start network checking (no-op if disabled) */
    start,

    /** Stop network checking */
    stop,

    /** Run a single network check */
    checkOnce: checkConnection,
  };
}
```

## Option 4

### Hybrid Version

```ts
type CheckNetworkOptions = {
  interval?: number;
  timeout?: number;
  pauseOnHidden?: boolean;
  onChange?: (isOnline: boolean) => void;
};

/**
 * Hybrid network connectivity checker.
 *
 * Combines:
 * - navigator.onLine
 * - online/offline events
 * - real network verification via Fetch API
 *
 * Safe for:
 * - Browser Window
 * - Web Worker
 * - Service Worker
 */
export const checkNetwork = (
  enabled = true,
  {
    interval = 5000,
    timeout = 3000,
    pauseOnHidden = false,
    onChange,
  }: CheckNetworkOptions = {}
) => {
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastStatus: boolean | null = null;

  const hasWindow =
    typeof window !== 'undefined' &&
    typeof window.addEventListener === 'function';

  const hasNavigator =
    typeof navigator !== 'undefined' &&
    typeof navigator.onLine === 'boolean';

  const hasVisibility =
    pauseOnHidden &&
    typeof document !== 'undefined' &&
    typeof document.visibilityState === 'string';

  const emit = (status: boolean) => {
    if (lastStatus !== status) {
      lastStatus = status;
      onChange?.(status);
    }
  };

  const fetchCheck = async (): Promise<boolean> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(
        'https://clients3.google.com/generate_204',
        {
          cache: 'no-store',
          signal: controller.signal,
        }
      );
      return res.status === 204;
    } catch {
      return false;
    } finally {
      clearTimeout(id);
    }
  };

  const verify = async () => {
    // If browser thinks we're offline, trust it immediately
    if (hasNavigator && navigator.onLine === false) {
      emit(false);
      return;
    }

    // Otherwise verify via fetch
    emit(await fetchCheck());
  };

  const start = () => {
    if (!enabled || timer) return;

    // Initial signal (fast)
    if (hasNavigator) {
      emit(navigator.onLine);
    }

    verify();

    timer = setInterval(verify, interval);

    if (hasWindow) {
      window.addEventListener('online', verify);
      window.addEventListener('offline', () => emit(false));
    }

    if (hasVisibility) {
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    if (hasWindow) {
      window.removeEventListener('online', verify);
      window.removeEventListener('offline', () => emit(false));
    }

    if (hasVisibility) {
      document.removeEventListener('visibilitychange', visibilityHandler);
    }
  };

  const visibilityHandler = () => {
    if (document.visibilityState === 'hidden') {
      stop();
    } else {
      start();
    }
  };

  return {
    start,
    stop,
    checkOnce: verify,
  };
}
```

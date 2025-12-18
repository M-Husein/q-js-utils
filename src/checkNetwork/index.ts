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
    interval = 5e3, // 5000
    timeout = 3e3, // 3000
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
          cache: "no-cache", // no-store
          mode: "no-cors",
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

interface ThrottleAdvancedOptions {
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Throttled function with leading, trailing, and cancellation support.
 * 
 * @template T - Function type to throttle
 * @param func - Target function
 * @param wait - Throttle interval in ms (default: 300)
 * @param options - { leading?: boolean, trailing?: boolean }
 * @returns Throttled function with cancel() and flush() methods.
 */
export const throttleAdvanced = <T extends (...args: any[]) => void>(
  func: T,
  wait: number = 300,
  { leading = false, trailing = true }: ThrottleAdvancedOptions = {}
) => {
  let lastExecTime: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    // Leading edge execution
    if (leading && !lastExecTime) {
      func(...args);
      lastExecTime = now;
      return;
    }

    // Time since last execution
    const timeSinceLast = now - (lastExecTime || 0);

    // Schedule or execute
    if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        if (trailing && lastArgs) {
          func(...lastArgs);
        }
        lastExecTime = Date.now();
        timeoutId = null;
      }, wait - timeSinceLast);
    }
  };

  // Cancel pending trailing execution
  throttledFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastExecTime = null;
  };

  // Immediately execute pending trailing call
  throttledFn.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      lastExecTime = Date.now();
      timeoutId = null;
    }
  };

  // Check if there's a pending throttled call
  throttledFn.pending = () => {
    return timeoutId !== null;
  };

  return throttledFn as typeof throttledFn & {
    cancel: () => void;
    flush: () => void;
    pending: () => boolean;
  };
}

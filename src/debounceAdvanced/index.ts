interface DebounceAdvancedOptions {
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Ultra-optimized debounce with cancel, flush, and pending status
 * @template T - Function type to debounce
 * @param func - Target function
 * @param wait - Delay in ms (default: 300)
 * @param options - { leading?: boolean, trailing?: boolean }
 * @returns Debounced function with control methods
 */
export const debounceAdvanced = <T extends (...args: any[]) => void>(
  func: T,
  wait: number = 300,
  { leading = false, trailing = true }: DebounceAdvancedOptions = {}
) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    // Leading edge call
    if (leading && !timer) {
      func(...args);
    }

    // Always capture latest args
    lastArgs = args;

    // Clear existing timeout
    if (timer) {
      clearTimeout(timer);
    }

    // Schedule trailing call
    if (trailing) {
      timer = setTimeout(() => {
        if (trailing && lastArgs) {
          func(...lastArgs);
        }
        timer = null;
      }, wait);
    }
  };

  // Cancel pending execution
  debouncedFn.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      lastArgs = null;
    }
  };

  // Immediately execute pending call
  debouncedFn.flush = () => {
    if (timer && lastArgs) {
      clearTimeout(timer);
      func(...lastArgs);
      timer = null;
      lastArgs = null;
    }
  };

  // Check if there's a pending call
  debouncedFn.pending = () => {
    return timer !== null;
  };

  return debouncedFn as typeof debouncedFn & {
    cancel: () => void;
    flush: () => void;
    pending: () => boolean;
  };
}

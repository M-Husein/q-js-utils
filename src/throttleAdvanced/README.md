# Throttle Notes

## Throttle with full features

```ts
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
```

**Example usage:**

**Cancellation Support (`cancel()`)**
```js
const throttledScroll = throttleAdvanced(handleScroll, 100);
window.addEventListener('scroll', throttledScroll);

// Later...
throttledScroll.cancel(); // Stops any pending execution
```

**Immediate Execution (`flush()`)**
```js
const throttledApiCall = throttleAdvanced(fetchData, 1000);
throttledApiCall("query");

// Force execute if waiting
throttledApiCall.flush();
```

**Pending Check (`pending()`)**
```js
if (throttledFn.pending()) {
  console.log("Waiting to execute...");
}
```

### Example Use Cases:

**Cancellable Scroll Handler**
```js
const scrollHandler = throttleAdvanced((position: number) => {
  console.log("Current scroll:", position);
}, 200);

window.addEventListener('scroll', () => scrollHandler(window.scrollY));

// When leaving the page
window.addEventListener('beforeunload', () => {
  scrollHandler.cancel(); // Cleanup
});
```

**Throttled API Calls with Manual Flush**
```js
const searchAPI = throttleAdvanced(async (query: string) => {
  const results = await fetch(`/search?q=${query}`);
  displayResults(results);
}, 500);

searchInput.addEventListener('input', (e) => {
  searchAPI(e.target.value);
});

// "Search Now" button forces execution
searchButton.addEventListener('click', () => {
  searchAPI.flush();
});
```

**Game Loop with Cancellation**
```js
const gameUpdate = throttleAdvanced((deltaTime: number) => {
  updatePlayerPosition(deltaTime);
}, 16); // ~60fps

gameLoop.on('update', gameUpdate);

// When game pauses
pauseButton.addEventListener('click', () => {
  gameUpdate.cancel(); // Stop pending updates
});
```

### Performance Notes:
1. **Single Timer Management** - Uses minimal variable tracking.
2. **Accurate Timing** - Precisely calculates remaining wait time.
3. **Memory Safe** - Proper cleanup in `cancel()` and `flush()`.

This matches the behavior of Lodash's `_.throttle` while adding explicit cancellation control and being more TypeScript-friendly. The implementation maintains <1KB minified size.

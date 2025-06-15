# Debounce Notes

## Simple debounce

```ts
/**
 * Creates a debounce function that delays execution of the given function
 * until after the specified delay has passed since the last call.
 *
 * @template T - A function type that accepts any parameters and returns void.
 * @param {T} func - The function to be debounced.
 * @param {number} wait - The delay time in milliseconds.
 * @returns {(...args: Parameters<T>) => void} - A new function with debouncing behavior.
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void => {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), wait);
  };
}
```

**Example usage:**

```js
// 1. Basic Usage
const handleResize = () => {
  console.log(`Window resized to: ${window.innerWidth}x${window.innerHeight}`);
};
// Wait 250ms after resizing stops
const debouncedResize = debounce(handleResize, 250);
window.addEventListener('resize', debouncedResize);
```

---

# Notes

see `debounceAdvanced` to use the full features and see other notes.

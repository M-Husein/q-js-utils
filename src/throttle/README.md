# Throttle Notes

## Simple throttle

```js
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  wait: number = 300
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    let now = Date.now();
    if (now - lastCall >= wait) {
      func(...args);
      lastCall = now;
    }
  };
}
```

**Example usage:**

```js
// Basic usage
const throttledScroll = throttle((position: number) => {
  console.log('Current scroll position:', position);
}, 100);

window.addEventListener('scroll', () => throttledScroll(window.scrollY));

// With default wait time (300ms)
const throttledClick = throttle(() => console.log('Clicked!'));
button.addEventListener('click', throttledClick);
```

---

## Enhanced (But Still Clean) Throttle

```js
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  wait: number = 300,
  trailing: boolean = false
) => {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (!lastCall || now - lastCall >= wait) {
      if (timeout) clearTimeout(timeout);
      func(...args);
      lastCall = now;
    } else if (trailing && !timeout) {
      timeout = setTimeout(() => {
        func(...args);
        timeout = null;
        lastCall = Date.now();
      }, wait - (now - lastCall));
    }
  };
};
```
Choose the first version for absolute simplicity, or the second if you need trailing call behavior!

---

# Notes

see `throttleAdvanced` to use the full features and see other notes.

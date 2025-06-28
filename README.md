# q-js-utils

A collection of JavaScript utilities.

## Install

```bash
npm install q-js-utils
```

## Usage

For the entire library (convenience, but potentially larger bundle if not tree-shaken by consumer's bundler):

```js
import { darkOrLight, str2Hex, getInitials } from 'q-js-utils';
// Or
// import * as utils from 'q-js-utils';

const isDark = darkOrLight('#000');
const nameToHex = str2Hex('Muhamad Husein');
const initialName = getInitials('Muhamad Husein');

console.log(isDark); // true
console.log(nameToHex); // f529de
console.log(initialName); // MH
```

For specific modules (recommended for tree-shaking):

```ts
import { darkOrLight } from 'q-js-utils/darkOrLight';
import { str2Hex } from 'q-js-utils/str2Hex';
import { getInitials } from 'q-js-utils/getInitials';
```

---

## Utilities

### For numeric data

```js
import { isNumber } from 'q-js-utils/isNumber';
import { isNegative } from 'q-js-utils/isNegative';
import { padWithLeadingZeros } from 'q-js-utils/padWithLeadingZeros';

const one = 1;
const minus = -1;

console.log(isNumber(one)); // true

console.log(isNegative(one)); // false
console.log(isNegative(minus)); // true

console.log(padWithLeadingZeros(one)); // '01'
```

---

### debounce

**Debouncing an input for an autocomplete search**
```js
import { debounce } from 'q-js-utils/debounce';

const searchInput = document.getElementById('searchInput') as HTMLInputElement;

const performSearch = (query: string) => {
  console.log(`Performing search for: ${query}`);
  // In a real app, you would make an API call here
};

const debouncedSearch = debounce(performSearch, 300); // Wait 300ms after last keypress

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    debouncedSearch(target.value);
  });
}
```

**Debouncing a window resize event**
```js
import { debounce } from 'q-js-utils/debounce';

const handleResize = () => {
  console.log(`Window resized to: ${window.innerWidth}x${window.innerHeight}`);
};
// Wait 250ms after resizing stops
const debouncedResize = debounce(handleResize, 250);
window.addEventListener('resize', debouncedResize);
```

---

### debounceAdvanced

**Resetting a Form Before Debounced Submission**
```js
import { debounceAdvanced } from 'q-js-utils/debounceAdvanced';

const submitForm = debounceAdvanced(
  (formData: { email: string }) => console.log("Submitting:", formData),
  1000
);

// User clicks submit but then clicks "Reset"
submitForm({ email: "user@example.com" });
submitForm.cancel(); // Stops the submission if the form was reset
```

**Avoiding Unnecessary Resize/Scroll Handlers**
```js
import { debounceAdvanced } from 'q-js-utils/debounceAdvanced';

const logScrollPosition = debounceAdvanced(
  () => console.log("Current scroll Y:", window.scrollY),
  200
);

window.addEventListener("scroll", logScrollPosition);

// When navigating away, cancel pending calls
window.removeEventListener("scroll", logScrollPosition);
logScrollPosition.cancel(); // Cleanup
```

**Game Input Handling (Cancel on Player Death)**
```js
import { debounceAdvanced } from 'q-js-utils/debounceAdvanced';

const shootBullet = debounceAdvanced(
  () => console.log("🔥 Pew!"),
  300,
  { leading: true } // Immediate first shot
);

shootBullet(); // Fires instantly
shootBullet(); // Queued for 300ms later...

// Player dies before the next shot
shootBullet.cancel(); // Prevents queued shots
```

---

### throttle

**Basic usage**
```js
import { throttle } from 'q-js-utils/throttle';

const throttledScroll = throttle((position: number) => {
  console.log('Current scroll position:', position);
}, 100);

window.addEventListener('scroll', () => throttledScroll(window.scrollY));
```

**With default wait time (300ms)**
```js
import { throttle } from 'q-js-utils/throttle';

const throttledClick = throttle(() => console.log('Clicked!'));
button.addEventListener('click', throttledClick);
```

---

### throttleAdvanced

**Cancellation Support (`cancel()`)**
```js
import { throttleAdvanced } from 'q-js-utils/throttleAdvanced';

const throttledScroll = throttleAdvanced(handleScroll, 100);
window.addEventListener('scroll', throttledScroll);

// Later...
throttledScroll.cancel(); // Stops any pending execution
```

**Immediate Execution (`flush()`)**
```js
import { throttleAdvanced } from 'q-js-utils/throttleAdvanced';

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
import { throttleAdvanced } from 'q-js-utils/throttleAdvanced';

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
import { throttleAdvanced } from 'q-js-utils/throttleAdvanced';

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
import { throttleAdvanced } from 'q-js-utils/throttleAdvanced';

const gameUpdate = throttleAdvanced((deltaTime: number) => {
  updatePlayerPosition(deltaTime);
}, 16); // ~60fps

gameLoop.on('update', gameUpdate);

// When game pauses
pauseButton.addEventListener('click', () => {
  gameUpdate.cancel(); // Stop pending updates
});
```

---

### request

```js
import { request } from 'q-js-utils/request';

try {
  const todo = await request('https://jsonplaceholder.typicode.com/todos/1').json();
  console.log('request Todo:', todo);
} catch (error) {
  console.error('request Error:', error);
}
```

---

### nextId
Generates a unique, sequentially incremented string ID with an optional prefix. Each call increments an internal counter to ensure uniqueness.

```js
import { nextId } from '../src/nextId';

console.log(`nextId to ${nextId()}`);
console.log(`nextId to ${nextId()}`);
console.log(`nextId to ${nextId('x')}`);
```

---

### cached

```js
import { cache } from 'q-js-utils/cache';

const sayHi = cache(name => 'Hi, ' + name);
```

---

### darkOrLight

```js
import { darkOrLight } from 'q-js-utils/darkOrLight';

const isDark = darkOrLight('#000');
```

---

### str2Hex

```js
import { str2Hex } from 'q-js-utils/str2Hex';

const nameToHex = str2Hex('Muhamad Husein');
```

---

### getInitials

```js
import { getInitials } from 'q-js-utils/getInitials';

const initialName = getInitials('Muhamad Husein');
```

---

### obj2FormData

```js
import { obj2FormData } from 'q-js-utils/obj2FormData';

const objData = {
  name: "Muhamad Husein",
  email: "m.husein27@gmail.com"
};
const dataForm = obj2FormData(objData);
```

---

### isEqual
Deeply compares two values to determine if they are equal.
Handles primitives, arrays, objects, Maps, Sets, Dates, RegExps, and circular references.

Can be significantly faster than Lodash's `_.isEqual()` in most cases, while still handling all the same edge cases.

```js
import { isEqual } from 'q-js-utils/isEqual';

isEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] }) // true
isEqual({ a: 1 }, { a: 1, b: undefined }) // false
isEqual({ a: 1, b: [2, 3] }, { b: [2, 3], a: 1 }) // true
isEqual(NaN, NaN) // true
```

### cn
Joins class names together, filtering out falsy values.
@param {...(string | boolean | null | undefined)} classes - Class names or conditional expressions.
returns string Combined class names as a single string, or undefined (to prevent `class=""` not render in node).

```js
import { cn } from 'q-js-utils/cn';

const isActive = true;
const hasError = false;
const zero = 0;

// Returns: "btn active" (when isActive is true and hasError is false)
cn('btn', isActive && 'active', hasError && 'error');

// undefined
cn(zero && 'zero', hasError && 'error');
```

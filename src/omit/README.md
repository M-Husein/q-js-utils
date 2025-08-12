# omit
Creates a shallow copy of an object excluding the specified keys.

## Usage
```ts
import { omit } from 'q-js-utils/omit';

const user = { id: 1, name: "Husein", password: "secret" };
const safeUser = omit(user, "password"); // Output: { id: 1, name: "Husein" }
```

# Original / Current Code
```ts
const omit = <T extends Record<string, any>>(
  obj: T,
  ...omitKeys: (keyof T)[]
): Partial<T> => {
  const result: Partial<T> = {};

  for (const key in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) && 
      !omitKeys.includes(key as keyof T)
    ) {
      result[key] = obj[key];
    }
  }

  return result;
}
```

## Option Code
### Using `Object.entries` + `filter` + `includes`

```ts
const omit = (
  obj: T,
  ...omitKeys: (keyof T)[]
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !omitKeys.includes(key))
  );
}
```

**✅ Performance:**
- Slightly more overhead due to intermediate allocations (`entries`, `fromEntries`).
- But **cleaner**, avoids inherited props, and easier to extend or compose.

**🧪 Real-World Comparison**
For small to medium objects (dozens of keys), performance difference is imperceptible. But for extremely large or frequently called utilities, the original version will edge ahead in raw speed — especially if optimized with:
```js
if (Object.prototype.hasOwnProperty.call(obj, key)) {
  // ...
}
```

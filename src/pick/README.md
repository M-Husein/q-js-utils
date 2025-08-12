# pick
Creates a shallow copy of an object including only the specified keys.

## Usage
```ts
import { pick } from 'q-js-utils/pick';

const user = { id: 1, name: "Husein", password: "secret" };
const publicUser = pick(user, "id", "name"); // Output: { id: 1, name: "Husein" }
```

# Original / Current Code
```ts
const pick = <T extends Record<string, any>>(
  obj: T,
  ...pickKeys: (keyof T)[]
): Partial<T> => {
  const result: Partial<T> = {};

  for (const key of pickKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
}
```

## Option Code
### Using `Object.entries` + `filter` + `includes`

```ts
const pick = <T extends Record<string, any>>(
  obj: T,
  ...pickKeys: (keyof T)[]
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) =>
      pickKeys.includes(key as keyof T)
    )
  );
}
```

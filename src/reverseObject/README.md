# reverseObject

## Usage
```ts
import { reverseObject } from 'q-js-utils/reverseObject';


```

## Option 1

```ts
export const reverseObject = <T extends Record<PropertyKey, PropertyKey>>(
  obj: T
): ReverseRecord<T> => {
  const result = {} as Record<PropertyKey, PropertyKey>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[obj[key]] = key;
    }
  }

  return result as ReverseRecord<T>;
};
```

## Option 2

```ts
const reverseObject = <
  T extends Record<string, string>
>(
  obj: T
) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key])
  ) as {
    [K in keyof T as T[K]]: K
  };
};
```

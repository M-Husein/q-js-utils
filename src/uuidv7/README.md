# uuidv7

## Usage
```ts
import { uuidv7 } from 'q-js-utils/uuidv7';


```

## Option

```ts
/**
 * Check if a string is a valid UUIDv7
 */
export const isUUIDv7 = (str: string): str is UUIDv7 => {
  // UUID regex (general format)
  // let uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}
```

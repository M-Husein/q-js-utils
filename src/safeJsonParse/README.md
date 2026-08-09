# safeJsonParse

## Usage
```ts
import { safeJsonParse } from 'q-js-utils/safeJsonParse';


```

## Option 1

```ts
const safeJsonParse = (
  value: string,
  fallback = {}
) => {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}
```

## Option 2

### Strict object-only parser

```ts
const parseJsonObject = <T extends object>(
  value: string,
  fallback: T
): T => {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null ? parsed : fallback;
  } catch {
    return fallback;
  }
}
```

## Option 3

### Allow unknown input (string | null | undefined)
Useful for localStorage.getItem:

```ts
const parseJsonSafe = <T>(
  value: string | null | undefined,
  fallback: T
): T => {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}
```

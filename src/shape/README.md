# shape
Shapes an object by picking or omitting specified keys, with TypeScript inferring exact key types.

## Original / Current Code
With TypeScript inferring exact key types.

```ts
const shape = <
  T extends Record<string, any>,
  K extends keyof T
>(
  obj: T,
  keys: readonly K[],
  action: "pick" | "omit" = "pick"
): Partial<Pick<T, K>> | Partial<Omit<T, K>> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => {
      const keysIncluded = keys.includes(key as K);
      return action === "pick" ? keysIncluded : !keysIncluded;
    })
  ) as Partial<Pick<T, K>> | Partial<Omit<T, K>>;
}
```

**Or**

```ts
const shape = <T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[],
  action: "pick" | "omit" = "pick"
): Partial<Record<string, any>> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => {
      const keysIncluded = keys.includes(key as keyof T);
      return action === "pick"
        ? keysIncluded
        : !keysIncluded;
    })
  );
}
```

## Usage
```ts
const user = {
  id: 1,
  name: "Husein",
  email: "husein@example.com",
  role: "admin",
};

const result = shape(user, ["id", "name"] as const, "pick");
// ✅ Inferred type:
// result: { id?: number; name?: string }
```

## Option Code 1
### With switch

```ts
const shape = <T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[],
  action: "pick" | "omit" = "pick"
): Partial<T> => {
  switch (action) {
    case "pick":
      return Object.fromEntries(
        Object.entries(obj).filter(([key]) =>
          keys.includes(key as keyof T)
        )
      ) as Partial<T>;
    case "omit":
      return Object.fromEntries(
        Object.entries(obj).filter(([key]) =>
          !keys.includes(key as keyof T)
        )
      ) as Partial<T>;
    default:
      throw new Error("Invalid action. Use 'pick' or 'omit'.");
  }
}
```

**Or**

```ts
const shape = <T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[],
  action: "pick" | "omit" = "pick"
): Partial<T> => {
  switch (action) {
    case "pick":
    case "omit":
      const
      return Object.fromEntries(
        Object.entries(obj).filter(([key]) => {
          const keysIncluded = keys.includes(key as keyof T);
          return action === "pick" ? keysIncluded : !keysIncluded;
        })
      ) as Partial<T>;
    default:
      throw new Error("Invalid action. Use 'pick' or 'omit'.");
  }
}
```

## Option Code 2
### With options object

```ts
const shape = <T extends Record<string, any>>(
  obj: T,
  options: {
    pick?: (keyof T)[];
    omit?: (keyof T)[];
  }
): Partial<T> => {
  if (options.pick && options.omit) {
    throw new Error("Cannot use both 'pick' and 'omit' at the same time.");
  }

  if (options.pick) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) =>
        options.pick!.includes(key as keyof T)
      )
    ) as Partial<T>;
  }

  if (options.omit) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) =>
        !options.omit!.includes(key as keyof T)
      )
    ) as Partial<T>;
  }

  return {};
}
```

## Option Code 3
### With chanining action

```ts
/**
 * Creates a fluent shape helper for picking or omitting keys from an object.
 *
 * @template T - Type of the original object.
 * @param obj - The object to transform.
 * @param keys - The keys to include or exclude.
 * @returns An object with `pick()` and `omit()` methods.
 * 
 * @example
 * shape(data, "email", "role").omit()
 */
const shape = <T extends Record<string, any>>(
  obj: T,
  ...keys: (keyof T)[]
) => {
  return {
    pick(): Partial<T> {
      return Object.fromEntries(
        Object.entries(obj).filter(([key]) =>
          keys.includes(key as keyof T)
        )
      ) as Partial<T>;
    },
    omit(): Partial<T> {
      return Object.fromEntries(
        Object.entries(obj).filter(([key]) =>
          !keys.includes(key as keyof T)
        )
      ) as Partial<T>;
    },
  };
}
```

```ts
/**
 * Creates a fluent object shaper with pick and omit methods.
 *
 * @template T - Original object type.
 * @param obj - Object to transform.
 * @param keys - Keys to pick or omit.
 * @returns An object with `.pick()` and `.omit()` methods.
 */
const shape = <T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
) => {
  /**
   * Internal shape logic with switch-based behavior.
   */
  const apply = (action: "pick" | "omit" = "pick"): Partial<T> => {
    switch (action) {
      case "pick":
        return Object.fromEntries(
          Object.entries(obj).filter(([key]) =>
            keys.includes(key as keyof T)
          )
        ) as Partial<T>;

      case "omit":
        return Object.fromEntries(
          Object.entries(obj).filter(([key]) =>
            !keys.includes(key as keyof T)
          )
        ) as Partial<T>;

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  };

  return {
    pick: () => apply("pick"),
    omit: () => apply("omit"),
  };
}
```

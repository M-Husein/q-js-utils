# mapSort
Sorts an array using a "map callback" (like Python's `key` argument in `sorted`) before comparing.

## Usage
```ts
import { mapSort } from 'q-js-utils/mapSort';


```

# Original / Current Code
```ts
export const mapSort = <T, U>(
  list: T[],
  mapFn: (item: T, index: number, array: T[]) => U | undefined, //  = (x => x as unknown as U)
  compareFn?: (a: U, b: U) => number = defaultCompareFn
): T[] => {
	// const sorted = 'toSorted' in list 
  //   ? list.map(...).toSorted(...) 
  //   : list.map(...).slice().sort(...);

  // compareFn ||= defaultCompareFn;
	
  return list.map((o, i, arr) => ({
    o, // is mean original
    s: mapFn(o, i, arr), // is mean sortable
    i, // stable sort tie-breaker
  }))
	.toSorted((a, b) => {
    if (a.s == null) return 1;
    if (b.s == null) return -1;
    return compareFn(a.s, b.s) || a.i - b.i;
  })
	.map(entry => entry.o);
};
```

## Option Function

```ts
// const defaultCompareFn = <T>(a: T, b: T): number => {
// 	let strA = String(a), // '' + a,
// 			strB = String(b); // '' + b

// 	return strA < strB ? -1 : strA > strB ? 1 : 0;
// }

// export const mapSort = <T, U>(
//   list: T[],
//   mapFn: (item: T, index: number, array: T[]) => U | undefined,
//   compareFn: (a: U, b: U) => number = defaultCompareFn
// ): T[] => {
//   const mapped = list.map((ori, i, arr) => ({
//     ori,
//     s: mapFn(ori, i, arr),
//     i, // stable sort tie-breaker
//   }));

//   // compareFn ||= defaultCompareFn;

//   mapped.sort((a, b) => {
//     // if (a.s === undefined) return 1;
//     if (a.s == null) return 1;

//     // if (b.s === undefined) return -1;
//     if (b.s == null) return -1;

//     return compareFn(a.s, b.s) || a.i - b.i;
//   });

//   return mapped.map(entry => entry.ori);
// };

// const mapSort = <T, U>(
//   list: T[],
//   mapFn: (item: T, index: number, array: T[]) => U,
//   compareFn: (a: U, b: U) => number
// ): T[] => {
//   const mapped = list.map((item, i, arr) => ({
//     original: item,
//     sortable: mapFn(item, i, arr),
//     index: i, // keep index for stability if compareFn returns 0
//   }));

//   compareFn ||= defaultCompareFn;

//   mapped.sort((a, b) => {
//     if (a.sortable === undefined) return 1;
//     if (b.sortable === undefined) return -1;
//     return compareFn(a.sortable, b.sortable) || a.index - b.index;
//   });

//   return mapped.map(entry => entry.original);
// }

// export const mapSort = <T, U>(
//   list: T[],
//   mapFn: (item: T) => U | undefined,
//   compareFn: (a: U, b: U) => number = defaultCompareFn
// ): T[] => {
//   return [...list].sort((a, b) => {
//     const mappedA = mapFn(a);
//     const mappedB = mapFn(b);

//     // Handle undefined → push to end
//     if (mappedA === undefined && mappedB === undefined) return 0;
//     if (mappedA === undefined) return 1;
//     if (mappedB === undefined) return -1;

//     return compareFn(mappedA, mappedB);
//   });
// };
```

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

## Utilities

### For numeric data

```js
import { isNumber, isNegative, padWithLeadingZeros } from 'q-js-utils/number';

const one = 1;
const minus = -1;

console.log(isNumber(one)); // true

console.log(isNegative(one)); // false
console.log(isNegative(minus)); // true

console.log(padWithLeadingZeros(one)); // '01'
```

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

### nextId
Generates a unique, sequentially incremented string ID with an optional prefix. Each call increments an internal counter to ensure uniqueness.

```js
import { nextId } from '../src/nextId';

console.log(`nextId to ${nextId()}`);
console.log(`nextId to ${nextId()}`);
console.log(`nextId to ${nextId('x')}`);
```

### cached

```js
import { cachePrimitive } from 'q-js-utils/cachePrimitive';

const sayHi = cachePrimitive(name => 'Hi, ' + name);
```

### darkOrLight

```js
import { darkOrLight } from 'q-js-utils/darkOrLight';

const isDark = darkOrLight('#000');
```

### str2Hex

```js
import { str2Hex } from 'q-js-utils/str2Hex';

const nameToHex = str2Hex('Muhamad Husein');
```

### getInitials

```js
import { getInitials } from 'q-js-utils/getInitials';

const initialName = getInitials('Muhamad Husein');
```

### obj2FormData

```js
import { obj2FormData } from 'q-js-utils/obj2FormData';

const objData = {
  name: "Muhamad Husein",
  email: "m.husein27@gmail.com"
};
const dataForm = obj2FormData(objData);
```

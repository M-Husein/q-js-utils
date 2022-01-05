# q-js-utils

A collection of JavaScript utilities.

## Install

```bash
npm install q-js-utils
```

## Usage

```js
import { typeOf, darkOrLight, str2Hex, getInitials } from 'q-js-utils';
// Or
// import * as utils from 'q-js-utils';

const getType = typeOf('Iam string');
const isDark = darkOrLight('#000');
const nameToHex = str2Hex('Muhamad Husein');
const initialName = getInitials('Muhamad Husein');

console.log(getType); // string
console.log(isDark); // true
console.log(nameToHex); // f529de
console.log(initialName); // MH
```

## Utilities

```js
import cached from 'q-js-utils/cached';

const sayHi = cached(name => 'Hi, ' + name);
```

```js
import typeOf from 'q-js-utils/typeOf';

const getType = typeOf('Iam string');
```






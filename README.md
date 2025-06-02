# q-js-utils

A collection of JavaScript utilities.

## Install

```bash
npm install q-js-utils
```

## Usage

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

## Utilities

### cached

```js
import cached from 'q-js-utils/cached';

const sayHi = cached(name => 'Hi, ' + name);
```

### darkOrLight

```js
import darkOrLight from 'q-js-utils/darkOrLight';

const isDark = darkOrLight('#000');
```

### str2Hex

```js
import str2Hex from 'q-js-utils/str2Hex';

const nameToHex = str2Hex('Muhamad Husein');
```

### getInitials

```js
import getInitials from 'q-js-utils/getInitials';

const initialName = getInitials('Muhamad Husein');
```

### obj2FormData

```js
import obj2FormData from 'q-js-utils/obj2FormData';

const objData = {
  name: "Muhamad Husein",
  email: "m.husein27@gmail.com"
};
const dataForm = obj2FormData(objData);
```

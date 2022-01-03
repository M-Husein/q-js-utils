# q-js-utils

A collection of Javascript utilities.

## Install

```bash
npm install q-js-utils
```

## Usage

```js
import { darkOrLight, str2Hex, getInitials } from 'q-js-utils';

const isDark = darkOrLight('#000');
const nameToHex = str2Hex('Muhamad Husein');
const initialName = getInitials('Muhamad Husein');

console.log(isDark); // true
console.log(nameToHex); // f529de
console.log(initialName); // MH
```


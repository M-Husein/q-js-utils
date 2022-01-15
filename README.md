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

### cached

```js
import cached from 'q-js-utils/cached';

const sayHi = cached(name => 'Hi, ' + name);
```

### typeOf

```js
import typeOf from 'q-js-utils/typeOf';

const getType = typeOf('Iam string');
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

### jsonParse

```js
import jsonParse from 'q-js-utils/jsonParse';

/**
 * @param_1 : json string, required
 * @param_2 : option to return error parse, default {}
*/
const jsonObject = jsonParse(`{ "name": "Muhamad Husein", "email": "m.husein27@gmail.com" }`);

const jsonArray = jsonParse(`["React", "Vue", "Svelte", "Angular"]`, []);
```

### objOmit

```js
import objOmit from 'q-js-utils/objOmit';

const objData = {
  name: "Muhamad Husein",
  email: "m.husein27@gmail.com",
  password: "MyPassword",
  id: "1"
};
const omit = objOmit(objData, "password", "id"); // { name: "Muhamad Husein", email: "m.husein27@gmail.com" }
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

### isMobile

```js
import isMobile from 'q-js-utils/isMobile';

console.log(isMobile()); // true / false
```

### setClass

```js
import setClass from 'q-js-utils/setClass';

const navbar = document.getElementById('navbar');

// Add class
setClass(navbar, "open"); // can multiple className e.g "open fade dark"

// Remove class
setClass(navbar, "open", "remove"); // can multiple className e.g "open fade dark"
```

### setAttr

```js
import setAttr from 'q-js-utils/setAttr';

const sidebar = document.getElementById('sidebar');

// Add attributes
setAttr(sidebar, { "aria-hidden": "false", hidden: true });

// Remove attributes
setAttr(sidebar, "aria-hidden hidden");
```

### uid

```js
import uid from 'q-js-utils/uid';

/**
 * @param : word length, number, default = 4
*/

console.log(uid()); // print 4x random string separated with _
console.log(uid(7)); // print 7x random string separated with _
```




















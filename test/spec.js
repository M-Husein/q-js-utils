const utils = require('..');
const assert = require('assert')

// const USER = { 
//   name: "Muhamad Husein", 
//   email: "m.husein27@gmail.com",
//   country: "Indonesia",
//   city: "Tangerang Selatan" 
// };

assert.strictEqual(utils.typeOf('Iam string'), 'string');
assert.strictEqual(utils.darkOrLight('#000'), 'dark');
assert.strictEqual(utils.str2Hex('Muhamad Husein'), 'f529de');
assert.strictEqual(utils.getInitials('Muhamad Husein'), 'MH');
// assert.strictEqual(utils.objOmit(USER, 'email','city'), { name: "Muhamad Husein", country: "Indonesia" });

console.log(`\u001B[32m✓\u001B[39m Tests passed`);

const utils = require('..');
const assert = require('assert')

assert.strictEqual(utils.typeOf('Iam string'), 'string');
assert.strictEqual(utils.darkOrLight('#000'), 'dark');
assert.strictEqual(utils.str2Hex('Muhamad Husein'), 'f529de');
assert.strictEqual(utils.getInitials('Muhamad Husein'), 'MH');

console.log(`\u001B[32m✓\u001B[39m Tests passed`);
import { debounce } from '../src/debounce';
// import { debounceAdvanced } from '../src/debounceAdvanced';
import { throttle } from '../src/throttle';
import { request } from '../src/request';
import { nextId } from '../src/nextId';
import { asyncSimulation } from '../src/asyncSimulation';
import { str2Hex } from '../src/str2Hex';
import { getInitials } from '../src/getInitials';
import { darkOrLight } from '../src/darkOrLight';
import { isEqual } from '../src/isEqual';
import { cn } from '../src/cn';
import { download } from '../src/download';
import { uuidv7 } from '../src/uuidv7';
import { safeJsonParse } from '../src/safeJsonParse';
import { safeStringify } from '../src/safeStringify';
import { safeDeepClone } from '../src/safeDeepClone';
import { retryAsync } from '../src/retryAsync';

import requestExamples from '../src/request/example';

async function runExamples() {
    const fragment = document.createDocumentFragment();
    Array.from({ length: 30 }).forEach((_, index) => {
        let p = document.createElement("p");
        p.textContent = `Paragraph ${index + 1}`;
        fragment.appendChild(p);
    });
    document.body.appendChild(fragment);

    console.log('--- Running Library Examples ---');

    const fileInput = document.getElementById('fileInput');
    const btnDownload = document.getElementById('btnDownload');

    let fileInputValue: any;

    if(fileInput){
        fileInput.addEventListener('change', (e: any) => {
            fileInputValue = e.target.files[0];
        });
    }

    if(btnDownload){
        btnDownload.addEventListener('click', async () => {
            const downloadFile = await download(fileInputValue);
            console.log('downloadFile:', downloadFile);
            if(downloadFile){
                fileInputValue = ""; // Reset input file
            }
        });
    }

    // Test debounce function
    const handleResize = () => {
        console.group('debounce');
        console.log(`Window resized to: ${window.innerWidth}x${window.innerHeight}`);
        console.groupEnd();
    };
    // Wait 250ms after resizing stops
    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener('resize', debouncedResize);

    // Test throttle function
    const throttledScroll = throttle((position: number) => {
        console.log('Current scroll position:', position);
    }, 100);
    window.addEventListener('scroll', () => throttledScroll(window.scrollY));

    // Test str2Hex function

    const name1 = 'Muhamad Husein';
    const name2 = 'Tony Stark';
    const name3 = 'Steve Roger';

    console.group('str2Hex');
    const color1 = str2Hex(name1);
    const color2 = str2Hex(name2);
    const color3 = str2Hex(name3);
    // Expected: 
    console.log(`%c${name1} color is ${color1}`, 'font-size:21px;color:#' + color1);
    // Expected: 
    console.log(`%c${name2} color is ${color2}`, 'font-size:21px;color:#' + color2);
    console.log(`%c${name3} color is ${color3}`, 'font-size:21px;color:#' + color3);
    console.groupEnd();

    // Test darkOrLight function
    const isDarkOrLight1 = color1 && darkOrLight(color1);
    const isDarkOrLight2 = color2 && darkOrLight(color2);
    const isDarkOrLight3 = color3 && darkOrLight(color3);

    console.group('darkOrLight');
    // Expected: 
    console.log(`%c${name1} color is ${isDarkOrLight1}`, 'font-size:21px');
    // Expected: 
    console.log(`%c${name2} color is ${isDarkOrLight2}`, 'font-size:21px');
    console.log(`%c${name3} color is ${isDarkOrLight3}`, 'font-size:21px');
    console.groupEnd();

    // Test getInitials function
    const initial1 = getInitials(name1);
    const initial2 = getInitials(name2);
    const initial3 = getInitials(name3);

    // Test getInitials function
    console.group('getInitials');
    // Expected: 
    console.log(`%c${name1} initial is ${initial1}`, 'font-size:21px');
    // Expected: 
    console.log(`%c${name2} initial is ${initial2}`, 'font-size:21px');
    console.log(`%c${name3} initial is ${initial3}`, 'font-size:21px');

    // Test nextId function
    console.group('nextId');
    console.log(`%cnextId to ${nextId()}`, 'font-size:21px');
    console.log(`%cnextId to ${nextId()}`, 'font-size:21px');
    console.log(`%cnextId to ${nextId('x')}`, 'font-size:21px');
    console.groupEnd();

    // Test asyncSimulation function
    // Successful case
    asyncSimulation({ delay: 500 }).then(console.log); // 1

    // Failure case
    asyncSimulation({ isFail: true }).catch(err => console.error('asyncSimulation Failed with: ', err)); // 0

    // Abort case
    const controller = new AbortController();
    const promise = asyncSimulation({ signal: controller.signal });
    controller.abort();
    promise.catch(err => console.error(err)); // true

    // Test isEqual function
    console.log('isEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] })', isEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] })); // true
    console.log('isEqual({ a: 1, b: [2, 3] }, { b: [2, 3], a: 1 })', isEqual({ a: 1, b: [2, 3] }, { b: [2, 3], a: 1 })); // true
    console.log('isEqual(NaN, NaN)', isEqual(NaN, NaN)); // true
    console.log('isEqual({ a: 1 }, { a: 1, b: undefined })', isEqual({ a: 1 }, { a: 1, b: undefined })); // false

    const isActive = true;
    const hasError = false;
    const emptyString = '';
    const zero = 0;
    const nullVar = null;
    const undefinedConst = undefined;
    let undefinedLet: any;

    // Returns: "btn active" (when isActive is true and hasError is false)
    console.log(cn('btn', isActive && 'active', hasError && 'error'));

    // undefined
    console.log(
        cn(
            hasError && 'error',
            emptyString && 'emptyString',
            zero && 'zero',
            nullVar && 'nullVar',
            undefinedConst && 'undefinedConst',
            undefinedLet && 'undefinedLet',
        )
    );

    // Test uuidv7
    console.log('1. uuidv7:', uuidv7());
    console.log('2. uuidv7:', uuidv7());
    console.log('3. uuidv7:', uuidv7());

    // Test safeJsonParse
    console.log('1. safeJsonParse ok:', safeJsonParse('{"name":"Muhamad Husein","age":39}'));
    console.log('2. safeJsonParse error:', safeJsonParse('{"name":"Muhamad Husein",age:39}'));

    // Test safeStringify
    console.log('1. safeStringify ok:', safeStringify({
        name: "Muhamad Husein",
        age: 39
    }));

    const obj2Stringify: any = {};
    obj2Stringify.self = obj2Stringify;

    // → '{"self":"[Circular]"}'
    console.log('2. safeStringify Circular:', safeStringify(obj2Stringify));
    console.log('3. safeStringify space:', safeStringify({ a: 1 }, 2));

    // Test safeDeepClone
    const obj2clone: any = { a: 1 };
    obj2clone.self = obj2clone;

    const cloned = safeDeepClone(obj2clone);
    console.log('1. cloned !== obj2clone:', cloned !== obj2clone); // true
    console.log('2. cloned.self === cloned:', cloned.self === cloned); // true

    // Test retryAsync
    retryAsync(
        () => request('https://jsonplaceholder.typicode.com/users/1')
    )
    .then(() => console.log('then'))
    .catch((err) => console.log('err:', err));

    // Test request function
    try {
        const todo = await request('https://jsonplaceholder.typicode.com/todos/1');
        console.log('request Todo:', todo);
    } catch (error) {
        console.error('request Error:', error);
    }

    await requestExamples();

    //

    console.log('--- Examples Complete ---');
}

runExamples();

const appDiv = document.getElementById('app');
if (appDiv) {
    appDiv.innerHTML += '<p>Examples executed. Check console.</p>';
}

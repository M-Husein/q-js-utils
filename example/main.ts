import { debounce } from '../src/debounce';
// import { debounceAdvanced } from '../src/debounceAdvanced';
import { throttle } from '../src/throttle';
import { request } from '../src/request';
import { nextId } from '../src/nextId';
import { asyncSimulation } from '../src/asyncSimulation';
import { str2Hex } from '../src/str2Hex';
import { getInitials } from '../src/getInitials';
import { darkOrLight } from '../src/darkOrLight';

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

    // Test request function
    try {
        const todo = await request('https://jsonplaceholder.typicode.com/todos/1').json();
        console.log('request Todo:', todo);
    } catch (error) {
        console.error('request Error:', error);
    }

    await requestExamples();

    // 

    const name1 = 'Muhamad Husein';
    const name2 = 'Tony Stark';
    const name3 = 'Steve Roger';

    // Test str2Hex function
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
    const isDarkOrLight1 = darkOrLight(color1);
    const isDarkOrLight2 = darkOrLight(color2);
    const isDarkOrLight3 = darkOrLight(color3);

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
    asyncSimulation({ isFail: true }).catch(err => console.error('Failed with:', err)); // 0

    // Abort case
    const controller = new AbortController();
    const promise = asyncSimulation({ signal: controller.signal });
    controller.abort();
    promise.catch(err => console.error(err)); // true

    console.log('--- Examples Complete ---');
}

runExamples();

const appDiv = document.getElementById('app');
if (appDiv) {
    appDiv.innerHTML += `<p>Examples executed. Check console.</p>`;
}

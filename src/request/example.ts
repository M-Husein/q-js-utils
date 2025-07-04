import { request } from './index';
// import { NormalizedRequestOptions } from './types';

export default async function runExamples() {
  console.log('--- Starting Simplified Request API Examples ---');

  // 1. Basic GET request (defaults to GET)
  try {
    const data = await request('https://jsonplaceholder.typicode.com/todos/1').json();
    console.log('1. Basic GET (title):', data.title);
  } catch (error) {
    console.error('1. Basic GET (Error):', error);
  }

  // 2. GET with query parameters
  try {
    const text = await request('https://jsonplaceholder.typicode.com/todos', {
      query: { userId: 1, completed: false },
    }).json();
    // console.log('2. GET with query params (first 100 chars of text):', text.substring(0, 100) + '...');
    console.log('2. GET with query params json:', text);
  } catch (error) {
    console.error('2. GET with query params Error:', error);
  }

  // 3. POST request with JSON body and explicit method
  try {
    const newPost = await request(
      'https://jsonplaceholder.typicode.com/posts',
      {
        method: 'POST', // Explicit method required
        body: {
          title: 'Simplified Post',
          body: 'This is a test post body.',
          userId: 99,
        },
        headers: { 'X-Request-Specific': 'Hello' }, // Explicit headers for this request
      },
    ).json();
    console.log('3. POST JSON (new post ID):', newPost.id, newPost.title);
  } catch (error) {
    console.error('3. POST JSON Error:', error);
  }

  // 4. Download progress
  console.log('4. Download Progress');
  try {
    const blob = await request('https://httpbin.org/bytes/1048576', {
      onProgress: (progress) => {
        console.log('progress: ', progress);
        if (progress.total) {
          console.log(
            `Progress: ${progress.loaded} / ${progress.total} bytes (${(
              progress.progress! * 100
            ).toFixed(2)}%)`,
          );
        } else {
          console.log(`Progress: ${progress.loaded} bytes loaded (total unknown)`);
        }
      },
    }).blob();

    console.log('Download complete. Blob size:', blob.size, 'bytes');
  } catch (error: any) {
    console.error('4. Download Progress Error:', error);
    // console.error('error.name: ', error.name);
    // console.error('error.message: ', error.message);
    for(let err in error){
      console.error('err: ', err);
    }
  }

  // 5. Request timeout
  console.log('5. Request Timeout (should fail)');
  try {
    await request('https://httpbin.org/delay/2', { timeout: 100 }).json();
    console.log('   Timeout test succeeded (unexpected)');
  } catch (error) {
    console.error('Other Error during timeout test:', error);
  }

  // 6. Abort request manually
  console.log('6. Abort Request Manually (should fail)');
  const abortController = new AbortController();
  const abortTimeout = setTimeout(() => {
    abortController.abort();
    // console.log('Manual abort triggered!');
  }, 50);

  try {
    await request('https://httpbin.org/delay/2', { signal: abortController.signal }).json();
    console.log('Manual abort test succeeded (unexpected)');
  } catch (error: any) {
    console.log('Error:', error);
    // console.log('Error mesage:', error.mesage);
    // console.log('Error name:', error.name);
    // console.log('Error status:', error.status);
    // console.log('Error statusText:', error.statusText);
    // console.log('Error data:', error.data);
  } finally {
    clearTimeout(abortTimeout);
  }

  // 7. Custom error handling for non-2xx status (404 Not Found)
  console.log('7. Custom Error Handling (404 Not Found)');
  try {
    await request('https://jsonplaceholder.typicode.com/non-existent-path-12345').json();
  } catch (error: any) {
    console.log('Error:', error);
    console.log('Error mesage:', error.mesage);
    console.log('Error name:', error.name);
    console.log('Error status:', error.status);
    console.log('Error statusText:', error.statusText);
    console.log('Error data:', error.data);
  }

  // 8. Error during JSON parsing (invalid JSON from server for 200 OK)
  console.log('8. Error during JSON parsing (invalid JSON from server for 200 OK)');
  try {
    const validResponse = await request('https://jsonplaceholder.typicode.com/todos/1').json();
    console.log('Valid JSON parsed successfully:', validResponse.title);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('SyntaxError during JSON parsing (from .json() call):', error.message);
    } else {
      console.error('Other Error during parsing test:', error);
    }
  }

  // 9. Using before and after hooks for a specific request
  console.log('9. Using before and after hooks for a specific request');
  try {
    const response = await request('https://jsonplaceholder.typicode.com/comments/1', {
      beforeHook: async (requestOptions: RequestInit) => {
        console.log(`[Specific Before Hook] Preparing request: `, requestOptions);
        
        // requestOptions.headers.Authorization = 'Bearer';
        // (requestOptions.headers as Record<string, string>).Authorization = 'Bearer';
        // requestOptions.headers.set('Authorization', 'Bearer ');

        // let token = await getToken();
        // if (token) {
        //   requestOptions.headers.set('Authorization', 'Bearer ' + token);
        // }
        (requestOptions.headers as Headers).set('Authorization', 'Bearer ');

        return requestOptions;
      },
      afterHook: async (response) => { // , options
        console.log(`[Specific After Hook] Received response with status ${response.status}`);

        if (response.status === 401) {
          // Handle token refresh logic here
          console.warn('Token expired, refreshing...');
        }
        return response;
      }
    }).json();
    
    console.log('Hooked request data:', response.name);
  } catch (error) {
    console.error('9. Hooked request error:', error);
  }
}

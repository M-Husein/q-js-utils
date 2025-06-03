import { request } from './index'; // FetchError, AbortError

export default async function runExamples() {
  console.log('--- Starting Simplified Request API Examples ---');

  // 1. Basic GET request (defaults to GET)
  try {
    const data = await request('https://jsonplaceholder.typicode.com/todos/1').json();
    console.log('1. Basic GET (title):', data.title);
  } catch (error) {
    // if (error instanceof FetchError) {
    //   console.error('1. Basic GET (FetchError):', error.status, error.originalResponse.url);
    // } 
    // else if (error instanceof AbortError) {
    //   console.error('1. Basic GET (AbortError):', error.message);
    // } 
    // else {
    //   console.error('1. Basic GET (Other Error):', error);
    // }
    console.error('1. Basic GET (Error):', error);
  }

  // 2. GET with query parameters
  try {
    const text = await request('https://jsonplaceholder.typicode.com/todos', {
      query: { userId: 1, completed: false },
    }).text();
    console.log('2. GET with query params (first 100 chars of text):', text.substring(0, 100) + '...');
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
    const blob = await request('https://www.learningcontainer.com/wp-content/uploads/2020/07/5MB-test.zip', {
      onProgress: (progress) => {
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
  } catch (error) {
    console.error('4. Download Progress Error:', error);
  }

  // 5. Request timeout
  console.log('5. Request Timeout (should fail)');
  try {
    await request('https://httpbin.org/delay/2', { timeout: 100 }).json();
    console.log('   Timeout test succeeded (unexpected)');
  } catch (error) {
    // if (error instanceof AbortError) {
    //   console.error('Timeout Error:', error.message);
    // } else {
    //   console.error('Other Error during timeout test:', error);
    // }

    console.error('Other Error during timeout test:', error);
  }

  // 6. Abort request manually
  console.log('6. Abort Request Manually (should fail)');
  const abortController = new AbortController();
  const abortTimeout = setTimeout(() => {
    abortController.abort();
    console.log('Manual abort triggered!');
  }, 50);

  try {
    await request('https://httpbin.org/delay/2', { signal: abortController.signal }).json();
    console.log('Manual abort test succeeded (unexpected)');
  } catch (error) {
    // if (error instanceof AbortError) {
    //   console.error('Manual Abort Error:', error.message);
    // } 
    // else {
    //   console.error('Other Error during manual abort test:', error);
    // }
    console.error('Other Error during manual abort test:', error);
  } finally {
    clearTimeout(abortTimeout);
  }

  // 7. Custom error handling for non-2xx status (404 Not Found)
  console.log('7. Custom Error Handling (404 Not Found)');
  try {
    await request('https://jsonplaceholder.typicode.com/non-existent-path-12345').json();
  } catch (error) {
    // if (error instanceof FetchError) {
    //   console.error(`FetchError: ${error.message}`);
    //   console.error(`Status: ${error.status}`);
    //   try {
    //     const errorBody = await error.originalResponse.text();
    //     console.error('Error Body:', errorBody.substring(0, 100) + '...');
    //   } catch (parseError) {
    //     console.error('Failed to parse 404 error body:', parseError);
    //   }
    // } else {
    //   console.error('Other Error:', error);
    // }
    console.error('Error:', error);
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
      beforeHook: async (requestOptions: any) => {
        console.log(`[Specific Before Hook] Preparing request: `, requestOptions);
        // let token = await getToken();
        // if (token) {
        //   requestOptions.headers.set('Authorization', 'Bearer ' + token);
        // }
        // return requestOptions;

        // requestOptions.headers.Authorization = 'Bearer';
        // (requestOptions.headers as Record<string, string>).Authorization = 'Bearer';
        requestOptions.headers.set('Authorization', 'Bearer ');
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

// runExamples();

// src/network/request.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request, FetchError, AbortError } from './request'; // Adjust path if needed

// Mock the global fetch function for testing network requests
beforeEach(() => {
  global.fetch = vi.fn();
});

describe('request function', () => {
  it('should make a GET request and parse JSON', async () => {
    // global.fetch.mockResolvedValueOnce({
    //   ok: true,
    //   status: 200,
    //   statusText: 'OK',
    //   url: 'http://test.com/data',
    //   json: () => Promise.resolve({ id: 1, name: 'Test Item' }),
    //   text: () => Promise.resolve(JSON.stringify({ id: 1, name: 'Test Item' })),
    //   blob: () => Promise.resolve(new Blob()),
    //   arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    //   formData: () => Promise.resolve(new FormData()),
    //   headers: new Headers({ 'Content-Length': '100' }), // Mock headers
    //   body: new ReadableStream(), // Mock body for progress
    // });

    const data = await request('http://test.com/data').json();
    expect(data).toEqual({ id: 1, name: 'Test Item' });
    expect(global.fetch).toHaveBeenCalledWith('http://test.com/data', expect.any(Object));
  });

  it('should throw FetchError for non-2xx responses', async () => {
    // global.fetch.mockResolvedValueOnce({
    //   ok: false,
    //   status: 404,
    //   statusText: 'Not Found',
    //   url: 'http://test.com/404',
    //   json: () => Promise.resolve({ message: 'Not Found' }),
    //   text: () => Promise.resolve('Not Found'),
    //   headers: new Headers(),
    //   body: null,
    // });

    await expect(request('http://test.com/404').json()).rejects.toThrow(FetchError);
    await expect(request('http://test.com/404').json()).rejects.toHaveProperty('status', 404);
  });

  // it('should throw AbortError on timeout', async () => {
  //   global.fetch.mockImplementation(() => {
  //     return new Promise(() => { /* never resolves */ });
  //   });

  //   await expect(request('http://test.com/timeout', { timeout: 10 }).json()).rejects.toThrow(AbortError);
  // });

  // Add tests for other utility functions (chunk, capitalize, etc.) in their respective test files
  // src/array/chunk.test.ts
  // describe('chunk function', () => {
  //   it('should split an array into chunks of a given size', () => {
  //     expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  //     expect(chunk(['a', 'b', 'c'], 1)).toEqual([['a'], ['b'], ['c']]);
  //   });

  //   it('should return an empty array for an empty input', () => {
  //     expect(chunk([], 3)).toEqual([]);
  //   });

  //   it('should handle size larger than array length', () => {
  //     expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  //   });
  // });
});

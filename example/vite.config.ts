// example/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Specify the root for the example app
  root: resolve(__dirname, './'),
  // Base public path when served in dev or built
  base: '/',
  // Tell Vite to not clear the output directory when building the example app,
  // so it doesn't conflict with the library build in 'dist'.
  build: {
    outDir: resolve(__dirname, '../example-dist'), // Build output for the example app
    emptyOutDir: true, // Clear this specific output dir
  },
  server: {
    open: true, // Automatically open the browser
  },
  // If your library source is outside the example root,
  // Vite might need a little help for module resolution.
  resolve: {
    alias: {
      // Allows imports like `import { request } from 'your-lib/network';`
      // within the example app by mapping it to your source code.
      // Make sure 'your-lib' matches the name in your package.json
      'your-utility-library': resolve(__dirname, '../src'),
      // Or if you want to be more specific to individual modules:
      // 'your-utility-library/network': resolve(__dirname, '../src/network'),
      // 'your-utility-library/array': resolve(__dirname, '../src/array'),
      // 'your-utility-library/string': resolve(__dirname, '../src/string'),
    },
  },
});

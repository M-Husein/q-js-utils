This setup will involve:

Modular Source Structure: Organizing utilities into distinct files/folders.
Vite Multi-Entry Build: Configuring Vite to output separate bundles for each utility or module, alongside a main bundle.
package.json Exports: Defining the modern exports field to allow consumers to import specific utilities (e.g., import { request } from 'your-lib/network';) or the whole library (import { request } from 'your-lib';).
Updated Dependencies: Ensuring Vite and vite-plugin-dts are up-to-date.
JSDoc: (Already done in previous steps, but good to keep in mind for new utilities).

1. Recommended Project Structure
For a utility library, a structured src folder is highly beneficial for organization and enabling tree-shaking.

```md
your-utility-library/
├── src/
│   ├── index.ts                     // Main entry: re-exports everything for convenience
│   │
│   ├── network/                     // Category for network-related utilities
│   │   ├── index.ts                 // Entry for network/ (re-exports request)
│   │   ├── request.ts               // Your request function
│   │   └── types.ts                 // Types specific to network (can be moved to common types if preferred)
│   │
│   ├── array/                       // Category for array utilities
│   │   ├── index.ts                 // Entry for array/ (re-exports chunk, uniq)
│   │   ├── chunk.ts                 // Example: function to chunk arrays
│   │   └── uniq.ts                  // Example: function to get unique elements
│   │
│   ├── string/                      // Category for string utilities
│   │   ├── index.ts                 // Entry for string/ (re-exports capitalize, kebabCase)
│   │   ├── capitalize.ts            // Example: capitalize first letter
│   │   └── kebabCase.ts             // Example: convert to kebab-case
│   │
│   └── common-types.ts              // Common type definitions for the whole library
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

2. Source Code Changes (src directory)
src/common-types.ts (New or refactored existing types.ts)

```ts
// src/common-types.ts

// Re-exporting from network/types, or if network/types was consolidated here:
export * from './network/types'; // Assuming network/types defines HttpMethod, RequestBody, QueryParams, DownloadProgress, OnProgressCallback, BeforeHook, AfterHook, ChainedFetchResponse, PerformanceFetchOptions

// Add any other common types here for your new utilities
export type Primitive = string | number | boolean | symbol | bigint | undefined | null;

export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}
```

src/network/index.ts (New)

```ts
// src/network/index.ts

export * from './request';
export * from './types'; // If you want to export types specifically from this entry
```

src/array/chunk.ts (Example Utility)

```ts
// src/array/chunk.ts

/**
 * Chunks an array into smaller arrays of a specified size.
 * @template T - The type of elements in the array.
 * @param array - The array to chunk.
 * @param size - The desired size of each chunk. Must be a positive integer.
 * @returns An array of arrays (chunks).
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array) || array.length === 0 || size <= 0) {
    return [];
  }
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
```

src/array/index.ts (New)

```ts
// src/array/index.ts

export * from './chunk';
export * from './uniq'; // Assuming you create a uniq.ts
```

src/index.ts (Main Library Entry)

```ts
// src/index.ts

// This file serves as the main entry point, re-exporting all modules.
// This allows consumers to import everything from the main package:
// `import { request, chunk, capitalize } from 'your-library-name';`

// Re-export all from network module
export * from './network';

// Re-export all from array module
export * from './array';

// Re-export all from string module
export * from './string'; // Assuming you create a string/index.ts

// Re-export common types (if they are not already re-exported via a module)
export * from './common-types';

// Add any other top-level exports or modules here
```

3. vite.config.ts (Multi-Entry Configuration)
This is the most critical part. We'll define multiple entry points, allowing Vite/Rollup to create separate bundles for each. This supports tree-shaking when consumers import individual modules.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      // Define multiple entry points.
      // The key of each entry will determine the output filename prefix (e.g., 'index', 'network', 'array').
      // The value is the path to the source file for that entry.
      entry: {
        index: resolve(__dirname, 'src/index.ts'),       // Main bundle: your-library-name
        network: resolve(__dirname, 'src/network/index.ts'), // Network utilities module
        array: resolve(__dirname, 'src/array/index.ts'),     // Array utilities module
        string: resolve(__dirname, 'src/string/index.ts'),   // String utilities module
        // Add more entries as you create new utility categories or standalone functions.
        // E.g., 'object': resolve(__dirname, 'src/object/index.ts')
      },
      formats: ['es', 'cjs'], // Output both ES Modules and CommonJS
      // Function to customize the output file names based on format and entry name.
      // This will result in files like `index.es.js`, `network.cjs.js`, etc.
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    // Prevent bundling external dependencies.
    // List any npm packages that your library *uses* but expects the consumer to *install*.
    rollupOptions: {
      external: [], // Example: if you use 'lodash', add 'lodash' here.
      output: {
        // You can set specific global names for UMD builds if needed, but for 'es'/'cjs' it's less critical.
        globals: {
          // 'lodash': 'lodash' // Example
        },
      },
    },
    // Clear the output directory before building to ensure a clean build.
    emptyOutDir: true,
  },
  plugins: [
    // Vite plugin for generating TypeScript declaration files (.d.ts).
    // It will generate declaration files for each entry point defined in `build.lib.entry`.
    dts({
      entryRoot: 'src', // Specifies the root of your source files for type generation
      outDir: 'dist',   // Output directory for declaration files
      tsconfigPath: './tsconfig.json', // Path to your tsconfig file
      // If you want all types rolled into a single .d.ts file for convenience, uncomment:
      // rollupTypes: true, // This will create a single `index.d.ts` that contains types for all modules
      // typedir: 'dist/types' // If rollupTypes: true, specify a sub-directory for the single file
      // For a modular library, having individual .d.ts files often works better with `exports` field
    }),
  ],
});
```

4. tsconfig.json
This configuration remains largely the same, optimized for modern TypeScript and library building.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext", "DOM"], // DOM is important if your network utilities interact with browser APIs
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": false,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true, // Essential for Vite/esbuild
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./src", // The root of your source files
    "types": ["node"], // For Node.js specific globals in your build environment
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*.ts"], // Ensure all your TypeScript source files are included
  "exclude": ["node_modules", "dist"]
}
```

5. package.json (Updated with exports for modularity)
The exports field is crucial here. It allows you to define how consumers can import specific parts of your library, enabling true tree-shaking.

```json
{
  "name": "your-utility-library",       // IMPORTANT: Choose a unique name for your npm package
  "version": "1.0.0",
  "description": "A performance-oriented utility library for modern JavaScript/TypeScript applications.",
  "license": "MIT",
  "keywords": [
    "utility", "javascript", "typescript", "fetch", "network", "array", "string", "utils", "lodash-like"
  ],
  "author": "Your Name <your.email@example.com>",
  "homepage": "https://github.com/your-username/your-utility-library#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/your-utility-library.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/your-utility-library/issues"
  },
  "type": "module",                      // Indicates that this package is an ES Module
  "main": "./dist/index.cjs.js",         // CommonJS entry point
  "module": "./dist/index.es.js",        // ES Modules entry point
  "types": "./dist/index.d.ts",          // Main TypeScript declaration file
  "exports": {                           // Modern way to define package entry points
    ".": {
      "import": "./dist/index.es.js",       // For 'import' statements (ESM)
      "require": "./dist/index.cjs.js",     // For 'require' statements (CJS)
      "types": "./dist/index.d.ts"          // For TypeScript type resolution
    },
    // Expose specific modules for tree-shaking (subpath exports)
    "./network": {
      "import": "./dist/network.es.js",
      "require": "./dist/network.cjs.js",
      "types": "./dist/network.d.ts"
    },
    "./array": {
      "import": "./dist/array.es.js",
      "require": "./dist/array.cjs.js",
      "types": "./dist/array.d.ts"
    },
    "./string": {
      "import": "./dist/string.es.js",
      "require": "./dist/string.cjs.js",
      "types": "./dist/string.d.ts"
    },
    // Add more entries as you add new top-level utility modules/categories
    // "./common-types": { // If you want to expose types specifically
    //   "import": "./dist/common-types.es.js", // May not be actual JS, just for consistency
    //   "require": "./dist/common-types.cjs.js",
    //   "types": "./dist/common-types.d.ts"
    // }
  },
  "files": ["dist"],                     // Only publish the 'dist' directory to npm
  "scripts": {
    "dev": "vite",                       // For development server (if you have an example HTML)
    "build": "vite build",               // Command to build your library
    "preview": "vite preview"            // Preview your build locally
  },
  "devDependencies": {
    "@types/node": "^22.x.x",
    "vite": "^5.x.x",
    "vite-plugin-dts": "^4.x.x"
  }
}
```

How Consumers Will Use It:

For the entire library (convenience, but potentially larger bundle if not tree-shaken by consumer's bundler):

```ts
import { request, chunk, capitalize } from 'your-utility-library';
```

For specific modules (recommended for tree-shaking):

```ts
import { request } from 'your-utility-library/network';
import { chunk } from 'your-utility-library/array';
import { capitalize } from 'your-utility-library/string';
```

This setup provides a robust foundation for your utility library, making it easy to develop, build, and consume in a modern, tree-shakable way.

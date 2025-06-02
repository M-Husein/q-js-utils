{
  "name": "q-js-utils",
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
    "dev": "vite", // Keep this, though you'll mostly use dev:example
    "dev:example": "vite --config example/vite.config.ts", // New script for dev server
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest", // New script for testing
    "test:coverage": "vitest run --coverage" // New script for coverage report
  },
  "devDependencies": {
    "@types/node": "^22.15.29",
    "vite": "^6.3.5",
    "vite-plugin-dts": "^4.5.4"
  }
}

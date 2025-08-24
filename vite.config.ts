import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'), // Main bundle
        // number: resolve(__dirname, 'src/number/index.ts'),
        isNumber: resolve(__dirname, 'src/number/isNumber.ts'),
        isNegative: resolve(__dirname, 'src/number/isNegative.ts'),
        padWithLeadingZeros: resolve(__dirname, 'src/number/padWithLeadingZeros.ts'),
        cache: resolve(__dirname, 'src/cache/index.ts'),
        cacheJSON: resolve(__dirname, 'src/cacheJSON/index.ts'),
        cacheWeak: resolve(__dirname, 'src/cacheWeak/index.ts'),
        debounce: resolve(__dirname, 'src/debounce/index.ts'),
        debounceAdvanced: resolve(__dirname, 'src/debounceAdvanced/index.ts'),
        throttle: resolve(__dirname, 'src/throttle/index.ts'),
        throttleAdvanced: resolve(__dirname, 'src/throttleAdvanced/index.ts'),
        request: resolve(__dirname, 'src/request/index.ts'),
        nextId: resolve(__dirname, 'src/nextId/index.ts'),
        getInitials: resolve(__dirname, 'src/getInitials/index.ts'),
        darkOrLight: resolve(__dirname, 'src/darkOrLight/index.ts'),
        str2Hex: resolve(__dirname, 'src/str2Hex/index.ts'),
        obj2FormData: resolve(__dirname, 'src/obj2FormData/index.ts'),
        isEqual: resolve(__dirname, 'src/isEqual/index.ts'),
        cn: resolve(__dirname, 'src/cn/index.ts'),
        download: resolve(__dirname, 'src/download/index.ts'),
        // pick: resolve(__dirname, 'src/omit/pick.ts'),
        // omit: resolve(__dirname, 'src/omit/index.ts'),
        shape: resolve(__dirname, 'src/shape/index.ts'),
        mapSort: resolve(__dirname, 'src/mapSort/index.ts'),
        capitalize: resolve(__dirname, 'src/capitalize/index.ts'),
        copyStyles: resolve(__dirname, 'src/copyStyles/index.ts'),
      },

      // formats: ['es', 'cjs', 'umd', 'iife'],
      formats: ['es', 'cjs'], // Output both ES Modules and CommonJS
      // Function to customize the output file names based on format and entry name.
      // This will result in files like `index.es.js`, `request.cjs.js`, etc.
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    // outDir: 'dist',
    // sourcemap: true, // Keep sourcemaps for easier debugging of production issues
    // 
    minify: 'terser',
    terserOptions: {
      compress: {
        // drop_console: true,   // Optional: Remove console.log statements
        drop_debugger: true,  // Optional: Remove debugger statements
        arrows: true,         // Converts functions to arrow functions
        comparisons: true,    // Optimizes `typeof` checks, if false will Disables '==' optimization
        conditionals: true,   // Flattens nested ternaries
        toplevel: true,       // Minifies top-level functions
      },
      format: {
        comments: false, // Removes comments
      },
    },
    // Prevent bundling external dependencies.
    // List any npm packages that your library *uses* but expects the consumer to *install*.
    rollupOptions: {
      external: [], // Example: if you use 'lodash', add 'lodash' here.
      output: {
        // Provide global variables to use in the UMD build for externalized deps.
        // If you had external dependencies (e.g., 'lodash'), you'd map them here:
        // globals: {
        //   lodash: 'lodash',
        // },
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
      rollupTypes: true, // This will create a single `index.d.ts` that contains types for all modules
      // typedir: 'dist/types' // If rollupTypes: true, specify a sub-directory for the single file
      // For a modular library, having individual .d.ts files often works better with `exports` field
    }),
  ],
  // Vitest Configuration
  // test: {
  //   environment: 'happy-dom', // or 'node' if you don't need DOM APIs in tests
  //   globals: true, // Allows using test functions (describe, it, expect) globally
  //   include: ['src/**/*.test.ts'], // Pattern for your test files
  //   coverage: {
  //     provider: 'v8', // or 'istanbul'
  //     reporter: ['text', 'json', 'html'], // Output formats for coverage reports
  //     exclude: ['src/common-types.ts', 'src/**/types.ts', 'src/index.ts', 'example/**'], // Files to exclude from coverage
  //   },
  //   // You can add more test configuration here, e.g.:
  //   // setupFiles: './vitest.setup.ts', // If you have a setup file
  //   // mockReset: true, // Reset mocks before each test
  // },
});

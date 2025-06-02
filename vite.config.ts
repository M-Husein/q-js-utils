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
        index: resolve(__dirname, 'src/index.ts'), // Main bundle
        number: resolve(__dirname, 'src/number/index.ts'),
        cached: resolve(__dirname, 'src/cached/index.ts'),
        network: resolve(__dirname, 'src/network/request/index.ts'),
        getInitials: resolve(__dirname, 'src/getInitials/index.ts'),
        darkOrLight: resolve(__dirname, 'src/darkOrLight/index.ts'),
        str2Hex: resolve(__dirname, 'src/str2Hex/index.ts'),
        obj2FormData: resolve(__dirname, 'src/obj2FormData/index.ts'),
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

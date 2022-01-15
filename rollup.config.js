import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
// import multi from '@rollup/plugin-multi-entry';
import pkg from "./package.json";

const FILES = [
  "cached.js", // src/
  "typeOf.js", 
  "darkOrLight.js",
  "str2Hex.js",
  "getInitials.js", 
  "jsonParse.js",
  "objOmit.js",
  "obj2FormData.js",
  "isMobile.js",
  "setClass.js",
  "setAttr.js",
  // "Cx.js", 
  "uid.js",
];

export default [
  {
    input: "src/index.js", // Entry point
    output: {
      name: "q-js-utils", // package name
      file: pkg.browser,
      format: "umd"
    },
    plugins: [
      nodeResolve(), // resolve
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: ["node_modules/**"],
      }),
      terser(),
    ],
  },
  {
    input: "src/index.js", // Entry point
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [
      babel({
        babelHelpers: 'bundled',
        exclude: ["node_modules/**"],
      }),
    ],
  },
  
  ...FILES.map(file => ({
    input: "src/" + file, // Entry point
    // output: {
    //   dir: "dist",
    //   // format: "es",
    // },
    output: [
      { file: "dist/cjs/" + file, format: "cjs" },
      { file: "dist/esm/" + file, format: "es" },
    ],
    plugins: [ 
      nodeResolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: ["node_modules/**"],
      }),
      // multi(),
    ],
    // external: ['classnames']
  }))
];

// export default {
//   // Entry point
//   input: ["src/cached.js", "src/typeOf.js", "src/str2Hex.js"], 
//   output: {
//     dir: "dist",
//     // format: "es",
//   },
//   plugins: [ 
//     // nodeResolve(), // resolve
//     // commonjs(),
//     // babel({
//     //   babelHelpers: 'bundled',
//     //   exclude: ["node_modules/**"], 
//     // }),
//     // { exports: false, entryFileName: "ok.js" }
//     multi({ exports: false }),
//   ],
// }

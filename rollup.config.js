import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
// import multi from '@rollup/plugin-multi-entry';
// import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

const FILES = [
  "cached.js", 
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
  "uid.js",
];

export default [
  {
    input: "src/index.js", // Entry point
    output: {
      name: "qJsUtils", // package name
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
    input: "src/index.js", 
    output: {
      name: "qJsUtils", 
      file: "dist/umd/q-js-utils.umd.js",
      format: "umd"
    },
    plugins: [
      nodeResolve(), 
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: ["node_modules/**"],
      }),
    ],
  },
  {
    input: "src/index.js", 
    output: [
      { file: pkg.main, format: "cjs" },
      { file: "index.js", format: "es" },
    ],
    plugins: [
      babel({
        babelHelpers: 'bundled',
        exclude: ["node_modules/**"],
      }),
      // typescript({ tsconfig: "./tsconfig.json" }),
    ],
  },
  
  ...FILES.map(file => ({
    input: "src/" + file, 
    output: [
      { file: "dist/cjs/" + file, format: "cjs" },
      { file, format: "es" }, // "dist/esm/" + file
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

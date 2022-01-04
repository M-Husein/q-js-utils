import { nodeResolve } from '@rollup/plugin-node-resolve';
// import resolve from "rollup-plugin-node-resolve";
// import commonjs from "rollup-plugin-commonjs";
import { babel } from '@rollup/plugin-babel';
// import babel from "rollup-plugin-babel";
import commonjs from '@rollup/plugin-commonjs';
import pkg from "./package.json";

export default [
  {
    input: "src/index.js", // your entry point
    output: {
      name: "q-js-utils", // package name
      file: pkg.browser,
      format: "umd",
    },
    plugins: [
      nodeResolve(), // resolve
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: ["node_modules/**"],
      }),
    ],
  },
  {
    input: "src/index.js", // your entry point
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
];

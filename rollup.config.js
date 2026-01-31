import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import url from "@rollup/plugin-url";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: false,
      exports: "named",
    },
    {
      file: "dist/index.es.js",
      format: "es",
      sourcemap: false,
    },
  ],
  plugins: [
    external(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    url({ exclude: ["**/*.svg"] }),
    babel({
      exclude: "node_modules/**",
      babelHelpers: "bundled",
    }),
    resolve(),
    commonjs(),
  ],
};

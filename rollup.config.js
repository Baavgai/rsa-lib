import {terser} from 'rollup-plugin-terser';

export default {
  input: 'ts_build/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'rsa-lib',
    },
    {
      file: 'dist/index.min.js',
      format: 'iife',
      plugins: [terser()]
    }
  ]
};

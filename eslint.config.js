const js = require('@eslint/js');

module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['dist/', 'eslint.config.js'],
    rules: {},
    languageOptions: {
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 2018,
      },
      globals: { commonjs: true, es6: true, jest: true, node: true },
    },
  },
  js.configs.recommended,
];

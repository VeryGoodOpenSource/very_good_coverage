import js from '@eslint/js';
import globals from 'globals';
import jest from 'eslint-plugin-jest';

export default [
  {
    files: ['*.js'],
    ignores: ['eslint.config.js'],
    rules: {
      ...globals.rules,
      ...js.configs.recommended.rules,
    },
    languageOptions: {
      globals: { ...globals.node, ...jest.environments.globals.globals },
    },
  },
];

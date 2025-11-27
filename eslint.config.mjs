// @ts-check
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import react from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.recommended,
  react.configs.flat['recommended'],
  prettier,
  {
    settings: {
      react: {
        version: 'detect',
      },
      env: {
        browser: true,
        es2021: true,
        node: true,
      },
    },
  },
);

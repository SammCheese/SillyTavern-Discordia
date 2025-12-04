// @ts-check
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import react from 'eslint-plugin-react';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  react.configs.flat['recommended'],
  prettier,
  {
    extends: ['plugin:react/recommended', 'plugin:react/jsx-runtime'],
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  [globalIgnores(['dist/**', 'node_modules/**', '*.config.js', '**/*.json'])],
);

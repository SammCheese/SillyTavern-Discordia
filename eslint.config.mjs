import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettierRecommended,
  [
    globalIgnores([
      'dist/**',
      'node_modules/**',
      '**/*.css',
      '**/*.json',
      '*.config.{js,cjs,mjs,ts,cts,mts}',
    ]),
  ],
);

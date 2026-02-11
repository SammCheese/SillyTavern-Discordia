import eslint from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintReact.configs['recommended-typescript'],
  reactHooks.configs.flat['recommended-latest'],
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

import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic', include: /\.(ts|tsx)$/ }),
  inject({
    imports: path.resolve(__dirname, 'tests/utils/mockImports.ts'),
    dislog: path.resolve(__dirname, 'src/utils/logger.ts'),
  })
  ],
  logLevel: 'info',
  test: {
    globals: true,
    environment: 'happy-dom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
});

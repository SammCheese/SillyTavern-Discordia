import { defineConfig } from 'vite';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react({
      include: [resolve(__dirname, 'src/**/*.tsx')],
      jsxRuntime: 'automatic',
    }),
    inject({
      imports: resolve(__dirname, 'src/import.ts'),
      dislog: resolve(__dirname, 'src/utils/logger.ts'),
    })
  ],
  mode: isProduction ? 'production' : 'development',
  css: {
    postcss: {
      plugins: [require('@tailwindcss/postcss'), require('autoprefixer')],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist'),
    target: 'esnext',
    minify: isProduction ? 'terser' : false,
    sourcemap: !isProduction ? 'inline' : false,
    cssMinify: isProduction,
    cssCodeSplit: false,
    dynamicImportVarsOptions: {
      warnOnError: true,
    },
    rollupOptions: {
      input: resolve(__dirname, 'src/index.tsx'),
      treeshake: isProduction,
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.includes('style.css')) {
            return 'style.css';
          }
          return 'assets/[name].[ext]';
        },
        entryFileNames: 'bundle.js',
        esModule: true,
        format: 'es',
        manualChunks: undefined,
        chunkFileNames: 'chunks/[name].js',
      },
    },
  },
  server: {
    open: false,
    port: 3000,
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
});

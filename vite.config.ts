import { defineConfig } from 'vite';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
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
    watch: isProduction ? undefined : {
      exclude: ['**/dist/**'],
    },
    rolldownOptions: {
      input: resolve(__dirname, 'src/index.tsx'),
      treeshake: isProduction,
      transform: {
        inject: {
          imports: resolve(__dirname, 'src/import.ts'),
          dislog: resolve(__dirname, 'src/utils/logger.ts'),
        },
      },
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
        chunkFileNames: 'chunks/[name].js',
        manualChunks: undefined,
        minifyInternalExports: isProduction,
        minify: isProduction,
      },
    },
  },
  server: {
    open: false,
    port: 3000,
    hmr: {
      overlay: false,
    },
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
});

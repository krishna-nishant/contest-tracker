import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    css: false,
    include: [
      '**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.js',
        'tests/e2e/**'
      ]
    },
    testTimeout: 60000,
    hookTimeout: 60000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
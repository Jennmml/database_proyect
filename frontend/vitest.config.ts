import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }, { find: /.*\.css$/, replacement: path.resolve(__dirname, './tests/empty.js') }] },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'], css: false }
});

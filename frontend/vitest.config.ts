import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    css: false,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '../globals.css': path.resolve(__dirname, './tests/empty.js')
    }
  },
  server: {
    fs: {
      strict: false,
      allow: ['..']
    }
  }
})

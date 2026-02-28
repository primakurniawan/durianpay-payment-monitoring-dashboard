import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,               // so you don't need to import `describe`, `it`, etc.
    environment: 'jsdom',         // simulate browser
    setupFiles: './src/test/setup.ts', // optional setup file
  },
});

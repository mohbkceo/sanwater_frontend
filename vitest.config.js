import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(root, './src') } },
  test: { environment: 'jsdom', include: ['ui-tests/**/*.test.{js,jsx}'], globals: true },
});

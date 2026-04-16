import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  build: {
    outDir: 'dist',
  },
  json: {
    stringify: true,
  },
});

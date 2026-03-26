import { defineConfig } from 'vite';
import contentPlugin from './vite-plugin-content.js';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [contentPlugin()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});

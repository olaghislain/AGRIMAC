import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'app',
  publicDir: 'assets',
  css: { devSourcemap: false },
  plugins: [
    react(),
    {
      name: 'agrimac-public-css-assets',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.css')) return null;
        return code.replaceAll("'/assets/", "'/").replaceAll('"/assets/', '"/');
      },
    },
  ],
  build: { outDir: '../dist', emptyOutDir: true },
});

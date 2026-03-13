import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Forward all /api requests to the backend, bypassing CORS
      '/api': {
        target: 'https://api.aisep.tech',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'build',
  }
});


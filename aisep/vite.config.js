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
        target: 'http://3.106.185.201:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'build',
  }
});


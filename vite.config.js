import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    exclude: ['@mediapipe/hands']
  }
});

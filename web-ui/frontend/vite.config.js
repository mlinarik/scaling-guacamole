import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config: proxy /api during development to backend at localhost:3000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

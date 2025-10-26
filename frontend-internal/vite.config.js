import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to network
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      // Proxy backend health check for DebugInfo component
      '/health': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})

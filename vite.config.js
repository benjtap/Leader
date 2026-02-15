import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // VitePWA({...}) // DISABLED TO FIX CACHING ISSUES
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/auth': {
        targetold: 'http://localhost:5000',
        target: 'https://v2.entreprenariat-beni.com/',
        changeOrigin: true
      }
    }
  }
})

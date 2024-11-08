import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const cssFileName = 'index.min.css'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: './public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias for "@/components/theme-provider"
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (file) => {
          return `assets/css/${cssFileName}`
        },
        entryFileNames: (file) => {
          return `assets/js/[name].min.js`
        }
      }
    }
  }
})

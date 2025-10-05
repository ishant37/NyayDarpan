import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'chart-vendor': ['plotly.js', 'react-plotly.js', 'recharts'],
          'utils': ['jspdf', 'html2canvas', 'qrcode']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
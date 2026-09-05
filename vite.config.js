import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-router-dom': path.resolve(__dirname, 'src/shim-router.jsx'),
    },
  },
  build: { target: 'esnext' },
  server: { host: '127.0.0.1', port: 5180, strictPort: true, allowedHosts: true },
  preview: { host: '127.0.0.1', port: 5180, strictPort: true, allowedHosts: true },
})

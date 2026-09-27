import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// notiflix "main" apunta a *.min.js; esbuild en Linux (Amplify) puede fallar en [commonjs--resolver].
// El build sin minificar se transforma bien.
const notiflixEntry = path.resolve(__dirname, 'node_modules/notiflix/build/notiflix-aio.js')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      notiflix: notiflixEntry,
    },
  },
  server: {
    allowedHosts: ['takes-arg-indicator-bars.trycloudflare.com'],
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  optimizeDeps: {
    include: ['notiflix'],
  },
  build: {
    commonjsOptions: {
      include: [/notiflix/, /node_modules/],
    },
  },
})

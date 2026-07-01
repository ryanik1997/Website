import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

const require = createRequire(import.meta.url)
const PDF_WORKER_FILE = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs')

/** Mọi client route — copy index.html làm fallback khi Vercel không áp dụng rewrites */
const SPA_ROUTES = [
  'auth/callback',
  'app',
  'app/home',
  'app/vocab',
  'app/writing',
  'app/listening',
  'app/mindmap',
  'app/settings',
  'app/admin',
]

function copyPdfWorker() {
  const dest = resolve(__dirname, 'public/pdf.worker.min.mjs')
  return {
    name: 'copy-pdf-worker',
    buildStart() {
      copyFileSync(PDF_WORKER_FILE, dest)
    },
    configureServer() {
      copyFileSync(PDF_WORKER_FILE, dest)
    },
  }
}

function vercelSpaRoutes() {
  return {
    name: 'vercel-spa-routes',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const indexHtml = resolve(dist, 'index.html')

      copyFileSync(resolve(__dirname, 'spa.vercel.json'), resolve(dist, 'vercel.json'))
      copyFileSync(indexHtml, resolve(dist, '404.html'))

      for (const route of SPA_ROUTES) {
        const dir = resolve(dist, route)
        mkdirSync(dir, { recursive: true })
        copyFileSync(indexHtml, resolve(dir, 'index.html'))
      }
    },
  }
}

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
  worker: {
    format: 'es',
  },
  plugins: [react(), copyPdfWorker(), vercelSpaRoutes()],
  resolve: {
    alias: {
      '@ryan/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ryan/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@ryan/db': resolve(__dirname, '../../packages/db/src/index.ts'),
    },
  },
})

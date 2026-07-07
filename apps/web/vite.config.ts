import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

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

/** Bump cache catalog audio mỗi release — user tải MP3 mới sau deploy. */
function injectSwCatalogCacheVersion() {
  return {
    name: 'inject-sw-catalog-cache-version',
    closeBundle() {
      const swPath = resolve(__dirname, 'dist/sw.js')
      const pkg = JSON.parse(
        readFileSync(resolve(__dirname, 'package.json'), 'utf8'),
      ) as { version?: string }
      const version = pkg.version ?? '0'
      let sw = readFileSync(swPath, 'utf8')
      sw = sw.replaceAll('__CATALOG_CACHE_VERSION__', version)
      writeFileSync(swPath, sw)
    },
  }
}

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
  },
  plugins: [react(), vercelSpaRoutes(), injectSwCatalogCacheVersion()],
  resolve: {
    alias: {
      '@ryan/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ryan/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@ryan/db': resolve(__dirname, '../../packages/db/src/index.ts'),
      '@ryan/catalog': resolve(__dirname, '../../packages/catalog/src/index.ts'),
    },
  },
})

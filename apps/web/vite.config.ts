import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import type { IncomingMessage } from 'http'

/** Mọi client route — copy index.html làm fallback khi Vercel không áp dụng rewrites */
const SPA_ROUTES = [
  'auth/callback',
  'terms',
  'privacy',
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
    writeBundle() {
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
    writeBundle() {
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

function readJsonBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolveBody, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', chunk => {
      body += chunk
      if (body.length > 32_768) reject(new Error('Request body is too large'))
    })
    request.on('end', () => {
      try {
        resolveBody(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    request.on('error', reject)
  })
}

function envValue(value: string) {
  return JSON.stringify(value)
}

/** Local development bridge from browser-only IndexedDB credentials to Node scripts. */
function cambridgeWritingCredentialBridge() {
  return {
    name: 'cambridge-writing-credential-bridge',
    configureServer(server: { middlewares: { use: Function } }) {
      server.middlewares.use(async (request: IncomingMessage, response: import('http').ServerResponse, next: Function) => {
        if (request.url !== '/__local/cambridge-writing-credentials') return next()

        const host = request.headers.host?.split(':')[0]
        const origin = request.headers.origin
        const localHost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
        const localOrigin = !origin || /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(origin)
        if (request.method !== 'POST' || !localHost || !localOrigin) {
          response.statusCode = 403
          response.end('Local development only')
          return
        }

        try {
          const payload = await readJsonBody(request) as {
            deepseekKey?: unknown
            groqKey?: unknown
          }
          const deepseekKey = typeof payload.deepseekKey === 'string' ? payload.deepseekKey.trim() : ''
          const groqKey = typeof payload.groqKey === 'string' ? payload.groqKey.trim() : ''
          if (!deepseekKey) throw new Error('DeepSeek key is required')

          const content = [
            'CAMBRIDGE_WRITING_AI_PROVIDER=deepseek',
            'CAMBRIDGE_WRITING_AI_MODEL=deepseek-chat',
            `CAMBRIDGE_WRITING_AI_KEY=${envValue(deepseekKey)}`,
            ...(groqKey ? [
              'CAMBRIDGE_WRITING_VERIFY_PROVIDER=groq',
              'CAMBRIDGE_WRITING_VERIFY_MODEL=llama-3.3-70b-versatile',
              `CAMBRIDGE_WRITING_VERIFY_KEY=${envValue(groqKey)}`,
            ] : []),
            '',
          ].join('\n')
          writeFileSync(resolve(__dirname, '../../.env.cambridge-writing.local'), content, {
            encoding: 'utf8',
            mode: 0o600,
          })
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: true }))
        } catch (error) {
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({
            ok: false,
            error: error instanceof Error ? error.message : 'Credential bridge failed',
          }))
        }
      })
    },
  }
}

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    // Mode B: never ship source maps to production (layout/logic reverse-engineer)
    sourcemap: false,
    // Avoid leaking path names in chunk comments
    minify: 'esbuild',
  },
  esbuild: {
    // Drop console/debugger in production bundles
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
  },
  plugins: [react(), cambridgeWritingCredentialBridge(), vercelSpaRoutes(), injectSwCatalogCacheVersion()],
  resolve: {
    alias: {
      '@ryan/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ryan/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@ryan/db': resolve(__dirname, '../../packages/db/src/index.ts'),
      '@ryan/catalog': resolve(__dirname, '../../packages/catalog/src/index.ts'),
    },
  },
})

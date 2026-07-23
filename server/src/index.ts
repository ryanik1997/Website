import express from 'express'
import { config } from './config.js'
import { ensureKokoroStarted, shutdownKokoro } from './kokoro/manager.js'
import { sttRouter } from './routes/stt.js'
import { ttsRouter } from './routes/tts.js'

const app = express()

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

app.use(express.json({ limit: '64kb' }))

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'local-tts',
    engine: 'kokoro',
    endpoints: {
      ttsHealth: 'GET /api/tts/health',
      tts: 'POST /api/tts',
      sttHealth: 'GET /api/stt/health',
      stt: 'POST /api/stt',
    },
  })
})

app.use('/api/tts', ttsRouter)
app.use('/api/stt', sttRouter)

app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Not found' })
})

const server = app.listen(config.port, () => {
  console.log(`[local-tts] listening on http://localhost:${config.port}`)
  console.log(`[local-tts] health: http://localhost:${config.port}/api/tts/health`)
  console.log(`[local-tts] python: ${config.pythonPath ?? '(not set)'}`)
  console.log(`[local-tts] cache: ${config.cacheDir}`)
  void ensureKokoroStarted().then(() => {
    console.log(`[local-tts] kokoro target: http://${config.kokoroHost}:${config.kokoroPort}`)
  })
})

async function shutdown() {
  server.close()
  await shutdownKokoro()
  process.exit(0)
}

process.on('SIGINT', () => { void shutdown() })
process.on('SIGTERM', () => { void shutdown() })

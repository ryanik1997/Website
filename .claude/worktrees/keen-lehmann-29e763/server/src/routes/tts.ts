import { Router } from 'express'
import { buildCacheKey, countCacheFiles, readCache, writeCache } from '../cache/ttsCache.js'
import { config } from '../config.js'
import { synthesizeWithKokoro } from '../kokoro/client.js'
import { ensureKokoroStarted, getEngineStatus } from '../kokoro/manager.js'
import { clampSpeed, normalizeVoice } from '../kokoro/voices.js'

export const ttsRouter = Router()

const ENGINE = 'kokoro'

interface TtsBody {
  text?: unknown
  voice?: unknown
  speed?: unknown
  lang?: unknown
}

function parseRequest(body: TtsBody) {
  const text = typeof body.text === 'string' ? body.text.trim() : ''
  const voiceRaw = typeof body.voice === 'string' && body.voice.trim()
    ? body.voice.trim()
    : 'default'
  const lang = body.lang === 'a' ? 'a' : 'b'
  const speedRaw = body.speed
  const speed = typeof speedRaw === 'number' && Number.isFinite(speedRaw)
    ? clampSpeed(speedRaw)
    : 1
  const voice = normalizeVoice(voiceRaw, lang)
  return { text, voice, speed, lang }
}

ttsRouter.get('/health', async (_req, res) => {
  try {
    await ensureKokoroStarted()
    const engine = await getEngineStatus(false)
    const ok = true

    res.json({
      ok,
      service: 'local-tts',
      engine: ENGINE,
      message: engine.ready
        ? 'TTS service is running with Kokoro engine'
        : 'TTS Node service is running; Kokoro engine not ready yet',
      kokoro: engine,
      cache: {
        dir: config.cacheDir,
        fileCount: countCacheFiles(),
      },
    })
  } catch (err) {
    res.json({
      ok: true,
      service: 'local-tts',
      engine: ENGINE,
      message: 'TTS Node service is running; Kokoro status check failed',
      kokoro: {
        available: false,
        ready: false,
        processRunning: false,
        host: config.kokoroHost,
        port: config.kokoroPort,
        python: config.pythonPath,
        pythonScript: config.kokoroScript,
        lastError: err instanceof Error ? err.message : String(err),
        deps: null,
        installHint: 'pip install -r server/python/requirements.txt',
      },
      cache: {
        dir: config.cacheDir,
        fileCount: countCacheFiles(),
      },
    })
  }
})

ttsRouter.post('/start', async (_req, res) => {
  try {
    await ensureKokoroStarted()
    const engine = await getEngineStatus(true)

    res.json({
      ok: engine.ready,
      service: 'local-tts',
      engine: ENGINE,
      message: engine.ready
        ? 'Kokoro engine is running'
        : (engine.lastError ?? 'Kokoro start requested but engine is not ready yet'),
      kokoro: engine,
      manualCommand: 'pnpm dev:server',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(503).json({
      ok: false,
      service: 'local-tts',
      engine: ENGINE,
      message,
      kokoro: {
        available: false,
        ready: false,
        processRunning: false,
        host: config.kokoroHost,
        port: config.kokoroPort,
        python: config.pythonPath,
        pythonScript: config.kokoroScript,
        lastError: message,
        deps: null,
        installHint: 'pip install -r server/python/requirements.txt',
      },
      manualCommand: 'pnpm dev:server',
    })
  }
})

ttsRouter.post('/', async (req, res) => {
  const { text, voice, speed, lang } = parseRequest(req.body as TtsBody)

  if (!text) {
    res.status(400).json({
      ok: false,
      engine: ENGINE,
      message: 'Field "text" is required and must be a non-empty string',
    })
    return
  }

  const cacheKey = buildCacheKey({ text, voice, speed })
  const cached = readCache(cacheKey)
  if (cached) {
    res.setHeader('Content-Type', 'audio/wav')
    res.setHeader('X-Cache', 'HIT')
    res.setHeader('X-Engine', ENGINE)
    res.setHeader('X-Voice', voice)
    res.setHeader('X-Speed', String(speed))
    res.send(cached)
    return
  }

  try {
    await ensureKokoroStarted()
    const engine = await getEngineStatus(true)
    if (!engine.available || !engine.ready) {
      res.status(503).json({
        ok: false,
        engine: ENGINE,
        error: 'Kokoro engine not ready',
        message: engine.lastError ?? 'Install Kokoro dependencies and restart the server',
        installHint: engine.installHint,
        python: engine.python,
        cacheDir: config.cacheDir,
      })
      return
    }

    const result = await synthesizeWithKokoro({ text, voice, speed, lang })
    writeCache(cacheKey, result.audio)

    res.setHeader('Content-Type', 'audio/wav')
    res.setHeader('X-Cache', 'MISS')
    res.setHeader('X-Engine', ENGINE)
    res.setHeader('X-Voice', result.voiceUsed)
    res.setHeader('X-Speed', String(speed))
    if (result.seconds != null) res.setHeader('X-Synth-Seconds', String(result.seconds))
    res.send(result.audio)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(503).json({
      ok: false,
      engine: ENGINE,
      error: 'Kokoro synthesis failed',
      message,
      installHint: 'See server/README.md for Windows setup steps',
      cacheDir: config.cacheDir,
    })
  }
})

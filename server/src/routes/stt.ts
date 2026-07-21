/**
 * STT local: MP3/WAV → transcript bằng faster-whisper (base.en).
 * POST /api/stt  (body: audio bytes, Content-Type audio/*) → { ok, text, segments }
 * GET  /api/stt/health
 * Cache theo SHA-256 audio + model — transcribe 1 lần, lần sau trả từ cache.
 */
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Router, raw } from 'express'
import { config } from '../config.js'

export const sttRouter = Router()

const STT_MODEL = process.env.WHISPER_MODEL || 'base.en'
const STT_TIMEOUT_MS = Number(process.env.WHISPER_TIMEOUT_MS) || 600_000

const sttCacheDir = path.join(config.serverRoot, '.cache', 'stt')

function resolveWhisperPython(): string {
  const fromEnv = process.env.WHISPER_PYTHON?.trim()
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv
  // Venv có sẵn faster-whisper từ app Electron cũ (Mp33covert / App English)
  const candidates = [
    'C:\\Users\\lindv\\whisper\\.venv\\Scripts\\python.exe',
    'D:\\App-English-Ryan\\ProjectGitHub\\App English_P15.8.302\\dist\\win-unpacked\\resources\\whisper\\.venv\\Scripts\\python.exe',
    'D:\\App-English-Ryan\\ProjectGitHub\\App English_P15.8.302\\dist_admin_lifetime\\win-unpacked\\resources\\whisper\\.venv\\Scripts\\python.exe',
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return config.pythonPath ?? 'python'
}

interface SttResult {
  language?: string
  duration?: number
  text?: string
  segments?: { id: number; start: number; end: number; text: string }[]
  error?: string
}

function runWhisper(audioPath: string): Promise<SttResult> {
  const py = resolveWhisperPython()
  const script = path.join(config.pythonDir, 'whisper_stt.py')
  return new Promise((resolve, reject) => {
    const p = spawn(py, [script, '--audio', audioPath, '--model', STT_MODEL], {
      windowsHide: true,
      env: { ...process.env, HF_HOME: config.hfHome },
    })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      p.kill()
      reject(new Error(`Whisper quá thời gian (${Math.round(STT_TIMEOUT_MS / 1000)}s).`))
    }, STT_TIMEOUT_MS)
    p.stdout.on('data', d => { stdout += String(d) })
    p.stderr.on('data', d => { stderr += String(d) })
    p.on('error', err => {
      clearTimeout(timer)
      reject(new Error(`Không chạy được Python (${py}): ${err.message}`))
    })
    p.on('close', code => {
      clearTimeout(timer)
      const line = stdout.trim().split(/\r?\n/).reverse().find(l => l.startsWith('{'))
      if (!line) {
        reject(new Error(`Whisper thất bại (code ${code}). ${stderr.slice(-800)}`))
        return
      }
      try {
        const parsed = JSON.parse(line) as SttResult
        if (parsed.error) {
          reject(new Error(parsed.error))
          return
        }
        resolve(parsed)
      } catch {
        reject(new Error(`Không parse được output Whisper. ${stderr.slice(-400)}`))
      }
    })
  })
}

sttRouter.get('/health', (_req, res) => {
  const py = resolveWhisperPython()
  res.json({
    ok: true,
    service: 'local-stt',
    engine: 'faster-whisper',
    model: STT_MODEL,
    python: py,
    hint: 'Cần faster-whisper trong Python env: pip install faster-whisper',
  })
})

sttRouter.post(
  '/',
  raw({ type: ['audio/*', 'application/octet-stream'], limit: '60mb' }),
  async (req, res) => {
    const body = req.body as Buffer
    if (!Buffer.isBuffer(body) || body.length < 1000) {
      res.status(400).json({ ok: false, message: 'Thiếu audio (gửi bytes với Content-Type audio/mpeg).' })
      return
    }
    const hash = createHash('sha256').update(body).update(STT_MODEL).digest('hex')
    const cachePath = path.join(sttCacheDir, `${hash}.json`)
    try {
      if (fs.existsSync(cachePath)) {
        res.json({ ok: true, cached: true, ...JSON.parse(fs.readFileSync(cachePath, 'utf8')) })
        return
      }
    } catch {
      /* cache đọc lỗi → transcribe lại */
    }

    const tmpPath = path.join(os.tmpdir(), `ryan-stt-${hash.slice(0, 16)}.mp3`)
    try {
      fs.writeFileSync(tmpPath, body)
      const result = await runWhisper(tmpPath)
      const payload = {
        language: result.language ?? 'en',
        duration: result.duration ?? 0,
        text: result.text ?? '',
        segments: result.segments ?? [],
      }
      try {
        fs.mkdirSync(sttCacheDir, { recursive: true })
        fs.writeFileSync(cachePath, JSON.stringify(payload))
      } catch {
        /* cache ghi lỗi không chặn response */
      }
      res.json({ ok: true, cached: false, ...payload })
    } catch (e) {
      res.status(500).json({ ok: false, message: e instanceof Error ? e.message : 'STT lỗi.' })
    } finally {
      try { fs.unlinkSync(tmpPath) } catch { /* ignore */ }
    }
  },
)

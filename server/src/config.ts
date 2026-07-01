import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function readOptionalFile(filePath: string): string | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8').trim()
    return raw || null
  } catch {
    return null
  }
}

function resolvePythonPath(): string | null {
  const fromEnv = process.env.PYTHON_PATH?.trim()
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv

  const fromFile = readOptionalFile(path.join(serverRoot, 'python', 'python_path.txt'))
  if (fromFile && fs.existsSync(fromFile)) return fromFile

  const candidates = [
    path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Python', 'Python312', 'python.exe'),
    path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Python', 'Python311', 'python.exe'),
    path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Python', 'Python310', 'python.exe'),
    path.join(process.env.APPDATA ?? '', 'RyanEnglish', 'kokoro-venv', 'Scripts', 'python.exe'),
    path.join(serverRoot, 'python', '.venv', 'Scripts', 'python.exe'),
    'python',
    'py',
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (candidate === 'python' || candidate === 'py') return candidate
    if (fs.existsSync(candidate)) return candidate
  }

  return 'python'
}

export const config = {
  serverRoot,
  port: Number(process.env.PORT) || 8787,
  kokoroPort: Number(process.env.KOKORO_PORT) || 8788,
  kokoroHost: process.env.KOKORO_HOST || '127.0.0.1',
  kokoroAutoStart: process.env.KOKORO_AUTO_START !== '0',
  pythonPath: resolvePythonPath(),
  pythonDir: path.join(serverRoot, 'python'),
  kokoroScript: path.join(serverRoot, 'python', 'kokoro_server.py'),
  cacheDir: process.env.KOKORO_CACHE_DIR
    ? path.resolve(process.env.KOKORO_CACHE_DIR)
    : path.join(serverRoot, '.cache', 'tts'),
  hfHome: process.env.HF_HOME
    ? path.resolve(process.env.HF_HOME)
    : path.join(serverRoot, '.cache', 'huggingface'),
  synthTimeoutMs: Number(process.env.KOKORO_SYNTH_TIMEOUT_MS) || 300_000,
  startupTimeoutMs: Number(process.env.KOKORO_STARTUP_TIMEOUT_MS) || 30_000,
}
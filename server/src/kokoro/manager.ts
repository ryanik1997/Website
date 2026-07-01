import { spawn, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import { config } from '../config.js'
import { fetchKokoroDeps, fetchKokoroHealth } from './client.js'
import type { KokoroEngineStatus } from './types.js'

let child: ChildProcess | null = null
let lastError: string | null = null
let startPromise: Promise<void> | null = null

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function pythonExists(): boolean {
  if (!config.pythonPath) return false
  if (config.pythonPath === 'python' || config.pythonPath === 'py') return true
  return fs.existsSync(config.pythonPath)
}

function scriptExists(): boolean {
  return fs.existsSync(config.kokoroScript)
}

async function waitForHealth(timeoutMs: number): Promise<boolean> {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const health = await fetchKokoroHealth(1200)
    if (health?.ok) return true
    await sleep(400)
  }
  return false
}

async function startProcess(): Promise<void> {
  if (!config.kokoroAutoStart) {
    lastError = 'KOKORO_AUTO_START=0 — Python engine not auto-started'
    return
  }
  if (!pythonExists()) {
    lastError = `Python not found. Set PYTHON_PATH or create server/python/python_path.txt`
    return
  }
  if (!scriptExists()) {
    lastError = `Missing Kokoro script: ${config.kokoroScript}`
    return
  }

  if (child && !child.killed) return

  fs.mkdirSync(config.hfHome, { recursive: true })

  child = spawn(
    config.pythonPath!,
    [config.kokoroScript, '--host', config.kokoroHost, '--port', String(config.kokoroPort)],
    {
      cwd: config.pythonDir,
      env: {
        ...process.env,
        HF_HOME: config.hfHome,
        RYAN_KOKORO_DEBUG: process.env.RYAN_KOKORO_DEBUG ?? '0',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  )

  child.stdout?.on('data', chunk => {
    const line = String(chunk).trim()
    if (line) console.log(`[kokoro] ${line}`)
  })

  child.stderr?.on('data', chunk => {
    const line = String(chunk).trim()
    if (line) console.warn(`[kokoro:err] ${line}`)
  })

  child.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      lastError = `Kokoro process exited (code=${code}, signal=${signal ?? 'none'})`
    }
    child = null
  })

  const healthy = await waitForHealth(config.startupTimeoutMs)
  if (!healthy) {
    lastError = lastError ?? `Kokoro did not become healthy within ${config.startupTimeoutMs}ms`
  } else {
    lastError = null
  }
}

export async function ensureKokoroStarted(): Promise<void> {
  if (!startPromise) {
    startPromise = startProcess().finally(() => {
      startPromise = null
    })
  }
  await startPromise
}

export function isProcessRunning(): boolean {
  return !!child && !child.killed
}

export async function getEngineStatus(forceDeps = false): Promise<KokoroEngineStatus> {
  const health = await fetchKokoroHealth(1500)
  const deps = await fetchKokoroDeps(forceDeps, 10_000)
  const available = !!health?.ok
  const ready = !!(deps?.ready ?? health?.ready)

  return {
    available,
    ready,
    processRunning: isProcessRunning(),
    host: config.kokoroHost,
    port: config.kokoroPort,
    python: config.pythonPath,
    pythonScript: config.kokoroScript,
    lastError: lastError ?? health?.last_error ?? deps?.last_error ?? null,
    deps,
    installHint: deps?.install_hint
      ?? health?.install_hint
      ?? 'pip install -r server/python/requirements.txt',
  }
}

export async function shutdownKokoro(): Promise<void> {
  if (!child || child.killed) return
  const proc = child
  child = null
  proc.kill('SIGTERM')
  await sleep(300)
  if (!proc.killed) proc.kill('SIGKILL')
}
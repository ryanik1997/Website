import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { config } from '../config.js'

export interface CacheKeyInput {
  text: string
  voice: string
  speed: number
}

export function buildCacheKey({ text, voice, speed }: CacheKeyInput): string {
  const payload = `${text.trim()}|${voice}|${speed.toFixed(2)}`
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex')
}

export function ensureCacheDir(): string {
  fs.mkdirSync(config.cacheDir, { recursive: true })
  return config.cacheDir
}

export function getCachePath(key: string): string {
  return path.join(ensureCacheDir(), `${key}.wav`)
}

export function readCache(key: string): Buffer | null {
  const filePath = getCachePath(key)
  if (!fs.existsSync(filePath)) return null
  try {
    return fs.readFileSync(filePath)
  } catch {
    return null
  }
}

export function writeCache(key: string, audio: Buffer): string {
  const filePath = getCachePath(key)
  fs.writeFileSync(filePath, audio)
  return filePath
}

export function countCacheFiles(): number {
  ensureCacheDir()
  try {
    return fs.readdirSync(config.cacheDir).filter(name => name.endsWith('.wav')).length
  } catch {
    return 0
  }
}
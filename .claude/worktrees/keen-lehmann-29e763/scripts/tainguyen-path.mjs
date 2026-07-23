/**
 * Resolve path to exam source bundles (formerly always Website/Tainguyen).
 *
 * Priority:
 * 1. process.env.TAINGUYEN_PATH or TAINGUYEN_DIR (absolute or relative to cwd)
 * 2. <repo>/Tainguyen (folder or Windows junction/symlink)
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = path.resolve(__dirname, '..')

export function resolveTainguyenPath() {
  const raw = (process.env.TAINGUYEN_PATH || process.env.TAINGUYEN_DIR || '').trim()
  if (raw) {
    return path.isAbsolute(raw) ? path.normalize(raw) : path.resolve(process.cwd(), raw)
  }
  return path.join(REPO_ROOT, 'Tainguyen')
}

export function tainguyenExists(dir = resolveTainguyenPath()) {
  return existsSync(dir)
}

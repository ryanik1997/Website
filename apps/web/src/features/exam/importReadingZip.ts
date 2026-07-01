import { unzip } from 'fflate'
import {
  isReadingJsonFile,
  isReadingMediaFile,
  parseReadingImportJson,
  type ReadingImportPayload,
} from './importReadingManualUtils'

export const READING_IMPORT_MAX_ZIP_BYTES = 40 * 1024 * 1024

export interface ReadingZipBundle {
  jsonFile: File
  payload: ReadingImportPayload
  mediaFiles: File[]
  zipName: string
}

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '')
}

function baseName(path: string): string {
  return normalizeZipPath(path).split('/').pop() ?? path
}

function mimeFromName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.json')) return 'application/json'
  return 'application/octet-stream'
}

function isMacOsMeta(path: string): boolean {
  const n = normalizeZipPath(path)
  return n.startsWith('__MACOSX/') || n.includes('/._') || baseName(n).startsWith('._')
}

export async function extractReadingZip(file: File): Promise<ReadingZipBundle> {
  if (file.size > READING_IMPORT_MAX_ZIP_BYTES) {
    throw new Error(`ZIP quá lớn (tối đa ${Math.round(READING_IMPORT_MAX_ZIP_BYTES / 1024 / 1024)}MB).`)
  }
  if (!file.name.toLowerCase().endsWith('.zip')) {
    throw new Error('Chọn file .zip')
  }

  const buffer = await file.arrayBuffer()
  const entries = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
    unzip(new Uint8Array(buffer), (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

  const files: File[] = []
  let jsonCandidate: { path: string; file: File } | null = null

  for (const [path, bytes] of Object.entries(entries)) {
    if (isMacOsMeta(path)) continue
    const name = baseName(path)
    if (!name || name.endsWith('/')) continue

    const blob = new Blob([new Uint8Array(bytes)], { type: mimeFromName(name) })
    const f = new File([blob], name, { type: blob.type, lastModified: Date.now() })
    files.push(f)

    if (isReadingJsonFile(f)) {
      const priority = name === 'exam.json' || name === 'reading.json' ? 0 : 1
      const currentPriority = jsonCandidate?.path.includes('exam.json') ? 0 : 1
      if (!jsonCandidate || priority < currentPriority) {
        jsonCandidate = { path, file: f }
      }
    }
  }

  if (!jsonCandidate) {
    throw new Error('ZIP phải chứa file JSON đề (exam.json hoặc *.json).')
  }

  const text = await jsonCandidate.file.text()
  const payload = parseReadingImportJson(text)
  const mediaFiles = files.filter(f => f !== jsonCandidate!.file && isReadingMediaFile(f))

  return {
    jsonFile: jsonCandidate.file,
    payload,
    mediaFiles,
    zipName: file.name,
  }
}
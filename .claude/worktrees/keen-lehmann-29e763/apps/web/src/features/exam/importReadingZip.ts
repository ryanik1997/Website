import { unzip } from 'fflate'
import {
  isReadingJsonFile,
  isReadingMediaFile,
  parseReadingImportJson,
  type ReadingImportPayload,
} from './importReadingManualUtils'
import { mimeFromImageFileName } from './examImportImageFormats'
import { extractTextFromPdf } from './pdfExtract'
import { parseCambridgeAnswerKey } from './cambridgeAnswerKeyParse'

export const READING_IMPORT_MAX_ZIP_BYTES = 40 * 1024 * 1024

export interface ReadingZipBundle {
  jsonFile: File
  payload: ReadingImportPayload
  mediaFiles: File[]
  zipName: string
  answerKeyText?: string
  answerKeyNotes: string[]
}

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '')
}

function baseName(path: string): string {
  return normalizeZipPath(path).split('/').pop() ?? path
}

function mimeFromName(name: string): string {
  const lower = name.toLowerCase()
  if (/\.(webp|png|gif|jpe?g)$/i.test(lower)) return mimeFromImageFileName(name)
  if (lower.endsWith('.json')) return 'application/json'
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.txt')) return 'text/plain'
  return 'application/octet-stream'
}

function isMacOsMeta(path: string): boolean {
  const n = normalizeZipPath(path)
  return n.startsWith('__MACOSX/') || n.includes('/._') || baseName(n).startsWith('._')
}

/** Answer Key Reading — PDF hoặc TXT (`answer-key.pdf` / `answer-key.txt`). */
export function isReadingAnswerKeyFile(name: string): boolean {
  const n = name.toLowerCase()
  if (!(n.endsWith('.pdf') || n.endsWith('.txt'))) return false
  if (
    n === 'answer-key.pdf'
    || n === 'answer-key.txt'
    || n === 'answer_key.pdf'
    || n === 'answer_key.txt'
    || n === 'answers.pdf'
    || n === 'answers.txt'
    || n === 'answerkey.pdf'
    || n === 'answerkey.txt'
    || n === 'answer keys.pdf'
    || n === 'answer keys.txt'
  ) {
    return true
  }
  // Không nuốt audioscript (Listening) — Reading chỉ answer key
  if (n.includes('audioscript') || n.includes('tapescript') || n.includes('transcript')) {
    return false
  }
  return n.includes('answer')
}

function answerKeyFilePriority(name: string): number {
  const n = name.toLowerCase()
  const txtBoost = n.endsWith('.txt') ? -0.5 : 0
  if (n.includes('answer') && n.includes('key')) return 1 + txtBoost
  if (n.includes('answer')) return 2 + txtBoost
  return 3 + txtBoost
}

async function readAnswerKeyText(file: File): Promise<string> {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.txt')) {
    return (await file.text()).trim()
  }
  if (lower.endsWith('.pdf')) {
    try {
      return (await extractTextFromPdf(file, 40)).trim()
    } catch (err) {
      console.warn('[importReadingZip] PDF answer key extract failed', err)
      return ''
    }
  }
  return ''
}

/** Bổ sung answer trống từ Answer Key (không ghi đè JSON đã có). */
export function applyReadingAnswerKeyToPayload(
  payload: ReadingImportPayload,
  answers: Map<number, string>,
): { payload: ReadingImportPayload; filled: number } {
  if (!answers.size) return { payload, filled: 0 }
  let filled = 0
  const parts = payload.parts.map(part => ({
    ...part,
    questionGroups: (part.questionGroups ?? []).map(g => ({
      ...g,
      questions: (g.questions ?? []).map(q => {
        if (q.type === 'writing-task') return q
        if (q.answer?.trim()) return q
        const ans = answers.get(q.number)
        if (!ans) return q
        filled += 1
        // MC Cambridge thường lower-case a/b/c trong app
        const looksMc = /^[a-h](?:\s*[\/|]\s*[a-h])*$/i.test(ans.trim())
        return {
          ...q,
          answer: looksMc ? ans.trim().toLowerCase() : ans.trim(),
        }
      }),
    })),
  }))
  return { payload: { ...payload, parts }, filled }
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
  const answerKeyFiles: File[] = []
  let jsonCandidate: { path: string; file: File } | null = null

  for (const [path, bytes] of Object.entries(entries)) {
    if (isMacOsMeta(path)) continue
    const name = baseName(path)
    if (!name || name.endsWith('/')) continue

    const blob = new Blob([new Uint8Array(bytes)], { type: mimeFromName(name) })
    const f = new File([blob], name, { type: blob.type, lastModified: Date.now() })

    if (isReadingAnswerKeyFile(name)) {
      answerKeyFiles.push(f)
      continue
    }

    // Bỏ PDF/TXT khác (đề PDF gốc) — không đưa vào media
    const lower = name.toLowerCase()
    if (lower.endsWith('.pdf') || lower.endsWith('.txt') || lower.endsWith('.md')) {
      continue
    }

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
    throw new Error('ZIP phải có file JSON đề (exam.json hoặc *.json).')
  }

  const text = await jsonCandidate.file.text()
  let payload = parseReadingImportJson(text)
  const mediaFiles = files.filter(f => f !== jsonCandidate!.file && isReadingMediaFile(f))

  const answerKeyNotes: string[] = []
  let answerKeyText: string | undefined

  if (answerKeyFiles.length) {
    answerKeyFiles.sort((a, b) => answerKeyFilePriority(a.name) - answerKeyFilePriority(b.name))
    const texts: string[] = []
    for (const ak of answerKeyFiles) {
      const t = await readAnswerKeyText(ak)
      if (t.length >= 10) {
        texts.push(t)
        answerKeyNotes.push(`Đã đọc ${ak.name} (${t.length} ký tự).`)
      } else {
        answerKeyNotes.push(
          `${ak.name}: không trích được text — dùng answer-key.txt UTF-8 nếu PDF scan.`,
        )
      }
    }
    answerKeyText = texts.join('\n\n')
    if (answerKeyText.length >= 10) {
      const answers = parseCambridgeAnswerKey(answerKeyText, { maxNum: 60, maxAnswerLen: 64 })
      const applied = applyReadingAnswerKeyToPayload(payload, answers)
      payload = applied.payload
      if (answers.size > 0) {
        answerKeyNotes.push(
          `Answer Key: parse ${answers.size} đáp án`
          + (applied.filled ? ` (bổ sung ${applied.filled} câu trống trong JSON)` : ''),
        )
      } else {
        answerKeyNotes.push('Answer Key: không parse được dòng dạng `1 A` / `12 TRUE`.')
      }
    }
  }

  return {
    jsonFile: jsonCandidate.file,
    payload,
    mediaFiles,
    zipName: file.name,
    answerKeyText,
    answerKeyNotes,
  }
}

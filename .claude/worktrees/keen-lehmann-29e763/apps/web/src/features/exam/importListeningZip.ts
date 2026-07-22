import { unzip } from 'fflate'
import {
  isListeningJsonFile,
  isListeningMediaFile,
  parseListeningImportJson,
  type ListeningImportPayload,
} from './importListeningUtils'
import { extractTextFromPdf } from './pdfExtract'
import { parseListeningAnswerKey } from './listeningAnswerKeyParse'
import {
  applyAnswerKeyAndScriptToPayload,
  parseListeningAudioscript,
} from './listeningAudioscriptParse'
import { mimeFromImageFileName } from './examImportImageFormats'

export const LISTENING_IMPORT_MAX_ZIP_BYTES = 80 * 1024 * 1024

export interface ListeningZipBundle {
  jsonFile: File
  payload: ListeningImportPayload
  mediaFiles: File[]
  zipName: string
  /** Text từ answer-key.pdf / audioscript.txt (nếu có) */
  answerKeyText?: string
  /** Ghi chú parse script / đáp án */
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
  if (lower.endsWith('.mp3')) return 'audio/mpeg'
  if (lower.endsWith('.wav')) return 'audio/wav'
  if (lower.endsWith('.m4a')) return 'audio/mp4'
  if (lower.endsWith('.ogg')) return 'audio/ogg'
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

/** Answer Key / Audioscript — PDF hoặc TXT trong ZIP (`answer-key.pdf` / `answer-key.txt`). */
export function isListeningAnswerKeyOrScriptFile(name: string): boolean {
  const n = name.toLowerCase()
  if (!(n.endsWith('.pdf') || n.endsWith('.txt'))) return false
  // Tên chuẩn
  if (
    n === 'answer-key.pdf'
    || n === 'answer-key.txt'
    || n === 'answer_key.pdf'
    || n === 'answer_key.txt'
    || n === 'answers.pdf'
    || n === 'answers.txt'
    || n === 'answerkey.pdf'
    || n === 'answerkey.txt'
  ) {
    return true
  }
  return (
    n.includes('answer')
    || n.includes('audioscript')
    || n.includes('audio-script')
    || n.includes('audio_script')
    || n.includes('tapescript')
    || n.includes('transcript')
    || n === 'script.txt'
    || n === 'scripts.txt'
  )
}

function isSkippedZipEntry(name: string): boolean {
  const lower = name.toLowerCase()
  if (isListeningAnswerKeyOrScriptFile(name)) return false
  return lower.endsWith('.pdf') || lower.endsWith('.txt') || lower.endsWith('.md')
}

function answerKeyFilePriority(name: string): number {
  const n = name.toLowerCase()
  // Ưu tiên .txt (đáng tin hơn PDF scan) cho cùng loại
  const txtBoost = n.endsWith('.txt') ? -0.5 : 0
  if (n.includes('audioscript') || n.includes('tapescript') || n.includes('transcript')) {
    return 0 + txtBoost
  }
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
      return (await extractTextFromPdf(file, 48)).trim()
    } catch (err) {
      console.warn('[importListeningZip] PDF answer key extract failed', err)
      return ''
    }
  }
  return ''
}

export async function extractListeningZip(file: File): Promise<ListeningZipBundle> {
  if (file.size > LISTENING_IMPORT_MAX_ZIP_BYTES) {
    throw new Error(`ZIP quá lớn (tối đa ${Math.round(LISTENING_IMPORT_MAX_ZIP_BYTES / 1024 / 1024)}MB).`)
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
    if (!name || name.endsWith('/') || isSkippedZipEntry(name)) continue

    const blob = new Blob([new Uint8Array(bytes)], { type: mimeFromName(name) })
    const f = new File([blob], name, { type: blob.type, lastModified: Date.now() })

    if (isListeningAnswerKeyOrScriptFile(name)) {
      answerKeyFiles.push(f)
      continue
    }

    files.push(f)

    if (isListeningJsonFile(f)) {
      const priority = name === 'exam.json' || name === 'listening.json' ? 0 : 1
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
  let payload = parseListeningImportJson(text)
  const mediaFiles = files.filter(f => f !== jsonCandidate!.file && isListeningMediaFile(f))

  const answerKeyNotes: string[] = []
  let answerKeyText: string | undefined

  if (answerKeyFiles.length) {
    answerKeyFiles.sort((a, b) => answerKeyFilePriority(a.name) - answerKeyFilePriority(b.name))
    const texts: string[] = []
    for (const ak of answerKeyFiles) {
      const t = await readAnswerKeyText(ak)
      if (t.length >= 20) {
        texts.push(t)
        answerKeyNotes.push(`Đã đọc ${ak.name} (${t.length} ký tự text).`)
      } else {
        answerKeyNotes.push(
          `${ak.name}: không trích được text (PDF scan?) — thêm audioscript.txt hoặc file text có layer chữ.`,
        )
      }
    }
    answerKeyText = texts.join('\n\n')

    if (answerKeyText.length >= 20) {
      const answers = parseListeningAnswerKey(answerKeyText)
      const examType = (payload.examType ?? 'ielts').toString().toLowerCase()
      // Transcript auto từ Audioscript: chỉ Cambridge A2–C2 (ket/pet/fce/cae/cpe)
      // IELTS: chỉ lấy đáp án; transcript khi xem lại dùng AI (user bật)
      const isCambridgeRw = ['ket', 'pet', 'fce', 'cae', 'cpe'].includes(examType)

      if (isCambridgeRw) {
        const scripts = parseListeningAudioscript(answerKeyText)
        const applied = applyAnswerKeyAndScriptToPayload(payload, answerKeyText, answers)
        payload = applied.payload
        if (applied.scriptCount > 0) {
          answerKeyNotes.push(`Transcript (Cambridge): gắn ${applied.scriptCount} câu từ Audioscript.`)
        } else if (scripts.size === 0) {
          answerKeyNotes.push('Không tìm thấy block Audioscript đánh số câu trong file key.')
        }
        if (applied.answerFilled > 0) {
          answerKeyNotes.push(`Đáp án: bổ sung ${applied.answerFilled} câu trống từ Answer Key.`)
        }
      } else {
        // IELTS — chỉ fill answer nếu JSON thiếu; KHÔNG gắn ttsText từ PDF
        let answerFilled = 0
        payload = {
          ...payload,
          parts: payload.parts.map(part => ({
            ...part,
            questions: part.questions.map(q => {
              const filled = answers.get(q.number)
              if (filled && !q.answer?.trim()) {
                answerFilled += 1
                return { ...q, answer: filled }
              }
              return q
            }),
          })),
        }
        if (answers.size > 0) {
          answerKeyNotes.push(
            `IELTS Answer Key: parse ${answers.size} đáp án`
            + (answerFilled ? ` (bổ sung ${answerFilled} câu trống)` : '')
            + '. Transcript: dùng AI khi «Xem cùng đề bài + transcript».',
          )
        } else {
          answerKeyNotes.push(
            'IELTS: không auto transcript từ PDF — bấm AI khi xem cùng đề bài.',
          )
        }
      }
      if (answers.size > 0 && isCambridgeRw) {
        answerKeyNotes.push(`Answer Key: parse được ${answers.size} đáp án.`)
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

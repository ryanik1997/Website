/**
 * DOCX → 4 ô examText của IELTS Listening Wizard.
 * Giữ paragraph thật từ Word (không OCR PDF).
 */
import type { DocxContent, DocxImage } from './docxExtract'
import { splitDocxIntoPartSlices } from './ieltsListeningDocxImport'

export type WizardPartNumber = 1 | 2 | 3 | 4

const WIZARD_PARTS: WizardPartNumber[] = [1, 2, 3, 4]

export interface DocxWizardTextImportResult {
  partTexts: Record<WizardPartNumber, string>
  mediaFiles: File[]
  warnings: string[]
  suggestedTitle?: string
  suggestedCambridge?: string
  suggestedTest?: string
}

function imageToFile(img: DocxImage, outName: string): File {
  const ext = img.mime.includes('png') ? 'png' : 'jpg'
  const name = outName.replace(/\.(jpe?g|png)$/i, `.${ext}`)
  const blob = new Blob([new Uint8Array(img.bytes)], { type: img.mime })
  return new File([blob], name, { type: img.mime })
}

/** Mỗi paragraph Word = một dòng; giữ \\n nội bộ (gap trên dòng riêng trong cùng đoạn). */
export function partLinesToExamText(lines: { text: string }[], qFrom: number, qTo: number): string {
  const paragraphs = lines.map(l => l.text.trim()).filter(Boolean)
  if (!paragraphs.length) return ''
  const hasRangeHeader = /^Questions?\s*\d/i.test(paragraphs[0])
  if (hasRangeHeader) return paragraphs.join('\n')
  return `Questions ${qFrom}–${qTo}\n${paragraphs.join('\n')}`
}

function inferMetaFromFilename(fileName: string): {
  cambridge?: string
  test?: string
  title?: string
} {
  const cam = fileName.match(/cam\s*(\d{1,2})/i)?.[1]
  const test = fileName.match(/test\s*(\d)/i)?.[1]
  if (cam && test) {
    return {
      cambridge: cam,
      test,
      title: `IELTS Listening — Cambridge ${cam} Test ${test}`,
    }
  }
  return {}
}

function mediaFilesFromSlices(
  slices: ReturnType<typeof splitDocxIntoPartSlices>,
): { files: File[]; warnings: string[] } {
  const files: File[] = []
  const warnings: string[] = []

  for (const slice of slices) {
    if (!slice.images.length) continue
    const blob = slice.lines.map(l => l.text).join(' ').toLowerCase()
    const wantsMap = blob.includes('label the map') || /\bletters?\s+a\s*[–—-]\s*i\b/.test(blob)
    const wantsDiagram = blob.includes('label the diagram') || blob.includes('diagram below')

    if (wantsMap) {
      files.push(imageToFile(slice.images[0], 'map.jpg'))
    } else if (wantsDiagram) {
      files.push(imageToFile(slice.images[0], 'diagram.jpg'))
    } else if (slice.partNumber === 2) {
      files.push(imageToFile(slice.images[0], 'map.jpg'))
      warnings.push(`Part ${slice.partNumber}: gán ảnh Word là map.jpg — đổi tên nếu là diagram.`)
    }
  }

  return { files, warnings }
}

/** Đọc .docx đã extract → text 4 part + ảnh map/diagram (nếu có). */
export function buildWizardExamTextsFromDocx(
  content: DocxContent,
  options?: { fileName?: string },
): DocxWizardTextImportResult {
  const warnings: string[] = []
  const slices = splitDocxIntoPartSlices(content)
  const partTexts: Record<WizardPartNumber, string> = { 1: '', 2: '', 3: '', 4: '' }

  if (slices.length < 4) {
    warnings.push(`Word có ${slices.length} section — cần Questions 1–10 / 11–20 / 21–30 / 31–40.`)
  }

  for (const part of WIZARD_PARTS) {
    const slice = slices.find(s => s.partNumber === part)
    if (!slice) {
      warnings.push(`Part ${part}: không tìm thấy section Questions trong Word.`)
      continue
    }
    partTexts[part] = partLinesToExamText(slice.lines, slice.qFrom, slice.qTo)
    if (!partTexts[part].trim()) {
      warnings.push(`Part ${part}: không có đoạn văn nào sau khi tách.`)
    }
  }

  const { files: mediaFiles, warnings: mediaWarnings } = mediaFilesFromSlices(slices)
  warnings.push(...mediaWarnings)

  const meta = options?.fileName ? inferMetaFromFilename(options.fileName) : {}

  return {
    partTexts,
    mediaFiles,
    warnings,
    suggestedTitle: meta.title,
    suggestedCambridge: meta.cambridge,
    suggestedTest: meta.test,
  }
}
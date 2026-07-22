import type { ListeningNotePassageBlock } from './listeningExamData'
import type {
  ListeningImportPartJson,
  ListeningImportPayload,
  ListeningImportQuestionJson,
} from './importListeningUtils'
import { normalizeListeningImportPayload } from './listeningImportNormalize'
import { parseListeningAnswerKey } from './listeningAnswerKeyParse'
import type { DocxContent, DocxImage, DocxParagraph } from './docxExtract'

const PART_RANGES: [number, number][] = [
  [1, 10],
  [11, 20],
  [21, 30],
  [31, 40],
]

const SECTION_RE = /^SECTION\s*(\d)\s*$/i
const QUESTIONS_RANGE_RE = /Questions?\s*(\d{1,2})\s*[–—\-]\s*(\d{1,2})/i
const INSTRUCTION_HINT_RE = /complete|choose|label|write|answer|select|which/i
const GAP_TOKEN_RE = /\[\s*(\d{1,2})\s*\]|_{3,}|…{2,}|\.{4,}/g
const OPTION_LINE_RE = /^([A-G])[\.\):\-–—]\s*(.+)$/i
const INLINE_MC_OPTION_RE = /([A-G])[\.\):\-–—]\s*/gi
const MAP_LEGEND_RE = /^A\s*Location\s*A/i

export interface DocxListeningImportOptions {
  title: string
  cambridge?: string
  test?: string
  answerKey: string
}

export interface DocxListeningImportResult {
  payload: ListeningImportPayload
  mediaFiles: File[]
  warnings: string[]
}

interface PartSlice {
  partNumber: number
  qFrom: number
  qTo: number
  lines: DocxParagraph[]
  images: DocxImage[]
  paragraphIndices: number[]
}

interface QuestionHead {
  num: number
  prompt: string
}

interface InlineGapHit {
  index: number
  length: number
}

function parseQuestionHead(text: string): QuestionHead | null {
  const t = stripBullet(text)
  const dot = t.match(/^(\d{1,2})\.(.+)$/)
  if (dot) return { num: Number(dot[1]), prompt: dot[2].trim() }
  const spaced = t.match(/^(\d{1,2})\s+(.+)$/)
  if (spaced) return { num: Number(spaced[1]), prompt: spaced[2].trim() }
  return null
}

function hasTraditionalGapMarkers(text: string): boolean {
  GAP_TOKEN_RE.lastIndex = 0
  return GAP_TOKEN_RE.test(text)
}

function findNextInlineGap(line: string, startIndex: number, expected: number, qTo: number): InlineGapHit | null {
  if (expected > qTo) return null

  const candidates: Array<InlineGapHit & { num: number }> = []

  const poundRe = /£(\d{1,2})(?!\d)/g
  let m: RegExpExecArray | null
  while ((m = poundRe.exec(line)) !== null) {
    if (m.index >= startIndex) {
      candidates.push({ index: m.index + 1, length: m[1].length, num: Number(m[1]) })
    }
  }

  const parenRe = /\((\d{1,2})\b/g
  while ((m = parenRe.exec(line)) !== null) {
    if (m.index >= startIndex) {
      candidates.push({ index: m.index + 1, length: m[1].length, num: Number(m[1]) })
    }
  }

  const wordRe = /\b(\d{1,2})\b/g
  while ((m = wordRe.exec(line)) !== null) {
    if (m.index < startIndex) continue
    if (m.index > 0 && line[m.index - 1] === '£') continue
    candidates.push({ index: m.index, length: m[0].length, num: Number(m[1]) })
  }

  candidates.sort((a, b) => a.index - b.index)
  for (const c of candidates) {
    if (c.num === expected) return { index: c.index, length: c.length }
  }
  return null
}

/** Word tách `15` + `.` + `Scarecrow` thành 3 dòng sau expand — gộp lại. */
function mergeSplitQuestionHeadLines(lines: DocxParagraph[]): DocxParagraph[] {
  const out: DocxParagraph[] = []
  let i = 0
  while (i < lines.length) {
    const text = lines[i].text.trim()
    const numOnly = text.match(/^(\d{1,2})$/)
    if (numOnly) {
      if (i + 1 < lines.length && lines[i + 1].text.trim() === '.') {
        const label = i + 2 < lines.length ? lines[i + 2].text.trim() : ''
        if (label && !/^\d/.test(label)) {
          out.push({ ...lines[i], text: `${numOnly[1]}.${label}` })
          i += 3
          continue
        }
      }
      if (i + 1 < lines.length) {
        const dotLabel = lines[i + 1].text.trim().match(/^\.(.+)$/)
        if (dotLabel) {
          out.push({ ...lines[i], text: `${numOnly[1]}.${dotLabel[1]}` })
          i += 2
          continue
        }
      }
    }
    out.push(lines[i])
    i += 1
  }
  return out
}

function parseInlineMcOptions(text: string): Array<{ id: string; label: string }> {
  const markers: Array<{ id: string; start: number; end: number }> = []
  INLINE_MC_OPTION_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = INLINE_MC_OPTION_RE.exec(text)) !== null) {
    markers.push({ id: m[1].toUpperCase(), start: m.index, end: m.index + m[0].length })
  }
  if (markers.length < 2) return []

  const opts: Array<{ id: string; label: string }> = []
  for (let i = 0; i < markers.length; i += 1) {
    const label = text.slice(markers[i].end, markers[i + 1]?.start ?? text.length).trim()
    opts.push({ id: markers[i].id, label })
  }
  return opts
}

function stripBullet(text: string): string {
  return text.replace(/^[•●‣▪◦○·*+–−\-]\s*/, '').trim()
}

function isSectionHeader(text: string): boolean {
  const t = text.trim()
  return SECTION_RE.test(t) || /^Part\s*[1-4]\s*$/i.test(t)
}

function isLikelyPassageTitle(line: DocxParagraph): boolean {
  const t = stripBullet(line.text)
  if (t.length < 4 || t.length > 80) return false
  if (INSTRUCTION_HINT_RE.test(t) && t.length > 40) return false
  if (QUESTIONS_RANGE_RE.test(t)) return false
  return line.centered || (line.bold && t === t.toUpperCase() && t.split(/\s+/).length <= 8)
}

function isLikelySectionLabel(line: DocxParagraph): boolean {
  const t = stripBullet(line.text)
  if (!t || t.length > 60) return false
  if (hasTraditionalGapMarkers(t)) return false
  if (parseQuestionHead(t)) return false
  if (OPTION_LINE_RE.test(t)) return false
  if (INSTRUCTION_HINT_RE.test(t) && t.length > 35) return false
  if (/^example\b/i.test(t)) return false
  if (lineEndsWithColon(t) && t.split(/\s+/).length <= 6) return true
  return line.bold && t.split(/\s+/).length <= 5 && !t.includes('.')
}

function lineEndsWithColon(text: string): boolean {
  return text.trimEnd().endsWith(':')
}

/** Tách 4 part theo marker Questions 1–10 / 11–20 / … — dùng chung Word import + Wizard. */
export function splitDocxIntoPartSlices(content: DocxContent): PartSlice[] {
  const slices: PartSlice[] = []
  let current: PartSlice | null = null

  for (const line of content.paragraphs) {
    const text = line.text.trim()
    if (!text) continue

    const sectionMatch = text.match(SECTION_RE)
    if (sectionMatch) {
      const partNumber = Number(sectionMatch[1])
      if (partNumber >= 1 && partNumber <= 4) {
        const [qFrom, qTo] = PART_RANGES[partNumber - 1]
        current = { partNumber, qFrom, qTo, lines: [], images: [], paragraphIndices: [] }
        slices.push(current)
        continue
      }
    }

    const rangeMatch = text.match(QUESTIONS_RANGE_RE)
    if (rangeMatch) {
      const qFrom = Number(rangeMatch[1])
      const qTo = Number(rangeMatch[2])
      const partNumber = PART_RANGES.findIndex(([a, b]) => a === qFrom && b === qTo) + 1
      if (partNumber >= 1) {
        current = { partNumber, qFrom, qTo, lines: [], images: [], paragraphIndices: [] }
        const existing = slices.find(s => s.partNumber === partNumber)
        if (!existing) slices.push(current)
        else current = existing
        continue
      }
    }

    if (!current) {
      const guessed = text.match(QUESTIONS_RANGE_RE)
      if (guessed) continue
      if (slices.length === 0) {
        current = { partNumber: 1, qFrom: 1, qTo: 10, lines: [], images: [], paragraphIndices: [] }
        slices.push(current)
      } else {
        continue
      }
    }

    current.lines.push(line)
    if (line.index >= 0) current.paragraphIndices.push(line.index)
  }

  for (const slice of slices) {
    if (!slice.paragraphIndices.length) continue
    const minIdx = Math.min(...slice.paragraphIndices)
    const maxIdx = Math.max(...slice.paragraphIndices)
    const embedded = content.images.filter(
      img => img.paragraphIndex >= minIdx && img.paragraphIndex <= maxIdx,
    )
    slice.images = embedded
  }

  if (!slices.length) {
    slices.push({
      partNumber: 1,
      qFrom: 1,
      qTo: 40,
      lines: [...content.paragraphs],
      images: content.images,
      paragraphIndices: content.paragraphs.map(p => p.index).filter(i => i >= 0),
    })
  }

  return slices.sort((a, b) => a.partNumber - b.partNumber)
}

function parseGapMarkersInLine(
  line: string,
  rawLine: string,
  nextGap: { n: number },
  qTo: number,
): ListeningNotePassageBlock[] {
  const blocks: ListeningNotePassageBlock[] = []
  const marker = rawLine.trim().match(/^[•●‣▪◦○·*+–−\-]/)?.[0]

  GAP_TOKEN_RE.lastIndex = 0
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = GAP_TOKEN_RE.exec(line)) !== null) {
    const before = line.slice(lastIndex, match.index).trimEnd()
    if (before) {
      blocks.push({ type: 'static', text: lastIndex === 0 && marker ? `${marker} ${before}` : before })
    }

    const explicit = match[1] ? Number(match[1]) : nextGap.n
    if (explicit >= nextGap.n && explicit <= qTo) nextGap.n = explicit
    if (nextGap.n <= qTo) {
      blocks.push({ type: 'gap', number: nextGap.n })
      nextGap.n += 1
    }
    lastIndex = match.index + match[0].length
  }

  const tail = line.slice(lastIndex).trim()
  if (tail) {
    blocks.push({ type: 'static', text: marker && !blocks.length ? `${marker} ${tail}` : tail })
  }
  return blocks
}

function lineToNoteBlocks(
  rawLine: string,
  nextGap: { n: number },
  qTo: number,
): ListeningNotePassageBlock[] {
  const blocks: ListeningNotePassageBlock[] = []
  let line = stripBullet(rawLine)
  if (/^example\b/i.test(line)) {
    if (hasTraditionalGapMarkers(line)) {
      const prefix = line.match(/^example\s*(?:[–—\-:]\s*)?/i)?.[0]?.trim() ?? 'Example'
      const body = line.replace(/^example\s*(?:[–—\-:]\s*)?/i, '').trim()
      return [{ type: 'example', text: prefix }, ...parseGapMarkersInLine(body, rawLine, nextGap, qTo)]
    }
    return [{ type: 'example', text: line }]
  }

  const bare = line.trim()
  if (/^\d{1,2}$/.test(bare) && Number(bare) === nextGap.n && nextGap.n <= qTo) {
    const num = nextGap.n
    nextGap.n += 1
    return [{ type: 'gap', number: num, gapOnOwnLine: true }]
  }

  if (hasTraditionalGapMarkers(line)) {
    return parseGapMarkersInLine(line, rawLine, nextGap, qTo)
  }

  const marker = rawLine.trim().match(/^[•●‣▪◦○·*+–−\-]/)?.[0]
  let pos = 0
  let usedMarker = false
  while (pos < line.length && nextGap.n <= qTo) {
    const found = findNextInlineGap(line, pos, nextGap.n, qTo)
    if (!found) break

    const before = line.slice(pos, found.index).trimEnd()
    if (before) {
      const text = !usedMarker && marker ? `${marker} ${before}` : before
      blocks.push({ type: 'static', text })
      usedMarker = true
    }

    blocks.push({ type: 'gap', number: nextGap.n })
    nextGap.n += 1
    pos = found.index + found.length
  }

  const tail = line.slice(pos).trim()
  if (tail) {
    blocks.push({ type: 'static', text: !usedMarker && marker ? `${marker} ${tail}` : tail })
  } else if (!blocks.length && line) {
    blocks.push({ type: 'static', text: marker ? `${marker} ${line}` : line })
  }

  return blocks
}

function isMcQuestionLine(text: string, lines: DocxParagraph[], index: number): boolean {
  const qHead = parseQuestionHead(text)
  if (!qHead) return false
  if (parseInlineMcOptions(text).length >= 2) return true
  for (let j = index + 1; j < Math.min(index + 3, lines.length); j += 1) {
    const next = stripBullet(lines[j].text.trim())
    if (!next) continue
    if (parseQuestionHead(next)) break
    if (parseInlineMcOptions(next).length >= 2) return true
    if (OPTION_LINE_RE.test(next)) return true
  }
  return false
}

function buildNotePassageFromLines(
  lines: DocxParagraph[],
  qFrom: number,
  qTo: number,
): { blocks: ListeningNotePassageBlock[]; passageTitle?: string; instruction?: string } {
  const blocks: ListeningNotePassageBlock[] = []
  let passageTitle: string | undefined
  let instruction: string | undefined
  const nextGap = { n: qFrom }
  let inNotes = false

  for (let li = 0; li < lines.length; li += 1) {
    const line = lines[li]
    const text = line.text.trim()
    if (!text) continue

    if (QUESTIONS_RANGE_RE.test(text) || SECTION_RE.test(text)) continue

    if (!instruction && INSTRUCTION_HINT_RE.test(text) && text.length > 20) {
      instruction = text
      continue
    }

    if (!passageTitle && isLikelyPassageTitle(line)) {
      passageTitle = stripBullet(text)
      inNotes = true
      continue
    }

    if (isLikelySectionLabel(line)) {
      blocks.push({ type: 'section', text: stripBullet(text) })
      inNotes = true
      continue
    }

    if (hasTraditionalGapMarkers(text) || text.includes('\t')) {
      blocks.push(...lineToNoteBlocks(text, nextGap, qTo))
      inNotes = true
      continue
    }

    const qHead = parseQuestionHead(text)
    if (qHead && qHead.num >= qFrom && qHead.num <= qTo) {
      if (isMcQuestionLine(text, lines, li)) continue
      break
    }

    if (OPTION_LINE_RE.test(stripBullet(text))) {
      if (!inNotes) continue
      break
    }
    if (MAP_LEGEND_RE.test(stripBullet(text))) break

    if (line.bullet || line.indentLevel > 0 || inNotes) {
      blocks.push(...lineToNoteBlocks(text, nextGap, qTo))
      inNotes = true
      continue
    }

    if (!inNotes && !passageTitle) {
      blocks.push({ type: 'static', text })
    } else {
      blocks.push(...lineToNoteBlocks(text, nextGap, qTo))
    }
  }

  return { blocks, passageTitle, instruction }
}

function partTextBlob(instruction: string | undefined, lines: DocxParagraph[]): string {
  return `${instruction ?? ''} ${lines.map(l => l.text).join(' ')}`.toLowerCase()
}

/** Part 3 IELTS: Choose the correct letter A/B/C — không phải map/diagram. */
function isMultipleChoicePart(instruction: string | undefined, lines: DocxParagraph[]): boolean {
  const blob = partTextBlob(instruction, lines)
  return /choose\s+(the\s+)?correct\s+letter/i.test(blob)
    || /choose\s+(one\s+)?letter\s+a\s*,\s*b\s*(or|and)\s*c/i.test(blob)
    || /three\s+letters\s+a\s*,\s*b\s+and\s+c/i.test(blob)
}

function detectMapPart(instruction: string | undefined, lines: DocxParagraph[]): boolean {
  if (isMultipleChoicePart(instruction, lines)) return false
  const blob = partTextBlob(instruction, lines)
  return blob.includes('label the map')
    || blob.includes('label the plan')
    || /\bletters?\s+a\s*[–—-]\s*i\b/.test(blob)
    || (blob.includes('on the map') && /\bletter[s]?\s+a\b/.test(blob))
}

function detectDiagramPart(instruction: string | undefined, lines: DocxParagraph[]): boolean {
  if (isMultipleChoicePart(instruction, lines)) return false
  const blob = partTextBlob(instruction, lines)
  return blob.includes('label the diagram') || blob.includes('diagram below')
}

function letterOptions(count: number): Array<{ id: string; label: string }> {
  return Array.from({ length: count }, (_, i) => {
    const id = String.fromCharCode(65 + i)
    return { id, label: id }
  })
}

function buildQuestionsFromLines(
  lines: DocxParagraph[],
  qFrom: number,
  qTo: number,
  answers: Map<number, string>,
  instruction?: string,
): ListeningImportQuestionJson[] {
  const mergedLines = mergeSplitQuestionHeadLines(lines)
  const questions: ListeningImportQuestionJson[] = []
  const flat = mergedLines.map(l => l.text.trim()).filter(Boolean)
  let i = 0
  let sectionRange: string | undefined
  let sectionInstruction: string | undefined

  if (instruction) sectionInstruction = instruction
  const mcPart = isMultipleChoicePart(instruction ?? sectionInstruction, lines)

  while (i < flat.length) {
    const text = stripBullet(flat[i])
    if (QUESTIONS_RANGE_RE.test(text) || SECTION_RE.test(text)) {
      i += 1
      continue
    }

    if (INSTRUCTION_HINT_RE.test(text) && text.length > 25 && !parseQuestionHead(text)) {
      sectionInstruction = text
      i += 1
      continue
    }

    if (MAP_LEGEND_RE.test(text)) {
      i += 1
      continue
    }

    const qHead = parseQuestionHead(text)
    if (qHead) {
      const { num, prompt: rawPrompt } = qHead
      if (num < qFrom || num > qTo) {
        i += 1
        continue
      }

      let prompt = rawPrompt
      const opts: Array<{ id: string; label: string }> = []

      const sameLineOptStart = rawPrompt.search(/\s[A-G][\.\):\-–—]/)
      if (sameLineOptStart > 0) {
        prompt = rawPrompt.slice(0, sameLineOptStart).trim()
        opts.push(...parseInlineMcOptions(rawPrompt.slice(sameLineOptStart)))
      }

      let j = i + 1
      if (opts.length < 2) {
        while (j < flat.length) {
          const optLine = stripBullet(flat[j])
          const inline = parseInlineMcOptions(optLine)
          if (inline.length >= 2) {
            opts.push(...inline)
            j += 1
            break
          }
          const om = optLine.match(OPTION_LINE_RE)
          if (om) {
            opts.push({ id: om[1].toUpperCase(), label: om[2].trim() })
            j += 1
            continue
          }
          if (parseQuestionHead(optLine) || INSTRUCTION_HINT_RE.test(optLine)) break
          break
        }
      } else {
        j = i + 1
      }

      const answer = answers.get(num) ?? ''
      if (opts.length >= 2) {
        questions.push({
          number: num,
          type: 'multiple-choice',
          prompt,
          options: opts,
          answer,
          explanation: 'Chọn theo answer key.',
          ...(questions.length === 0 && sectionRange ? { sectionRange, sectionInstruction } : {}),
        })
        i = j
        continue
      }

      const ans = answer.replace(/\/.*/, '').trim()
      const isMap = !mcPart && ans.length === 1 && /[a-i]/i.test(ans)
      if (isMap) {
        questions.push({
          number: num,
          type: 'matching',
          prompt,
          options: letterOptions(9),
          answer: ans.toUpperCase(),
          explanation: 'Chọn theo answer key.',
          mapLabel: true,
          ...(questions.length === 0 && sectionRange ? { sectionRange, sectionInstruction } : {}),
        })
      } else {
        questions.push({
          number: num,
          type: 'gap-fill',
          prompt: prompt.slice(0, 60),
          options: [],
          answer,
          explanation: 'Điền theo answer key.',
          wordLimit: 3,
          ...(questions.length === 0 && sectionRange ? { sectionRange, sectionInstruction } : {}),
        })
      }
      i += 1
      continue
    }

    if (hasTraditionalGapMarkers(text) || mergedLines[i]?.bullet) {
      i += 1
      continue
    }

    i += 1
  }

  // Gap-fill từ notePassage blocks
  const noteResult = buildNotePassageFromLines(mergedLines, qFrom, qTo)
  const gapNums = noteResult.blocks
    .filter((b): b is ListeningNotePassageBlock & { number: number } => b.type === 'gap' && typeof b.number === 'number')
    .map(b => b.number)

  for (const num of gapNums) {
    if (questions.some(q => q.number === num)) continue
    questions.push({
      number: num,
      type: 'gap-fill',
      prompt: `Question ${num}`,
      options: [],
      answer: answers.get(num) ?? '',
      explanation: 'Điền theo answer key.',
      wordLimit: 3,
      ...(questions.length === 0 ? { sectionRange: `Questions ${qFrom}–${qTo}`, sectionInstruction } : {}),
    })
  }

  questions.sort((a, b) => a.number - b.number)
  return questions
}

function imageToFile(img: DocxImage, outName: string): File {
  const blob = new Blob([new Uint8Array(img.bytes)], { type: img.mime })
  return new File([blob], outName, { type: img.mime })
}

function buildPart(
  slice: PartSlice,
  answers: Map<number, string>,
  warnings: string[],
): { part: ListeningImportPartJson; files: File[] } {
  const { partNumber, qFrom, qTo, lines, images } = slice
  const files: File[] = []

  const instructionLine = lines.find(l => INSTRUCTION_HINT_RE.test(l.text) && l.text.length > 20)
  const instruction = instructionLine?.text.trim()

  const mergedLines = mergeSplitQuestionHeadLines(lines)
  const noteResult = buildNotePassageFromLines(mergedLines, qFrom, qTo)
  let questions = buildQuestionsFromLines(mergedLines, qFrom, qTo, answers, instruction ?? noteResult.instruction)
  const mcPartHint = isMultipleChoicePart(instruction, mergedLines)
  const mapPartHint = detectMapPart(instruction, mergedLines)

  for (let n = qFrom; n <= qTo; n += 1) {
    if (!questions.some(q => q.number === n)) {
      warnings.push(`Part ${partNumber}: thiếu câu ${n} — kiểm tra định dạng Word (số câu / gap ___).`)
      if (answers.has(n)) {
        const ans = (answers.get(n) ?? '').replace(/\/.*/, '').trim()
        const isMapAns = !mcPartHint && ans.length === 1 && /[a-i]/i.test(ans)
        if (isMapAns && mapPartHint) {
          questions.push({
            number: n,
            type: 'matching',
            prompt: `Question ${n}`,
            options: letterOptions(9),
            answer: ans.toUpperCase(),
            explanation: 'Chọn theo answer key.',
            mapLabel: true,
          })
        } else {
          questions.push({
            number: n,
            type: 'gap-fill',
            prompt: `Question ${n}`,
            options: [],
            answer: answers.get(n) ?? '',
            explanation: 'Điền theo answer key.',
            wordLimit: 3,
          })
        }
      }
    }
  }
  questions.sort((a, b) => a.number - b.number)

  const part: ListeningImportPartJson = {
    partNumber,
    rangeLabel: `Questions ${qFrom}–${qTo}`,
    instruction: instruction ?? noteResult.instruction ?? `Questions ${qFrom}–${qTo}`,
    audioFile: 'listening.mp3',
    questions,
  }

  const hasGapNotes = noteResult.blocks.some(b => b.type === 'gap')
  const mcOnlyPart = !hasGapNotes && (
    isMultipleChoicePart(instruction, lines)
    || (questions.length > 0 && questions.every(q => q.type === 'multiple-choice'))
  )

  if (!mcOnlyPart && noteResult.passageTitle) part.passageTitle = noteResult.passageTitle
  if (!mcOnlyPart && noteResult.blocks.length) {
    part.notePassage = noteResult.blocks
    part.notePassageLayout = partNumber === 1 ? 'form' : undefined
  }

  const wantsMap = !mcOnlyPart
    && (detectMapPart(instruction, lines) || questions.some(q => q.mapLabel))
  const wantsDiagram = !mcOnlyPart
    && (detectDiagramPart(instruction, lines) || questions.some(q => q.diagramLabel))

  if (images.length > 0) {
    if (wantsMap) {
      files.push(imageToFile(images[0], 'map.jpg'))
      part.imageFile = 'map.jpg'
    } else if (wantsDiagram) {
      files.push(imageToFile(images[0], 'diagram.jpg'))
      part.imageFile = 'diagram.jpg'
    }
  } else if (wantsMap || wantsDiagram) {
    warnings.push(`Part ${partNumber}: thiếu ảnh nhúng trong Word (map/diagram).`)
  }

  const gapInPassage = (part.notePassage ?? []).filter(b => b.type === 'gap').length
  const gapInQuestions = questions.filter(q => q.type === 'gap-fill' && !q.mapLabel).length
  if (gapInPassage && gapInQuestions && gapInPassage !== gapInQuestions) {
    warnings.push(
      `Part ${partNumber}: ${gapInPassage} gap trong notePassage vs ${gapInQuestions} câu gap-fill — kiểm tra dấu ___ hoặc [n] trong Word.`,
    )
  }

  return { part, files }
}

export function buildListeningPayloadFromDocx(
  content: DocxContent,
  options: DocxListeningImportOptions,
): DocxListeningImportResult {
  const warnings: string[] = []
  const answers = parseListeningAnswerKey(options.answerKey)

  if (answers.size < 30) {
    warnings.push(`Answer key chỉ có ${answers.size}/40 câu — kiểm tra định dạng "1 answer".`)
  }

  const slices = splitDocxIntoPartSlices(content)
  if (slices.length < 4) {
    warnings.push(`Word có ${slices.length} section — cần SECTION 1–4 hoặc Questions 1–10 / 11–20 / …`)
  }

  const parts: ListeningImportPartJson[] = []
  const mediaFiles: File[] = []

  for (const slice of slices) {
    const { part, files } = buildPart(slice, answers, warnings)
    parts.push(part)
    mediaFiles.push(...files)
  }

  const cam = options.cambridge?.trim()
  const test = options.test?.trim()
  const bandHint = [
    'IELTS',
    cam ? `Cam ${cam}` : '',
    test ? `Test ${test}` : '',
    'Word import',
    '4 parts',
  ].filter(Boolean).join(' · ')

  const raw: ListeningImportPayload = {
    version: 1,
    title: options.title.trim() || 'IELTS Listening — Word import',
    durationMinutes: 30,
    bandHint,
    examType: 'ielts',
    examMode: 'practice',
    parts,
  }

  const normalized = normalizeListeningImportPayload(raw)
  const payload: ListeningImportPayload = { ...raw, parts: normalized.parts }

  return { payload, mediaFiles, warnings }
}
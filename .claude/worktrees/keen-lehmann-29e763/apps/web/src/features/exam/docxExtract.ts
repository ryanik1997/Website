import { unzip } from 'fflate'

export interface DocxParagraph {
  text: string
  bold: boolean
  centered: boolean
  bullet: boolean
  indentLevel: number
  /** Thứ tự đoạn trong document.xml (0-based). */
  index: number
}

export interface DocxImage {
  fileName: string
  bytes: Uint8Array
  mime: string
  /** Đoạn chứa ảnh nhúng (blip). */
  paragraphIndex: number
}

export interface DocxContent {
  paragraphs: DocxParagraph[]
  images: DocxImage[]
}

export const DOCX_IMPORT_MAX_BYTES = 25 * 1024 * 1024

export interface ExtractDocxOptions {
  /** Tách \\n trong paragraph thành paragraph riêng (parser Import Word). Wizard: false. */
  splitMultilineParagraphs?: boolean
}

function mimeFromName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

function elementsByLocalName(root: ParentNode, local: string): Element[] {
  const host = root as Document | Element
  return Array.from(host.getElementsByTagName('*')).filter(
    (el): el is Element => el.localName === local,
  )
}

function firstChildByLocal(parent: Element, local: string): Element | null {
  for (const child of Array.from(parent.children)) {
    if (child.localName === local) return child
  }
  return null
}

function attrVal(el: Element | null, local: string): string {
  if (!el) return ''
  return el.getAttribute(`w:${local}`)
    ?? el.getAttribute(local)
    ?? ''
}

function runText(run: Element): string {
  const parts: string[] = []
  for (const child of Array.from(run.children)) {
    if (child.localName === 't') parts.push(child.textContent ?? '')
    else if (child.localName === 'tab') parts.push('\t')
    else if (child.localName === 'br') parts.push('\n')
  }
  return parts.join('')
}

function inlineBlockText(el: Element): string {
  if (el.localName === 'r') return runText(el)
  if (el.localName === 'hyperlink') {
    return Array.from(el.children)
      .filter(child => child.localName === 'r')
      .map(child => runText(child))
      .join('')
  }
  return ''
}

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()
}

function paragraphRuns(p: Element): Element[] {
  const runs: Element[] = []
  for (const child of Array.from(p.children)) {
    if (child.localName === 'r') runs.push(child)
    else if (child.localName === 'hyperlink') {
      for (const r of Array.from(child.children)) {
        if (r.localName === 'r') runs.push(r)
      }
    }
  }
  return runs
}

function nextNonEmptyRunText(runs: Element[], fromIndex: number): string {
  for (let j = fromIndex; j < runs.length; j += 1) {
    const t = runText(runs[j]).replace(/\u00a0/g, ' ').trim()
    if (t) return t
  }
  return ''
}

/** Run `15` + run `.` + `Scarecrow` = câu map/MC — không phải gap note-completion. */
function isQuestionNumberRun(runIndex: number, runs: Element[]): boolean {
  const trimmed = runText(runs[runIndex]).replace(/\u00a0/g, ' ').trim()
  if (!/^\d{1,2}$/.test(trimmed)) return false
  const next = nextNonEmptyRunText(runs, runIndex + 1)
  return next === '.' || next.startsWith('.')
}

/** Run chỉ chứa số gap (1–40) — Word IELTS hay tách run riêng = xuống dòng trên giấy. */
function isIsolatedGapNumberRun(runIndex: number, runs: Element[]): boolean {
  const trimmed = runText(runs[runIndex]).replace(/\u00a0/g, ' ').trim()
  if (!/^\d{1,2}$/.test(trimmed)) return false
  if (isQuestionNumberRun(runIndex, runs)) return false
  return true
}

function paragraphText(p: Element): string {
  const runs = paragraphRuns(p)
  const parts: string[] = []
  for (let ri = 0; ri < runs.length; ri += 1) {
    const run = runs[ri]
    const raw = runText(run)
    const trimmed = raw.replace(/\u00a0/g, ' ').trim()
    if (!trimmed) continue

    if (isIsolatedGapNumberRun(ri, runs)) {
      if (parts.length && !parts[parts.length - 1].endsWith('\n')) parts.push('\n')
      parts.push(trimmed)
      parts.push('\n')
      continue
    }

    parts.push(raw)
  }

  if (!parts.length) {
    const fallback = Array.from(p.children)
      .map(child => inlineBlockText(child))
      .join('')
    return normalizeExtractedText(fallback)
  }

  return normalizeExtractedText(parts.join(''))
}

/** Một đoạn Word có Shift+Enter → tách thành nhiều dòng logic cho parser. */
function expandMultilineParagraphs(paragraphs: DocxParagraph[]): DocxParagraph[] {
  const out: DocxParagraph[] = []
  for (const para of paragraphs) {
    if (!para.text.includes('\n')) {
      out.push(para)
      continue
    }
    for (const segment of para.text.split(/\r?\n/)) {
      const trimmed = segment.trim()
      if (!trimmed) continue
      out.push({
        ...para,
        text: trimmed,
        bullet: para.bullet || /^[•●‣▪◦○·*+–−\-]/.test(trimmed),
      })
    }
  }
  return out
}

function paragraphBold(p: Element): boolean {
  for (const run of elementsByLocalName(p, 'r')) {
    const rPr = firstChildByLocal(run, 'rPr')
    if (rPr && firstChildByLocal(rPr, 'b')) return true
  }
  return false
}

function paragraphCentered(p: Element): boolean {
  const pPr = firstChildByLocal(p, 'pPr')
  const jc = pPr ? firstChildByLocal(pPr, 'jc') : null
  return attrVal(jc, 'val').toLowerCase() === 'center'
}

function paragraphBullet(p: Element): boolean {
  const pPr = firstChildByLocal(p, 'pPr')
  if (!pPr) return false
  if (firstChildByLocal(pPr, 'numPr')) return true
  const text = paragraphText(p)
  return /^[•●‣▪◦○·*+–−\-]\s/.test(text)
}

function paragraphIndent(p: Element): number {
  const pPr = firstChildByLocal(p, 'pPr')
  const ind = pPr ? firstChildByLocal(pPr, 'ind') : null
  const left = Number(attrVal(ind, 'left') || attrVal(ind, 'start') || '0')
  if (left >= 720) return 2
  if (left >= 360) return 1
  return 0
}

function parseTable(tbl: Element): DocxParagraph[] {
  const rows: DocxParagraph[] = []
  for (const tr of elementsByLocalName(tbl, 'tr')) {
    const cells: string[] = []
    for (const tc of elementsByLocalName(tr, 'tc')) {
      const cellParts: string[] = []
      for (const p of elementsByLocalName(tc, 'p')) {
        const t = paragraphText(p)
        if (t) cellParts.push(t)
      }
      cells.push(cellParts.join(' '))
    }
    const text = cells.filter(Boolean).join('\t')
    if (text) rows.push({ text, bold: false, centered: false, bullet: false, indentLevel: 0, index: -1 })
  }
  return rows
}

function loadRelationships(relsXml: string): Map<string, string> {
  const doc = new DOMParser().parseFromString(relsXml, 'application/xml')
  const map = new Map<string, string>()
  for (const rel of elementsByLocalName(doc, 'Relationship')) {
    const id = rel.getAttribute('Id')
    const target = rel.getAttribute('Target')
    if (id && target) map.set(id, target.replace(/^\.\.\//, 'word/'))
  }
  return map
}

function embedIdsFromParagraph(p: Element): string[] {
  const ids: string[] = []
  for (const blip of elementsByLocalName(p, 'blip')) {
    const embed = blip.getAttribute('r:embed') ?? blip.getAttribute('embed')
    if (embed) ids.push(embed)
  }
  return ids
}

async function unzipDocx(buffer: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    unzip(buffer, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

/** Trích paragraph + ảnh từ .docx (1 file Word = 4 sections). */
export async function extractDocxContent(
  file: File,
  options?: ExtractDocxOptions,
): Promise<DocxContent> {
  if (!file.name.toLowerCase().endsWith('.docx')) {
    throw new Error('Chọn file .docx (Word).')
  }
  if (file.size > DOCX_IMPORT_MAX_BYTES) {
    throw new Error(`File Word quá lớn (tối đa ${Math.round(DOCX_IMPORT_MAX_BYTES / 1024 / 1024)}MB).`)
  }

  const entries = await unzipDocx(new Uint8Array(await file.arrayBuffer()))
  const docPath = Object.keys(entries).find(p => /word\/document\.xml$/i.test(p.replace(/\\/g, '/')))
  if (!docPath) throw new Error('Không tìm thấy word/document.xml trong file Word.')

  const docXml = new TextDecoder().decode(entries[docPath])
  const document = new DOMParser().parseFromString(docXml, 'application/xml')
  const body = elementsByLocalName(document, 'body')[0]
  if (!body) throw new Error('document.xml không có body.')

  const paragraphs: DocxParagraph[] = []
  let paragraphIndex = 0
  for (const child of Array.from(body.children)) {
    if (child.localName === 'p') {
      const text = paragraphText(child)
      if (!text) {
        paragraphIndex += 1
        continue
      }
      paragraphs.push({
        text,
        bold: paragraphBold(child),
        centered: paragraphCentered(child),
        bullet: paragraphBullet(child),
        indentLevel: paragraphIndent(child),
        index: paragraphIndex,
      })
      paragraphIndex += 1
    } else if (child.localName === 'tbl') {
      paragraphs.push(...parseTable(child))
    }
  }

  const images: DocxImage[] = []
  const relsPath = Object.keys(entries).find(p => /word\/_rels\/document\.xml\.rels$/i.test(p.replace(/\\/g, '/')))
  if (relsPath) {
    const relsXml = new TextDecoder().decode(entries[relsPath])
    const relMap = loadRelationships(relsXml)
    const seen = new Set<string>()

    const bodyParagraphs = elementsByLocalName(body, 'p')
    for (let pIdx = 0; pIdx < bodyParagraphs.length; pIdx += 1) {
      const p = bodyParagraphs[pIdx]
      for (const embedId of embedIdsFromParagraph(p)) {
        const target = relMap.get(embedId)
        if (!target || seen.has(target)) continue
        const entryKey = Object.keys(entries).find(k => k.replace(/\\/g, '/').endsWith(target.replace(/^word\//, 'word/')))
          ?? Object.keys(entries).find(k => k.replace(/\\/g, '/').includes(target.split('/').pop() ?? ''))
        if (!entryKey) continue
        seen.add(target)
        const fileName = target.split('/').pop() ?? `image${images.length + 1}.jpg`
        images.push({
          fileName,
          bytes: entries[entryKey],
          mime: mimeFromName(fileName),
          paragraphIndex: pIdx,
        })
      }
    }
  }

  // Fallback: mọi file trong word/media/
  if (!images.length) {
    for (const [path, bytes] of Object.entries(entries)) {
      const norm = path.replace(/\\/g, '/')
      if (!/\/media\//i.test(norm)) continue
      const fileName = norm.split('/').pop() ?? `image${images.length + 1}.jpg`
      if (!/\.(png|jpe?g|webp|gif)$/i.test(fileName)) continue
      images.push({ fileName, bytes, mime: mimeFromName(fileName), paragraphIndex: -1 })
    }
  }

  if (!paragraphs.length) {
    throw new Error('Word không có đoạn văn nào — kiểm tra file .docx.')
  }

  const finalParagraphs = options?.splitMultilineParagraphs === false
    ? paragraphs
    : expandMultilineParagraphs(paragraphs)
  return { paragraphs: finalParagraphs, images }
}
import type { ReadingPassageBlock } from '../examData'

export interface KetRwEmailSection {
  from?: string
  to?: string
  paragraphs: string[]
}

function normalizeEmailLabel(label?: string): 'from' | 'to' | null {
  const norm = label?.trim().toLowerCase().replace(/:$/, '')
  if (norm === 'from') return 'from'
  if (norm === 'to') return 'to'
  return null
}

function splitEmailParagraphs(text: string): string[] {
  const parts = text.split(/\n\n+/).map(s => s.trim()).filter(Boolean)
  return parts.length ? parts : [text.trim()]
}

function stripLeadingEmailHeaders(text: string): string {
  const lines = text.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) {
      i += 1
      continue
    }
    if (/^From:\s*/i.test(line) || /^To:\s*/i.test(line)) {
      i += 1
      continue
    }
    break
  }
  return lines.slice(i).join('\n').trim()
}

/** Parse "From: …\nTo: …\n\n<body>" embedded in a single text block. */
export function parseKetEmailBlockText(text: string): KetRwEmailSection {
  const lines = text.split('\n')
  let from: string | undefined
  let to: string | undefined
  let bodyStart = 0

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()
    const fromMatch = line.match(/^From:\s*(.*)$/i)
    const toMatch = line.match(/^To:\s*(.*)$/i)
    if (fromMatch) {
      from = fromMatch[1].trim()
      bodyStart = i + 1
      continue
    }
    if (toMatch) {
      to = toMatch[1].trim()
      bodyStart = i + 1
      continue
    }
    if (!line && (from || to)) {
      bodyStart = i + 1
      break
    }
    if (line && !from && !to) break
  }

  const body = stripLeadingEmailHeaders(lines.slice(bodyStart).join('\n').trim())
  return {
    from,
    to,
    paragraphs: body ? splitEmailParagraphs(body) : [],
  }
}

export function groupKetPart5Passage(passage: ReadingPassageBlock[]): KetRwEmailSection[] {
  const emails: KetRwEmailSection[] = []
  let current: KetRwEmailSection | null = null

  const flush = () => {
    if (current && (current.from || current.to || current.paragraphs.length)) {
      emails.push(current)
    }
    current = null
  }

  const pushParagraphs = (text: string) => {
    const cleaned = stripLeadingEmailHeaders(text)
    if (!cleaned) return
    if (!current) current = { paragraphs: [] }
    current.paragraphs.push(...splitEmailParagraphs(cleaned))
  }

  for (const block of passage) {
    const label = normalizeEmailLabel(block.label)
    if (label === 'from') {
      if (!current || current.paragraphs.length) flush()
      if (!current) current = { paragraphs: [] }
      current.from = block.text?.trim()
      continue
    }
    if (label === 'to') {
      if (!current) current = { paragraphs: [] }
      current.to = block.text?.trim()
      continue
    }

    const raw = block.text?.trim()
    if (!raw) continue

    const embedded = parseKetEmailBlockText(raw)
    if (embedded.from || embedded.to) {
      flush()
      emails.push(embedded)
      continue
    }

    pushParagraphs(raw)
  }

  flush()

  if (!emails.length && passage.some(b => b.text?.trim())) {
    return [{
      paragraphs: passage
        .map(b => stripLeadingEmailHeaders(b.text?.trim() ?? ''))
        .filter(Boolean),
    }]
  }

  return emails
}
import type { Card, Deck } from '@ryan/db'
import { resolvePos } from './posLabels'

export type ImportCardRow = {
  phrase: string
  meaning: string
  example?: string
  ipaUS?: string
  pos?: string
}

const CSV_HEADER = ['phrase', 'meaning', 'example', 'ipaUS', 'pos'] as const

export const CSV_TEMPLATE = `phrase,meaning,example,ipaUS,pos
good,tốt; hay; giỏi,She is a very good student.,/gʊd/,adjective
look,nhìn; ngó,Please look at the picture.,/lʊk/,verb
run away,bỏ trốn,He ran away from home.,/rʌn əˈweɪ/,phrasal verb`

function enrichImportRow(row: ImportCardRow): ImportCardRow {
  return {
    ...row,
    pos: resolvePos(row.phrase, row.pos),
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').trim() || 'deck'
}

function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCSVField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

function splitCSVRows(text: string): string[] {
  const rows: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          current += '""'
          i++
        } else {
          inQuotes = false
          current += ch
        }
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
      current += ch
    } else if (ch === '\r') {
      if (text[i + 1] === '\n') i++
      rows.push(current)
      current = ''
    } else if (ch === '\n') {
      rows.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.length > 0 || text.endsWith('\n') || text.endsWith('\r')) {
    rows.push(current)
  }
  return rows
}

function rowToImportCard(fields: string[], colIndex: Record<string, number>): ImportCardRow | null {
  const get = (key: string) => {
    const idx = colIndex[key]
    if (idx === undefined || idx < 0) return undefined
    const v = fields[idx]?.trim()
    return v || undefined
  }

  const phrase = get('phrase')
  const meaning = get('meaning')
  if (!phrase || !meaning) return null

  return {
    phrase,
    meaning,
    example: get('example'),
    ipaUS: get('ipaus') ?? get('ipaUS'),
    pos: get('pos'),
  }
}

export function exportDeckAsCSV(cards: Card[], deckName: string): void {
  const header = CSV_HEADER.join(',')
  const lines = cards.map(card => [
    escapeCSVField(card.phrase),
    escapeCSVField(card.meaning),
    escapeCSVField(card.example ?? ''),
    escapeCSVField(card.ipaUS ?? ''),
    escapeCSVField(card.pos ?? ''),
  ].join(','))

  const csv = [header, ...lines].join('\r\n')
  downloadText(`${sanitizeFilename(deckName)}.csv`, csv, 'text/csv;charset=utf-8')
}

export function exportDeckAsJSON(deck: Deck, cards: Card[]): void {
  const payload = {
    version: 1 as const,
    deck: {
      name: deck.name,
      book: deck.book,
      unit: deck.unit,
    },
    cards: cards.map(({ phrase, meaning, example, ipaUS, ipaUK, pos }) => ({
      phrase,
      meaning,
      ...(example ? { example } : {}),
      ...(ipaUS ? { ipaUS } : {}),
      ...(ipaUK ? { ipaUK } : {}),
      ...(pos ? { pos } : {}),
    })),
  }
  downloadText(
    `${sanitizeFilename(deck.name)}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  )
}

export function downloadCSVTemplate(): void {
  downloadText('vocab-template.csv', CSV_TEMPLATE, 'text/csv;charset=utf-8')
}

export function parseCSV(text: string): ImportCardRow[] {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('File CSV trống.')

  const rows = splitCSVRows(trimmed).filter(r => r.trim().length > 0)
  if (rows.length < 2) throw new Error('CSV cần ít nhất 1 dòng header và 1 dòng dữ liệu.')

  const headerFields = parseCSVLine(rows[0]).map(h => h.trim().toLowerCase())
  const phraseIdx = headerFields.indexOf('phrase')
  const meaningIdx = headerFields.indexOf('meaning')
  if (phraseIdx < 0) throw new Error('CSV thiếu cột bắt buộc: phrase')
  if (meaningIdx < 0) throw new Error('CSV thiếu cột bắt buộc: meaning')

  const colIndex: Record<string, number> = {}
  headerFields.forEach((name, i) => { colIndex[name] = i })

  const cards: ImportCardRow[] = []
  for (let i = 1; i < rows.length; i++) {
    const fields = parseCSVLine(rows[i])
    const card = rowToImportCard(fields, colIndex)
    if (card) cards.push(card)
  }

  if (cards.length === 0) throw new Error('Không tìm thấy từ hợp lệ (cần phrase và meaning).')
  return cards.map(enrichImportRow)
}

function normalizeImportRow(raw: unknown): ImportCardRow | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const phrase = typeof o.phrase === 'string' ? o.phrase.trim() : ''
  const meaning = typeof o.meaning === 'string' ? o.meaning.trim() : ''
  if (!phrase || !meaning) return null

  return {
    phrase,
    meaning,
    example: typeof o.example === 'string' ? o.example.trim() || undefined : undefined,
    ipaUS: typeof o.ipaUS === 'string' ? o.ipaUS.trim() || undefined : undefined,
    pos: typeof o.pos === 'string' ? o.pos.trim() || undefined : undefined,
  }
}

export function parseJSON(text: string): { deckName: string; cards: ImportCardRow[] } {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('File JSON không hợp lệ.')
  }

  if (!data || typeof data !== 'object') {
    throw new Error('JSON phải là object.')
  }

  const obj = data as Record<string, unknown>
  if (obj.version !== 1) {
    throw new Error('JSON không đúng format Ryan English (version 1).')
  }

  if (!Array.isArray(obj.cards)) {
    throw new Error('JSON thiếu mảng cards.')
  }

  const deck = obj.deck as Record<string, unknown> | undefined
  const deckName = typeof deck?.name === 'string' && deck.name.trim()
    ? deck.name.trim()
    : 'Imported deck'

  const cards = obj.cards
    .map(normalizeImportRow)
    .filter((c): c is ImportCardRow => c !== null)

  if (cards.length === 0) {
    throw new Error('JSON không có từ hợp lệ (cần phrase và meaning).')
  }

  return { deckName, cards: cards.map(enrichImportRow) }
}

export function parseImportFile(text: string, filename: string): ImportCardRow[] {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) return parseJSON(text).cards
  if (lower.endsWith('.csv')) return parseCSV(text)
  throw new Error('Chỉ hỗ trợ file .csv hoặc .json')
}
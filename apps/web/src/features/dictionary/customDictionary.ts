import type { DictResult } from '@ryan/core'
import { settingsRepo } from '@ryan/db'

export const CUSTOM_DICTIONARY_KEY = 'admin_custom_dictionary_entries'

export type CustomDictionaryEntry = DictResult & { word: string }

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let value = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1 }
      else quoted = !quoted
    } else if (char === ',' && !quoted) { values.push(value); value = '' }
    else value += char
  }
  values.push(value)
  return values
}

function normalizeEntry(raw: Record<string, unknown>): CustomDictionaryEntry | null {
  const word = clean(raw.word ?? raw.phrase ?? raw.headword)
  if (!word) return null
  const rawDefinitions = Array.isArray(raw.definitions) ? raw.definitions : []
  const definitions = rawDefinitions
    .map(item => {
      const row = item as Record<string, unknown>
      const meaning = clean(row.meaning ?? row.definition)
      return meaning ? { meaning, example: clean(row.example), exampleVi: clean(row.exampleVi ?? row.example_vi) } : null
    })
    .filter((item): item is { meaning: string; example: string; exampleVi: string } => Boolean(item))
  if (!definitions.length) {
    const meaning = clean(raw.meaning ?? raw.definition)
    if (meaning) definitions.push({ meaning, example: clean(raw.example), exampleVi: clean(raw.exampleVi ?? raw.example_vi) })
  }
  if (!definitions.length) return null
  const list = (value: unknown) => Array.isArray(value)
    ? value.map(clean).filter(Boolean)
    : clean(value).split(/[|;]/).map(item => item.trim()).filter(Boolean)
  return {
    word,
    pos: clean(raw.pos) || undefined,
    level: clean(raw.level) || undefined,
    ipaUS: clean(raw.ipaUS ?? raw.ipa_us) || undefined,
    ipaUK: clean(raw.ipaUK ?? raw.ipa_uk) || undefined,
    definitions,
    collocations: list(raw.collocations),
    synonyms: list(raw.synonyms),
  }
}

export function parseDictionaryJson(text: string): CustomDictionaryEntry[] {
  const parsed = JSON.parse(text) as unknown
  const rows = Array.isArray(parsed)
    ? parsed
    : (parsed && typeof parsed === 'object' && Array.isArray((parsed as { entries?: unknown }).entries)
      ? (parsed as { entries: unknown[] }).entries : [])
  return mergeEntries(rows.map(row => normalizeEntry(row as Record<string, unknown>)).filter(Boolean) as CustomDictionaryEntry[])
}

export function parseDictionaryCsv(text: string): CustomDictionaryEntry[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0]).map(header => header.trim())
  const rows = lines.slice(1).map(line => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
  return mergeEntries(rows.map(normalizeEntry).filter(Boolean) as CustomDictionaryEntry[])
}

function mergeEntries(entries: CustomDictionaryEntry[]): CustomDictionaryEntry[] {
  const byWord = new Map<string, CustomDictionaryEntry>()
  for (const entry of entries) {
    const key = entry.word.toLowerCase().trim()
    const previous = byWord.get(key)
    if (!previous) { byWord.set(key, entry); continue }
    previous.definitions.push(...entry.definitions)
    previous.collocations = [...new Set([...(previous.collocations ?? []), ...(entry.collocations ?? [])])]
    previous.synonyms = [...new Set([...(previous.synonyms ?? []), ...(entry.synonyms ?? [])])]
  }
  return [...byWord.values()]
}

export async function getCustomDictionary(): Promise<CustomDictionaryEntry[]> {
  return (await settingsRepo.getSetting(CUSTOM_DICTIONARY_KEY) as CustomDictionaryEntry[] | undefined) ?? []
}

export async function saveCustomDictionary(entries: CustomDictionaryEntry[]): Promise<void> {
  const current = await getCustomDictionary()
  const byWord = new Map(current.map(entry => [entry.word.toLowerCase().trim(), entry]))
  // A newer Admin import replaces the previous custom row for the same word.
  for (const entry of entries) byWord.set(entry.word.toLowerCase().trim(), entry)
  await settingsRepo.putSetting(CUSTOM_DICTIONARY_KEY, [...byWord.values()])
}

export async function lookupCustomDictionary(word: string): Promise<DictResult | null> {
  const key = word.toLowerCase().trim().replace(/\s+/g, ' ')
  const hit = (await getCustomDictionary()).find(entry => entry.word.toLowerCase().trim() === key)
  return hit ?? null
}

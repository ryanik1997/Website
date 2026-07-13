import fs from 'node:fs'
import path from 'node:path'

const [cefrjFile, c1c2File, dictionaryDir, outputFile] = process.argv.slice(2)
if (!cefrjFile || !c1c2File || !dictionaryDir || !outputFile) {
  console.error('Usage: node scripts/build-offline-cefr-dictionary.mjs <cefrj.csv> <c1c2.csv> <dictionary-dir> <output.json>')
  process.exit(1)
}

function parseCsvLine(line) {
  const fields = []
  let value = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"'
        i += 1
      } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      fields.push(value)
      value = ''
    } else value += char
  }
  fields.push(value)
  return fields
}

function readProfiles(file) {
  return fs.readFileSync(file, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map(line => {
      const [word, pos, level] = parseCsvLine(line)
      return { word: word?.trim(), pos: pos?.trim(), level: level?.trim() }
    })
    .filter(item => item.word && /^[A-Za-z][A-Za-z .'-]*$/.test(item.word) && /^(A2|B1|B2|C1|C2)$/.test(item.level))
}

const dictionaryEntries = new Map()

function extractMeanings(raw) {
  const clean = value => value
    .replace(/\[\d{2}[^\]]*\]/g, '')
    .replace(/^\s*[-–]\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/^;\s*/, '')
    .trim()

  const senses = raw
    .split(/\\n/)
    .filter(line => /^\s*(?:\[\d{2}[^\]]*\]\s*)*[-–]\s+/.test(line))
    .map(clean)
    .filter(Boolean)

  const unique = [...new Set(senses)]
    .filter(sense => sense.length <= 220)
    .slice(0, 4)
  if (unique.length) return unique

  const fallback = clean(raw.replace(/\\n/g, '; ')).slice(0, 220)
  return fallback ? [fallback] : []
}

function extractDictionaryEntry(rawHeadword, raw) {
  const meanings = extractMeanings(raw)
  const definitions = meanings.map(meaning => ({ meaning }))
  let activeDefinition = -1
  const collocations = []

  for (const line of raw.split(/\\n/)) {
    if (/^\s*(?:\[\d{2}[^\]]*\]\s*)*[-–]\s+/.test(line)) {
      const meaning = line.replace(/\[\d{2}[^\]]*\]/g, '').replace(/^\s*[-–]\s*/, '').replace(/\s+/g, ' ').trim()
      activeDefinition = meanings.indexOf(meaning)
      continue
    }
    const example = line.match(/^\s*\[02=\s*([^\]]+)\]\s*(.*)$/)
    if (example && activeDefinition >= 0 && activeDefinition < definitions.length && !definitions[activeDefinition].example) {
      definitions[activeDefinition].example = example[1].trim()
      definitions[activeDefinition].exampleVi = example[2].trim()
    }
    const phrase = line.match(/^\s*\[04!\s*([^\]]+)\]/)
    if (phrase) collocations.push(phrase[1].trim())
  }

  const ipa = rawHeadword.match(/\[\d{2}\/([^/]+)\/\]/)?.[1]?.trim()
  return {
    definitions,
    ...(ipa ? { ipaUS: ipa } : {}),
    ...(collocations.length ? { collocations: [...new Set(collocations)].slice(0, 5) } : {}),
  }
}

for (const name of fs.readdirSync(dictionaryDir).filter(name => /^directoryEng\d+\.csv$/i.test(name))) {
  const content = fs.readFileSync(path.join(dictionaryDir, name), 'utf8').replace(/^\uFEFF/, '')
  for (const line of content.split(/\r?\n/)) {
    const tab = line.indexOf('\t')
    if (tab < 1) continue
    const rawHeadword = line.slice(0, tab).trim()
    // DictionaryForMIDs stores pronunciation after the headword, e.g. "ability [01/ə'biliti/]".
    const word = rawHeadword.replace(/\s+\[\d{2}\/.*$/, '').trim().toLowerCase()
    const entry = extractDictionaryEntry(rawHeadword, line.slice(tab + 1))
    if (word && entry.definitions.length && !dictionaryEntries.has(word)) dictionaryEntries.set(word, entry)
  }
}

const profiles = [...readProfiles(cefrjFile), ...readProfiles(c1c2File)]
const unique = new Map()
for (const item of profiles) {
  const key = item.word.toLowerCase()
  if (!unique.has(key) && dictionaryEntries.has(key)) unique.set(key, item)
}

// Preserve broad coverage: all available A2/B1, then fill progressively through B2-C2.
const quotas = { A2: 1350, B1: 2200, B2: 1200, C1: 650, C2: 600 }
const selected = []
for (const level of Object.keys(quotas)) {
  const candidates = [...unique.values()].filter(item => item.level === level)
  selected.push(...candidates.slice(0, quotas[level]))
}

// If a source revision leaves a quota short, fill from any remaining level up to 6,000.
const selectedKeys = new Set(selected.map(item => item.word.toLowerCase()))
for (const item of unique.values()) {
  if (selected.length >= 6000) break
  if (!selectedKeys.has(item.word.toLowerCase())) {
    selected.push(item)
    selectedKeys.add(item.word.toLowerCase())
  }
}

const entries = selected.slice(0, 6000).map(item => ({
  word: item.word,
  pos: item.pos || undefined,
  level: item.level,
  ...dictionaryEntries.get(item.word.toLowerCase()),
}))

if (entries.length !== 6000) {
  throw new Error(`Offline CEFR pack must contain exactly 6000 entries; received ${entries.length}`)
}
for (const entry of entries) {
  if (!entry.definitions?.length || entry.definitions.length > 4) {
    throw new Error(`Invalid definition blocks for "${entry.word}"`)
  }
  if (entry.definitions.some(definition => !definition.meaning || definition.meaning.length > 220)) {
    throw new Error(`Invalid or oversized meaning for "${entry.word}"`)
  }
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, `${JSON.stringify({ version: 1, entries })}\n`, 'utf8')

const counts = Object.fromEntries(['A2', 'B1', 'B2', 'C1', 'C2'].map(level => [level, entries.filter(e => e.level === level).length]))
console.log(`Generated ${entries.length} entries: ${JSON.stringify(counts)}`)
console.log(`Enrichment: ${entries.filter(e => e.ipaUS).length} IPA, ${entries.filter(e => e.definitions.some(d => d.example && d.exampleVi)).length} bilingual examples, ${entries.filter(e => e.collocations?.length).length} collocations`)

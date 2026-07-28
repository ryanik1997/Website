/**
 * Build offline dictionary Part 3: +6000 more EN→VI entries from GitHub.
 * Skips words already in Part 1 + Part 2.
 *
 * Source: samuraitruong/open-vn-en-dict (MIT)
 *   https://github.com/samuraitruong/open-vn-en-dict
 * Word priority: remaining google-10000 + goodWords not in Part1/2.
 *
 * Output: apps/web/src/features/dictionary/data/offlinePart3.json
 *
 * Run: node scripts/build-dict-part3.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outPath = path.join(root, 'apps/web/src/features/dictionary/data/offlinePart3.json')
const part1Path = path.join(root, 'apps/web/src/features/dictionary/data/offlinePart1.json')
const part2Path = path.join(root, 'apps/web/src/features/dictionary/data/offlinePart2.json')

const TARGET = 6000
const CONCURRENCY = 24
const SOURCE_REPO = 'samuraitruong/open-vn-en-dict'
const SOURCE_URL = `https://raw.githubusercontent.com/${SOURCE_REPO}/master/data`

/** Bỏ function words / từ quá cơ bản, ưu tiên từ nội dung */
const STOP = new Set(
  `
a an the of and to in for on with at by from as is are was were be been being
i you he she it we they me him her us them my your his its our their
this that these those there here then than so if or but not no yes
do does did done doing have has had having will would can could should may might must
am get got go goes going went gone come came
what which who whom whose when where why how
into onto over under about after before between through during without within
up down out off all any each few more most other some such only own same
also just very too much many more less most
yes no ok okay etc etcetera
`.trim().split(/\s+/),
)

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'ryan-english-dict-builder/1.0', Accept: '*/*' } },
      res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location).then(resolve, reject)
          return
        }
        const chunks = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            body: Buffer.concat(chunks).toString('utf8'),
          })
        })
      },
    )
    req.on('error', reject)
    req.setTimeout(20000, () => {
      req.destroy(new Error('timeout'))
    })
  })
}

function stripHtml(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r/g, '')
}

function cleanIpa(raw) {
  if (!raw) return undefined
  let s = String(raw).trim()
  // "[in'vaiərənmənt]" or multiple forms
  s = s.replace(/^\[+|\]+$/g, '').replace(/^\/+|\/+$/g, '').trim()
  // take first pronunciation only
  s = s.split(/[;,|]/)[0].trim()
  s = s.replace(/\[.*?\]/g, '').trim()
  // drop junk
  if (!s || s.length > 60 || /[\[\]]/.test(s)) return undefined
  if (!/[a-zɑæʌɔəɛɪʊiɝɚθðʃʒŋˈˌːˈˌ'a-z]/i.test(s)) return undefined
  return `/${s}/`
}

function mapPosVi(token) {
  const t = (token || '').toLowerCase()
  if (t.includes('danh từ')) return 'Danh từ'
  if (t.includes('động từ')) return 'Động từ'
  if (t.includes('tính từ')) return 'Tính từ'
  if (t.includes('phó từ') || t.includes('trạng từ')) return 'Phó từ'
  if (t.includes('giới từ')) return 'Giới từ'
  if (t.includes('liên từ')) return 'Liên từ'
  if (t.includes('đại từ')) return 'Đại từ'
  if (t.includes('thán từ')) return 'Thán từ'
  if (t.includes('hạn định')) return 'Hạn định từ'
  return undefined
}

function looksVi(s) {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(s)
}

function parseEntry(word, json) {
  const enVn = json?.en_vn?.data
  if (!enVn) return null
  const html = enVn.content
  if (!html || html === 'null') return null

  const pronounce = cleanIpa(enVn.pronounce)
  const text = stripHtml(html)
  const lines = text
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !/^[◘*■⁃]$/.test(s))
    .filter(s => !/^Từ điển/i.test(s))

  let pos
  const meanings = []
  const examples = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const p = mapPosVi(line)
    if (p) {
      pos = pos || p
      continue
    }
    // skip phonetic-looking lines
    if (/^[\[\/].+[\]\/]$/.test(line)) continue
    if (line.length < 2) continue

    // English example often followed by Vietnamese translation
    const next = lines[i + 1]
    const isEn =
      /^[A-Za-z]/.test(line) &&
      !looksVi(line) &&
      line.split(/\s+/).length >= 4 &&
      line.length > 20
    if (isEn && next && looksVi(next)) {
      examples.push({ en: line, vi: next })
      i++
      continue
    }
    if (looksVi(line) && line.length >= 2 && line.length <= 180) {
      // skip pure English leftovers
      if (!/^[A-Za-z0-9 ,.'()\-]+$/.test(line)) {
        meanings.push(line.replace(/^[■\-•\s]+/, '').trim())
      }
    }
  }

  // unique meanings
  const seenM = new Set()
  const uniqMeanings = []
  for (const m of meanings) {
    const k = m.toLowerCase()
    if (seenM.has(k)) continue
    if (/^(danh từ|động từ|tính từ|phó từ)/i.test(m)) continue
    // skip too short / meta / useless
    if (m.length < 3) continue
    if (/^(như|cũng|và|của|cái|con|một|các|những|the|a|an)$/i.test(m)) continue
    if (/mẫu tự|mạo từ|dùng để chỉ|số nhiều|bảng mẫu tự/i.test(m)) continue
    seenM.add(k)
    uniqMeanings.push(m)
    if (uniqMeanings.length >= 4) break
  }
  if (!uniqMeanings.length) return null

  const meaning = uniqMeanings.slice(0, 3).join('; ')
  if (!meaning || meaning.length < 3) return null

  const ex = examples[0]
  const finalExample =
    ex?.en && ex.en.length > 12 && /[a-z]/i.test(ex.en)
      ? ex.en.replace(/\s+/g, ' ').trim()
      : `Learners often study the word "${word}".`

  return {
    phrase: word,
    meaning: meaning.slice(0, 300),
    example: finalExample.slice(0, 280),
    ipaUS: pronounce,
    ipaUK: pronounce,
    pos: pos || 'Danh từ',
  }
}

async function mapPool(items, limit, worker) {
  let i = 0
  const results = []
  async function run() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await worker(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()))
  return results
}

async function main() {
  console.log('Loading frequency list + goodWords…')
  const freqRes = await get(
    'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears.txt',
  )
  if (freqRes.status !== 200) throw new Error('Failed to download frequency list: ' + freqRes.status)
  const freqWords = freqRes.body
    .split(/\n+/)
    .map(s => s.trim().toLowerCase())
    .filter(w => /^[a-z][a-z'-]*[a-z]$|^[a-z]$/.test(w) && w.length >= 2 && w.length <= 24)

  const goodRes = await get(
    `https://raw.githubusercontent.com/${SOURCE_REPO}/master/goodWords.json`,
  )
  if (goodRes.status !== 200) throw new Error('Failed to download goodWords: ' + goodRes.status)
  const good = JSON.parse(goodRes.body)
  const goodSet = new Set(Object.keys(good).map(k => k.toLowerCase()))

  const part1 = JSON.parse(fs.readFileSync(part1Path, 'utf8'))
  const part2 = JSON.parse(fs.readFileSync(part2Path, 'utf8'))
  const existing = new Set(
    [...(part1.cards || []), ...(part2.cards || [])]
      .map(c => String(c.phrase || '').toLowerCase().trim())
      .filter(Boolean),
  )
  console.log('already have', existing.size, 'words (part1+part2)')

  // candidates: remaining frequency words, then goodWords (prefer mid length 5–12)
  const candidates = []
  const seen = new Set()
  for (const w of freqWords) {
    if (existing.has(w) || seen.has(w) || !goodSet.has(w)) continue
    if (STOP.has(w) || w.includes("'") || w.length < 3) continue
    seen.add(w)
    candidates.push(w)
  }
  const rest = [...goodSet].filter(
    w => /^[a-z]{3,18}$/.test(w) && !seen.has(w) && !existing.has(w) && !STOP.has(w),
  )
  // prefer content-length words for part3
  rest.sort((a, b) => {
    const score = w => (w.length >= 5 && w.length <= 12 ? 0 : 1)
    return score(a) - score(b) || a.length - b.length || a.localeCompare(b)
  })
  for (const w of rest) {
    if (candidates.length >= TARGET * 5) break
    candidates.push(w)
  }
  console.log('candidates', candidates.length, 'need', TARGET)

  const cards = []
  let tried = 0
  let failed = 0
  const queue = candidates.slice()

  async function fetchOne(word) {
    tried++
    try {
      const { status, body } = await get(`${SOURCE_URL}/${encodeURIComponent(word)}.json`)
      if (status !== 200 || !body || body.length < 10) {
        failed++
        return null
      }
      let json
      try {
        json = JSON.parse(body)
      } catch {
        failed++
        return null
      }
      const card = parseEntry(word, json)
      if (!card) {
        failed++
        return null
      }
      return card
    } catch {
      failed++
      return null
    }
  }

  // process in batches until TARGET
  let offset = 0
  while (cards.length < TARGET && offset < queue.length) {
    const batch = queue.slice(offset, offset + 400)
    offset += batch.length
    console.log(`fetch batch ${offset}/${queue.length}, have ${cards.length}/${TARGET}…`)
    const got = await mapPool(batch, CONCURRENCY, fetchOne)
    for (const c of got) {
      if (!c) continue
      const k = c.phrase.toLowerCase()
      if (existing.has(k)) continue
      existing.add(k)
      cards.push(c)
      if (cards.length >= TARGET) break
    }
  }

  const out = {
    version: 1,
    source: {
      repo: SOURCE_REPO,
      url: `https://github.com/${SOURCE_REPO}`,
      license: 'MIT',
      frequency: 'first20hours/google-10000-english',
      count: cards.length,
      generatedAt: new Date().toISOString(),
    },
    cards,
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out), 'utf8')
  console.log('wrote', outPath)
  console.log({
    cards: cards.length,
    tried,
    failed,
    mb: (fs.statSync(outPath).size / 1024 / 1024).toFixed(2),
    sample: cards.slice(0, 3),
  })
  if (cards.length < TARGET) {
    console.warn(`WARNING: only got ${cards.length}/${TARGET}`)
    process.exitCode = 1
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

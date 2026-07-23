/**
 * Đổ IPA US/UK vào offline multi-word packs (phrasal / idioms / collocations).
 * Dùng CMUdict ARPABET → IPA (cùng heuristic với enrich-preset-vocab.mjs).
 *
 * Run: node scripts/enrich-dict-multi-ipa.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { dictionary: CMU } = require('cmu-pronouncing-dictionary')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dataDir = path.join(root, 'apps/web/src/features/dictionary/data')

const FILES = ['offlinePhrasal.json', 'offlineIdioms.json', 'offlineCollocations.json']

const ARPABET_IPA = {
  AA: 'ɑ', AE: 'æ', AH: 'ʌ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ',
  B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', EH: 'ɛ', ER: 'ɝ', EY: 'eɪ',
  F: 'f', G: 'g', HH: 'h', IH: 'ɪ', IY: 'i', JH: 'dʒ',
  K: 'k', L: 'l', M: 'm', N: 'n', NG: 'ŋ', OW: 'oʊ', OY: 'ɔɪ',
  P: 'p', R: 'r', S: 's', SH: 'ʃ', T: 't', TH: 'θ',
  UH: 'ʊ', UW: 'u', V: 'v', W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ',
}

const VOWELS = new Set([
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW',
])

// Function words often reduced in connected speech — optional weak forms for multi-word
const WEAK_US = {
  a: 'ə',
  an: 'ən',
  the: 'ðə',
  of: 'əv',
  to: 'tə',
  for: 'fər',
  and: 'ənd',
  or: 'ər',
  but: 'bət',
  at: 'ət',
  from: 'frəm',
  in: 'ɪn',
  on: 'ɑn',
  as: 'əz',
  that: 'ðət',
  with: 'wɪð',
  your: 'jər',
  you: 'jə',
  his: 'ɪz',
  her: 'hər',
  their: 'ðər',
  our: 'ɑr',
  my: 'maɪ',
  me: 'mi',
  him: 'ɪm',
  them: 'ðəm',
  us: 'əs',
  is: 'ɪz',
  are: 'ər',
  was: 'wəz',
  were: 'wər',
  be: 'bi',
  been: 'bɪn',
  have: 'həv',
  has: 'həz',
  had: 'həd',
  do: 'də',
  does: 'dəz',
  did: 'dɪd',
  can: 'kən',
  could: 'kəd',
  would: 'wəd',
  should: 'ʃəd',
  will: 'wəl',
  shall: 'ʃəl',
  must: 'məst',
  some: 'səm',
  any: 'əni',
  one: 'wʌn',
  there: 'ðər',
  this: 'ðɪs',
  these: 'ðiz',
  those: 'ðoʊz',
  it: 'ɪt',
  its: 'ɪts',
  not: 'nɑt',
  no: 'noʊ',
  if: 'ɪf',
  by: 'baɪ',
  up: 'ʌp',
  out: 'aʊt',
  off: 'ɔf',
  over: 'ˈoʊvər',
  into: 'ˈɪntu',
  onto: 'ˈɑntu',
  about: 'əˈbaʊt',
  after: 'ˈæftər',
  before: 'bɪˈfɔr',
  under: 'ˈʌndər',
  between: 'bɪˈtwin',
  through: 'θru',
  during: 'ˈdʊrɪŋ',
  without: 'wɪˈðaʊt',
  against: 'əˈɡɛnst',
  among: 'əˈmʌŋ',
  across: 'əˈkrɔs',
  around: 'əˈraʊnd',
  along: 'əˈlɔŋ',
  toward: 'təˈwɔrd',
  towards: 'təˈwɔrdz',
  until: 'ənˈtɪl',
  since: 'sɪns',
  while: 'waɪl',
  when: 'wɛn',
  where: 'wɛr',
  what: 'wʌt',
  who: 'hu',
  which: 'wɪtʃ',
  how: 'haʊ',
  why: 'waɪ',
  all: 'ɔl',
  each: 'itʃ',
  every: 'ˈɛvri',
  both: 'boʊθ',
  few: 'fju',
  many: 'ˈmɛni',
  much: 'mʌtʃ',
  more: 'mɔr',
  most: 'moʊst',
  other: 'ˈʌðər',
  another: 'əˈnʌðər',
  such: 'sʌtʃ',
  own: 'oʊn',
  same: 'seɪm',
  so: 'soʊ',
  than: 'ðən',
  then: 'ðɛn',
  too: 'tu',
  very: 'ˈvɛri',
  just: 'dʒʌst',
  only: 'ˈoʊnli',
  also: 'ˈɔlsoʊ',
  even: 'ˈivən',
  still: 'stɪl',
  already: 'ɔlˈrɛdi',
  always: 'ˈɔlweɪz',
  never: 'ˈnɛvər',
  often: 'ˈɔfən',
  sometimes: 'ˈsʌmtaɪmz',
  here: 'hɪr',
  now: 'naʊ',
  today: 'təˈdeɪ',
  tomorrow: 'təˈmɑroʊ',
  yesterday: 'ˈjɛstərdeɪ',
}

function arpabetToIpa(arpabet) {
  if (!arpabet) return null
  const raw = arpabet.split('#')[0].trim()
  if (!raw) return null
  const phones = raw
    .split(/\s+/)
    .map(ph => {
      const m = ph.match(/^([A-Z]+)([012])?$/)
      if (!m) return null
      return { base: m[1], stress: m[2] || '0', ipa: ARPABET_IPA[m[1]] }
    })
    .filter(p => p && p.ipa)

  let out = ''
  let i = 0
  while (i < phones.length) {
    const p = phones[i]
    if (VOWELS.has(p.base) && (p.stress === '1' || p.stress === '2')) {
      out += (p.stress === '1' ? 'ˈ' : 'ˌ') + p.ipa
      i++
      continue
    }
    out += p.ipa
    i++
  }
  // tˈeɪk → ˈteɪk
  out = out.replace(/([bcdfghjklmnpqrstvwxyzʃʒθðŋɡ]+)([ˈˌ])/gi, '$2$1')
  return out || null
}

function lookupArpabet(word) {
  const w = word.toLowerCase().replace(/[^a-z']/g, '')
  if (!w) return null
  if (CMU[w]) return CMU[w]
  for (const alt of [
    w.replace(/'s$/, ''),
    w.replace(/s$/, ''),
    w.replace(/es$/, ''),
    w.replace(/ed$/, ''),
    w.replace(/ing$/, ''),
    w.replace(/ies$/, 'y'),
  ]) {
    if (alt && alt.length >= 2 && CMU[alt]) return CMU[alt]
  }
  if (CMU[`${w}(2)`]) return CMU[`${w}(2)`]
  return null
}

function usToUkIpa(us) {
  if (!us) return null
  let uk = us
  uk = uk.replace(/ɝ/g, 'ɜː')
  uk = uk.replace(/ɚ/g, 'ə')
  // non-rhotic-ish: drop r before consonant / end
  uk = uk.replace(/r(?![aeiouɑæʌɔaɪeɪoʊɔɪʊiɛɪɝɜəjw])/g, '')
  // US oʊ → UK əʊ (approx)
  uk = uk.replace(/oʊ/g, 'əʊ')
  // US ɑ in cot → often ɒ in UK (light)
  // keep conservative for multi-word
  return uk || us
}

/**
 * Build phrase IPA from word tokens.
 * @param {string} phrase
 * @returns {{ us: string|null, uk: string|null, covered: number, total: number }}
 */
export function phraseIpa(phrase) {
  const tokens = phrase
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (!tokens.length) return { us: null, uk: null, covered: 0, total: 0 }

  const usParts = []
  const ukParts = []
  let covered = 0
  const multi = tokens.length > 1
  for (const t of tokens) {
    // hyphenated compounds: try whole then parts
    const clean = t.replace(/^['-]+|['-]+$/g, '')
    if (!clean) continue

    let us = null
    // Function words in multi-word: prefer weak forms (a→ə not ʌ)
    if (multi && WEAK_US[clean]) {
      us = WEAK_US[clean]
    }
    if (!us) {
      const arp = lookupArpabet(clean)
      us = arpabetToIpa(arp)
    }
    // hyphenated: five-finger → five + finger
    if (!us && clean.includes('-')) {
      const bits = clean.split('-').filter(Boolean)
      const bitIpa = bits.map(b => {
        if (WEAK_US[b]) return WEAK_US[b]
        return arpabetToIpa(lookupArpabet(b))
      })
      if (bitIpa.every(Boolean)) us = bitIpa.join('-')
    }
    // rare latin/loan: keep orthography only if at least one other token has IPA
    if (us) {
      covered++
      usParts.push(us)
      ukParts.push(usToUkIpa(us) || us)
    } else {
      usParts.push(clean)
      ukParts.push(clean)
    }
  }
  if (!covered) return { us: null, uk: null, covered: 0, total: tokens.length }
  return {
    us: `/${usParts.join(' ')}/`,
    uk: `/${ukParts.join(' ')}/`,
    covered,
    total: tokens.length,
  }
}

function enrichFile(name) {
  const fp = path.join(dataDir, name)
  if (!fs.existsSync(fp)) {
    console.warn('skip missing', fp)
    return null
  }
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'))
  const cards = data.cards || []
  let withIpa = 0
  let fullCover = 0
  let partial = 0
  let none = 0

  for (const c of cards) {
    const { us, uk, covered, total } = phraseIpa(c.phrase || '')
    if (us) {
      c.ipaUS = us
      c.ipaUK = uk || us
      withIpa++
      if (covered === total) fullCover++
      else partial++
    } else {
      delete c.ipaUS
      delete c.ipaUK
      none++
    }
  }

  data.source = {
    ...(data.source || {}),
    ipa: {
      engine: 'cmu-pronouncing-dictionary + arpabet→ipa',
      enrichedAt: new Date().toISOString(),
      withIpa,
      fullCover,
      partial,
      none,
    },
  }

  fs.writeFileSync(fp, JSON.stringify(data), 'utf8')
  const mb = (fs.statSync(fp).size / 1024 / 1024).toFixed(2)
  console.log(name, {
    total: cards.length,
    withIpa,
    fullCover,
    partial,
    none,
    mb: `${mb} MB`,
  })
  return { name, total: cards.length, withIpa, fullCover, partial, none }
}

function main() {
  console.log('Enriching multi-word packs with IPA…')
  const stats = FILES.map(enrichFile).filter(Boolean)
  // smoke samples
  for (const name of FILES) {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'))
    const samples = (data.cards || []).slice(0, 3).map(c => ({
      phrase: c.phrase,
      ipaUS: c.ipaUS,
      ipaUK: c.ipaUK,
    }))
    console.log('sample', name, samples)
  }
  const totalWith = stats.reduce((s, x) => s + x.withIpa, 0)
  const total = stats.reduce((s, x) => s + x.total, 0)
  console.log('DONE', { total, totalWith, rate: ((totalWith / total) * 100).toFixed(1) + '%' })
}

main()

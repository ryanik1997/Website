/**
 * Enrich preset-singles.json + preset-phrases.json with:
 * - ipaUS / ipaUK (from CMUdict ARPABET → IPA; UK ≈ US with light heuristics)
 * - natural English example sentences embedding the phrase
 *
 * Run: node scripts/enrich-preset-vocab.mjs
 * Then re-open /app/vocab for seed patch (v4).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { dictionary: CMU } = require('cmu-pronouncing-dictionary')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const seedDir = path.join(root, 'apps/web/src/features/vocab/seedData')

// ARPABET → IPA (US)
const ARPABET_IPA = {
  AA: 'ɑ', AE: 'æ', AH: 'ʌ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ',
  B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', EH: 'ɛ', ER: 'ɝ', EY: 'eɪ',
  F: 'f', G: 'g', HH: 'h', IH: 'ɪ', IY: 'i', JH: 'dʒ',
  K: 'k', L: 'l', M: 'm', N: 'n', NG: 'ŋ', OW: 'oʊ', OY: 'ɔɪ',
  P: 'p', R: 'r', S: 's', SH: 'ʃ', T: 't', TH: 'θ',
  UH: 'ʊ', UW: 'u', V: 'v', W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ',
}

const VOWELS = new Set(['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'])

function arpabetToIpa(arpabet) {
  if (!arpabet) return null
  const raw = arpabet.split('#')[0].trim()
  if (!raw) return null
  const phones = raw.split(/\s+/).map(ph => {
    const m = ph.match(/^([A-Z]+)([012])?$/)
    if (!m) return null
    return { base: m[1], stress: m[2] || '0', ipa: ARPABET_IPA[m[1]] }
  }).filter(p => p && p.ipa)

  // Gắn stress vào đầu âm tiết (consonants trước vowel stress + vowel)
  let out = ''
  let i = 0
  while (i < phones.length) {
    const p = phones[i]
    if (VOWELS.has(p.base) && (p.stress === '1' || p.stress === '2')) {
      // lùi về consonants đầu syllable
      let j = i
      while (j > 0 && !VOWELS.has(phones[j - 1].base) && phones[j - 1].stress === '0') j--
      // nếu đã ghi consonants trước đó, chèn stress trước vowel thôi
      if (j === i) {
        out += (p.stress === '1' ? 'ˈ' : 'ˌ') + p.ipa
      } else {
        // rebuild last consonants with stress prefix — simpler: stress before vowel
        out += (p.stress === '1' ? 'ˈ' : 'ˌ') + p.ipa
      }
      i++
      continue
    }
    out += p.ipa
    i++
  }
  // Prefer stress at syllable start for common CVC: move ˈ before leading consonants of stressed nucleus
  // Post-process: tˈeɪk → ˈteɪk
  out = out.replace(/([bcdfghjklmnpqrstvwxyzʃʒθðŋ]+)([ˈˌ])/gi, '$2$1')
  return out || null
}

function lookupArpabet(word) {
  const w = word.toLowerCase().replace(/[^a-z']/g, '')
  if (!w) return null
  if (CMU[w]) return CMU[w]
  // try without trailing s/es/ed/ing
  for (const alt of [w.replace(/'s$/, ''), w.replace(/s$/, ''), w.replace(/es$/, ''), w.replace(/ed$/, ''), w.replace(/ing$/, '')]) {
    if (alt && CMU[alt]) return CMU[alt]
  }
  // multi-key variants like hello(2)
  const key2 = `${w}(2)`
  if (CMU[key2]) return CMU[key2]
  return null
}

function usToUkIpa(us) {
  if (!us) return null
  // light British-ish heuristics (approximate, not full dialect model)
  let uk = us
  uk = uk.replace(/ɝ/g, 'ɜː')
  uk = uk.replace(/ɚ/g, 'ə')
  // ɑ often → ɒ in some contexts; keep conservative
  uk = uk.replace(/æ/g, 'æ') // keep
  // rhotic: drop r after vowel if we used r from CMU — CMU has R phone → ɾ-like r
  // Remove non-prevocalic /r/ roughly: r before consonant or end
  uk = uk.replace(/r(?![aeiouɑæʌɔaɪeɪoʊɔɪʊiɛɪɝɜəjw])/g, '')
  return uk || us
}

function phraseIpa(phrase) {
  const tokens = phrase
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (!tokens.length) return { us: null, uk: null }

  const usParts = []
  const ukParts = []
  let any = false
  for (const t of tokens) {
    const clean = t.replace(/^['-]+|['-]+$/g, '')
    const arp = lookupArpabet(clean)
    const us = arpabetToIpa(arp)
    if (us) {
      any = true
      usParts.push(us)
      ukParts.push(usToUkIpa(us) || us)
    } else {
      // keep token as-is placeholder so user sees something for missing CMU entries
      usParts.push(clean)
      ukParts.push(clean)
    }
  }
  if (!any) return { us: null, uk: null }
  return {
    us: `/${usParts.join(' ')}/`,
    uk: `/${ukParts.join(' ')}/`,
  }
}

function hash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function article(word) {
  const w = word.trim().toLowerCase()
  if (!w) return 'a'
  // acronyms / leading vowel sound (simple heuristic)
  if (/^[aeiou]/.test(w)) return 'an'
  if (/^hour|^honest|^honor|^heir/.test(w)) return 'an'
  if (/^uni|^eu|^one|^user|^uk/.test(w)) return 'a'
  return 'a'
}

const PERSON_WORDS = new Set(`
doctor nurse teacher student manager client patient guest chef pilot lawyer judge
artist actor author writer driver player worker partner colleague neighbor pharmacist
engineer scientist researcher developer designer analyst consultant officer agent
assistant director executive employee employer applicant candidate customer user
member leader owner founder investor entrepreneur adult child person people man woman
boy girl friend stranger visitor passenger tourist resident citizen consumer supplier
vendor shareholder stakeholder tutor mentor coach athlete coach singer dancer musician
photographer journalist reporter editor publisher librarian accountant banker
salesperson salesperson salesman saleswoman waiter waitress bartender receptionist
secretary policeman policewoman firefighter soldier farmer builder carpenter plumber
electrician mechanic programmer hacker admin administrator
`.trim().split(/\s+/).map(s => s.toLowerCase()))

const PERSON_SUFFIX_RE = /(ist|ician|grapher|logist|ographer|wright|maker|keeper|monger)$/i

const ABSTRACT_RE =
  /(tion|sion|ment|ness|ity|ism|ship|hood|ance|ence|age|ure)$/i

const MASS_RE =
  /^(water|air|money|time|information|knowledge|advice|research|evidence|equipment|furniture|traffic|weather|music|news|progress|success|failure|health|education|energy|power|data|software|hardware|privacy|security|growth|inflation|poverty|freedom|justice|peace|love|happiness|anger|stress|anxiety|pollution|waste|oil|gas|food|rice|bread|coffee|tea|sugar|salt|milk|homework|work|fun|luck|space|room)$/i

const PHRASAL_START =
  /^(get|go|take|make|look|put|set|come|run|break|give|turn|check|work|carry|find|point|figure|deal|focus|depend|rely|lead|result|consist|account|refer|relate|contribute|respond|adapt|belong|apply|prepare|search|wait|ask|pay|care|think|talk|worry|learn|know|suffer|recover|protect|prevent|keep|differ|benefit|hear|escape|separate|cut|drop|end|fall|hand|hang|hold|let|live|move|pass|pick|pull|show|shut|sit|stand|throw|try|use|wake|watch|wear|wipe|bring|call|fill|log|sign|switch|write|roll|scale|phase|lay|hire|fire|boost|raise|meet|miss|draw|launch|enter|gain|close|schedule|follow|start|train|claim|submit|review|approve|reject|accept|negotiate|reach|settle|file|comply|place|ship|track)\b/i

function pick(arr, h) {
  return arr[h % arr.length]
}

function isPersonNoun(word) {
  const w = word.toLowerCase()
  if (PERSON_WORDS.has(w)) return true
  if (PERSON_SUFFIX_RE.test(w)) return true
  return false
}

function makeExample(phrase, pos = '') {
  const p = phrase.trim()
  const posL = (pos || '').toLowerCase()
  const h = hash(p)
  const lower = p.toLowerCase()
  const multi = /\s/.test(p)

  // --- Phrasal / multi-word verb-like ---
  if (
    posL.includes('cụm động từ') ||
    posL.includes('phrasal') ||
    (multi && PHRASAL_START.test(p))
  ) {
    const parts = p.split(/\s+/)
    const particle =
      parts.length === 2 &&
      /^(up|off|on|out|down|away|back|over|in|through|along|around|apart|aside|forward)$/i.test(
        parts[1],
      )
    if (particle) {
      const [v, part] = parts
      return pick([
        `She decided to ${v} it ${part} later.`,
        `Can you ${v} this ${part} for me?`,
        `I will ${v} the form ${part} tomorrow.`,
        `They had to ${v} the plan ${part} quickly.`,
        `Please ${v} it ${part} carefully.`,
        `He tried to ${v} everything ${part} at once.`,
      ], h)
    }
    if (parts.length === 2) {
      // look after, depend on, deal with…
      return pick([
        `You should ${p} this carefully.`,
        `She needs to ${p} the problem soon.`,
        `They always ${p} difficult situations well.`,
        `I will ${p} the details tomorrow.`,
        `Please ${p} the customer first.`,
        `He learned to ${p} stress at work.`,
      ], h)
    }
    return pick([
      `She decided to ${p} after thinking carefully.`,
      `You may need to ${p} in this situation.`,
      `They had to ${p} during the meeting.`,
      `I will try to ${p} tomorrow morning.`,
      `He learned how to ${p} at work.`,
      `Please ${p} carefully next time.`,
    ], h)
  }

  // --- Multi-word noun phrases (climate change, market research…) ---
  if (multi && !PHRASAL_START.test(p)) {
    return pick([
      `${p.charAt(0).toUpperCase() + p.slice(1)} is a major issue in many countries.`,
      `Experts are studying ${p} more closely this year.`,
      `The report focuses on ${p} and its effects.`,
      `We discussed ${p} in class yesterday.`,
      `Understanding ${p} helps you follow the news.`,
      `Governments often debate ${p} in public meetings.`,
    ], h)
  }

  // --- Verbs ---
  if (posL.includes('động từ') && !posL.includes('cụm')) {
    return pick([
      `Please ${p} the form before you leave.`,
      `Students should ${p} the main ideas carefully.`,
      `They ${p} every problem step by step.`,
      `I always ${p} before making a decision.`,
      `Teachers help students ${p} new skills.`,
      `We need to ${p} this together as a team.`,
    ], h)
  }

  // --- Adjectives ---
  if (posL.includes('tính từ')) {
    const art = article(p)
    return pick([
      `It was ${art} ${p} decision for the whole team.`,
      `She gave ${art} ${p} answer during the interview.`,
      `This is ${art} ${p} topic for beginners.`,
      `They found ${art} ${p} solution to the problem.`,
      `The results look ${p} after the final test.`,
      `His explanation was clear and ${p}.`,
    ], h)
  }

  // --- Adverbs ---
  if (posL.includes('trạng từ')) {
    return pick([
      `She spoke ${p} during the presentation.`,
      `He finished the task ${p} and on time.`,
      `Please write your answers ${p}.`,
      `The team worked ${p} all afternoon.`,
      `They answered every question ${p}.`,
      `You should read the instructions ${p}.`,
    ], h)
  }

  // --- Nouns: order mass → abstract → person → default ---
  if (MASS_RE.test(lower)) {
    return pick([
      `${p.charAt(0).toUpperCase() + p.slice(1)} is essential in daily life.`,
      `We need more ${p} to finish this project.`,
      `Too much ${p} can cause serious problems.`,
      `People often underestimate the value of ${p}.`,
      `Access to ${p} is still limited in some areas.`,
      `The quality of ${p} has improved recently.`,
    ], h)
  }

  // -ment/-tion abstract, but skip countable school/office items
  const countableAbstract =
    /^(assignment|apartment|document|department|instrument|moment|element|statement|agreement|appointment|argument|comment|payment|equipment|environment|government|investment|apartment|restaurant|department)$/i.test(
      lower,
    )
  if (ABSTRACT_RE.test(lower) && !countableAbstract) {
    return pick([
      `${p.charAt(0).toUpperCase() + p.slice(1)} plays a key role in modern society.`,
      `The study focuses on ${p} among young people.`,
      `Better ${p} can lead to better results.`,
      `They discussed the importance of ${p}.`,
      `Recent research has examined ${p} carefully.`,
      `Many people benefit from better ${p}.`,
    ], h)
  }

  if (isPersonNoun(lower)) {
    const art = article(p)
    return pick([
      `The ${p} explained everything clearly.`,
      `She works as ${art} ${p} in a large hospital.`,
      `I asked the ${p} for more information.`,
      `A good ${p} needs patience and skill.`,
      `He wants to become ${art} ${p} after graduation.`,
      `The ${p} helped us solve the problem.`,
    ], h)
  }

  // Default countable noun / object / concept
  const art = article(p)
  return pick([
    `I found ${art} ${p} in the textbook.`,
    `The ${p} was harder than I expected.`,
    `She wrote the ${p} carefully in her notebook.`,
    `We need ${art} clear ${p} for this lesson.`,
    `Can you explain the ${p} again?`,
    `There is ${art} useful ${p} on page ten.`,
  ], h)
}

function enrichList(cards) {
  let withIpa = 0
  let noIpa = 0
  for (const c of cards) {
    const { us, uk } = phraseIpa(c.phrase)
    if (us) {
      c.ipaUS = us
      c.ipaUK = uk || us
      withIpa++
    } else {
      delete c.ipaUS
      delete c.ipaUK
      noIpa++
    }
    c.example = makeExample(c.phrase, c.pos || '')
  }
  return { withIpa, noIpa }
}

function enrichFile(name) {
  const fp = path.join(seedDir, name)
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'))
  let withIpa = 0
  let noIpa = 0
  let total = 0
  for (const g of Object.keys(data)) {
    const r = enrichList(data[g])
    withIpa += r.withIpa
    noIpa += r.noIpa
    total += data[g].length
  }
  fs.writeFileSync(fp, JSON.stringify(data), 'utf8')
  console.log(name, { total, withIpa, noIpa, mb: (fs.statSync(fp).size / 1024 / 1024).toFixed(2) })
  // sample
  const sample = data.ielts?.[0]
  if (sample) console.log('  sample', JSON.stringify(sample))
}

console.log('CMU entries', Object.keys(CMU).length)
enrichFile('preset-singles.json')
enrichFile('preset-phrases.json')

// bump wrapper version
const tsPath = path.join(seedDir, 'presetVocabCards.ts')
let ts = fs.readFileSync(tsPath, 'utf8')
ts = ts.replace(/PRESET_VOCAB_CARDS_VERSION = \d+/, 'PRESET_VOCAB_CARDS_VERSION = 5')
if (!ts.includes('Enrich IPA')) {
  ts = ts.replace(
    '/** Auto-generated preset seed: 100 singles + 100 phrases per deck.',
    '/** Auto-generated preset seed: 100 singles + 100 phrases per deck (+ IPA + natural examples).\n * Enrich: node scripts/enrich-preset-vocab.mjs',
  )
}
fs.writeFileSync(tsPath, ts, 'utf8')
console.log('bumped PRESET_VOCAB_CARDS_VERSION to 5')

// Quick sanity: pharmacist example
const singles = JSON.parse(fs.readFileSync(path.join(seedDir, 'preset-singles.json'), 'utf8'))
const hit = Object.values(singles).flat().find(c => c.phrase === 'pharmacist')
if (hit) console.log('pharmacist example →', hit.example)

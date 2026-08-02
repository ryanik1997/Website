/**
 * Build global catalog from Tainguyen/ bundles.
 * - Copies media → apps/web/public/catalog/
 * - Emits processed exam JSON → packages/catalog/data/
 *
 * Run: node scripts/build-catalog.mjs
 *      node scripts/build-catalog.mjs --if-present   # skip if no Tainguyen (CI/Vercel)
 *
 * Path: TAINGUYEN_PATH env, else <repo>/Tainguyen (junction OK)
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { REPO_ROOT, resolveTainguyenPath, tainguyenExists } from './tainguyen-path.mjs'
import { convertFcePagesToReadingExam, loadFceTestExamJson } from './reading/fce-b2-pages-to-parts.mjs'
import { mergeAiRepairs } from './reading/merge-fce-b2-ai-repairs.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = REPO_ROOT
const TAINGUYEN = resolveTainguyenPath()
const PUBLIC_CATALOG = path.join(ROOT, 'apps/web/public/catalog')
const DATA_OUT = path.join(ROOT, 'packages/catalog/data')
const OUT_READING = path.join(ROOT, 'out-reading')
const READING_CRAWL = path.join(TAINGUYEN, 'Crawl', 'Reading_ITELTS')
const IF_PRESENT =
  process.argv.includes('--if-present')
  || process.env.SKIP_CATALOG_BUILD === '1'
  || process.env.VERCEL === '1'

function readCliArg(name) {
  const args = process.argv.slice(2)
  const inline = args.find(arg => arg.startsWith(`--${name}=`))
  if (inline) return inline.slice(name.length + 3)
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] ?? null : null
}

const ONLY_EXAM_ID = readCliArg('only-exam')

const STATIC_BUNDLES = [
  {
    kind: 'reading',
    slug: 'ket-a2-test1',
    examId: 'catalog-reading-ket-a2-test1',
    sourceDir: 'ket-reading-test1',
    cambridgeLevel: 'a2',
    examTrack: 'cambridge',
  },
  {
    kind: 'reading',
    slug: 'pet-b1-test1',
    examId: 'catalog-reading-pet-b1-test1',
    sourceDir: 'pet-reading-test1',
    cambridgeLevel: 'b1',
    examTrack: 'cambridge',
  },
  {
    kind: 'reading',
    slug: 'fce-b2-test1',
    examId: 'catalog-reading-fce-b2-test1',
    sourceDir: 'fce-reading-test1',
    cambridgeLevel: 'b2',
    examTrack: 'cambridge',
  },
  {
    kind: 'reading',
    slug: 'cae-c1-test1',
    examId: 'catalog-reading-cae-c1-test1',
    sourceDir: 'cae-Reading-test1',
    cambridgeLevel: 'c1',
    examTrack: 'cambridge',
  },
  {
    kind: 'reading',
    slug: 'cpe-c2-test1',
    examId: 'catalog-reading-cpe-c2-test1',
    sourceDir: 'cpe-Reading-test1',
    cambridgeLevel: 'c2',
    examTrack: 'cambridge',
  },
  {
    kind: 'listening',
    slug: 'ket-a2-test1',
    examId: 'catalog-listening-ket-a2-test1',
    sourceDir: 'ket-listening-test1',
    examType: 'ket',
    examMode: 'practice',
  },
  {
    kind: 'listening',
    slug: 'pet-b1-test1',
    examId: 'catalog-listening-pet-b1-test1',
    sourceDir: 'pet-listening-test1',
    examType: 'pet',
    examMode: 'practice',
  },
  {
    kind: 'listening',
    slug: 'fce-b2-test1',
    examId: 'catalog-listening-fce-b2-test1',
    sourceDir: 'fce-Listening-test1',
    examType: 'fce',
    examMode: 'practice',
  },
  {
    kind: 'listening',
    slug: 'cae-c1-test1',
    examId: 'catalog-listening-cae-c1-test1',
    sourceDir: 'cae-Listening-test1',
    examType: 'cae',
    examMode: 'practice',
  },
]

const IELTS_LISTENING_FOLDER_RE = /^Listening IELTS_Test(\d+)_Cam(\d+)$/i
const IELTS_READING_FOLDER_RE = /^Reading IELTS_Test(\d+)_Cam(\d+)$/i

/**
 * Discover IELTS Listening Cam9–20 bundles.
 * Layouts supported:
 *   Tainguyen/IELTS/Listening/Listening IELTS_Test{N}_Cam{X}/
 *   Tainguyen/IELTS/Listening IELTS_Test{N}_Cam{X}/  (legacy flat)
 */
async function discoverIeltsListeningBundles() {
  const ieltsRoot = path.join(TAINGUYEN, 'IELTS')
  if (!existsSync(ieltsRoot)) return []

  const searchRoots = [
    { abs: path.join(ieltsRoot, 'Listening'), relPrefix: 'IELTS/Listening' },
    { abs: ieltsRoot, relPrefix: 'IELTS' },
  ]

  const seen = new Set()
  const bundles = []

  for (const root of searchRoots) {
    if (!existsSync(root.abs)) continue
    const entries = await fs.readdir(root.abs, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const match = entry.name.match(IELTS_LISTENING_FOLDER_RE)
      if (!match) continue

      const test = Number.parseInt(match[1], 10)
      const cam = Number.parseInt(match[2], 10)
      const slug = `ielts-cam${cam}-test${test}`
      if (seen.has(slug)) continue

      const examJsonPath = path.join(root.abs, entry.name, 'exam.json')
      if (!existsSync(examJsonPath)) continue

      seen.add(slug)
      bundles.push({
        kind: 'listening',
        slug,
        examId: `catalog-listening-ielts-cam${cam}-test${test}`,
        sourceDir: `${root.relPrefix}/${entry.name}`,
        examType: 'ielts',
        examMode: 'practice',
        cam,
        test,
      })
    }
  }

  bundles.sort((a, b) => a.cam - b.cam || a.test - b.test)
  return bundles
}

/**
 * Discover IELTS Reading bundles that already have exam.json
 * (Cam9–20 scaffold; only folders with full exam.json are included).
 * Layout: Tainguyen/IELTS/Reading IELTS_Test{N}_Cam{X}/
 */
async function discoverIeltsReadingBundles() {
  const ieltsRoot = path.join(TAINGUYEN, 'IELTS')
  if (!existsSync(ieltsRoot)) return []

  const entries = await fs.readdir(ieltsRoot, { withFileTypes: true })
  const bundles = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const match = entry.name.match(IELTS_READING_FOLDER_RE)
    if (!match) continue

    const test = Number.parseInt(match[1], 10)
    const cam = Number.parseInt(match[2], 10)
    const examJsonPath = path.join(ieltsRoot, entry.name, 'exam.json')
    if (!existsSync(examJsonPath)) continue

    bundles.push({
      kind: 'reading',
      slug: `ielts-cam${cam}-test${test}`,
      examId: `catalog-reading-ielts-cam${cam}-test${test}`,
      sourceDir: `IELTS/${entry.name}`,
      examTrack: 'ielts',
      examMode: 'practice',
      cam,
      test,
    })
  }

  bundles.sort((a, b) => a.cam - b.cam || a.test - b.test)
  return bundles
}

async function discoverPayloadReadingBundles() {
  // Prefer out-reading/converted/ (post-consolidate + normalize + template pipeline).
  // Fall back to out-reading/ (raw) for slugs missing a converted counterpart.
  const CONVERTED_DIR = path.join(OUT_READING, 'converted')
  const hasConverted = existsSync(CONVERTED_DIR)
  const hasRaw = existsSync(OUT_READING)
  if (!hasConverted && !hasRaw) return []

  const bySlug = new Map()

  // Crawl is the source of truth. Filename matching deliberately tolerates
  // case, separators, whitespace and zero-padded Cambridge numbers.
  if (existsSync(READING_CRAWL)) {
    for (const name of await fs.readdir(READING_CRAWL)) {
      const compact = name.replace(/\.json$/i, '').replace(/[^a-z0-9]/gi, '').toLowerCase()
      const match = compact.match(/^cam0*(9|1[0-9]|20)test0*([1-4])$/)
      if (!match || (match[1] === '11' && match[2] === '2')) continue
      const cam = Number(match[1]); const test = Number(match[2]); const slug = `ielts-cam${cam}-test${test}`
      bySlug.set(slug, { kind: 'reading', slug, examId: `catalog-cam-${cam}-${test}-reading`, examTrack: 'ielts', cam, test, crawlPath: path.join(READING_CRAWL, name) })
    }
  }

  const collect = async (dir) => {
    if (!existsSync(dir)) return
    const entries = await fs.readdir(dir)
    for (const name of entries) {
      const match = name.match(/^reading-cam-(9|1[0-9]|20)-([1-4])\.json$/)
      if (!match) continue
      if (match[1] === '11' && match[2] === '2') continue
      const cam = Number(match[1])
      const test = Number(match[2])
      const slug = `ielts-cam${cam}-test${test}`
      if (bySlug.has(slug)) continue // crawl wins; converted/raw remain fallback
      bySlug.set(slug, {
        kind: 'reading',
        slug,
        examId: `catalog-cam-${cam}-${test}-reading`,
        examTrack: 'ielts',
        cam,
        test,
        payloadPath: path.join(dir, name),
      })
    }
  }

  await collect(CONVERTED_DIR)
  await collect(OUT_READING)

  return [...bySlug.values()].sort((a, b) => a.cam - b.cam || a.test - b.test)
}

/**
 * KET A2 Reading under Import Cambridge Books 1–7
 * (Cam 1–3 official bundles + Cam 4–7 englishpracticetest practice 1–14).
 * Layout: Tainguyen/Import Cambridge/KET_A2/Reading/KET A2_Cam {B}/Test {T}/
 */
/**
 * FCE B2 practice Listening Book 2+ (Import_FCE_B2_Listening tests 10–36).
 * Layout: Tainguyen/Import Cambridge/FCE_B2/Listening/FCE B2_Cam {B}/Test {T}/
 */
async function discoverFcePracticeListeningBundles() {
  const listeningRoot = path.join(
    TAINGUYEN,
    'Import Cambridge',
    'FCE_B2',
    'Listening',
  )
  if (!existsSync(listeningRoot)) return []

  const bundles = []
  const entries = await fs.readdir(listeningRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const camMatch = entry.name.match(/^FCE B2_Cam\s+(\d+)$/i)
    if (!camMatch) continue
    const book = Number.parseInt(camMatch[1], 10)
    if (book < 2) continue
    const camDir = path.join(listeningRoot, entry.name)
    const tests = await fs.readdir(camDir, { withFileTypes: true })
    for (const t of tests) {
      if (!t.isDirectory()) continue
      const tm = t.name.match(/^Test\s+(\d+)$/i)
      if (!tm) continue
      const test = Number.parseInt(tm[1], 10)
      const examJsonPath = path.join(camDir, t.name, 'exam.json')
      if (!existsSync(examJsonPath)) continue
      const slug = `fce-b2-book${book}-test${test}`
      bundles.push({
        kind: 'listening',
        slug,
        examId: `catalog-listening-fce-b2-book${book}-test${test}`,
        sourceDir: path.join(
          'Import Cambridge',
          'FCE_B2',
          'Listening',
          entry.name,
          t.name,
        ),
        examType: 'fce',
        examMode: 'practice',
        book,
        test,
      })
    }
  }
  bundles.sort((a, b) => a.book - b.book || a.test - b.test)
  return bundles
}

/**
 * FCE B2 practice Reading tests 1â€“26 from crawl, mapped to app tests 2â€“27.
 * Layout: Tainguyen/Import Cambridge/FCE_B2/Reading/fce-reading-test{N}/exam/exam.json
 * Test 1 is reserved for the static official sample bundle.
 */
async function discoverFcePracticeReadingBundles() {
  const readingRoot = path.join(
    TAINGUYEN,
    'Import Cambridge',
    'FCE_B2',
    'Reading',
  )
  if (!existsSync(readingRoot)) return []

  const bundles = []
  const entries = await fs.readdir(readingRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const match = entry.name.match(/^fce-reading-test(\d+)$/i)
    if (!match) continue
    const test = Number.parseInt(match[1], 10)
    const sourceDir = path.join(readingRoot, entry.name, 'exam')
    const examJsonPath = path.join(sourceDir, 'exam.json')
    if (!existsSync(examJsonPath)) continue
    bundles.push({
      kind: 'reading',
      sourceTest: test,
      appTest: test + 1,
      slug: `fce-b2-test${test + 1}`,
      examId: `catalog-reading-fce-b2-test${test + 1}`,
      sourceDir: path.join(
        'Import Cambridge',
        'FCE_B2',
        'Reading',
        entry.name,
        'exam',
      ),
      cambridgeLevel: 'b2',
      examTrack: 'cambridge',
    })
  }

  bundles.sort((a, b) => a.appTest - b.appTest)
  return bundles
}

/**
 * PET B1 practice Listening Book 2+ (englishpracticetest practice tests).
 * Layout: Tainguyen/Import Cambridge/PET_B1/Listening/PET B1_Cam {B}/Test {T}/
 */
async function discoverPetPracticeListeningBundles() {
  const listeningRoot = path.join(
    TAINGUYEN,
    'Import Cambridge',
    'PET_B1',
    'Listening',
  )
  if (!existsSync(listeningRoot)) return []

  const bundles = []
  const entries = await fs.readdir(listeningRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const camMatch = entry.name.match(/^PET B1_Cam\s+(\d+)$/i)
    if (!camMatch) continue
    const book = Number.parseInt(camMatch[1], 10)
    // Book 1 is reserved for official Cam sample (STATIC pet-listening-test1)
    if (book < 2) continue
    const camDir = path.join(listeningRoot, entry.name)
    const tests = await fs.readdir(camDir, { withFileTypes: true })
    for (const t of tests) {
      if (!t.isDirectory()) continue
      const tm = t.name.match(/^Test\s+(\d+)$/i)
      if (!tm) continue
      const test = Number.parseInt(tm[1], 10)
      const examJsonPath = path.join(camDir, t.name, 'exam.json')
      if (!existsSync(examJsonPath)) continue
      const slug = `pet-b1-book${book}-test${test}`
      bundles.push({
        kind: 'listening',
        slug,
        examId: `catalog-listening-pet-b1-book${book}-test${test}`,
        sourceDir: path.join(
          'Import Cambridge',
          'PET_B1',
          'Listening',
          entry.name,
          t.name,
        ),
        examType: 'pet',
        examMode: 'practice',
        book,
        test,
      })
    }
  }
  bundles.sort((a, b) => a.book - b.book || a.test - b.test)
  return bundles
}

async function discoverKetPracticeReadingBundles() {
  const readingRoot = path.join(
    TAINGUYEN,
    'Import Cambridge',
    'KET_A2',
    'Reading',
  )
  if (!existsSync(readingRoot)) return []

  const bundles = []
  // Books 1–7 (any Test N folder with exam.json)
  for (const book of [1, 2, 3, 4, 5, 6, 7]) {
    const camDir = path.join(readingRoot, `KET A2_Cam ${book}`)
    if (!existsSync(camDir)) continue
    const entries = await fs.readdir(camDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const m = entry.name.match(/^Test\s+(\d+)$/i)
      if (!m) continue
      const test = Number.parseInt(m[1], 10)
      const examJsonPath = path.join(camDir, entry.name, 'exam.json')
      if (!existsSync(examJsonPath)) continue
      const slug = `ket-a2-book${book}-test${test}`
      bundles.push({
        kind: 'reading',
        slug,
        examId: `catalog-reading-ket-a2-book${book}-test${test}`,
        sourceDir: path.join(
          'Import Cambridge',
          'KET_A2',
          'Reading',
          `KET A2_Cam ${book}`,
          entry.name,
        ),
        cambridgeLevel: 'a2',
        examTrack: 'cambridge',
        book,
        test,
      })
    }
  }

  bundles.sort((a, b) => a.book - b.book || a.test - b.test)
  return bundles
}

async function writeGeneratedIeltsImports(ieltsListeningBundles, ieltsReadingBundles) {
  // Listening
  {
    const outPath = path.join(ROOT, 'packages/catalog/src/generatedIeltsListening.ts')
    const lines = [
      '// AUTO-GENERATED by scripts/build-catalog.mjs — do not edit',
      '',
    ]
    const vars = []
    for (const bundle of ieltsListeningBundles) {
      const varName = `ieltsCam${bundle.cam}Test${bundle.test}`
      lines.push(`import ${varName} from '../data/listening-${bundle.slug}.json'`)
      vars.push(varName)
    }
    lines.push('')
    lines.push('export const GENERATED_IELTS_LISTENING_EXAMS = [')
    for (const varName of vars) {
      lines.push(`  ${varName},`)
    }
    lines.push(']')
    lines.push('')
    await fs.writeFile(outPath, lines.join('\n'), 'utf8')
  }

  // Reading
  {
    const outPath = path.join(ROOT, 'packages/catalog/src/generatedIeltsReading.ts')
    const lines = [
      '// AUTO-GENERATED by scripts/build-catalog.mjs — do not edit',
      '',
    ]
    const vars = []
    for (const bundle of ieltsReadingBundles) {
      const varName = `ieltsReadingCam${bundle.cam}Test${bundle.test}`
      lines.push(`import ${varName} from '../data/reading-${bundle.slug}.json'`)
      vars.push(varName)
    }
    lines.push('')
    lines.push('export const GENERATED_IELTS_READING_EXAMS = [')
    for (const varName of vars) {
      lines.push(`  ${varName},`)
    }
    lines.push(']')
    lines.push('')
    await fs.writeFile(outPath, lines.join('\n'), 'utf8')
  }
}

async function writeGeneratedKetReadingImports(ketBundles) {
  const outPath = path.join(ROOT, 'packages/catalog/src/generatedKetReading.ts')
  const lines = [
    '// AUTO-GENERATED by scripts/build-catalog.mjs — do not edit',
    '',
  ]
  const vars = []
  for (const bundle of ketBundles) {
    const varName = `ketReadingBook${bundle.book}Test${bundle.test}`
    lines.push(`import ${varName} from '../data/reading-${bundle.slug}.json'`)
    vars.push(varName)
  }
  lines.push('')
  lines.push('export const GENERATED_KET_READING_EXAMS = [')
  for (const varName of vars) {
    lines.push(`  ${varName},`)
  }
  lines.push(']')
  lines.push('')
  await fs.writeFile(outPath, lines.join('\n'), 'utf8')
}

async function writeGeneratedPetListeningImports(petBundles) {
  const outPath = path.join(ROOT, 'packages/catalog/src/generatedPetListening.ts')
  const lines = [
    '// AUTO-GENERATED by scripts/build-catalog.mjs — do not edit',
    '',
  ]
  const vars = []
  for (const bundle of petBundles) {
    const varName = `petListeningBook${bundle.book}Test${bundle.test}`
    lines.push(`import ${varName} from '../data/listening-${bundle.slug}.json'`)
    vars.push(varName)
  }
  lines.push('')
  lines.push('export const GENERATED_PET_LISTENING_EXAMS = [')
  for (const varName of vars) {
    lines.push(`  ${varName},`)
  }
  lines.push(']')
  lines.push('')
  await fs.writeFile(outPath, lines.join('\n'), 'utf8')
}

async function writeGeneratedFceListeningImports(fceBundles) {
  const outPath = path.join(ROOT, 'packages/catalog/src/generatedFceListening.ts')
  const lines = [
    '// AUTO-GENERATED by scripts/build-catalog.mjs — do not edit',
    '',
  ]
  const vars = []
  for (const bundle of fceBundles) {
    const varName = `fceListeningBook${bundle.book}Test${bundle.test}`
    lines.push(`import ${varName} from '../data/listening-${bundle.slug}.json'`)
    vars.push(varName)
  }
  lines.push('')
  lines.push('export const GENERATED_FCE_LISTENING_EXAMS = [')
  for (const varName of vars) {
    lines.push(`  ${varName},`)
  }
  lines.push(']')
  lines.push('')
  await fs.writeFile(outPath, lines.join('\n'), 'utf8')
}

const MEDIA_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.ogg'])

function catalogBase(kind, slug) {
  return `/catalog/${kind}/${slug}`
}

function mediaUrl(kind, slug, filename) {
  return `${catalogBase(kind, slug)}/${filename}`
}

export function transformReading(payload, bundle) {
  const { examId, slug, cambridgeLevel, examTrack } = bundle
  const base = catalogBase('reading', slug)
  const book = typeof bundle.book === 'number' ? bundle.book : null
  const test = typeof bundle.test === 'number' ? bundle.test : null

  const parts = (payload.parts ?? []).map(partJson => {
    const partId = `${examId}-part-${partJson.partNumber}`
    const passage = (partJson.passage ?? []).map(blockJson => {
      const block = {
        label: blockJson.label,
        text: blockJson.text ?? '',
      }
      if (blockJson.imageFile) {
        block.imageUrl = mediaUrl('reading', slug, blockJson.imageFile)
      }
      return block
    })

    const questionGroups = (partJson.questionGroups ?? []).map((groupJson, groupIndex) => {
      const groupId = `${partId}-g${groupIndex}`
      const questions = (groupJson.questions ?? []).map(qJson => {
        const question = {
          id: `${partId}-q${qJson.number}`,
          number: qJson.number,
          type: qJson.type,
          prompt: qJson.prompt,
          options: qJson.options ?? [],
          answer: qJson.answer,
          explanation: qJson.explanation ?? '',
          answerConfidence: qJson.answerConfidence ?? 'key',
        }
        if (typeof qJson.minWords === 'number') question.minWords = qJson.minWords
        return question
      })

      return {
        id: groupId,
        range: groupJson.range,
        instruction: groupJson.instruction,
        note: groupJson.note,
        type: groupJson.type,
        paragraphLetters: groupJson.paragraphLetters,
        noteTable: groupJson.noteTable,
        notePassage: groupJson.notePassage,
        notesTitle: groupJson.notesTitle,
        features: groupJson.features,
        headings: groupJson.headings,
        wordBank: groupJson.wordBank,
        questions,
      }
    })

    return {
      id: partId,
      partNumber: partJson.partNumber,
      rangeLabel: partJson.rangeLabel,
      passageTitle: partJson.passageTitle,
      passageSubtitle: partJson.passageSubtitle,
      passage,
      questionGroups,
      topImageUrl: partJson.topImageUrl,
      bottomImageUrl: partJson.bottomImageUrl,
    }
  })

  const partCount = parts.length
  const bandHint = (payload.bandHint ?? 'Cambridge Reading')
    + (partCount > 0 ? ` — ${partCount} part${partCount === 1 ? '' : 's'}` : '')
  const title =
    cambridgeLevel === 'b2' && test != null
      ? test === 1
        ? 'FCE B2 Reading — Test 1'
        : `FCE B2 Reading — Book ${book ?? Math.ceil(test / 4)} — Test ${test}`
      : payload.title

  return {
    id: examId,
    title,
    durationMinutes: payload.durationMinutes ?? 60,
    bandHint,
    parts,
    examTrack,
    cambridgeLevel,
    catalogSlug: slug,
    catalogBase: base,
  }
}

async function transformFceB2Reading(bundle) {
  const { raw } = await loadFceTestExamJson(
    bundle.sourceTest,
    path.join(TAINGUYEN, 'Import Cambridge', 'FCE_B2', 'Reading'),
  )
  const body = convertFcePagesToReadingExam(raw, {
    sourceTestNumber: bundle.sourceTest,
    appTestNumber: bundle.appTest,
  }).body

  // Apply AI repairs for missing content
  const sourcePages = (raw.pages ?? []).filter(p => {
    const pn = Number(p.partNumber)
    return Number.isInteger(pn) && pn >= 1 && pn <= 7
  })

  const mergedParts = []
  for (let i = 0; i < body.parts.length; i++) {
    const part = body.parts[i]
    const sourcePage = sourcePages.find(p => Number(p.partNumber) === part.partNumber)
    const merged = await mergeAiRepairs(part, bundle.sourceTest, bundle.appTest, sourcePage ?? {})
    mergedParts.push(merged)
  }

  body.parts = mergedParts
  return body
}

function enrichPayloadLayout(payload, sourceRows, cam, test) {
  const sourceByPart = new Map(
    sourceRows
      .filter(row => row.youpass_id?.startsWith(`cam-${cam}-${test}-`))
      .map(row => [Number(row.youpass_id.split('-').at(-1)), row]),
  )
  return {
    ...payload,
    parts: payload.parts.map(part => {
      const source = sourceByPart.get(part.partNumber)
      const sourceQuestions = new Map((source?.questions ?? []).map(question => [question.id ?? question.number, question]))
      return {
        ...part,
        questionGroups: part.questionGroups.map(group => {
          const first = group.questions[0]
          const sourceQuestion = first && sourceQuestions.get(first.number)
          const config = sourceQuestion?._blockConfig
          const questions = group.questions.map(question => {
            const original = sourceQuestions.get(question.number)
            return {
              ...question,
              prompt: original?.question_text ?? question.prompt,
              type: original?.displayType === 'table-completion' || original?.type === 'fill-blank'
                ? 'gap-fill'
                : original?.displayType === 'matching-heading'
                  ? 'matching-headings'
                  : original?.displayType === 'sentence-ending'
                    ? 'matching-features'
                    : question.type,
            }
          })
          if (config?.type === 'table-completion' && Array.isArray(config.tableRows)) {
            const rows = config.tableRows.map(row => ({
              cells: row.map(cell => [{ type: 'static', text: String(cell ?? '').replace(/\[(\d+)\]/g, (_, number) => `__GAP_${number}__`) }]),
            }))
            for (const row of rows) {
              for (const cell of row.cells) {
                for (const block of cell) {
                  if (block.text) {
                    const parts = block.text.split(/(__GAP_\d+__)/g)
                    cell.splice(0, cell.length, ...parts.filter(Boolean).map(text => text.startsWith('__GAP_')
                      ? { type: 'gap', number: Number(text.match(/\d+/)?.[0]) }
                      : { type: 'static', text }))
                  }
                }
              }
            }
            return {
              ...group,
              type: 'gap-fill',
              instruction: group.instruction,
              noteTable: {
                title: config.tableTitle || undefined,
                headers: config.tableHeaders?.length ? config.tableHeaders : ['', ''],
                rows,
              },
              questions,
            }
          }
          return { ...group, questions }
        }),
      }
    }),
  }
}

function transformListening(payload, bundle, sourceDir) {
  const { examId, slug, examType, examMode } = bundle
  const sharedAudio = new Map()

  const parts = (payload.parts ?? []).map(partJson => {
    const partId = `${examId}-part-${partJson.partNumber}`
    let partAudioUrl

    if (partJson.audioFile) {
      const key = partJson.audioFile.toLowerCase()
      if (!sharedAudio.has(key)) {
        sharedAudio.set(key, mediaUrl('listening', slug, partJson.audioFile))
      }
      partAudioUrl = sharedAudio.get(key)
    }

    const questions = (partJson.questions ?? []).map(qJson => {
      const qId = `${examId}-q-${qJson.number}`
      let audioUrl
      if (qJson.audioFile) {
        const key = qJson.audioFile.toLowerCase()
        if (!sharedAudio.has(key)) {
          sharedAudio.set(key, mediaUrl('listening', slug, qJson.audioFile))
        }
        audioUrl = sharedAudio.get(key)
      }

      let pictureImageUrl
      if (qJson.type === 'picture-mc') {
        const boardCandidates = [
          qJson.imageFile,
          `q${qJson.number}.jpg`,
          `q${qJson.number}.jpeg`,
          `q${qJson.number}.png`,
          `part1-q${qJson.number}.jpg`,
        ].filter(Boolean)
        for (const name of boardCandidates) {
          if (existsSync(path.join(sourceDir, name))) {
            pictureImageUrl = mediaUrl('listening', slug, name)
            break
          }
        }
      }

      const options = (qJson.options ?? []).map(opt => {
        const option = { id: opt.id, label: opt.label }
        if (!pictureImageUrl && opt.imageFile) {
          option.imageUrl = mediaUrl('listening', slug, opt.imageFile)
        }
        return option
      })

      const question = {
        id: qId,
        number: qJson.number,
        type: qJson.type,
        prompt: qJson.prompt,
        options,
        answer: qJson.answer,
        explanation: qJson.explanation ?? '',
        pictureImageUrl,
        audioUrl,
        ttsText: qJson.ttsText,
        wordLimit: qJson.wordLimit,
      }
      if (qJson.context) question.context = qJson.context
      if (qJson.gapLead) question.gapLead = qJson.gapLead
      if (qJson.gapTrail) question.gapTrail = qJson.gapTrail
      if (qJson.noteBefore) question.noteBefore = qJson.noteBefore
      if (qJson.noteAfter) question.noteAfter = qJson.noteAfter
      if (qJson.contextFirst) question.contextFirst = qJson.contextFirst
      if (qJson.sectionRange) question.sectionRange = qJson.sectionRange
      if (qJson.sectionInstruction) question.sectionInstruction = qJson.sectionInstruction
      if (qJson.sectionTitle) question.sectionTitle = qJson.sectionTitle
      if (qJson.mapLabel) question.mapLabel = qJson.mapLabel
      if (qJson.diagramLabel) question.diagramLabel = qJson.diagramLabel
      if (qJson.flowChart) question.flowChart = qJson.flowChart
      if (qJson.flowChartEnd) question.flowChartEnd = qJson.flowChartEnd
      return question
    })

    const part = {
      id: partId,
      partNumber: partJson.partNumber,
      rangeLabel: partJson.rangeLabel,
      instruction: partJson.instruction,
      audioUrl: partAudioUrl,
      ttsText: partJson.ttsText,
      transcript: partJson.transcript,
      transcriptSegments: partJson.transcriptSegments,
      maxPlays: partJson.maxPlays,
      questions,
    }
    if (partJson.passageTitle) part.passageTitle = partJson.passageTitle
    if (partJson.audioIntro) part.audioIntro = partJson.audioIntro
    if (partJson.notePassage) part.notePassage = partJson.notePassage
    if (partJson.notePassageLayout) part.notePassageLayout = partJson.notePassageLayout
    if (partJson.noteTable) part.noteTable = partJson.noteTable
    if (partJson.noteTables) part.noteTables = partJson.noteTables
    if (partJson.notePassageSections) part.notePassageSections = partJson.notePassageSections
    if (partJson.imageFile && existsSync(path.join(sourceDir, partJson.imageFile))) {
      part.partImageUrl = mediaUrl('listening', slug, partJson.imageFile)
    }
    if (partJson.matchingDualTask) part.matchingDualTask = true
    if (partJson.taskOneInstruction) part.taskOneInstruction = partJson.taskOneInstruction
    if (partJson.taskTwoInstruction) part.taskTwoInstruction = partJson.taskTwoInstruction
    return part
  })

  return {
    id: examId,
    title: payload.title,
    durationMinutes: payload.durationMinutes ?? 35,
    bandHint: payload.bandHint ?? 'Cambridge Listening',
    examType: payload.examType ?? examType,
    examMode: payload.examMode ?? examMode,
    parts,
    catalogSlug: slug,
    catalogBase: catalogBase('listening', slug),
  }
}

/** Tainguyen bundles may ship as .zip only on CI — extract before read. */
async function ensureSourceDir(sourceDir, sourceName) {
  const examJsonPath = path.join(sourceDir, 'exam.json')
  if (existsSync(examJsonPath)) return

  const zipPath = path.join(TAINGUYEN, `${sourceName}.zip`)
  if (!existsSync(zipPath)) {
    throw new Error(`Missing source: ${examJsonPath} (no ${zipPath})`)
  }

  await fs.mkdir(sourceDir, { recursive: true })
  if (process.platform === 'win32') {
    const result = spawnSync(
      'powershell',
      ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${sourceDir}' -Force`],
      { stdio: 'inherit' },
    )
    if (result.status !== 0) throw new Error(`Expand-Archive failed for ${zipPath}`)
  } else {
    const result = spawnSync('unzip', ['-o', zipPath, '-d', sourceDir], { stdio: 'inherit' })
    if (result.status !== 0) throw new Error(`unzip failed for ${zipPath}`)
  }

  if (!existsSync(examJsonPath)) {
    throw new Error(`After extracting ${zipPath}, still missing ${examJsonPath}`)
  }
}

async function copyMediaFiles(sourceDir, destDir) {
  await fs.mkdir(destDir, { recursive: true })
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  let copied = 0
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!MEDIA_EXT.has(ext)) continue
    await fs.copyFile(path.join(sourceDir, entry.name), path.join(destDir, entry.name))
    copied += 1
  }
  return copied
}

async function main() {
  if (!tainguyenExists(TAINGUYEN)) {
    const hasPublic = existsSync(PUBLIC_CATALOG)
    const hasData = existsSync(path.join(DATA_OUT, 'manifest.json'))
    if (IF_PRESENT && hasData) {
      console.log(`[build-catalog] No Tainguyen at ${TAINGUYEN}`)
      console.log('[build-catalog] --if-present / Vercel: skip rebuild; using committed packages/catalog/data')
      return
    }
    if (IF_PRESENT && hasPublic) {
      console.warn(`[build-catalog] No Tainguyen at ${TAINGUYEN}; public/catalog present — skip rebuild`)
      return
    }
    console.error(`[build-catalog] Tainguyen not found: ${TAINGUYEN}`)
    console.error('  Set TAINGUYEN_PATH to the folder, or create a junction:')
    console.error('  mklink /J Tainguyen D:\\path\\to\\Tainguyen')
    console.error('  Or run with --if-present to skip when using prebuilt catalog only.')
    process.exit(1)
  }

  console.log(`[build-catalog] Source: ${TAINGUYEN}`)
  await fs.mkdir(DATA_OUT, { recursive: true })
  await fs.mkdir(PUBLIC_CATALOG, { recursive: true })

  const ieltsListeningBundles = await discoverIeltsListeningBundles()
  const discoveredReadingBundles = await discoverIeltsReadingBundles()
  const payloadReadingBundles = await discoverPayloadReadingBundles()
  const ketPracticeReadingBundles = await discoverKetPracticeReadingBundles()
  const petPracticeListeningBundles = await discoverPetPracticeListeningBundles()
  const fcePracticeListeningBundles = await discoverFcePracticeListeningBundles()
  const fcePracticeReadingBundles = await discoverFcePracticeReadingBundles()
  const payloadSlugs = new Set(payloadReadingBundles.map(bundle => bundle.slug))
  const ieltsReadingBundles = [
    ...discoveredReadingBundles.filter(bundle => !payloadSlugs.has(bundle.slug)),
    ...payloadReadingBundles,
  ]
  const discoveredBundles = [
    ...STATIC_BUNDLES,
    ...ketPracticeReadingBundles,
    ...petPracticeListeningBundles,
    ...fcePracticeListeningBundles,
    ...fcePracticeReadingBundles,
    ...ieltsReadingBundles.filter(bundle => !bundle.payloadPath && !bundle.crawlPath),
    ...ieltsListeningBundles,
  ]
  const BUNDLES = ONLY_EXAM_ID
    ? discoveredBundles.filter(bundle => bundle.examId === ONLY_EXAM_ID)
    : discoveredBundles
  if (ONLY_EXAM_ID && BUNDLES.length !== 1) {
    throw new Error(`--only-exam did not match exactly one discovered bundle: ${ONLY_EXAM_ID}`)
  }
  if (!ONLY_EXAM_ID) {
    await writeGeneratedIeltsImports(ieltsListeningBundles, ieltsReadingBundles)
    await writeGeneratedKetReadingImports(ketPracticeReadingBundles)
    await writeGeneratedPetListeningImports(petPracticeListeningBundles)
    await writeGeneratedFceListeningImports(fcePracticeListeningBundles)
  }

  const existingManifestPath = path.join(DATA_OUT, 'manifest.json')
  const existingManifest = existsSync(existingManifestPath)
    ? JSON.parse(await fs.readFile(existingManifestPath, 'utf8'))
    : null
  const runtimeEntryExists = (kind, item) => {
    const runtimeDir = path.join(ROOT, 'apps', 'web', 'public', 'catalog', 'exams', kind)
    return existsSync(path.join(runtimeDir, `${item.id}.json`))
      && existsSync(path.join(runtimeDir, `${item.id}.answers.json`))
  }
  const manifest = existingManifest
    ? {
        ...existingManifest,
        builtAt: new Date().toISOString(),
        reading: (existingManifest.reading ?? []).filter(item => item.id !== ONLY_EXAM_ID && runtimeEntryExists('reading', item)),
        listening: (existingManifest.listening ?? []).filter(item => item.id !== ONLY_EXAM_ID && runtimeEntryExists('listening', item)),
      }
    : {
        version: 2,
        builtAt: new Date().toISOString(),
        reading: [],
        listening: [],
      }

  for (const bundle of BUNDLES) {
    const sourceDir = path.join(TAINGUYEN, bundle.sourceDir)
    await ensureSourceDir(sourceDir, bundle.sourceDir)
    const examJsonPath = path.join(sourceDir, 'exam.json')
    const destDir = path.join(PUBLIC_CATALOG, bundle.kind, bundle.slug)

    const raw = JSON.parse(await fs.readFile(examJsonPath, 'utf8'))
    const mediaCount = await copyMediaFiles(sourceDir, destDir)

    let processed
    let outName
    if (bundle.kind === 'reading') {
      if (bundle.cambridgeLevel === 'b2' && Number.isInteger(bundle.sourceTest) && Number.isInteger(bundle.appTest)) {
        processed = await transformFceB2Reading(bundle)
      } else {
        processed = transformReading(raw, bundle)
      }
      outName = `reading-${bundle.slug}.json`
      manifest.reading.push({ id: bundle.examId, slug: bundle.slug, title: processed.title })
    } else {
      processed = transformListening(raw, bundle, sourceDir)
      outName = `listening-${bundle.slug}.json`
      manifest.listening.push({ id: bundle.examId, slug: bundle.slug, title: processed.title })
    }

    await fs.writeFile(
      path.join(DATA_OUT, outName),
      JSON.stringify(processed, null, 2),
      'utf8',
    )

    console.log(`✓ ${bundle.kind}/${bundle.slug} — ${mediaCount} media, → ${outName}`)
  }

  for (const bundle of ONLY_EXAM_ID ? [] : payloadReadingBundles) {
    const raw = JSON.parse(await fs.readFile(bundle.crawlPath ?? bundle.payloadPath, 'utf8'))
    const sourcePath = path.join(ROOT, 'reading_filtered.json')
    const sourceRows = existsSync(sourcePath)
      ? JSON.parse(await fs.readFile(sourcePath, 'utf8'))
      : []
    const enriched = bundle.crawlPath ? raw : enrichPayloadLayout(raw, sourceRows, bundle.cam, bundle.test)
    const processed = transformReading(enriched, {
      ...bundle,
      cambridgeLevel: undefined,
    })
    const outName = `reading-${bundle.slug}.json`
    manifest.reading.push({ id: bundle.examId, slug: bundle.slug, title: processed.title })
    await fs.writeFile(path.join(DATA_OUT, outName), JSON.stringify(processed, null, 2), 'utf8')
    console.log(`✓ reading/${bundle.slug} — payload, → ${outName}`)
  }

  manifest.reading = [...new Map(manifest.reading.map(item => [item.id, item])).values()]
    .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))
  manifest.listening = [...new Map(manifest.listening.map(item => [item.id, item])).values()]
    .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))
  await fs.writeFile(
    path.join(DATA_OUT, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  )

  console.log(`\nIELTS listening: ${ieltsListeningBundles.length} đề`)
  console.log(`IELTS reading:   ${ieltsReadingBundles.length} đề (${payloadReadingBundles.length} từ out-reading)`)
  console.log(`KET practice R:  ${ketPracticeReadingBundles.length} đề (Book 1–7)`)
  console.log(`PET practice L:  ${petPracticeListeningBundles.length} đề (Book 2+)`)
  console.log(`FCE practice L:  ${fcePracticeListeningBundles.length} đề (Book 2+)`)
  console.log('\nCatalog build complete.')
  console.log(`  Public: ${PUBLIC_CATALOG}`)
  console.log(`  Data:   ${DATA_OUT}`)
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}

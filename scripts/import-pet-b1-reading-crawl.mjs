/**
 * Convert raw PET B1 Reading crawl folders into app-ready import bundles.
 *
 * Output format matches:
 *   D:\App-English-Ryan\Crawl\PET_B1_Reading\Tests\test-2\pet-b1-test2-import
 *
 * Usage:
 *   node scripts/import-pet-b1-reading-crawl.mjs all
 *   node scripts/import-pet-b1-reading-crawl.mjs 3
 *   node scripts/import-pet-b1-reading-crawl.mjs 3,4,5
 *   node scripts/import-pet-b1-reading-crawl.mjs 3-7
 *
 * Default root:
 *   D:\App-English-Ryan\Crawl\PET_B1_Reading\Tests
 *
 * Override with PET_B1_READING_TESTS_ROOT
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.env.PET_B1_READING_TESTS_ROOT || 'D:\\App-English-Ryan\\Crawl\\PET_B1_Reading\\Tests'

const PART_META = {
  1: {
    rangeLabel: 'Questions 1–5',
    instruction: 'For each question, choose the correct answer.',
    passageTitle: 'Part 1: Signs and Short Messages',
    type: 'multiple-choice',
  },
  2: {
    rangeLabel: 'Questions 6–10',
    instruction: 'Decide which option would be the most suitable.',
    passageTitle: 'Part 2: Matching People to Texts',
    type: 'matching-features',
  },
  3: {
    rangeLabel: 'Questions 11–15',
    instruction: 'Choose the correct answer A, B, C, or D.',
    passageTitle: 'Part 3: Long Text Multiple Choice',
    type: 'multiple-choice',
  },
  4: {
    rangeLabel: 'Questions 16–20',
    instruction: 'Choose the correct sentence for each gap.',
    passageTitle: 'Part 4: Missing Sentences',
    type: 'matching-features',
  },
  5: {
    rangeLabel: 'Questions 21–26',
    instruction: 'Choose the correct option for each gap.',
    passageTitle: 'Part 5: Multiple-Choice Cloze',
    type: 'multiple-choice',
  },
  6: {
    rangeLabel: 'Questions 27–32',
    instruction: 'Write ONE word for each gap.',
    passageTitle: 'Part 6: Open Cloze',
    type: 'gap-fill',
  },
}

function parseArgs(argv) {
  const arg = argv[2] || 'all'
  if (arg === 'all') {
    return readdirSync(ROOT, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && /^test-\d+$/.test(entry.name))
      .map(entry => Number(entry.name.replace('test-', '')))
      .filter(n => n !== 2)
      .sort((a, b) => a - b)
  }
  if (/^\d+$/.test(arg)) return [Number(arg)]
  if (/^\d+-\d+$/.test(arg)) {
    const [from, to] = arg.split('-').map(Number)
    return Array.from({ length: to - from + 1 }, (_, index) => from + index)
  }
  return arg.split(',').map(Number).filter(Number.isFinite)
}

function slugForTest(testNumber) {
  return `pet-b1-test${testNumber}`
}

function examIdForTest(testNumber) {
  return `catalog-reading-pet-b1-test${testNumber}`
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function htmlEntityDecode(text) {
  return String(text)
    .replace(/&#8211;|&#8212;|&#8210;|&#8212;/g, '–')
    .replace(/&#8216;|&#8217;|&#8242;/g, "'")
    .replace(/&#8220;|&#8221;|&#8243;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function maybeFixMojibake(text) {
  const value = String(text ?? '')
  if (!/[ÃÂâ]/.test(value)) return value
  try {
    const repaired = Buffer.from(value, 'latin1').toString('utf8')
    if (/[^\u0000-\u001f]/.test(repaired)) return repaired
  } catch {
    // ignore
  }
  return value
}

function stripHtml(text) {
  return String(text)
    .replace(/<div[^>]*$/i, '')
    .replace(/<[^>]+>/g, ' ')
}

function normalizeWhitespace(text) {
  return String(text).replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

function cleanText(text) {
  return normalizeWhitespace(stripHtml(htmlEntityDecode(maybeFixMojibake(text))))
}

function normalizeAnswer(answer) {
  return cleanText(answer).toLowerCase()
}

function genericPromptFor(partNumber, questionNumber, type) {
  if (partNumber >= 4 || type === 'gap-fill') return `Gap ${questionNumber}`
  if (partNumber === 1 && questionNumber) return `Question ${questionNumber}`
  return `Question ${questionNumber}`
}

function sanitizePrompt(rawPrompt, partNumber, questionNumber, type) {
  if (partNumber >= 4 || type === 'gap-fill') {
    return genericPromptFor(partNumber, questionNumber, type)
  }

  let prompt = cleanText(rawPrompt)
  prompt = prompt
    .replace(/\s+ABCDEFGH\s+A\..*$/i, '')
    .replace(/\s+ABC<\s*$/i, '')
    .replace(/\s+<div\s+class=.*$/i, '')
    .replace(/\s+VocabularyThe vocabulary below.*$/i, '')
    .replace(/\s+Vocabulary The vocabulary below.*$/i, '')
    .trim()

  return prompt || genericPromptFor(partNumber, questionNumber, type)
}

function sanitizeExplanation(raw) {
  return cleanText(raw)
    .replace(/\s+VocabularyThe vocabulary below.*$/i, '')
    .replace(/\s+Vocabulary The vocabulary below.*$/i, '')
    .trim()
}

function sanitizePassageBlock(block, partNumber, slug) {
  const out = {}
  if (block.label) out.label = cleanText(block.label)
  if (block.text) out.text = cleanText(block.text)
  if (block.imageFile) {
    out.text = out.text ?? ''
    out.imageUrl = `/catalog/reading/${slug}/${cleanText(block.imageFile)}`
  }
  if (partNumber === 1 && out.text == null) out.text = ''
  return out
}

function buildFeatures(rawFeatures) {
  if (!Array.isArray(rawFeatures)) return []
  return rawFeatures.map(feature => ({
    id: String(feature.id ?? '').trim().toLowerCase(),
    name: cleanText(feature.name ?? feature.label ?? ''),
  }))
}

function buildOptionsForMatching(rawFeatures) {
  if (!Array.isArray(rawFeatures)) return []
  return rawFeatures.map(feature => {
    const label = String(feature.id ?? '').trim().toUpperCase()
    return { id: label, label }
  })
}

function buildQuestion(question, examId, partNumber, rawFeatures, fallbackType) {
  const number = Number(question.number)
  const type = question.type ?? fallbackType
  const options = type === 'matching-features'
    ? buildOptionsForMatching(rawFeatures)
    : (question.options ?? []).map(option => ({
        id: String(option.id ?? '').trim(),
        label: cleanText(option.label ?? ''),
      }))

  return {
    body: {
      id: `${examId}-part-${partNumber}-q${number}`,
      number,
      type,
      prompt: sanitizePrompt(question.prompt, partNumber, number, type),
      options,
      answerConfidence: 'key',
    },
    answer: {
      answer: normalizeAnswer(question.answer),
      explanation: sanitizeExplanation(question.explanation ?? ''),
      answerConfidence: 'key',
    },
  }
}

function convertExam(rawExam, testNumber) {
  const examId = examIdForTest(testNumber)
  const slug = slugForTest(testNumber)
  const answers = {}

  const parts = (rawExam.parts ?? []).map((rawPart, partIndex) => {
    const partNumber = Number(rawPart.partNumber ?? partIndex + 1)
    const meta = PART_META[partNumber]
    const rawGroup = Array.isArray(rawPart.questionGroups) ? rawPart.questionGroups[0] : null
    const rawFeatures = rawGroup?.features ?? []
    const groupType = rawGroup?.type ?? meta.type

    const normalizedQuestions = (rawGroup?.questions ?? []).map(question =>
      buildQuestion(question, examId, partNumber, rawFeatures, groupType),
    )

    for (const question of normalizedQuestions) {
      answers[question.body.id] = question.answer
    }

    return {
      id: `${examId}-part-${partNumber}`,
      partNumber,
      rangeLabel: cleanText(rawPart.rangeLabel ?? meta.rangeLabel),
      passageTitle: cleanText(rawPart.passageTitle ?? meta.passageTitle),
      passageSubtitle: cleanText(rawPart.passageSubtitle ?? ''),
      passage: (rawPart.passage ?? []).map(block => sanitizePassageBlock(block, partNumber, slug)),
      questionGroups: [{
        id: `${examId}-part-${partNumber}-g0`,
        range: cleanText(rawGroup?.range ?? rawPart.rangeLabel ?? meta.rangeLabel),
        instruction: cleanText(rawGroup?.instruction ?? meta.instruction),
        type: groupType,
        ...(rawFeatures.length ? { features: buildFeatures(rawFeatures) } : {}),
        questions: normalizedQuestions.map(question => question.body),
      }],
    }
  })

  const questionCount = Object.keys(answers).length
  const body = {
    id: examId,
    title: cleanText(rawExam.title ?? `PET B1 Reading — Test ${testNumber}`),
    durationMinutes: Number(rawExam.durationMinutes ?? 45),
    bandHint: `B1 Preliminary Reading – 6 parts`,
    parts,
    examTrack: 'cambridge',
    cambridgeLevel: 'b1',
    catalogSlug: slug,
    catalogBase: `/catalog/reading/${slug}`,
    answersPath: `catalog/exams/reading/${examId}.answers.json`,
    answersRemote: true,
    bodyRemote: true,
  }

  const answersVault = {
    examId,
    version: 1,
    mode: 'answers-vault',
    answers,
  }

  const metaEntry = {
    id: examId,
    title: body.title,
    durationMinutes: body.durationMinutes,
    bandHint: body.bandHint,
    examMode: 'practice',
    examTrack: 'cambridge',
    cambridgeLevel: 'b1',
    questionCount,
    bodyPath: `catalog/exams/reading/${examId}.json`,
    answersPath: `catalog/exams/reading/${examId}.answers.json`,
    bodyRemote: true,
    answersRemote: true,
    parts: parts.map(part => ({
      id: part.id,
      partNumber: part.partNumber,
      rangeLabel: part.rangeLabel,
      questions: [],
    })),
  }

  return { body, answersVault, metaEntry }
}

function copyImages(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true })
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    copyFileSync(path.join(sourceDir, entry.name), path.join(targetDir, entry.name))
  }
}

function convertOne(testNumber) {
  const testDir = path.join(ROOT, `test-${testNumber}`)
  const rawExamPath = path.join(testDir, 'exam.json')
  const imagesDir = path.join(testDir, 'images')
  const slug = slugForTest(testNumber)
  const importDir = path.join(testDir, `${slug}-import`)
  const examsDir = path.join(importDir, 'apps', 'web', 'public', 'catalog', 'exams', 'reading')
  const readingDir = path.join(importDir, 'apps', 'web', 'public', 'catalog', 'reading', slug)

  if (!existsSync(rawExamPath)) {
    throw new Error(`Missing raw exam: ${rawExamPath}`)
  }
  if (!existsSync(imagesDir)) {
    throw new Error(`Missing images dir: ${imagesDir}`)
  }

  const rawExam = readJson(rawExamPath)
  const { body, answersVault, metaEntry } = convertExam(rawExam, testNumber)

  rmSync(importDir, { recursive: true, force: true })
  mkdirSync(examsDir, { recursive: true })
  mkdirSync(readingDir, { recursive: true })

  writeFileSync(
    path.join(examsDir, `${body.id}.json`),
    `${JSON.stringify(body, null, 2)}\n`,
    'utf8',
  )
  writeFileSync(
    path.join(examsDir, `${body.id}.answers.json`),
    `${JSON.stringify(answersVault, null, 2)}\n`,
    'utf8',
  )
  writeFileSync(
    path.join(importDir, 'meta-entry-to-paste-into-catalog-reading-meta.json'),
    `${JSON.stringify(metaEntry, null, 2)}\n`,
    'utf8',
  )

  copyImages(imagesDir, readingDir)

  return {
    testNumber,
    slug,
    importDir,
    questionCount: metaEntry.questionCount,
  }
}

function main() {
  const tests = parseArgs(process.argv)
  if (!tests.length) {
    console.error('No tests selected.')
    process.exit(1)
  }

  const results = []
  for (const testNumber of tests) {
    if (testNumber === 2) continue
    const result = convertOne(testNumber)
    results.push(result)
    console.log(`✓ test-${testNumber} -> ${result.importDir} (${result.questionCount} questions)`)
  }
  console.log(`Done: ${results.length}/${tests.filter(n => n !== 2).length}`)
}

main()

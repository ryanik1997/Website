import fs from 'node:fs/promises'
import path from 'node:path'

const PART_SPECS = {
  1: { rangeLabel: 'Questions 1–8', count: 8, type: 'multiple-choice' },
  2: { rangeLabel: 'Questions 9–16', count: 8, type: 'gap-fill' },
  3: { rangeLabel: 'Questions 17–24', count: 8, type: 'gap-fill' },
  4: { rangeLabel: 'Questions 25–30', count: 6, type: 'gap-fill' },
  5: { rangeLabel: 'Questions 31–36', count: 6, type: 'multiple-choice' },
  6: { rangeLabel: 'Questions 37–42', count: 6, type: 'matching-features' },
  7: { rangeLabel: 'Questions 43–52', count: 10, type: 'matching-features' },
}

const QUESTION_COUNTS = Object.fromEntries(Object.entries(PART_SPECS).map(([k, v]) => [Number(k), v.count]))
const PART_STARTS = { 1: 1, 2: 9, 3: 17, 4: 25, 5: 31, 6: 37, 7: 43 }

function stripHtml(input) {
  return String(input ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/h\d>|<\/li>|<\/tr>|<\/td>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&amp;/g, '&')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function normalizeText(input) {
  return String(input ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function htmlParagraphs(html) {
  const blocks = []
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let m
  while ((m = re.exec(String(html ?? ''))) !== null) {
    const text = normalizeText(stripHtml(m[1]))
    if (text) blocks.push({ text })
  }
  if (!blocks.length) {
    const text = normalizeText(stripHtml(html))
    if (text) blocks.push({ text })
  }
  return blocks
}

function questionRange(partNumber) {
  return PART_SPECS[partNumber]?.rangeLabel ?? `Questions ${PART_STARTS[partNumber]}`
}

function buildAnswerMap(answerPage) {
  const map = new Map()
  const groups = answerPage?.answers && typeof answerPage.answers === 'object'
    ? Object.values(answerPage.answers)
    : []

  for (const group of groups) {
    for (const item of Array.isArray(group) ? group : []) {
      const questionNumber = Number(item.questionNumber ?? item.number ?? item.question)
      if (!Number.isInteger(questionNumber)) {
        throw new Error(`Invalid answer question number: ${JSON.stringify(item)}`)
      }
      if (map.has(questionNumber)) {
        throw new Error(`Duplicate answer for question ${questionNumber}`)
      }
      map.set(questionNumber, {
        answer: normalizeText(item.answer),
        explanation: normalizeText(item.explanation ?? ''),
      })
    }
  }

  return map
}

function classifyFcePage(page, pageNumber) {
  const heading = [
    page.title,
    page.heading,
    page.partTitle,
    page.partTitle,
    page.instructions,
    page.passageTitle,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= 7) {
    return `part-${pageNumber}`
  }
  if (Number.isInteger(Number(page.partNumber)) && page.partNumber >= 1 && page.partNumber <= 7) {
    return `part-${page.partNumber}`
  }
  if (page.isAnswerPage || Array.isArray(page.answers) || /answer|answer key|correct answer|explanation/.test(heading)) {
    return 'answers'
  }
  const match = heading.match(/part\s*(\d+)/)
  if (match) return `part-${Number(match[1])}`
  return `unknown-page-${pageNumber}`
}

function parseQuestionOptions(q) {
  if (!Array.isArray(q.options)) return []
  return q.options.map(opt => {
    const rawKey = opt.key ?? opt.letter ?? opt.value ?? opt.id ?? ''
    const key = String(rawKey).trim()
    const label = normalizeText(opt.text ?? opt.label ?? opt.title ?? key)
    return { id: key || label, label }
  })
}

function convertPageToPart(page, answerMap, appTestNumber) {
  const partNumber = Number(page.partNumber)
  if (!PART_SPECS[partNumber]) {
    throw new Error(`Unsupported part number: ${page.partNumber}`)
  }

  const passageTitle = normalizeText(page.passageTitle ?? page.partTitle ?? `Part ${partNumber}`)
  const passage = htmlParagraphs(page.passageTextHtml)
  if (!passage.length) {
    passage.push({ text: passageTitle })
  }

  const questions = (page.questions ?? []).map(q => {
    const number = Number(q.number)
    const answerEntry = answerMap.get(number)
    if (!answerEntry) {
      throw new Error(`Missing answer for question ${number} in part ${partNumber}`)
    }
    const prompt =
      q.questionText
      ?? q.prompt
      ?? (partNumber === 5 ? `Question ${number}` : `Gap (${number})`)
    const normalized = {
      id: `catalog-reading-fce-b2-test${appTestNumber}-part-${partNumber}-q${number}`,
      number,
      type:
        partNumber === 1 ? 'multiple-choice'
          : partNumber === 2 || partNumber === 3 || partNumber === 4 ? 'gap-fill'
            : partNumber === 5 ? 'multiple-choice'
              : 'matching-features',
      prompt: normalizeText(prompt),
      options: parseQuestionOptions(q),
      answer: normalizeText(answerEntry.answer).toLowerCase(),
      explanation: normalizeText(answerEntry.explanation),
      answerConfidence: 'key',
    }
    if (partNumber === 3) {
      const baseWord = normalizeText(q.baseWord ?? q.wordStem ?? q.keyword ?? '')
      if (baseWord) normalized.prompt = `${normalized.prompt} — ${baseWord}`
    }
    if (partNumber === 4) {
      const keyword = normalizeText(q.keyword ?? '')
      if (keyword) normalized.prompt = `${keyword} — ${normalized.prompt}`
    }
    return normalized
  })

  const start = PART_STARTS[partNumber]
  const expectedNumbers = Array.from({ length: PART_SPECS[partNumber].count }, (_, i) => start + i)
  const seen = new Set(questions.map(q => q.number))
  for (const expected of expectedNumbers) {
    if (!seen.has(expected)) {
      throw new Error(`Part ${partNumber} missing question ${expected}`)
    }
  }

  const questionGroups = [
    {
      id: `catalog-reading-fce-b2-test${appTestNumber}-part-${partNumber}-g0`,
      range: questionRange(partNumber),
      instruction: normalizeText(page.instructions ?? ''),
      type: PART_SPECS[partNumber].type,
      paragraphLetters: partNumber === 6 ? ['A', 'B', 'C', 'D', 'E', 'F', 'G'] : undefined,
      features: partNumber === 7
        ? [
            { id: 'a', name: 'Section A' },
            { id: 'b', name: 'Section B' },
            { id: 'c', name: 'Section C' },
            { id: 'd', name: 'Section D' },
          ]
        : undefined,
      questions,
    },
  ]

  if (partNumber === 5) {
    questionGroups[0].instruction = normalizeText(page.instructions ?? 'Choose the correct answer.')
  }
  if (partNumber === 6) {
    questionGroups[0].instruction = normalizeText(page.instructions ?? 'Choose from the paragraphs A–G.')
  }
  if (partNumber === 7) {
    questionGroups[0].instruction = normalizeText(page.instructions ?? 'Choose from the sections A–D.')
  }

  return {
    id: `catalog-reading-fce-b2-test${appTestNumber}-part-${partNumber}`,
    partNumber,
    rangeLabel: questionRange(partNumber),
    passageTitle,
    passage,
    questionGroups,
  }
}

function buildExamBody(testNumber, parts) {
  const book = Math.ceil(testNumber / 4)
  return {
    id: `catalog-reading-fce-b2-test${testNumber}`,
    title:
      testNumber === 1
        ? 'FCE B2 Reading — Test 1'
        : `FCE B2 Reading — Book ${book} — Test ${testNumber}`,
    durationMinutes: 75,
    bandHint: 'B2 First Reading & Use of English — 7 parts',
    parts,
    examTrack: 'cambridge',
    cambridgeLevel: 'b2',
    catalogSlug: `fce-b2-test${testNumber}`,
    catalogBase: `/catalog/reading/fce-b2-test${testNumber}`,
  }
}

export function convertFcePagesToReadingExam(
  rawExam,
  { sourceTestNumber = Number(rawExam?.testNumber), appTestNumber = sourceTestNumber + 1 } = {},
) {
  const pages = Array.isArray(rawExam?.pages) ? rawExam.pages : []
  const answerPage = pages.find(page => page?.isAnswerPage || Array.isArray(page?.answers))
  const answerMap = buildAnswerMap(answerPage)
  const partPages = pages.filter(page => {
    const pageNumber = Number(page?.pageNumber)
    return Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= 7
  })
  const parts = []
  const inventory = []

  for (const page of partPages) {
    const classification = classifyFcePage(page, Number(page.pageNumber))
    const pageNumber = Number(page.pageNumber)
    inventory.push({
      pageNumber,
      file: `page-${pageNumber}.json`,
      classifiedAs: classification,
      questions: Array.isArray(page.questions) ? page.questions.length : 0,
      answers: 0,
      title: normalizeText(page.passageTitle ?? ''),
    })
    if (!classification.startsWith('part-')) {
      throw new Error(`Unknown page classification for source test ${sourceTestNumber} / app test ${appTestNumber} page ${pageNumber}: ${classification}`)
    }
    parts.push(convertPageToPart(page, answerMap, appTestNumber))
  }

  if (parts.length !== 7) {
    throw new Error(`Source test ${sourceTestNumber} / app test ${appTestNumber} must have 7 parts, got ${parts.length}`)
  }
  const partNumbers = parts.map(part => part.partNumber)
  for (let i = 0; i < partNumbers.length; i += 1) {
    if (partNumbers[i] !== i + 1) {
      throw new Error(`Source test ${sourceTestNumber} / app test ${appTestNumber} part order invalid: ${partNumbers.join(',')}`)
    }
  }

  const body = buildExamBody(appTestNumber, parts)
  const totalQuestions = parts.reduce((sum, part) => sum + part.questionGroups.reduce((s, g) => s + g.questions.length, 0), 0)
  return {
    body,
    inventory,
    answerCount: answerMap.size,
    totalQuestions,
    answerPageNumber: Number(answerPage?.pageNumber ?? 8),
  }
}

export async function loadFceTestExamJson(testNumber, sourceRoot) {
  const examPath = path.join(sourceRoot, `fce-reading-test${testNumber}`, 'exam', 'exam.json')
  const raw = JSON.parse(await fs.readFile(examPath, 'utf8'))
  return { raw, examPath }
}

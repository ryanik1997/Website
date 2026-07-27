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

const PART_STARTS = { 1: 1, 2: 9, 3: 17, 4: 25, 5: 31, 6: 37, 7: 43 }
const LETTERS = ['a', 'b', 'c', 'd']
const FEATURE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

function decodeHtmlEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    quot: '"',
    lt: '<',
    gt: '>',
    nbsp: ' ',
    rsquo: '’',
    lsquo: '‘',
    rdquo: '”',
    ldquo: '“',
    ndash: '–',
    mdash: '—',
    ellip: '…',
  }
  return String(value ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match)
}

function normalizeText(input) {
  return decodeHtmlEntities(String(input ?? ''))
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function stripHtml(input) {
  return normalizeText(
    String(input ?? '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>|<\/div>|<\/h\d>|<\/li>|<\/tr>|<\/td>|<\/blockquote>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
}

function htmlParagraphs(html) {
  const blocks = []
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let m
  while ((m = re.exec(String(html ?? ''))) !== null) {
    const text = stripHtml(m[1])
    if (text) blocks.push({ text })
  }
  if (!blocks.length) {
    const text = stripHtml(html)
    if (text) blocks.push({ text })
  }
  return blocks
}

function htmlParagraphInnerHtml(html) {
  const blocks = []
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let m
  while ((m = re.exec(String(html ?? ''))) !== null) {
    blocks.push(m[1])
  }
  if (!blocks.length && String(html ?? '').trim()) {
    blocks.push(String(html))
  }
  return blocks
}

function htmlToPlainWithGaps(html) {
  return stripHtml(
    String(html ?? '')
      .replace(/<select[\s\S]*?<\/select>/gi, ' _____ ')
      .replace(/<input[^>]*>/gi, ' _____ ')
      .replace(/<span class="nowrap">/gi, '')
      .replace(/<\/span>/gi, ' ')
      .replace(/<a[^>]*><\/a>/gi, ' ')
  )
}

function extractQuestionHtml(html, number) {
  const re = new RegExp(
    String.raw`<span class="nowrap">[\s\S]*?<strong>${number}</strong>[\s\S]*?<\/span><a[^>]*><\/a>`,
    'i',
  )
  const match = String(html ?? '').match(re)
  return match?.[0] ?? ''
}

function textWithInlineGap(html, number) {
  const raw = extractQuestionHtml(html, number)
  if (!raw) return `(${number}) .....`
  const stripped = htmlToPlainWithGaps(raw)
  return stripped.replace(new RegExp(`^${number}\\s*`, 'i'), `(${number}) `)
}

function parseQuestionOptions(q, letters = LETTERS) {
  const options = Array.isArray(q.options) ? q.options : []
  return options.map((opt, index) => {
    const explicit = String(opt.key ?? opt.letter ?? opt.value ?? opt.id ?? '').trim()
    const id = explicit && letters.includes(explicit.toLowerCase()) ? explicit.toLowerCase() : letters[index] ?? explicit.toLowerCase()
    return {
      id,
      label: normalizeText(opt.text ?? opt.label ?? opt.title ?? ''),
    }
  })
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

function questionRange(partNumber) {
  return PART_SPECS[partNumber]?.rangeLabel ?? `Questions ${PART_STARTS[partNumber]}`
}

function buildPartBase(page, appTestNumber, answerMap) {
  const partNumber = Number(page.partNumber)
  const partId = `catalog-reading-fce-b2-test${appTestNumber}-part-${partNumber}`
  const passageTitle = normalizeText(page.passageTitle ?? `Part ${partNumber}`)
  const start = PART_STARTS[partNumber]
  const questions = (page.questions ?? []).map(q => {
    const number = Number(q.number)
    const answerEntry = answerMap.get(number)
    if (!answerEntry) {
      throw new Error(`Missing answer for question ${number} in part ${partNumber}`)
    }
    return {
      id: `${partId}-q${number}`,
      number,
      answer: normalizeText(answerEntry.answer).toLowerCase(),
      explanation: normalizeText(answerEntry.explanation),
      answerConfidence: 'key',
      rawQuestion: q,
    }
  })
  const expectedNumbers = Array.from({ length: PART_SPECS[partNumber].count }, (_, i) => start + i)
  const seen = new Set(questions.map(q => q.number))
  for (const expected of expectedNumbers) {
    if (!seen.has(expected)) throw new Error(`Part ${partNumber} missing question ${expected}`)
  }
  return { partId, partNumber, passageTitle, questions }
}

function makeGenericPassageBlocks(html) {
  return htmlParagraphs(html).map(block => ({ text: block.text }))
}

function convertPart1(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const partHtml = String(page.passageTextHtml ?? '')
  const passage = htmlParagraphInnerHtml(partHtml).map(block => ({
    text: htmlToPlainWithGaps(block).replace(/\b(\d+)\s+_____/g, '($1) .....'),
  })).filter(block => block.text)
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => {
    const options = parseQuestionOptions(q, LETTERS)
    const answer = question.answer.toUpperCase()
    if (!options.some(opt => opt.id.toUpperCase() === answer)) {
      throw new Error(`${question.id}: answer ${answer} not found in options`)
    }
    return {
      ...question,
      type: 'multiple-choice',
      prompt: `Gap (${question.number})`,
      options,
    }
  })
  return {
    id: base.partId,
    partNumber: 1,
    rangeLabel: questionRange(1),
    passageTitle: base.passageTitle,
    passage,
    questionGroups: [{
      id: `${base.partId}-g0`,
      range: questionRange(1),
      instruction: normalizeText(page.instructions ?? ''),
      type: 'multiple-choice',
      questions,
    }],
  }
}

function convertPart2(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const html = String(page.passageTextHtml ?? '')
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => ({
    ...question,
    type: 'gap-fill',
    prompt: `Gap (${question.number})`,
    size: q.size ?? 10,
  }))
  const passage = htmlParagraphInnerHtml(html).map(block => ({ text: htmlToPlainWithGaps(block).replace(/\b(\d+)\s+_____/g, '($1) .....') }))
  return {
    id: base.partId,
    partNumber: 2,
    rangeLabel: questionRange(2),
    passageTitle: base.passageTitle,
    passage,
    questionGroups: [{
      id: `${base.partId}-g0`,
      range: questionRange(2),
      instruction: normalizeText(page.instructions ?? ''),
      type: 'gap-fill',
      questions,
    }],
  }
}

function convertPart3(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const html = String(page.passageTextHtml ?? '')
  const wordStems = new Map()
  for (const match of html.matchAll(/(\d+)\.\s*([A-Z]+)/g)) {
    wordStems.set(Number(match[1]), match[2])
  }
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => {
    const stem = wordStems.get(question.number) ?? normalizeText(q.prompt ?? '')
    return {
      ...question,
      type: 'gap-fill',
      prompt: `Gap (${question.number}) — ${stem}`,
      size: q.size ?? 10,
    }
  })
  const passage = htmlParagraphInnerHtml(html).map(block => ({ text: htmlToPlainWithGaps(block).replace(/\b(\d+)\s+_____/g, '($1) .....') }))
  return {
    id: base.partId,
    partNumber: 3,
    rangeLabel: questionRange(3),
    passageTitle: base.passageTitle,
    passage,
    questionGroups: [{
      id: `${base.partId}-g0`,
      range: questionRange(3),
      instruction: normalizeText(page.instructions ?? ''),
      type: 'gap-fill',
      questions,
    }],
  }
}

function parseTransformationParagraphs(html) {
  const paragraphs = htmlParagraphs(html).map(block => block.text)
  return paragraphs
}

function convertPart4(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const html = String(page.passageTextHtml ?? '')
  const paragraphs = parseTransformationParagraphs(html)
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => {
    const promptText = normalizeText(q.prompt ?? '')
    const sentence1 = promptText.replace(/^[.]\s*/, '').trim()
    return {
      ...question,
      type: 'gap-fill',
      prompt: `${sentence1} ${q.keyword ?? ''} →`,
      keyword: normalizeText(q.keyword ?? ''),
      size: q.size ?? 40,
    }
  })
  return {
    id: base.partId,
    partNumber: 4,
    rangeLabel: questionRange(4),
    passageTitle: base.passageTitle,
    passage: paragraphs.map(text => ({ text })),
    questionGroups: [{
      id: `${base.partId}-g0`,
      range: questionRange(4),
      instruction: normalizeText(page.instructions ?? ''),
      type: 'gap-fill',
      questions,
    }],
  }
}

function convertPart5(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const html = String(page.passageTextHtml ?? '')
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => {
    const options = parseQuestionOptions(q, LETTERS)
    const answer = question.answer.toUpperCase()
    if (!options.some(opt => opt.id.toUpperCase() === answer)) {
      throw new Error(`${question.id}: answer ${answer} not found in options`)
    }
    return {
      ...question,
      type: 'multiple-choice',
      prompt: normalizeText(q.questionText ?? `Question ${question.number}`),
      options,
    }
  })
  const passage = htmlParagraphInnerHtml(html).map(block => ({ text: htmlToPlainWithGaps(block).replace(/\b(\d+)\s+_____/g, '($1) .....') }))
  return {
    id: base.partId,
    partNumber: 5,
    rangeLabel: questionRange(5),
    passageTitle: base.passageTitle,
    passage,
    questionGroups: [{
      id: `${base.partId}-g0`,
      range: questionRange(5),
      instruction: normalizeText(page.instructions ?? ''),
      type: 'multiple-choice',
      questions,
    }],
  }
}

function convertPart6(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const html = String(page.passageTextHtml ?? '')
  const featureMatches = [...html.matchAll(/<strong>\s*([A-G])\s*<\/strong>\s*([\s\S]*?)(?=<br\s*\/?>\s*<strong>|<\/p>\s*<div|$)/gi)]
  const features = featureMatches.slice(0, 7).map(match => ({
    id: match[1],
    name: normalizeText(stripHtml(match[2])),
  }))
  const passageHtml = featureMatches.length
    ? html.slice(0, featureMatches[0].index).trim()
    : html
  const passage = htmlParagraphInnerHtml(passageHtml).map(block => ({ text: htmlToPlainWithGaps(block).replace(/\b(\d+)\s+_____/g, '($1) .....') }))
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => ({
    ...question,
    type: 'matching-features',
    prompt: normalizeText(q.questionText ?? `Gap (${question.number})`),
    options: parseQuestionOptions(q, FEATURE_LETTERS),
  }))
  return {
    id: base.partId,
    partNumber: 6,
    rangeLabel: questionRange(6),
    passageTitle: base.passageTitle,
    passage,
    questionGroups: [{
      id: `${base.partId}-g0`,
      range: questionRange(6),
      instruction: normalizeText(page.instructions ?? ''),
      type: 'matching-features',
      paragraphLetters: FEATURE_LETTERS,
      features,
      questions,
    }],
  }
}

function convertPart7(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const html = String(page.passageTextHtml ?? '')
  const featureSections = [...html.matchAll(/<strong>\s*([A-D])\s*<\/strong>\s*([\s\S]*?)(?=<br\s*\/?>\s*<strong>\s*[A-D]\s*<\/strong>|<\/p>\s*<div|$)/gi)]
  const passage = featureSections.length
    ? featureSections.map(match => ({ label: match[1], text: normalizeText(stripHtml(match[2])) }))
    : htmlParagraphInnerHtml(html).map(block => ({ text: htmlToPlainWithGaps(block) }))
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => ({
    ...question,
    type: 'matching-features',
    prompt: normalizeText(q.questionText ?? `Question ${question.number}`),
    options: parseQuestionOptions(q, LETTERS),
  }))
  return {
    id: base.partId,
    partNumber: 7,
    rangeLabel: questionRange(7),
    passageTitle: base.passageTitle,
    passage,
    questionGroups: [{
      id: `${base.partId}-g0`,
      range: questionRange(7),
      instruction: normalizeText(page.instructions ?? ''),
      type: 'matching-features',
      features: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
        { id: 'c', name: 'C' },
        { id: 'd', name: 'D' },
      ],
      questions,
    }],
  }
}

function convertPageToPart(page, answerMap, appTestNumber) {
  switch (Number(page.partNumber)) {
    case 1:
      return convertPart1(page, answerMap, appTestNumber)
    case 2:
      return convertPart2(page, answerMap, appTestNumber)
    case 3:
      return convertPart3(page, answerMap, appTestNumber)
    case 4:
      return convertPart4(page, answerMap, appTestNumber)
    case 5:
      return convertPart5(page, answerMap, appTestNumber)
    case 6:
      return convertPart6(page, answerMap, appTestNumber)
    case 7:
      return convertPart7(page, answerMap, appTestNumber)
    default:
      throw new Error(`Unsupported FCE part: ${page.partNumber}`)
  }
}

function buildExamBody(testNumber, parts) {
  const book = Math.ceil(testNumber / 4)
  return {
    id: `catalog-reading-fce-b2-test${testNumber}`,
    title: testNumber === 1 ? 'FCE B2 Reading — Test 1' : `FCE B2 Reading — Book ${book} — Test ${testNumber}`,
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
    const pageNumber = Number(page.pageNumber)
    const classification = `part-${Number(page.partNumber)}`
    inventory.push({
      pageNumber,
      file: `page-${pageNumber}.json`,
      classifiedAs: classification,
      questions: Array.isArray(page.questions) ? page.questions.length : 0,
      answers: 0,
      title: normalizeText(page.passageTitle ?? ''),
    })
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

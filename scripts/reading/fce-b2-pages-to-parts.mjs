import fs from 'node:fs/promises'
import path from 'node:path'
import * as parse5 from 'parse5'

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
const FEATURE_IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
const FEATURE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

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

function parseHtmlDocument(html) {
  return parse5.parseFragment(String(html ?? ''))
}

function nodesByTag(node, tagName) {
  const out = []
  visitNodes(node, child => {
    if (child.tagName?.toLowerCase() === tagName.toLowerCase()) out.push(child)
  })
  return out
}

function elementText(node) {
  let text = ''
  visitNodes(node, child => {
    if (child.nodeName === '#text') text += ` ${child.value ?? ''}`
  })
  return normalizeText(text)
}

function childElements(node, tagName) {
  return Array.from(node?.childNodes ?? []).filter(child => (
    child.tagName && (!tagName || child.tagName.toLowerCase() === tagName)
  ))
}

function nodeText(node) {
  return node?.nodeName === '#text' ? normalizeText(node.value) : elementText(node)
}

function splitCombinedPart7Heading(value) {
  const match = normalizeText(value).match(/^([A-E])[.]?(?:\s+(.+))?$/i)
  if (!match) return null
  return {
    label: match[1].toUpperCase(),
    heading: normalizeText(match[2]),
  }
}

export function parsePart7Section(paragraph, validLabels) {
  const children = Array.from(paragraph?.childNodes ?? [])
  const labelIndex = children.findIndex(child => (
    ['strong', 'b', 'em'].includes(child.tagName?.toLowerCase())
    && splitCombinedPart7Heading(elementText(child))
  ))
  if (labelIndex < 0) return null

  const labelNode = children[labelIndex]
  const combined = splitCombinedPart7Heading(elementText(labelNode))
  if (!combined || !validLabels.includes(combined.label)) return null

  const tail = children.slice(labelIndex + 1)
  const breakIndex = tail.findIndex(child => child.tagName?.toLowerCase() === 'br')
  const beforeBreak = breakIndex >= 0 ? tail.slice(0, breakIndex) : []
  const afterBreak = breakIndex >= 0 ? tail.slice(breakIndex + 1) : tail
  const beforeBreakText = normalizeText(beforeBreak.map(nodeText).filter(Boolean).join(' '))
  const heading = combined.heading || beforeBreakText || undefined
  let text = normalizeText(afterBreak.map(nodeText).filter(Boolean).join(' '))
  if (combined.heading && text.toLowerCase().startsWith(combined.heading.toLowerCase())) {
    text = normalizeText(text.slice(combined.heading.length).replace(/^\s*[,.:;–—-]\s*/, ''))
  }
  const firstHeadingNode = beforeBreak.find(child => nodeText(child))
  const shape = combined.heading
    ? 'label-heading-same-strong'
    : breakIndex < 0
      ? 'label-only-no-br'
      : !beforeBreakText
        ? 'label-only-before-br'
        : ['strong', 'b', 'em'].includes(firstHeadingNode?.tagName?.toLowerCase())
          ? 'label-strong-heading-element-before-br'
          : firstHeadingNode?.tagName
            ? 'label-element-heading-before-br'
            : 'label-strong-heading-text-before-br'

  return {
    label: combined.label,
    heading,
    text,
    rawStrongTexts: nodesByTag(paragraph, 'strong').map(elementText).filter(Boolean),
    bodyStart: text.slice(0, 120),
    shape,
  }
}

export function auditFcePart7Page(page, validLabels) {
  const html = String(page?.passageTextHtml || page?.entryContentHtml || '')
  const doc = parseHtmlDocument(html)
  return nodesByTag(doc, 'p')
    .map(paragraph => parsePart7Section(paragraph, validLabels))
    .filter(Boolean)
}

function hasTag(node, tagName) {
  return nodesByTag(node, tagName).length > 0
}

function visitNodes(node, fn) {
  for (const child of node?.childNodes ?? []) {
    fn(child)
    visitNodes(child, fn)
  }
}

function attrValue(node, name) {
  return node?.attrs?.find(attr => attr.name === name)?.value ?? ''
}

function strongNumber(node) {
  const strong = nodesByTag(node, 'strong')[0]
  const n = Number(elementText(strong).match(/\d+/)?.[0])
  return Number.isInteger(n) ? n : null
}

function replaceNodeWithText(node, text) {
  const parent = node.parentNode
  if (!parent?.childNodes) return
  const index = parent.childNodes.indexOf(node)
  if (index >= 0) parent.childNodes.splice(index, 1, { nodeName: '#text', value: text, parentNode: parent })
}

function removeNode(node) {
  const parent = node.parentNode
  if (!parent?.childNodes) return
  const index = parent.childNodes.indexOf(node)
  if (index >= 0) parent.childNodes.splice(index, 1)
}

function passageBlocksWithInlineMarkers(html, numbers, { strict = false, expectedTag = null } = {}) {
  const expected = new Set(numbers)
  const found = new Set()
  const doc = parseHtmlDocument(html)
  for (const anchor of nodesByTag(doc, 'a')) removeNode(anchor)
  for (const tagName of expectedTag ? [expectedTag] : ['select', 'input']) {
    for (const widget of [...nodesByTag(doc, tagName)]) {
      const raw = `${attrValue(widget, 'id')} ${attrValue(widget, 'name')}`
      const number = Number(raw.match(/(?:^|\b)q0?(\d+)\b/i)?.[1])
      if (!expected.has(number)) continue
      let replacementTarget = widget
      let parent = widget.parentNode
      while (parent && parent !== doc) {
        if (parent.tagName === 'span' && /\bnowrap\b/.test(attrValue(parent, 'class'))) {
          replacementTarget = parent
          break
        }
        parent = parent.parentNode
      }
      replaceNodeWithText(replacementTarget, ` (${number}) ..... `)
      found.add(number)
    }
  }
  let blockNodes = nodesByTag(doc, 'p')
  if (!blockNodes.some(node => numbers.some(number => elementText(node).includes(`(${number}) .....`)))) {
    blockNodes = nodesByTag(doc, 'td')
  }
  const blocks = blockNodes
    .map(node => ({ text: elementText(node) }))
    .filter(block => block.text)
  const joined = blocks.map(b => b.text).join('\n')
  try {
    for (const number of numbers) {
      if (!found.has(number)) throw new Error(`Missing raw widget q${number}`)
    }
    assertMarkers(joined, numbers, `part markers ${numbers[0]}-${numbers[numbers.length - 1]}`)
  } catch (error) {
    if (strict) throw error
  }
  return blocks
}

function assertMarkers(text, numbers, label) {
  for (const n of numbers) {
    const count = (text.match(new RegExp(`\\(${n}\\)\\s*\\.\\.\\.\\.\\.`, 'g')) ?? []).length
    if (count !== 1) throw new Error(`${label}: expected one marker for ${n}, got ${count}`)
  }
}

function markerNumbers(start, count) {
  return Array.from({ length: count }, (_, i) => start + i)
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

function splitAnswerAlternatives(raw) {
  return String(raw ?? '')
    .replace(/[.;]+$/g, '')
    .split(/\s*(?:\/|\|)\s*/i)
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)
}

function normalizeAnswerRecord(item) {
  let rawAnswer = normalizeText(item.answer)
  let explanation = normalizeText(item.explanation ?? '')

  const questionNumber = Number(item.questionNumber ?? item.number ?? item.question)
  if (questionNumber >= 9 && questionNumber <= 16 && /^[a-z]$/i.test(rawAnswer) && /^[a-z]{3,}(?:\/|$)/i.test(explanation)) {
    const firstToken = explanation.match(/^([a-z]+)/i)?.[1] ?? ''
    const joined = `${rawAnswer}${firstToken}`
    if (/^[a-z]{4,}$/i.test(joined)) {
      rawAnswer = `${joined}${explanation.slice(firstToken.length)}`
      explanation = rawAnswer
    }
  }

  const acceptedAnswers = splitAnswerAlternatives(rawAnswer)
  if (!acceptedAnswers.length) {
    throw new Error(`Missing answer Q${item.questionNumber ?? item.number ?? item.question}`)
  }
  return {
    answer: acceptedAnswers[0],
    acceptedAnswers,
    explanation: explanation || rawAnswer,
  }
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
      map.set(questionNumber, normalizeAnswerRecord(item))
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
      acceptedAnswers: answerEntry.acceptedAnswers,
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
  const passage = passageBlocksWithInlineMarkers(partHtml, markerNumbers(1, 8), { strict: true, expectedTag: 'select' })
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => {
    const options = parseQuestionOptions(q, LETTERS)
    if (options.length !== 4 || options.some(opt => !opt.label)) {
      throw new Error(`${question.id}: Part 1 must have four nonempty options`)
    }
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
  const html = String(page.passageTextHtml || page.entryContentHtml || '')
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => ({
    ...question,
    type: 'gap-fill',
    prompt: `Gap (${question.number})`,
    size: q.size ?? 10,
  }))
  const passage = passageBlocksWithInlineMarkers(html, markerNumbers(9, 8), { strict: Boolean(page.origin === 'source' && html), expectedTag: 'input' })
  return {
    id: base.partId,
    partNumber: 2,
    rangeLabel: questionRange(2),
    passageTitle: base.passageTitle,
    passageSubtitle: normalizeText(page.example ?? ''),
    passage: passage.map(block => ({ ...block, _provenance: 'source' })),
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
  const html = String(page.passageTextHtml ?? page.passageHtml ?? '')
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
      baseWord: stem,
      size: q.size ?? 10,
    }
  })
  const passage = passageBlocksWithInlineMarkers(html, markerNumbers(17, 8), { strict: true, expectedTag: 'input' })
  for (const question of questions) {
    if (!question.baseWord) throw new Error(`${question.id}: Part 3 baseWord is empty`)
  }
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

function parseTransformationItems(html, sourceQuestions) {
  const doc = parseHtmlDocument(html)
  const paragraphs = nodesByTag(doc, 'p').filter(p => hasTag(p, 'input')).map(p => {
    for (const input of nodesByTag(p, 'input')) replaceNodeWithText(input, ' ..... ')
    return elementText(p).replace(/_{3,}/g, '.....')
  }).filter(Boolean)
  return sourceQuestions.map((q, index) => {
    let keyword = normalizeText(q.keyword ?? '')
    const sourceSentence = normalizeText(q.prompt ?? '').replace(/^[.]\s*/, '')
    const rawTarget = paragraphs[index] ?? ''
    const targetSentence = rawTarget
      .replace(new RegExp(`^${q.number}\\s*`, 'i'), '')
      .replace(new RegExp(`\\b${keyword}\\b`, 'i'), '')
      .trim()
    if (sourceSentence && keyword && targetSentence.includes('.....')) {
      return { number: Number(q.number), sourceSentence, keyword, targetSentence }
    }
    let promptText = normalizeText(q.prompt ?? '').replace(/^[.]\s*/, '')
    if (!keyword) {
      const embeddedKeyword = promptText.match(/\.([A-Z]{2,})(?=[A-Z][a-z])/)
      if (embeddedKeyword) {
        keyword = embeddedKeyword[1]
        promptText = promptText.replace(embeddedKeyword[1], `${embeddedKeyword[1]} `)
      }
    }
    const promptParts = promptText.split(/(?<=[.!?])\s*(?=[A-Z])/)
    const fallbackTargetStart = promptParts.length > 1 ? promptParts.pop() : ''
    const fallbackSource = promptParts.join(' ').trim() || promptText
    if (!fallbackSource || !keyword) {
      throw new Error(`Part 4 question ${q.number}: failed to parse source/keyword/target`)
    }
    return {
      number: Number(q.number),
      sourceSentence: fallbackSource,
      keyword,
      targetSentence: fallbackTargetStart ? `${fallbackTargetStart} .....` : '.....',
    }
  })
}

function convertPart4(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const html = String(page.fullHtml ?? '')
  const parsedItems = parseTransformationItems(html, page.questions ?? [])
  const byNumber = new Map(parsedItems.map(item => [item.number, item]))
  const questions = base.questions.map(({ rawQuestion: _q, ...question }) => {
    const item = byNumber.get(question.number)
    if (!item) throw new Error(`Part 4 missing parsed item ${question.number}`)
    return {
      ...question,
      type: 'gap-fill',
      prompt: `${item.sourceSentence} ${item.keyword} -> ${item.targetSentence}`,
      sourceSentence: item.sourceSentence,
      keyword: item.keyword,
      targetSentence: item.targetSentence,
      size: 40,
    }
  })
  return {
    id: base.partId,
    partNumber: 4,
    rangeLabel: questionRange(4),
    passageTitle: base.passageTitle,
    passage: [],
    questionGroups: [{
      id: `${base.partId}-g0`,
      range: questionRange(4),
      instruction: normalizeText(page.instructions ?? ''),
      type: 'gap-fill',
      questions,
    }],
  }
}
function part5PassageHtml(page) {
  const parsed = String(page.passageTextHtml ?? '').trim()
  if (parsed) return parsed

  const html = String(page.entryContentHtml ?? '')
  const questionStart = html.search(/<p\b[^>]*id=["']d31["']/i)
  if (questionStart === -1) return ''

  const beforeQuestions = html.slice(0, questionStart)
  const heading = beforeQuestions.match(/<h2\b[^>]*>[\s\S]*?<\/h2>/i)
  if (heading?.index != null) {
    return beforeQuestions.slice(heading.index).trim()
  }

  const partHeading = beforeQuestions.match(/<h1\b[^>]*>\s*Part\s+5\s*<\/h1>/i)
  if (partHeading?.index == null) return ''

  return beforeQuestions
    .slice(partHeading.index + partHeading[0].length)
    .replace(
      /^\s*<p\b[^>]*>\s*<em\b[^>]*>[\s\S]*?<\/em>\s*<\/p>/i,
      '',
    )
    .trim()
}

function convertPart5(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const html = part5PassageHtml(page)
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
  const html = String(page.passageTextHtml || page.entryContentHtml || '')
  const featureMatches = [...html.matchAll(/<strong>\s*([A-G])\.?\s*<\/strong>\s*([\s\S]*?)(?=<br\s*\/?>\s*<strong>|<\/p>\s*<div|$)/gi)]
  const features = featureMatches.slice(0, 7).map((match, index) => ({
    id: FEATURE_IDS[index],
    name: normalizeText(stripHtml(match[2])),
  }))
  const passageHtml = featureMatches.length
    ? html.slice(0, featureMatches[0].index).trim()
    : html
  const passage = passageBlocksWithInlineMarkers(passageHtml, markerNumbers(37, 6), { strict: true, expectedTag: 'select' })
  if (features.length !== 7 || features.some(feature => !feature.name)) {
    throw new Error(`${base.partId}: Part 6 requires seven nonempty features`)
  }
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => ({
    ...question,
    type: 'matching-features',
    prompt: normalizeText(q.questionText ?? `Gap (${question.number})`),
    options: parseQuestionOptions(q, FEATURE_IDS),
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
      paragraphLetters: FEATURE_LABELS,
      features,
      questions,
    }],
  }
}

function assertPart7Section(section, partId) {
  if (!/^[A-E]$/.test(section.label)) {
    throw new Error(`${partId}: invalid Part 7 label ${section.label}`)
  }
  if (!section.text?.trim()) {
    throw new Error(`${partId}: section ${section.label} missing body`)
  }
  if (section.heading && section.text.toLowerCase().startsWith(section.heading.toLowerCase())) {
    throw new Error(`${partId}: section ${section.label} heading leaked into body`)
  }
}

function convertPart7(page, answerMap, appTestNumber) {
  const base = buildPartBase(page, appTestNumber, answerMap)
  const sourceOptions = (page.questions ?? []).flatMap(question => question?.options ?? [])
  const sectionLetters = [...new Set(sourceOptions.map(option => (
    normalizeText(option?.label ?? option?.text ?? option?.value).toUpperCase()
  )).filter(value => /^[A-E]$/.test(value)))]
  if (sectionLetters.length < 4 || sectionLetters.length > 5) {
    throw new Error(`${base.partId}: Part 7 requires four or five section labels`)
  }
  const passage = auditFcePart7Page(page, sectionLetters).map(({ label, heading, text }) => ({
    label,
    heading,
    text,
  }))
  if (passage.length !== sectionLetters.length || passage.some((block, index) => block.label !== sectionLetters[index])) {
    throw new Error(`${base.partId}: Part 7 section labels must be ${sectionLetters.join(',')}`)
  }
  for (const section of passage) assertPart7Section(section, base.partId)
  const optionLetters = sectionLetters.map(letter => letter.toLowerCase())
  const questions = base.questions.map(({ rawQuestion: q, ...question }) => ({
    ...question,
    type: 'matching-features',
    prompt: normalizeText(q.questionText ?? `Question ${question.number}`),
    options: parseQuestionOptions(q, optionLetters),
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
      features: sectionLetters.map(letter => ({ id: letter.toLowerCase(), name: letter })),
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

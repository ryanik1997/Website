#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as parse5 from 'parse5'
import { resolveTainguyenPath } from '../tainguyen-path.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..')
const FCE_ROOT = path.join(resolveTainguyenPath(), 'Import Cambridge', 'FCE_B2', 'Reading')
const PACKAGE_ROOT = path.join(REPO_ROOT, 'packages', 'catalog', 'data')
const RUNTIME_ROOT = path.join(REPO_ROOT, 'apps', 'web', 'public', 'catalog', 'exams', 'reading')
const REPAIR_ROOT = path.join(__dirname, 'generated', 'fce-b2')
const JSON_OUT = path.join(REPO_ROOT, 'tmp', 'fce-b2-corpus-audit.json')
const MARKDOWN_OUT = path.join(REPO_ROOT, 'tmp', 'fce-b2-corpus-audit.md')

const PART_SPECS = {
  1: { start: 1, count: 8, widget: 'select', options: 4, markers: true },
  2: { start: 9, count: 8, widget: 'input', markers: true },
  3: { start: 17, count: 8, widget: 'input', markers: true, baseWords: true },
  4: { start: 25, count: 6, widget: 'input', transformations: true },
  5: { start: 31, count: 6, options: 4, passage: true },
  6: { start: 37, count: 6, widget: 'select', options: 7, markers: true, features: 7 },
  7: { start: 43, count: 10, widget: 'select', options: 4, sections: 4 },
}

function expectedNumbers(partNumber) {
  const spec = PART_SPECS[partNumber]
  return Array.from({ length: spec.count }, (_, index) => spec.start + index)
}

function visitNodes(node, visitor) {
  for (const child of node?.childNodes ?? []) {
    visitor(child)
    visitNodes(child, visitor)
  }
}

function attrValue(node, name) {
  return node?.attrs?.find(attribute => attribute.name === name)?.value ?? ''
}

function nodesByTag(node, tagName) {
  const nodes = []
  visitNodes(node, child => {
    if (child.tagName?.toLowerCase() === tagName.toLowerCase()) nodes.push(child)
  })
  return nodes
}

function elementText(node) {
  let value = ''
  visitNodes(node, child => {
    if (child.nodeName === '#text') value += ` ${child.value ?? ''}`
  })
  return value.replace(/\s+/g, ' ').trim()
}

function widgetNumber(node) {
  for (const raw of [attrValue(node, 'id'), attrValue(node, 'name')]) {
    const match = raw.match(/(?:^|\b)q0?(\d+)\b/i)
    if (match) return Number(match[1])
  }
  return null
}

export function inspectSourceWidgets(html, numbers) {
  const expected = new Set(numbers)
  const doc = parse5.parseFragment(String(html ?? ''))
  const widgets = new Map()

  visitNodes(doc, node => {
    if (!node.tagName) return
    const tag = node.tagName.toLowerCase()
    if (tag !== 'input' && tag !== 'select') return
    const number = widgetNumber(node)
    if (!expected.has(number)) return
    widgets.set(number, {
      tag,
      id: attrValue(node, 'id'),
      name: attrValue(node, 'name'),
      optionCount: tag === 'select'
        ? nodesByTag(node, 'option').filter(option => elementText(option)).length
        : 0,
    })
  })

  return widgets
}

function allQuestions(part) {
  return (part?.questionGroups ?? []).flatMap(group => group?.questions ?? [])
}

function passageText(part) {
  return (part?.passage ?? []).map(block => `${block?.label ? `${block.label} ` : ''}${block?.text ?? ''}`).join('\n')
}

function markerCount(text, numbers) {
  return numbers.reduce((total, number) => total + (
    (String(text).match(new RegExp(`\\(${number}\\)\\s*\\.\\.\\.\\.\\.`, 'g')) ?? []).length
  ), 0)
}

function sourceHtml(page) {
  return String(page?.passageTextHtml || page?.entryContentHtml || page?.rawHtmlSample || '')
}

function rawBaseWordCount(html, numbers, questions) {
  const found = new Set()
  for (const match of String(html).matchAll(/\b(\d{1,2})\.\s*([A-Z]{2,})\b/g)) {
    if (numbers.includes(Number(match[1]))) found.add(Number(match[1]))
  }
  for (const question of questions) {
    if (numbers.includes(Number(question?.number)) && String(question?.baseWord ?? question?.prompt ?? '').trim()) {
      found.add(Number(question.number))
    }
  }
  return found.size
}

function labelledBlockCount(html, letters) {
  const doc = parse5.parseFragment(String(html ?? ''))
  const found = new Set()
  for (const strong of nodesByTag(doc, 'strong')) {
    const text = elementText(strong).toUpperCase()
    if (letters.includes(text)) found.add(text)
  }
  return found.size
}

function getAnswerMap(rawExam) {
  const answerPage = (rawExam?.pages ?? []).find(page => page?.isAnswerPage || page?.answers)
  const map = new Map()
  for (const group of Object.values(answerPage?.answers ?? {})) {
    for (const answer of Array.isArray(group) ? group : []) {
      const number = Number(answer?.questionNumber ?? answer?.number)
      if (Number.isInteger(number)) map.set(number, answer)
    }
  }
  return map
}

function inspectRaw(page, answerMap, partNumber) {
  const spec = PART_SPECS[partNumber]
  const numbers = expectedNumbers(partNumber)
  const html = sourceHtml(page)
  const questions = Array.isArray(page?.questions) ? page.questions : []
  const widgets = inspectSourceWidgets(html, numbers)
  const failures = []

  if (html.trim().length < 50) failures.push('raw passage is empty or too short')
  if (questions.filter(question => numbers.includes(Number(question?.number))).length !== spec.count) {
    failures.push(`raw question count is not ${spec.count}`)
  }
  const rawAnswerCount = numbers.filter(number => answerMap.has(number)).length
  if (rawAnswerCount !== spec.count) failures.push(`raw answer count is not ${spec.count}`)

  if (spec.widget) {
    for (const number of numbers) {
      const widget = widgets.get(number)
      if (!widget) failures.push(`missing raw ${spec.widget} q${number}`)
      else if (widget.tag !== spec.widget) failures.push(`q${number} uses ${widget.tag}, expected ${spec.widget}`)
      else if (spec.options && widget.optionCount !== spec.options) {
        failures.push(`q${number} has ${widget.optionCount} nonempty options, expected ${spec.options}`)
      }
    }
  }

  const baseWordCount = spec.baseWords ? rawBaseWordCount(html, numbers, questions) : 0
  if (spec.baseWords && baseWordCount !== spec.count) failures.push(`raw base-word count is not ${spec.count}`)
  const featureCount = spec.features ? labelledBlockCount(html, ['A', 'B', 'C', 'D', 'E', 'F', 'G']) : 0
  if (spec.features && featureCount !== spec.features) failures.push(`raw feature count is not ${spec.features}`)
  const sectionCount = spec.sections ? labelledBlockCount(html, ['A', 'B', 'C', 'D']) : 0
  if (spec.sections && sectionCount !== spec.sections) failures.push(`raw section count is not ${spec.sections}`)

  return {
    html,
    widgets,
    questionCount: questions.filter(question => numbers.includes(Number(question?.number))).length,
    answerCount: rawAnswerCount,
    baseWordCount,
    featureCount,
    sectionCount,
    failures,
    valid: failures.length === 0,
  }
}

function inspectPackage(part, partNumber) {
  const spec = PART_SPECS[partNumber]
  const numbers = expectedNumbers(partNumber)
  const questions = allQuestions(part)
  const text = passageText(part)
  const failures = []
  if (questions.length !== spec.count) failures.push(`package question count is not ${spec.count}`)
  if (spec.markers && markerCount(text, numbers) !== spec.count) failures.push(`package marker count is not ${spec.count}`)
  if (spec.passage && text.trim().length < 50) failures.push('package passage is empty or too short')
  if (partNumber === 1 || partNumber === 5) {
    for (const question of questions) {
      if ((question?.options ?? []).length !== 4) failures.push(`package Q${question.number} option count is not 4`)
    }
  }
  if (partNumber === 3 && questions.filter(question => String(question?.baseWord ?? '').trim()).length !== 8) {
    failures.push('package base-word count is not 8')
  }
  if (partNumber === 4) {
    for (const question of questions) {
      if (!question?.sourceSentence || !question?.keyword || !question?.targetSentence?.includes('.....')) {
        failures.push(`package Q${question.number} transformation fields incomplete`)
      }
    }
  }
  if (partNumber === 6 && (part?.questionGroups?.[0]?.features ?? []).length !== 7) failures.push('package feature count is not 7')
  if (partNumber === 7) {
    const labels = (part?.passage ?? []).map(block => block?.label).filter(Boolean).join(',')
    if (labels !== 'A,B,C,D') failures.push(`package section labels are ${labels || '<none>'}`)
    for (const question of questions) {
      if (!question?.prompt || /^Question \d+|^Gap \(\d+\)$/i.test(question.prompt)) failures.push(`package Q${question.number} prompt is placeholder`)
    }
  }
  return {
    passageLength: text.length,
    markerCount: markerCount(text, numbers),
    questionCount: questions.length,
    failures,
    valid: failures.length === 0,
  }
}

function inspectRuntime(part, vault, partNumber) {
  const spec = PART_SPECS[partNumber]
  const numbers = expectedNumbers(partNumber)
  const questions = allQuestions(part)
  const questionIds = new Set(questions.map(question => question.id))
  const text = passageText(part)
  const vaultAnswers = Object.entries(vault?.answers ?? {}).filter(([id]) => questionIds.has(id))
  const failures = []
  if (questions.length !== spec.count) failures.push(`runtime control count is not ${spec.count}`)
  if (spec.markers && markerCount(text, numbers) !== spec.count) failures.push(`runtime marker count is not ${spec.count}`)
  if (vaultAnswers.length !== spec.count) failures.push(`vault answer count is not ${spec.count}`)
  if (questions.some(question => Object.hasOwn(question, 'answer') || Object.hasOwn(question, 'acceptedAnswers'))) {
    failures.push('runtime body exposes answer data')
  }
  return {
    markerCount: markerCount(text, numbers),
    controlCount: questions.length,
    vaultAnswerCount: vaultAnswers.length,
    failures,
    valid: failures.length === 0,
  }
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}

async function hasVerifiedRepair(sourceTestNumber, partNumber) {
  const repairPath = path.join(
    REPAIR_ROOT,
    `source-test${String(sourceTestNumber).padStart(2, '0')}`,
    `part-${String(partNumber).padStart(2, '0')}.repair.json`,
  )
  const cache = await readJson(repairPath)
  return Boolean(
    cache
    && cache.status === 'verified'
    && cache.repair
    && cache.model !== 'bootstrap-v1'
    && cache.verification?.valid === true,
  )
}

function classify({ raw, packageResult, runtime, verifiedRepair }) {
  if (raw.valid && packageResult.valid && runtime.valid) return 'SOURCE_OK'
  if (raw.valid) return 'PARSER_BROKEN'
  if (verifiedRepair && packageResult.valid && runtime.valid) return 'AI_REPAIR_VERIFIED'
  return 'RECRAWL_REQUIRED'
}

function repairStrategy(status) {
  return {
    SOURCE_OK: 'source',
    PARSER_BROKEN: 'deterministic-parser',
    RECRAWL_REQUIRED: 'recrawl-source',
    AI_REPAIR_VERIFIED: 'verified-ai-unit',
  }[status]
}

function provenanceFor(part) {
  const values = new Set()
  for (const block of part?.passage ?? []) if (block?._provenance) values.add(block._provenance)
  for (const question of allQuestions(part)) {
    if (question?._prompt_provenance) values.add(question._prompt_provenance)
    if (question?.answerConfidence) values.add(question.answerConfidence === 'key' ? 'source' : question.answerConfidence)
  }
  if (values.has('ai-generated')) return values.has('source') ? 'mixed' : 'ai-generated'
  return 'source'
}

function sourceUrl(sourceTestNumber, partNumber) {
  return `https://engexam.info/fce-reading-and-use-of-english-practice-tests/fce-reading-and-use-of-english-practice-test-${sourceTestNumber}/${partNumber}/`
}

async function main() {
  const rows = []

  for (let sourceTestNumber = 1; sourceTestNumber <= 26; sourceTestNumber += 1) {
    const appTestNumber = sourceTestNumber + 1
    const sourcePath = path.join(FCE_ROOT, `fce-reading-test${sourceTestNumber}`, 'exam', 'exam.json')
    const packagePath = path.join(PACKAGE_ROOT, `reading-fce-b2-test${appTestNumber}.json`)
    const runtimePath = path.join(RUNTIME_ROOT, `catalog-reading-fce-b2-test${appTestNumber}.json`)
    const vaultPath = path.join(RUNTIME_ROOT, `catalog-reading-fce-b2-test${appTestNumber}.answers.json`)
    const [rawExam, packageExam, runtimeExam, vault] = await Promise.all([
      readJson(sourcePath, { pages: [] }),
      readJson(packagePath, { parts: [] }),
      readJson(runtimePath, { parts: [] }),
      readJson(vaultPath, { answers: {} }),
    ])
    const answerMap = getAnswerMap(rawExam)

    for (let partNumber = 1; partNumber <= 7; partNumber += 1) {
      const page = (rawExam.pages ?? []).find(item => Number(item?.partNumber) === partNumber)
      const packagePart = (packageExam.parts ?? []).find(item => Number(item?.partNumber) === partNumber)
      const runtimePart = (runtimeExam.parts ?? []).find(item => Number(item?.partNumber) === partNumber)
      const raw = inspectRaw(page, answerMap, partNumber)
      const packageResult = inspectPackage(packagePart, partNumber)
      const runtime = inspectRuntime(runtimePart, vault, partNumber)
      const verifiedRepair = await hasVerifiedRepair(sourceTestNumber, partNumber)
      const status = classify({ raw, packageResult, runtime, verifiedRepair })

      rows.push({
        sourceTestNumber,
        appTestNumber,
        partNumber,
        sourcePath,
        sourceUrl: sourceUrl(sourceTestNumber, partNumber),
        rawPassageLength: raw.html.length,
        rawWidgetCount: raw.widgets.size,
        rawQuestionCount: raw.questionCount,
        rawAnswerCount: raw.answerCount,
        rawBaseWordCount: raw.baseWordCount,
        rawFeatureCount: raw.featureCount,
        rawSectionCount: raw.sectionCount,
        packagePassageLength: packageResult.passageLength,
        packageMarkerCount: packageResult.markerCount,
        packageQuestionCount: packageResult.questionCount,
        runtimeMarkerCount: runtime.markerCount,
        runtimeControlCount: runtime.controlCount,
        vaultAnswerCount: runtime.vaultAnswerCount,
        status,
        repairStrategy: repairStrategy(status),
        provenance: provenanceFor(packagePart),
        failures: [...raw.failures, ...packageResult.failures, ...runtime.failures],
      })
    }
  }

  if (rows.length !== 182) throw new Error(`Expected 182 audit rows, got ${rows.length}`)
  const byStatus = Object.fromEntries(
    Object.keys({ SOURCE_OK: 0, PARSER_BROKEN: 0, RECRAWL_REQUIRED: 0, AI_REPAIR_VERIFIED: 0 })
      .map(status => [status, rows.filter(row => row.status === status).length]),
  )
  const report = {
    generatedAt: new Date().toISOString(),
    sourceTests: 26,
    appTests: 26,
    parts: rows.length,
    summary: { byStatus },
    rows,
  }
  const markdown = [
    '# FCE B2 Corpus Audit',
    '',
    '- Source tests: 26',
    '- App tests: 26',
    `- Rows: ${rows.length}`,
    ...Object.entries(byStatus).map(([status, count]) => `- ${status}: ${count}`),
    '',
    '| Source | App | Part | Raw widgets | Raw questions | Raw answers | Package questions | Runtime controls | Vault answers | Status | Provenance | Failures |',
    '| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |',
    ...rows.map(row => `| ${row.sourceTestNumber} | ${row.appTestNumber} | ${row.partNumber} | ${row.rawWidgetCount} | ${row.rawQuestionCount} | ${row.rawAnswerCount} | ${row.packageQuestionCount} | ${row.runtimeControlCount} | ${row.vaultAnswerCount} | ${row.status} | ${row.provenance} | ${row.failures.join('; ').replaceAll('|', '\\|')} |`),
    '',
  ]

  await fs.mkdir(path.dirname(JSON_OUT), { recursive: true })
  await Promise.all([
    fs.writeFile(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
    fs.writeFile(MARKDOWN_OUT, markdown.join('\n'), 'utf8'),
  ])
  console.log(`FCE B2 corpus audit PASS: ${rows.length} rows`)
  console.log(JSON.stringify(byStatus, null, 2))
  console.log(JSON_OUT)
  console.log(MARKDOWN_OUT)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})

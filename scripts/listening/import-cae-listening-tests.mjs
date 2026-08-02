#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM, VirtualConsole } from '../../apps/web/node_modules/jsdom/lib/api.js'
import {
  applyConversionPlan,
  createConversionPlan,
} from './cae-c1/convert-licensed-cae-listening-to-catalog.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SOURCE_ROOT = path.resolve(ROOT, '..', 'Crawl', 'IELTS_Bank', 'output', 'cae-listening')
const INPUT_ROOT = path.join(ROOT, 'tmp', 'cae-listening-licensed-input')
const OFFSET = 1

const readJson = file => fs.readFile(file, 'utf8').then(JSON.parse)
const writeJson = (file, value) => fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`)

function appTestNumber(sourceTestNumber) {
  if (!Number.isInteger(sourceTestNumber) || sourceTestNumber < 1 || sourceTestNumber > 30) {
    throw new Error(`Invalid crawled CAE test number: ${sourceTestNumber}`)
  }
  return sourceTestNumber + OFFSET
}

function option(value) {
  return { id: value.label, label: cleanText(value.text) }
}

function cleanText(value) {
  const text = String(value ?? '').trim()
  const boundary = text.search(/(?:<\/?(?:script|style|meta|link)[^>]*>|\{\s*"@context"|"\s*\/>)|\s+For this task:\s*|\s+Answer Keys\s*::/i)
  return (boundary >= 0 ? text.slice(0, boundary) : text).replace(/\s+/g, ' ').trim()
}

async function extractInstruction(sourceDir, partNumber, fallback) {
  const file = path.join(sourceDir, `source-page-${partNumber}.html`)
  try {
    const html = await fs.readFile(file, 'utf8')
    const virtualConsole = new VirtualConsole()
    virtualConsole.on('jsdomError', () => {})
    const document = new JSDOM(html, { virtualConsole }).window.document
    const heading = [...document.querySelectorAll('h2')].find(node => /CAE Listening Part\s+${partNumber}\b/i.test(node.textContent ?? ''))
    let node = heading?.nextElementSibling
    while (node) {
      const clone = node.cloneNode(true)
      clone.querySelectorAll('script, style, noscript, template, iframe, link, meta, svg').forEach(child => child.remove())
      const value = cleanText(clone.textContent)
      if (/^You will hear\b/i.test(value)) return value
      node = node.nextElementSibling
    }
  } catch {}
  return cleanText(fallback)
}

async function convertQuestions(source, sourceDir) {
  return {
    parts: await Promise.all(source.parts.map(async part => ({
      partNumber: part.partNumber,
      rangeLabel: `Questions ${part.questionRange.start}-${part.questionRange.end}`,
      instruction: await extractInstruction(sourceDir, part.partNumber, part.instructions || part.title),
      matchingDualTask: part.partNumber === 4,
      taskOneInstruction: part.partNumber === 4 ? 'For questions 21-25, choose the option which best describes each speaker.' : undefined,
      taskTwoInstruction: part.partNumber === 4 ? 'For questions 26-30, choose the option which best describes each speaker.' : undefined,
      questions: part.questions.map(question => ({
        number: question.questionNumber,
        type: part.partNumber === 2 ? 'gap-fill' : question.questionType,
        prompt: cleanText(question.questionText ?? question.speaker),
        options: question.options.map(option),
        context: question.speaker,
      })),
    }))),
  }
}

function convertAnswers(source) {
  const explanations = new Map(source.parts.flatMap(part => (part.explanations ?? []).map(item => [String(item.questionNumber), item.text])))
  const choiceQuestions = new Map(source.parts.flatMap(part => part.questions.map(question => [String(question.questionNumber), question.options.length > 0])))
  return {
    answers: Object.fromEntries(source.answerKey.map(item => [String(item.questionNumber), {
      answer: !choiceQuestions.get(String(item.questionNumber))
        ? item.answer.trim()
        : item.answer.trim().replace(/^[-.\s]+/, '').replace(/^([A-H])(?:[\s.|].*)?$/i, '$1').toUpperCase(),
      ...(explanations.has(String(item.questionNumber)) ? { explanation: cleanText(explanations.get(String(item.questionNumber))) } : {}),
    }])),
  }
}

async function prepareInput(sourceNumber) {
  const sourceDir = path.join(SOURCE_ROOT, `test-${String(sourceNumber).padStart(2, '0')}`)
  const source = await readJson(path.join(sourceDir, 'test.json'))
  const targetNumber = appTestNumber(sourceNumber)
  const targetDir = path.join(INPUT_ROOT, `test-${String(targetNumber).padStart(2, '0')}`)
  await fs.mkdir(targetDir, { recursive: true })
  const audio = Object.fromEntries(source.audio.map(item => [`part${item.part}`, item.filename]))
  await writeJson(path.join(targetDir, 'manifest.json'), {
    testNumber: targetNumber,
    title: `CAE Listening Test ${targetNumber}`,
    level: 'c1', family: 'cae', durationMinutes: source.durationMinutes ?? 40,
    license: { owner: 'User-provided rewritten corpus', permission: 'User authorized this rewritten corpus for use in the app.', source: 'user-provided-rewritten-corpus', userOwned: true, licensed: false },
    audio,
  })
  await writeJson(path.join(targetDir, 'questions.json'), await convertQuestions(source, sourceDir))
  await writeJson(path.join(targetDir, 'answers.json'), convertAnswers(source))
  await writeJson(path.join(targetDir, 'transcripts.json'), { parts: Object.fromEntries(source.parts.map(part => [String(part.partNumber), cleanText(part.transcript)])) })
  for (const filename of Object.values(audio)) await fs.copyFile(path.join(sourceDir, 'audio', filename), path.join(targetDir, filename))
  return { sourceNumber, targetNumber }
}

const args = new Set(process.argv.slice(2))
const onlyArg = process.argv.find(value => value.startsWith('--only='))
const numbers = onlyArg ? [Number(onlyArg.slice('--only='.length))] : Array.from({ length: 30 }, (_, index) => index + 1)
for (const number of numbers) await prepareInput(number)
const plan = await createConversionPlan({ inputRoot: INPUT_ROOT, overwrite: args.has('--overwrite') })
console.log(JSON.stringify({
  mode: args.has('--dry-run') ? 'dry-run' : 'apply',
  mapping: numbers.map(number => `Crawled Test ${String(number).padStart(2, '0')} -> App Test ${String(appTestNumber(number)).padStart(2, '0')}`),
  test1Protected: true,
  ...plan,
}, null, 2))
if (!args.has('--dry-run')) await applyConversionPlan(plan)

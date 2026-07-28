import { BANNED_GENERIC_PHRASES } from './cambridge-writing-prompts.mjs'

const BOILERPLATE = [
  'write your essay', 'write your article', 'write your review', 'write your email', 'write your proposal', 'write your report', 'write your story', 'answer one of these questions', 'you must answer this question',
]

export function normalizeText(value) {
  let text = String(value ?? '').toLowerCase()
  for (const phrase of BOILERPLATE) text = text.replaceAll(phrase, ' ')
  return text.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function shingles(value, size = 3) {
  const tokens = normalizeText(value).split(' ').filter(Boolean)
  const result = new Set()
  for (let index = 0; index <= tokens.length - size; index += 1) result.add(tokens.slice(index, index + size).join(' '))
  return result
}

export function jaccard(left, right) {
  const a = shingles(left)
  const b = shingles(right)
  if (!a.size && !b.size) return 1
  let intersection = 0
  for (const value of a) if (b.has(value)) intersection += 1
  return intersection / (a.size + b.size - intersection)
}

export function taskText(task) {
  const blockText = (task.promptBlocks ?? []).map(block => [block.heading, block.text, block.title, ...(block.paragraphs ?? []), ...(block.listItems ?? []), block.footer].filter(Boolean).join(' ')).join(' ')
  return [task.instruction, task.promptText, task.promptHtml, blockText].filter(Boolean).join(' ')
}

export function similarityPairs(tests, { warningThreshold = 0.58, failureThreshold = 0.72 } = {}) {
  const comparisons = []
  const failures = []
  const warnings = []
  const entries = tests.flatMap(test => test.tasks.map(task => ({ testId: test.id, taskId: task.id, genre: task.genre, text: taskText(task) })))
  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
      const left = entries[leftIndex]
      const right = entries[rightIndex]
      if (left.genre !== right.genre || left.testId === right.testId) continue
      const normalizedLeft = normalizeText(left.text)
      const normalizedRight = normalizeText(right.text)
      const exact = normalizedLeft.length > 0 && normalizedLeft === normalizedRight
      const score = jaccard(left.text, right.text)
      if (!exact && score <= warningThreshold) continue
      const comparison = { leftTaskId: left.taskId, rightTaskId: right.taskId, genre: left.genre, exact, score: Number(score.toFixed(4)) }
      comparisons.push(comparison)
      if (exact || score > failureThreshold) failures.push(comparison)
      else warnings.push(comparison)
    }
  }
  return { comparisons, failures, warnings, warningThreshold, failureThreshold }
}

export function bannedPhraseFindings(test) {
  const findings = []
  for (const task of test.tasks) {
    const text = taskText(task).toLowerCase()
    for (const phrase of BANNED_GENERIC_PHRASES) if (text.includes(phrase.toLowerCase())) findings.push({ taskId: task.id, phrase })
  }
  return findings
}

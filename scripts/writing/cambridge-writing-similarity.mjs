import { BANNED_GENERIC_PHRASES } from './cambridge-writing-prompts.mjs'
import { sha256 } from './cambridge-writing-ai-contracts.mjs'

const BOILERPLATE = [
  'write your essay', 'write your article', 'write your review', 'write your email', 'write your proposal', 'write your report', 'write your story',
  'answer one of these questions', 'you must answer this question', 'write 140 190 words', 'write 220 260 words', 'write 240 280 words', 'write 280 320 words',
]

const FRAME_WORDS = new Set([
  'a', 'about', 'after', 'all', 'also', 'an', 'and', 'are', 'as', 'ask', 'at', 'be', 'because', 'been', 'before', 'begin', 'benefit', 'benefits', 'both', 'but',
  'can', 'compare', 'consider', 'could', 'describe', 'discuss', 'do', 'does', 'evaluate', 'explain', 'following', 'for', 'from', 'give', 'has', 'have', 'help', 'how', 'if',
  'important', 'improve', 'in', 'include', 'is', 'it', 'make', 'may', 'more', 'most', 'must', 'notes', 'of', 'on', 'one', 'or', 'other', 'outline', 'own', 'people',
  'recommend', 'reasons', 'say', 'sentence', 'should', 'story', 'suggest', 'than', 'that', 'the', 'their', 'them', 'these', 'they', 'think', 'this', 'to', 'two', 'use', 'value',
  'was', 'ways', 'what', 'when', 'where', 'whether', 'which', 'who', 'why', 'will', 'with', 'would', 'write', 'you', 'your',
])

function normalizedTokenArray(value) {
  return normalizeText(value).split(' ').filter(Boolean)
}

export function normalizeText(value) {
  let text = String(value ?? '').toLowerCase().replace(/[–—]/g, '-')
  for (const phrase of BOILERPLATE) text = text.replaceAll(phrase, ' ')
  return text.replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function shingles(value, size = 3) {
  const tokens = normalizedTokenArray(value)
  const result = new Set()
  for (let index = 0; index <= tokens.length - size; index += 1) result.add(tokens.slice(index, index + size).join(' '))
  return result
}

export function jaccard(left, right, size = 3) {
  const a = shingles(left, size)
  const b = shingles(right, size)
  if (!a.size && !b.size) return 1
  if (!a.size || !b.size) return 0
  let intersection = 0
  for (const value of a) if (b.has(value)) intersection += 1
  return intersection / (a.size + b.size - intersection)
}

export function taskText(task) {
  const blockText = (task.promptBlocks ?? []).map(block => [
    block.heading, block.text, block.title, block.from, block.subject, block.greeting,
    ...(block.paragraphs ?? []), ...(block.listItems ?? []), block.footer, block.closing, block.sender,
  ].filter(Boolean).join(' ')).join(' ')
  return [task.instruction, task.promptText, task.promptHtml, blockText].filter(Boolean).join(' ')
}

export function extractEmailSubject(task) {
  return normalizeText((task.promptBlocks ?? []).find(block => block.type === 'email')?.subject ?? '')
}

export function extractStoryOpening(task) {
  if (task.genre !== 'story') return ''
  const candidates = [task.promptText, ...(task.promptBlocks ?? []).filter(block => block.type === 'paragraph').map(block => block.text)]
  for (const candidate of candidates.filter(Boolean)) {
    const match = String(candidate).match(/(?:begin|start)(?:s|ing)?\s+(?:with|your story with|with this sentence)?[:\s"']+([^\n.!?]+[.!?])/i)
    if (match) return normalizeText(match[1])
    const quoted = String(candidate).match(/"([^"]+)"|'([^']+)'/i)
    if (quoted) return normalizeText(quoted[1] || quoted[2])
  }
  return ''
}

export function extractRequiredContentPoints(task) {
  const points = []
  for (const block of task.promptBlocks ?? []) {
    if (block.type === 'panel') points.push(...(block.listItems ?? []))
    if (block.type === 'email') {
      for (const paragraph of block.paragraphs ?? []) {
        points.push(...String(paragraph).split(/(?<=[?])\s+/).filter(part => part.includes('?')))
      }
    }
  }
  if (!points.length) {
    const text = [task.instruction, task.promptText].filter(Boolean).join(' ')
    points.push(...text.split(/(?<=[?])\s+/).filter(part => part.includes('?')))
  }
  return [...new Set(points.map(normalizeText).filter(value => value && !value.includes('your own idea')))].sort()
}

export function extractSourceTextTheses(task) {
  return (task.promptBlocks ?? [])
    .filter(block => block.type === 'source-text')
    .map(block => normalizedTokenArray(`${block.title ?? ''} ${block.text}`).slice(0, 28).join(' '))
    .filter(Boolean)
}

export function skeletonNormalize(value) {
  const tokens = normalizedTokenArray(value)
  const skeleton = []
  for (const token of tokens) {
    const next = FRAME_WORDS.has(token) || /(?:ing|ed|ise|ize|fy)$/.test(token) ? token : '<topic>'
    if (next === '<topic>' && skeleton.at(-1) === '<topic>') continue
    skeleton.push(next)
  }
  return skeleton.join(' ')
}

export function skeletonSimilarity(left, right) {
  return jaccard(skeletonNormalize(left), skeletonNormalize(right), 2)
}

export function taskFingerprint(task) {
  return {
    genre: task.genre,
    normalizedPrompt: normalizeText(taskText(task)),
    audience: normalizeText(task.presentation?.audience ?? ''),
    setting: normalizeText(task.presentation?.setting ?? ''),
    contentPoints: extractRequiredContentPoints(task),
    emailSubject: extractEmailSubject(task),
    storyOpening: extractStoryOpening(task),
    sourceTextTheses: extractSourceTextTheses(task),
    skeleton: skeletonNormalize(taskText(task)),
  }
}

export function semanticScenarioKey({ level, genre, topicFamily, specificSetting, audience, communicativePurpose }) {
  return [level, genre, topicFamily, specificSetting, audience, communicativePurpose].map(normalizeText).join('|')
}

function planTaskDesign(row, task) {
  const key = `task${task.taskNumber}`
  const fingerprint = row?.designFingerprint ?? {}
  return {
    topicFamily: row?.topicFamily ?? '',
    specificSetting: fingerprint.specificSettingByTask?.[key] ?? fingerprint.specificSetting ?? row?.scenarioSeeds?.[key] ?? '',
    audience: fingerprint.audienceByTask?.[key] ?? row?.audiences?.[task.taskNumber - 1] ?? '',
    communicativePurpose: fingerprint.purposeByTask?.[key] ?? row?.communicativePurposes?.[task.taskNumber - 1] ?? '',
    requiredContentPoints: fingerprint.requiredContentPointsByTask?.[key] ?? [],
  }
}

function contentPointKey(task) {
  const points = extractRequiredContentPoints(task)
  return points.length ? points.join('|') : ''
}

function sourceThesisKey(task) {
  const theses = extractSourceTextTheses(task)
  return theses.length > 1 ? theses.join('|') : ''
}

function duplicateGroups(entries, keyOf) {
  const groups = new Map()
  for (const entry of entries) {
    const key = keyOf(entry)
    if (!key) continue
    const values = groups.get(key) ?? []
    values.push(entry)
    groups.set(key, values)
  }
  return [...groups.entries()].filter(([, values]) => values.length > 1).map(([key, values]) => ({ key, taskIds: values.map(value => value.task.id), testIds: [...new Set(values.map(value => value.test.id))] }))
}

export function buildDiversityReport({ baselineTests = [], checkpointTests = [], planRows = [], thresholds = {} }) {
  const warningThreshold = thresholds.warningThreshold ?? 0.38
  const baselineFailureThreshold = thresholds.baselineFailureThreshold ?? 0.45
  const checkpointFailureThreshold = thresholds.checkpointFailureThreshold ?? 0.55
  const wholeTestFailureThreshold = thresholds.wholeTestFailureThreshold ?? 0.50
  const skeletonFailureThreshold = thresholds.skeletonFailureThreshold ?? 0.60
  const planByTestId = new Map(planRows.map(row => [row.testId, row]))
  const baselineEntries = baselineTests.flatMap(test => test.tasks.map(task => ({ test, task, text: taskText(task), fingerprint: taskFingerprint(task) })))
  const checkpointEntries = checkpointTests.flatMap(test => test.tasks.map(task => ({ test, task, text: taskText(task), fingerprint: taskFingerprint(task), design: planTaskDesign(planByTestId.get(test.id), task) })))
  const comparisons = []
  const warnings = []
  const hardFailures = []

  for (const current of checkpointEntries) {
    for (const baseline of baselineEntries) {
      if (current.task.genre !== baseline.task.genre) continue
      const score = jaccard(current.text, baseline.text)
      const skeleton = skeletonSimilarity(current.text, baseline.text)
      if (score < warningThreshold && skeleton <= skeletonFailureThreshold) continue
      const comparison = { type: 'test01', leftTaskId: current.task.id, rightTaskId: baseline.task.id, genre: current.task.genre, score: Number(score.toFixed(4)), skeletonScore: Number(skeleton.toFixed(4)) }
      comparisons.push(comparison)
      if (score > baselineFailureThreshold || skeleton > skeletonFailureThreshold) hardFailures.push({ ...comparison, reason: score > baselineFailureThreshold ? 'similarity_to_test01' : 'skeleton_similarity' })
      else warnings.push(comparison)
    }
  }

  for (let leftIndex = 0; leftIndex < checkpointEntries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < checkpointEntries.length; rightIndex += 1) {
      const left = checkpointEntries[leftIndex]
      const right = checkpointEntries[rightIndex]
      if (left.test.id === right.test.id || left.task.genre !== right.task.genre) continue
      const exact = left.fingerprint.normalizedPrompt && left.fingerprint.normalizedPrompt === right.fingerprint.normalizedPrompt
      const score = jaccard(left.text, right.text)
      const skeleton = skeletonSimilarity(left.text, right.text)
      if (!exact && score < warningThreshold && skeleton <= skeletonFailureThreshold) continue
      const comparison = { type: 'checkpoint', leftTaskId: left.task.id, rightTaskId: right.task.id, genre: left.task.genre, exact, score: Number(score.toFixed(4)), skeletonScore: Number(skeleton.toFixed(4)) }
      comparisons.push(comparison)
      if (exact || score > checkpointFailureThreshold || skeleton > skeletonFailureThreshold) hardFailures.push({ ...comparison, reason: exact ? 'exact_normalized_prompt' : score > checkpointFailureThreshold ? 'checkpoint_similarity' : 'skeleton_similarity' })
      else warnings.push(comparison)
    }
  }

  const exactPromptGroups = duplicateGroups(checkpointEntries, entry => entry.fingerprint.normalizedPrompt)
  const emailSubjectGroups = duplicateGroups(checkpointEntries, entry => entry.fingerprint.emailSubject)
  const storyOpeningGroups = duplicateGroups(checkpointEntries, entry => entry.fingerprint.storyOpening)
  const contentPointGroups = duplicateGroups(checkpointEntries, entry => contentPointKey(entry.task))
  const sourceThesisGroups = duplicateGroups(checkpointEntries, entry => sourceThesisKey(entry.task))
  const scenarioEntries = checkpointEntries.map(entry => ({
    ...entry,
    scenarioKey: semanticScenarioKey({ level: entry.test.level, genre: entry.task.genre, ...entry.design }),
  }))
  const scenarioGroups = duplicateGroups(scenarioEntries, entry => entry.scenarioKey)

  for (const [reason, groups] of [
    ['exact_normalized_prompt', exactPromptGroups], ['duplicate_email_subject', emailSubjectGroups], ['duplicate_story_opening', storyOpeningGroups],
    ['duplicate_content_points', contentPointGroups], ['duplicate_source_theses', sourceThesisGroups], ['duplicate_scenario_key', scenarioGroups],
  ]) {
    for (const group of groups) hardFailures.push({ reason, ...group })
  }

  const wholeTestComparisons = []
  for (let leftIndex = 0; leftIndex < checkpointTests.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < checkpointTests.length; rightIndex += 1) {
      const left = checkpointTests[leftIndex]
      const right = checkpointTests[rightIndex]
      const score = jaccard(left.tasks.map(taskText).join(' '), right.tasks.map(taskText).join(' '))
      const item = { leftTestId: left.id, rightTestId: right.id, score: Number(score.toFixed(4)) }
      wholeTestComparisons.push(item)
      if (score > wholeTestFailureThreshold) hardFailures.push({ ...item, reason: 'whole_test_similarity' })
    }
  }

  const matrix = checkpointEntries.map(left => ({
    taskId: left.task.id,
    scores: Object.fromEntries(checkpointEntries.map(right => [right.task.id, left.task.id === right.task.id ? 1 : Number(jaccard(left.text, right.text).toFixed(4))])),
  }))

  return {
    thresholds: { warningThreshold, baselineFailureThreshold, checkpointFailureThreshold, wholeTestFailureThreshold, skeletonFailureThreshold },
    summary: {
      checkpointTests: checkpointTests.length,
      checkpointTasks: checkpointEntries.length,
      exactNormalizedPrompts: exactPromptGroups.length,
      duplicateScenarioKeys: scenarioGroups.length,
      duplicateStoryOpenings: storyOpeningGroups.length,
      duplicateEmailSubjects: emailSubjectGroups.length,
      duplicateContentPointSets: contentPointGroups.length,
      duplicateSourceThesisPairs: sourceThesisGroups.length,
      skeletonHardFailures: hardFailures.filter(item => item.reason === 'skeleton_similarity').length,
      maxJaccard: Math.max(0, ...comparisons.map(item => item.score ?? 0), ...wholeTestComparisons.map(item => item.score ?? 0)),
      maxSkeletonSimilarity: Math.max(0, ...comparisons.map(item => item.skeletonScore ?? 0)),
    },
    comparisons,
    wholeTestComparisons,
    warnings,
    hardFailures,
    exactDuplicateGroups: { prompts: exactPromptGroups, emailSubjects: emailSubjectGroups, storyOpenings: storyOpeningGroups, contentPoints: contentPointGroups, sourceTheses: sourceThesisGroups, scenarioKeys: scenarioGroups },
    matrix,
    fingerprintHash: sha256(checkpointEntries.map(entry => ({ testId: entry.test.id, taskId: entry.task.id, fingerprint: entry.fingerprint, design: entry.design }))),
  }
}

export function originalityGate(test, { baselineTests = [], checkpointTests = [], planRows = [] } = {}) {
  const report = buildDiversityReport({ baselineTests, checkpointTests: [...checkpointTests.filter(item => item.id !== test.id), test], planRows })
  const relevantFailures = report.hardFailures.filter(item => {
    const serialized = JSON.stringify(item)
    return serialized.includes(test.id) || test.tasks.some(task => serialized.includes(task.id))
  })
  return { valid: relevantFailures.length === 0, failures: relevantFailures, report }
}

export function similarityPairs(tests, { warningThreshold = 0.38, failureThreshold = 0.55 } = {}) {
  const report = buildDiversityReport({ checkpointTests: tests, thresholds: { warningThreshold, checkpointFailureThreshold: failureThreshold } })
  return { comparisons: report.comparisons, failures: report.hardFailures, warnings: report.warnings, warningThreshold, failureThreshold }
}

export function bannedPhraseFindings(test) {
  const findings = []
  for (const task of test.tasks) {
    const text = taskText(task).toLowerCase()
    for (const phrase of BANNED_GENERIC_PHRASES) if (text.includes(phrase.toLowerCase())) findings.push({ taskId: task.id, phrase })
  }
  return findings
}

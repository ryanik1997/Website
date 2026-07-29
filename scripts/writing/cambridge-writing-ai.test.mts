import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { CAMBRIDGE_WRITING_LEVEL_CONFIGS, getTaskId, getTestId, getTestTitle } from './cambridge-writing-level-config.mjs'
import { buildPlan, TOPIC_FAMILIES, validatePlan } from './plan-cambridge-writing-corpus.mjs'
import { buildDiversityReport, jaccard, semanticScenarioKey, similarityPairs, skeletonSimilarity, taskFingerprint } from './cambridge-writing-similarity.mjs'
import { buildGenerationCacheKey, cachedGenerationMatches, PROMPT_VERSION, SCHEMA_ONLY_EXAMPLE } from './cambridge-writing-ai-contracts.mjs'
import { TestSchema, assertIdentity, exactSchemaDescription } from './cambridge-writing-runtime.mjs'
import { countSchemaValid } from './report-cambridge-writing-final.mjs'

function testFixture(level = 'b1', number = 2) {
  const config = CAMBRIDGE_WRITING_LEVEL_CONFIGS[level]
  return {
    id: getTestId(level, number), level, testNumber: number, title: getTestTitle(level, number), sourceFile: `packages/catalog/data/cambridge-writing/${level}/${getTestId(level, number)}.json`, status: 'draft', version: 1,
    tasks: config.tasks.map(task => ({
      id: getTaskId(level, number, task.taskNumber), partNumber: task.partNumber, taskNumber: task.taskNumber, title: `Question ${task.taskNumber}`, genre: task.genre,
      instruction: `Candidate ${level} instruction ${number} ${task.taskNumber} about constellation-${level}-${number}-${task.taskNumber}`,
      promptText: `Distinct communicative prompt ${level} ${number} ${task.taskNumber}: constellation-${level}-${number}-${task.taskNumber}`,
      presentation: { template: task.template ?? (task.presentation === 'announcement' ? 'announcement' : task.presentation === 'email-with-notes' ? 'email' : 'plain'), ...(task.compulsory ? {} : level === 'b1' ? {} : { selectionRequired: 1 }) },
      wordLimit: task.wordLimit ?? { min: task.minWords, max: task.maxWords, displayText: `${task.minWords}-${task.maxWords} words` }, metadata: { compulsory: task.compulsory },
    })),
  }
}

function cacheInput(overrides = {}) {
  return {
    promptVersion: PROMPT_VERSION, provider: 'deepseek', model: 'deepseek-chat', level: 'b1', testId: 'b1-test-02', testNumber: 2,
    planRow: { testId: 'b1-test-02', designFingerprint: { specificSetting: 'weekend visit' } },
    levelContract: CAMBRIDGE_WRITING_LEVEL_CONFIGS.b1,
    avoidanceCorpus: [{ testId: 'b1-test-01', tasks: [{ genre: 'email', summary: 'seed summary only' }] }],
    ...overrides,
  }
}

function planScenarioKeys(rows) {
  const keys = []
  for (const row of rows.filter(item => item.testNumber >= 2 && item.testNumber <= 6)) {
    const config = CAMBRIDGE_WRITING_LEVEL_CONFIGS[row.level]
    for (const task of config.tasks) {
      const key = `task${task.taskNumber}`
      keys.push(semanticScenarioKey({ level: row.level, genre: task.genre, topicFamily: row.topicFamily, specificSetting: row.designFingerprint.specificSettingByTask[key], audience: row.designFingerprint.audienceByTask[key], communicativePurpose: row.designFingerprint.purposeByTask[key] }))
    }
  }
  return keys
}

describe('Cambridge Writing AI corpus contracts', () => {
  it('builds the configurable default 200-row plan with unique checkpoint designs', () => {
    const rows = buildPlan()
    expect(rows).toHaveLength(200)
    expect(() => validatePlan(rows)).not.toThrow()
    for (const level of Object.keys(CAMBRIDGE_WRITING_LEVEL_CONFIGS)) expect(rows.filter(row => row.level === level)).toHaveLength(50)
    expect(new Set(rows.map(row => row.topicFamily))).toEqual(new Set(TOPIC_FAMILIES))
    const checkpoint = rows.filter(row => row.testNumber >= 2 && row.testNumber <= 6)
    expect(checkpoint).toHaveLength(20)
    expect(new Set(checkpoint.map(row => row.designFingerprint.specificSetting))).toHaveLength(20)
    expect(new Set(planScenarioKeys(rows))).toHaveLength(75)
  })

  it('uses the specified B1/B2 checkpoint scenarios and distinct C1/C2 depth', () => {
    const rows = buildPlan()
    expect(rows.find(row => row.testId === 'b1-test-02')?.designFingerprint.specificSettingByTask.task1).toContain('weekend visit')
    expect(rows.find(row => row.testId === 'b1-test-06')?.designFingerprint.specificSettingByTask.task3).toContain('wrong person')
    expect(rows.find(row => row.testId === 'b2-test-02')?.designFingerprint.requiredContentPointsByTask.task1).toContain('managing money')
    expect(rows.find(row => row.testId === 'b2-test-06')?.designFingerprint.specificSettingByTask.task4).toContain('online group project')
    expect(rows.find(row => row.testId === 'c1-test-02')?.designFingerprint.specificSetting).toContain('governing body')
    expect(rows.find(row => row.testId === 'c2-test-02')?.designFingerprint.centralTension).toContain('autonomy')
  })

  it('generates canonical IDs and titles', () => {
    expect(getTestId('c2', 2)).toBe('c2-test-02')
    expect(getTaskId('b1', 51, 3)).toBe('b1-test-51-task-03')
    expect(getTestTitle('b2', 12)).toBe('FCE B2 AI Practice Test 12')
  })

  it('accepts optional provenance and rejects invalid scores', () => {
    const fixture = testFixture()
    expect(TestSchema.safeParse(fixture).success).toBe(true)
    fixture.provenance = { origin: 'ai-generated', provider: 'test', model: 'test', promptVersion: 1, generationBatchId: 'batch', generatedAt: Date.now(), contentHash: 'hash', reviewStatus: 'ai-verified', qualityScore: 101 }
    expect(TestSchema.safeParse(fixture).success).toBe(false)
  })

  it('checks canonical level structure', () => {
    const fixture = testFixture('c1', 7)
    expect(() => assertIdentity(fixture)).not.toThrow()
    fixture.tasks[1].genre = 'review'
    expect(() => assertIdentity(fixture)).toThrow(/genre mismatch/)
  })

  it('never reports a negative schema-valid count', () => {
    expect(countSchemaValid(0, { failures: Array.from({ length: 8 }, () => ({})) })).toBeGreaterThanOrEqual(0)
    expect(countSchemaValid(0, { records: [] })).toBe(0)
    expect(countSchemaValid(2, { records: [{ schemaValid: true }, { schemaValid: false }] })).toBe(1)
  })

  it('isolates cache by level, test and complete inputs', () => {
    const b1 = buildGenerationCacheKey(cacheInput())
    const b2 = buildGenerationCacheKey(cacheInput({ level: 'b2', testId: 'b2-test-02', levelContract: CAMBRIDGE_WRITING_LEVEL_CONFIGS.b2 }))
    const test03 = buildGenerationCacheKey(cacheInput({ testId: 'b1-test-03', testNumber: 3 }))
    const changedPlan = buildGenerationCacheKey(cacheInput({ planRow: { testId: 'b1-test-02', designFingerprint: { specificSetting: 'different setting' } } }))
    expect(new Set([b1.inputHash, b2.inputHash, test03.inputHash, changedPlan.inputHash])).toHaveLength(4)
    const cached = { inputHash: b1.inputHash, test: testFixture('b1', 2) }
    expect(cachedGenerationMatches(cached, { inputHash: b1.inputHash, level: 'b1', testId: 'b1-test-02', testNumber: 2 })).toBe(true)
    expect(cachedGenerationMatches(cached, { inputHash: b1.inputHash, level: 'b1', testId: 'b1-test-03', testNumber: 3 })).toBe(false)
  })

  it('uses content-free schema examples', () => {
    const schema = JSON.stringify(exactSchemaDescription())
    const example = JSON.stringify(SCHEMA_ONLY_EXAMPLE)
    for (const forbidden of ['Mia', 'Sandy', 'David', 'touring holiday', 'pollution', 'peer learning project']) {
      expect(schema).not.toContain(forbidden)
      expect(example).not.toContain(forbidden)
    }
  })

  it('detects exact, high similarity and placeholder sentence frames', () => {
    const left = testFixture('b1', 2)
    const right = testFixture('b1', 3)
    right.tasks[0].instruction = left.tasks[0].instruction
    right.tasks[0].promptText = left.tasks[0].promptText
    const report = similarityPairs([left, right])
    expect(report.failures.some(item => item.reason === 'exact_normalized_prompt')).toBe(true)
    expect(jaccard('one two three four', 'one two three four')).toBe(1)
    expect(skeletonSimilarity('Write about a peer learning project and explain its long-term value.', 'Write about a community centre project and explain its long-term value.')).toBeGreaterThan(0.6)
  })

  it('detects duplicate subjects, openings, content points, source theses and scenario keys', () => {
    const left = testFixture('b2', 2)
    const right = testFixture('b2', 3)
    left.tasks[3].promptBlocks = [{ id: 'email-a', type: 'email', subject: 'Shared subject', paragraphs: ['How will you prepare? What support do you need?'] }]
    right.tasks[3].promptBlocks = [{ id: 'email-b', type: 'email', subject: 'Shared subject', paragraphs: ['How will you prepare? What support do you need?'] }]
    const report = buildDiversityReport({ checkpointTests: [left, right] })
    expect(report.hardFailures.some(item => item.reason === 'duplicate_email_subject')).toBe(true)
    expect(report.hardFailures.some(item => item.reason === 'duplicate_content_points')).toBe(true)

    const storyA = testFixture('b1', 4)
    const storyB = testFixture('b1', 5)
    storyA.tasks[2].promptBlocks = [{ id: 'opening-a', type: 'paragraph', text: 'Your story must begin with this sentence: The door opened slowly.' }]
    storyB.tasks[2].promptBlocks = [{ id: 'opening-b', type: 'paragraph', text: 'Your story must begin with this sentence: The door opened slowly.' }]
    expect(buildDiversityReport({ checkpointTests: [storyA, storyB] }).hardFailures.some(item => item.reason === 'duplicate_story_opening')).toBe(true)

    const c2a = testFixture('c2', 2)
    const c2b = testFixture('c2', 3)
    const sources = [{ id: 's1', type: 'source-text', label: 'Text 1', title: 'Access', text: 'Institutions provide access by reducing barriers and sharing knowledge across groups.' }, { id: 's2', type: 'source-text', label: 'Text 2', title: 'Autonomy', text: 'Individuals need autonomy to make responsible choices and develop independent judgement.' }]
    c2a.tasks[0].promptBlocks = structuredClone(sources)
    c2b.tasks[0].promptBlocks = structuredClone(sources)
    expect(buildDiversityReport({ checkpointTests: [c2a, c2b] }).hardFailures.some(item => item.reason === 'duplicate_source_theses')).toBe(true)
  })

  it('has no deep-equal production prompt blocks copied from Test01', () => {
    const root = path.resolve(import.meta.dirname, '../..')
    for (const level of ['b1', 'b2', 'c1', 'c2']) {
      const seed = JSON.parse(fs.readFileSync(path.join(root, 'packages/catalog/src/cambridge/writing', level, `${level}-test-01.json`), 'utf8'))
      for (let number = 2; number <= 6; number += 1) {
        const generated = JSON.parse(fs.readFileSync(path.join(root, 'packages/catalog/data/cambridge-writing', level, `${level}-test-${String(number).padStart(2, '0')}.json`), 'utf8'))
        for (const [index, task] of generated.tasks.entries()) {
          const generatedBlocks = task.promptBlocks ?? []
          const seedBlocks = seed.tasks[index]?.promptBlocks ?? []
          if (!generatedBlocks.length && !seedBlocks.length) {
            expect(taskFingerprint(task).normalizedPrompt).not.toBe(taskFingerprint(seed.tasks[index]).normalizedPrompt)
          } else {
            expect(generatedBlocks).not.toEqual(seedBlocks)
          }
        }
      }
    }
  })

  it('creates canonical fingerprints for generated tasks', () => {
    const fingerprint = taskFingerprint({ genre: 'email', instruction: 'Reply clearly.', promptBlocks: [{ id: 'e', type: 'email', subject: 'Course choice', paragraphs: ['Which course? Why?'] }] })
    expect(fingerprint.emailSubject).toBe('course choice')
    expect(fingerprint.contentPoints).toEqual(['which course', 'why'])
    expect(fingerprint.normalizedPrompt).toContain('course choice')
  })
})

import { describe, expect, it } from 'vitest'
import { CAMBRIDGE_WRITING_LEVEL_CONFIGS, getTaskId, getTestId, getTestTitle } from './cambridge-writing-level-config.mjs'
import { buildPlan, TOPIC_FAMILIES, validatePlan } from './plan-cambridge-writing-corpus.mjs'
import { jaccard, similarityPairs } from './cambridge-writing-similarity.mjs'
import { TestSchema, assertIdentity } from './cambridge-writing-runtime.mjs'

function testFixture(level = 'b1', number = 2) {
  const config = CAMBRIDGE_WRITING_LEVEL_CONFIGS[level]
  return {
    id: getTestId(level, number), level, testNumber: number, title: getTestTitle(level, number), sourceFile: `packages/catalog/data/cambridge-writing/${level}/${getTestId(level, number)}.json`, status: 'draft', version: 1,
    tasks: config.tasks.map(task => ({
      id: getTaskId(level, number, task.taskNumber), partNumber: task.partNumber, taskNumber: task.taskNumber, title: `Question ${task.taskNumber}`, genre: task.genre, instruction: `Instruction ${number} ${task.taskNumber}`, promptText: `Unique prompt ${number} ${task.taskNumber}`, presentation: { template: task.template ?? (task.presentation === 'announcement' ? 'announcement' : task.presentation === 'email-with-notes' ? 'email' : 'plain'), ...(task.compulsory ? {} : level === 'b1' ? {} : { selectionRequired: 1 }) }, wordLimit: task.wordLimit ?? { min: task.minWords, max: task.maxWords, displayText: `${task.minWords}-${task.maxWords} words` }, metadata: { compulsory: task.compulsory },
    })),
  }
}

describe('Cambridge Writing AI corpus contracts', () => {
  it('builds the configurable default 200-row plan', () => {
    const rows = buildPlan()
    expect(rows).toHaveLength(200)
    expect(() => validatePlan(rows)).not.toThrow()
    for (const level of Object.keys(CAMBRIDGE_WRITING_LEVEL_CONFIGS)) expect(rows.filter(row => row.level === level)).toHaveLength(50)
    expect(new Set(rows.map(row => row.topicFamily))).toEqual(new Set(TOPIC_FAMILIES))
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

  it('detects exact and high-similarity prompts', () => {
    const left = testFixture('b1', 2)
    const right = testFixture('b1', 3)
    right.tasks[0].instruction = left.tasks[0].instruction
    right.tasks[0].promptText = left.tasks[0].promptText
    const report = similarityPairs([left, right])
    expect(report.failures.some(item => item.exact)).toBe(true)
    expect(jaccard('one two three four', 'one two three four')).toBe(1)
  })
})

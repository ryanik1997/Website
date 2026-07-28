import { describe, expect, it } from 'vitest'
import type { CambridgeWritingTestFormValue } from './cambridgeWritingFormSchema'
import {
  createCambridgeWritingTaskId,
  createCambridgeWritingTestId,
} from './cambridgeWritingFormSchema'
import { mapFormToWritingTest } from './cambridgeWritingFormMapper'

const baseValue: CambridgeWritingTestFormValue = {
  testNumber: 2,
  title: '  PET B1 Writing · Test 02  ',
  sourceUrl: '  https://example.com/source  ',
  tasks: [
    {
      clientId: 'task-1',
      partNumber: 1,
      taskNumber: 1,
      title: ' Question 1 ',
      genre: 'email',
      instruction: ' Write here ',
      promptText: '',
      promptHtml: '',
      minWords: 80,
      maxWords: 100,
      wordLimitDisplayText: ' about 100 words ',
      compulsory: true,
      imageAssets: [],
      promptBlocks: undefined,
      presentation: undefined,
    },
  ],
}

describe('cambridgeWritingFormMapper', () => {
  it('creates stable test IDs for A2-C2', () => {
    expect(createCambridgeWritingTestId('a2', 2)).toBe('ket-a2-writing-test-02')
    expect(createCambridgeWritingTestId('b1', 2)).toBe('pet-b1-writing-test-02')
    expect(createCambridgeWritingTestId('b2', 2)).toBe('fce-b2-writing-test-02')
    expect(createCambridgeWritingTestId('c1', 2)).toBe('cae-c1-writing-test-02')
    expect(createCambridgeWritingTestId('c2', 2)).toBe('cpe-c2-writing-test-02')
    expect(createCambridgeWritingTaskId('pet-b1-writing-test-02', 3)).toBe('pet-b1-writing-test-02-task-03')
  })

  it('maps empty optional strings to undefined and preserves metadata', () => {
    const mapped = mapFormToWritingTest('b1', baseValue)
    expect(mapped.id).toBe('pet-b1-writing-test-02')
    expect(mapped.title).toBe('PET B1 Writing · Test 02')
    expect(mapped.sourceUrl).toBe('https://example.com/source')
    expect(mapped.tasks[0].id).toBe('pet-b1-writing-test-02-task-01')
    expect(mapped.tasks[0].promptText).toBeUndefined()
    expect(mapped.tasks[0].promptHtml).toBeUndefined()
    expect(mapped.tasks[0].wordLimit).toEqual({
      min: 80,
      max: 100,
      displayText: 'about 100 words',
    })
    expect(mapped.tasks[0].metadata).toEqual({
      compulsory: true,
      sourceQuestionNumber: '1',
    })
  })

  it('keeps existing ID in edit mode', () => {
    const mapped = mapFormToWritingTest('c1', {
      ...baseValue,
      testNumber: 9,
      title: 'CAE edit',
    }, 'cae-c1-writing-test-02')
    expect(mapped.id).toBe('cae-c1-writing-test-02')
    expect(mapped.tasks[0].id).toBe('cae-c1-writing-test-02-task-01')
  })

  it('preserves promptBlocks and presentation metadata', () => {
    const mapped = mapFormToWritingTest('b2', {
      ...baseValue,
      tasks: [
        {
          ...baseValue.tasks[0],
          promptBlocks: [
            { id: 'notes', type: 'panel', variant: 'notes', heading: 'Notes', listItems: ['transport'] },
          ],
          presentation: { template: 'essay-notes' },
        },
      ],
    })

    expect(mapped.tasks[0].promptBlocks).toEqual([
      { id: 'notes', type: 'panel', variant: 'notes', heading: 'Notes', listItems: ['transport'] },
    ])
    expect(mapped.tasks[0].presentation).toEqual({ template: 'essay-notes' })
  })
})

export interface WritingMockTask {
  id: string
  title: string
  prompt: string
  minWords: number
  durationMinutes: number
}

export interface FullMockTest {
  id: string
  title: string
  track: 'ielts'
  durationMinutes: number
  readingExamId: string
  listeningExamId: string
  writingTasks: WritingMockTask[]
}

export const FULL_MOCK_TESTS: FullMockTest[] = [
  {
    id: 'ielts-mock-01',
    title: 'IELTS Academic Full Test 01',
    track: 'ielts',
    durationMinutes: 160,
    readingExamId: 'ielts-reading-01',
    listeningExamId: 'ielts-listening-sample-01',
    writingTasks: [
      {
        id: 'task1',
        title: 'Task 1',
        prompt: 'The chart below shows the percentage of households with internet access in three countries between 2000 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.',
        minWords: 150,
        durationMinutes: 20,
      },
      {
        id: 'task2',
        title: 'Task 2',
        prompt: 'Some people believe that technology has made our lives more complicated, while others think it has made life easier.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
        minWords: 250,
        durationMinutes: 40,
      },
    ],
  },
]

export function getFullMockTest(id: string): FullMockTest | null {
  return FULL_MOCK_TESTS.find(m => m.id === id) ?? null
}
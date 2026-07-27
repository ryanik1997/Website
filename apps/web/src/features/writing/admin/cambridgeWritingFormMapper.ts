import { CambridgeWritingTestSchema, type CambridgeWritingLevel, type CambridgeWritingTask, type CambridgeWritingTest } from '@ryan/catalog'
import {
  type CambridgeWritingTaskFormValue,
  type CambridgeWritingTestFormValue,
  createCambridgeWritingTaskId,
  createCambridgeWritingTestId,
} from './cambridgeWritingFormSchema'

export function mapTaskFormToTask(testId: string, task: CambridgeWritingTaskFormValue): CambridgeWritingTask {
  const taskId = createCambridgeWritingTaskId(testId, task.taskNumber)
  return {
    id: taskId,
    partNumber: task.partNumber,
    taskNumber: task.taskNumber,
    title: task.title.trim(),
    genre: task.genre,
    instruction: task.instruction.trim(),
    promptText: task.promptText.trim() || undefined,
    promptHtml: task.promptHtml.trim() || undefined,
    promptBlocks: task.promptBlocks?.length ? task.promptBlocks : undefined,
    presentation: task.presentation,
    wordLimit: {
      min: task.minWords ?? undefined,
      max: task.maxWords ?? undefined,
      displayText: task.wordLimitDisplayText.trim() || undefined,
    },
    imageAssets: task.imageAssets.length > 0 ? task.imageAssets : undefined,
    metadata: {
      compulsory: task.compulsory,
      sourceQuestionNumber: String(task.taskNumber),
    },
  }
}

export function mapFormToWritingTest(
  level: CambridgeWritingLevel,
  value: CambridgeWritingTestFormValue,
  existingId?: string,
): CambridgeWritingTest {
  const id = existingId ?? createCambridgeWritingTestId(level, value.testNumber)
  const payload: CambridgeWritingTest = {
    id,
    level,
    testNumber: value.testNumber,
    title: value.title.trim(),
    sourceUrl: value.sourceUrl.trim() || undefined,
    status: 'draft',
    version: 1,
    tasks: value.tasks.map((task: CambridgeWritingTaskFormValue) => mapTaskFormToTask(id, task)),
  }
  return CambridgeWritingTestSchema.parse(payload)
}

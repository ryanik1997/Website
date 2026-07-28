import type { ReadingExam, ReadingPart } from './examData'
import { resolvePassageAnchorForQuestion } from './readingPassageAnchor'

/** Anchor câu hỏi ở cột đáp án (phải). */
export function readingQuestionAnchorId(questionId: string): string {
  return `reading-q-${questionId}`
}

function scrollIntoPane(pane: HTMLElement, el: HTMLElement, behavior: ScrollBehavior = 'smooth') {
  const paneRect = pane.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const top = pane.scrollTop + (elRect.top - paneRect.top) - 20
  pane.scrollTo({ top: Math.max(0, top), behavior })
}

/**
 * Cuộn cột trái (passage) và phải (câu hỏi) tới cùng một câu — dùng trong toàn bộ Luyện thi Reading.
 */
export function scrollReadingToQuestion(
  root: HTMLElement | null,
  questionId: string,
  part?: ReadingPart,
  cambridgeLevel?: ReadingExam['cambridgeLevel'],
  behavior: ScrollBehavior = 'smooth',
): void {
  if (!root) return

  const passagePane = root.querySelector<HTMLElement>('.reading-test-passage')
  const questionsPane = root.querySelector<HTMLElement>('.reading-test-questions')

  const passageAnchorId = part
    ? resolvePassageAnchorForQuestion(part, questionId, cambridgeLevel)
    : `reading-p-${questionId}`

  const passageEl = root.querySelector<HTMLElement>(`#${CSS.escape(passageAnchorId)}`)
    ?? root.querySelector<HTMLElement>(`#${CSS.escape(`reading-p-${questionId}`)}`)
  const questionEl = root.querySelector<HTMLElement>(`#${CSS.escape(readingQuestionAnchorId(questionId))}`)

  if (passageEl && passagePane) {
    scrollIntoPane(passagePane, passageEl, behavior)
  }
  if (questionEl && questionsPane) {
    scrollIntoPane(questionsPane, questionEl, behavior)
  }
}
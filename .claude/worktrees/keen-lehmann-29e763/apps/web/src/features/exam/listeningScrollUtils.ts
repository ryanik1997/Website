/** Anchor đề / câu hỏi ở cột trái Listening. */
export function listeningPromptAnchorId(questionId: string): string {
  return `listening-q-${questionId}`
}

/** Anchor đáp án ở cột phải Listening. */
export function listeningAnswerAnchorId(questionId: string): string {
  return `listening-a-${questionId}`
}

function scrollIntoPane(pane: HTMLElement, el: HTMLElement, behavior: ScrollBehavior = 'smooth') {
  const paneRect = pane.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const top = pane.scrollTop + (elRect.top - paneRect.top) - 20
  pane.scrollTo({ top: Math.max(0, top), behavior })
}

/** Cuộn 2 cột Listening tới cùng một câu. */
export function scrollListeningToQuestion(
  root: HTMLElement | null,
  questionId: string,
  behavior: ScrollBehavior = 'smooth',
): void {
  if (!root) return

  const promptPane = root.querySelector<HTMLElement>('.listening-exam-prompt-pane')
  const answerPane = root.querySelector<HTMLElement>('.listening-exam-answer-pane')

  const promptEl = root.querySelector<HTMLElement>(`#${CSS.escape(listeningPromptAnchorId(questionId))}`)
  const answerEl = root.querySelector<HTMLElement>(`#${CSS.escape(listeningAnswerAnchorId(questionId))}`)

  if (promptEl && promptPane) {
    scrollIntoPane(promptPane, promptEl, behavior)
  }
  if (answerEl && answerPane) {
    scrollIntoPane(answerPane, answerEl, behavior)
  }
}

/** KET 1 câu / lần — cuộn về đầu mỗi cột khi đổi câu. */
export function resetListeningSplitPanes(root: HTMLElement | null, behavior: ScrollBehavior = 'auto'): void {
  if (!root) return
  root.querySelector<HTMLElement>('.listening-exam-prompt-pane')?.scrollTo({ top: 0, behavior })
  root.querySelector<HTMLElement>('.listening-exam-answer-pane')?.scrollTo({ top: 0, behavior })
}
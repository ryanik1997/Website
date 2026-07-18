/**
 * The submitted screen owns the answer-hydrated exam, while the paper screen is
 * rendered by its parent with the original DTO. Promote the hydrated snapshot
 * before leaving the report so review mode sees the same answer keys.
 */
export function promoteHydratedExamForReview<T extends object>(target: T, hydrated: T): void {
  if (target === hydrated) return
  Object.assign(target, hydrated)
}

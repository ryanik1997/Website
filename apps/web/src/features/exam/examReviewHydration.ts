/**
 * The submitted screen owns the answer-hydrated exam, while the paper screen is
 * rendered by its parent with the original DTO. Promote the hydrated snapshot
 * before leaving the report so review mode sees the same answer keys.
 */
function syncHydratedValue(target: unknown, hydrated: unknown): unknown {
  if (Array.isArray(target) && Array.isArray(hydrated)) {
    target.length = hydrated.length
    for (let index = 0; index < hydrated.length; index += 1) {
      target[index] = syncHydratedValue(target[index], hydrated[index])
    }
    return target
  }

  if (
    target !== null
    && hydrated !== null
    && typeof target === 'object'
    && typeof hydrated === 'object'
    && !Array.isArray(target)
    && !Array.isArray(hydrated)
  ) {
    const targetRecord = target as Record<string, unknown>
    const hydratedRecord = hydrated as Record<string, unknown>
    for (const key of Object.keys(targetRecord)) {
      if (!(key in hydratedRecord)) delete targetRecord[key]
    }
    for (const [key, value] of Object.entries(hydratedRecord)) {
      targetRecord[key] = syncHydratedValue(targetRecord[key], value)
    }
    return target
  }

  return hydrated
}

export function promoteHydratedExamForReview<T extends object>(target: T, hydrated: T): void {
  if (target === hydrated) return
  syncHydratedValue(target, hydrated)
}

/**
 * Answer mapping: derive display labels AFTER deterministic shuffle.
 * Blueprints store semantic keys, never letter labels.
 */

const DISPLAY_LABELS = 'abcdefgh'.split('')

export function labelDisplayedOptions(options) {
  return options.map((option, index) => ({
    ...option,
    displayLabel: DISPLAY_LABELS[index],
  }))
}

export function answerLabelForKey(displayedOptions, correctKey) {
  const option = displayedOptions.find(c => c.key === correctKey)
  if (!option) throw new Error(`Missing correct option key: ${correctKey}`)
  return option.displayLabel
}

/**
 * For Part 4: derive answer vault from correctForGap semantic mapping.
 */
export function derivePart4Answers(displayedOptions, questionIdFn) {
  const answers = {}
  for (let qn = 16; qn <= 20; qn += 1) {
    const correct = displayedOptions.find(o => o.correctForGap === qn)
    if (!correct) throw new Error(`Part 4 Q${qn}: no semantic answer`)
    answers[questionIdFn(qn)] = correct.displayLabel
  }
  return answers
}

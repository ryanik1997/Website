function normalizeLine(line: string): string {
  return line
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isHardBreakLine(line: string): boolean {
  return (
    /^questions?\s+\d+/i.test(line)
    || /^section\b/i.test(line)
    || /^part\b/i.test(line)
    || /^choose\b/i.test(line)
    || /^complete\b/i.test(line)
    || /^write\b/i.test(line)
    || /^list of\b/i.test(line)
    || /^example\b/i.test(line)
    || /^[A-E][\.\)]\s+/.test(line)
    || /^\(?[A-E]\)?\s+/.test(line)
    || /^\d{1,2}[\.\)]\s+/.test(line)
    || /^[•*+-]\s+/.test(line)
    || /^[A-Z][A-Z0-9 '&/,-]{4,}$/.test(line)
  )
}

function shouldMergeLines(prev: string, next: string): boolean {
  if (!prev || !next) return false
  if (isHardBreakLine(next)) return false
  if (isHardBreakLine(prev) && /[:.]$/.test(prev)) return false
  if (/[.?!:]$/.test(prev)) return false
  if (prev.endsWith('-')) return true
  if (prev.endsWith(',')) return true
  if (/^[a-z(]/.test(next)) return true
  if (prev.length >= 55 && /^[A-Z0-9]/.test(next)) return true
  if (/\b(?:and|or|of|to|for|with|in|on|at|by|from|the|a|an)$/i.test(prev)) return true
  return false
}

export function cleanupWizardExamText(text: string): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const output: string[] = []

  for (const raw of lines) {
    const line = normalizeLine(raw)
    if (!line) {
      if (output.length && output[output.length - 1] !== '') {
        output.push('')
      }
      continue
    }

    const last = output[output.length - 1]
    if (last && last !== '' && shouldMergeLines(last, line)) {
      output[output.length - 1] = last.endsWith('-')
        ? `${last.slice(0, -1)}${line}`
        : `${last} ${line}`
      continue
    }

    output.push(line)
  }

  while (output[0] === '') output.shift()
  while (output[output.length - 1] === '') output.pop()

  return output.join('\n')
}

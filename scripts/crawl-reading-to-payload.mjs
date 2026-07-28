const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const clean = value => String(value ?? '').trim()
const text = html => clean(html).replace(/<\s*(br|\/p|\/div)\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&#39;|&rsquo;/gi, "'").replace(/\n{3,}/g, '\n\n')
const nonEmpty = values => (values ?? []).map(clean).filter(Boolean)

function groupInstruction(groupHtml) {
  return text(groupHtml)
    .replace(/^Questions?\s+\d+\s*[–—-]\s*\d+\s*/i, '')
    .trim()
}

export function htmlToBlocks(html) {
  const normalized = String(html ?? '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div)\s*>/gi, '\n\n')
    .replace(/<\s*(p|div)(?:\s[^>]*)?>/gi, '')
  const blocks = normalized.split(/\n\s*\n|\n/).map(text).filter(Boolean).map(value => {
    const labelMatch = value.match(/^([A-Z])\.\s*(.*)$/s)
    return labelMatch ? { label: labelMatch[1], text: clean(labelMatch[2]) } : { text: value }
  }).filter(block => block.text || block.label)
  return blocks.reduce((result, block) => {
    if (result.at(-1)?.label && !result.at(-1).text && !block.label) result.at(-1).text = block.text
    else result.push(block)
    return result
  }, [])
}

function inlineBlocks(value) {
  const blocks = []
  let cursor = 0
  for (const match of String(value ?? '').matchAll(/\[(\d+)]/g)) {
    if (match.index > cursor) blocks.push({ type: 'static', text: value.slice(cursor, match.index) })
    blocks.push({ type: 'gap', number: Number(match[1]) })
    cursor = match.index + match[0].length
  }
  if (cursor < value.length) blocks.push({ type: 'static', text: value.slice(cursor) })
  return blocks
}

export function parseNoteContent(noteContent) {
  const blocks = []
  const lines = String(noteContent ?? '').split(/\r?\n/)
  for (let index = 0; index < lines.length; index++) {
    const line = clean(lines[index])
    if (!line) { if (blocks.length && blocks.at(-1).type !== 'break') blocks.push({ type: 'break' }); continue }
    const section = line.match(/^\*\*(.+?)\*\*$/)
    if (section) blocks.push({ type: 'section', text: clean(section[1]) })
    else blocks.push(...inlineBlocks(line))
    if (index < lines.length - 1 && blocks.at(-1)?.type !== 'break') blocks.push({ type: 'break' })
  }
  while (blocks.at(-1)?.type === 'break') blocks.pop()
  return blocks
}

function parseTableCell(value) {
  const lines = String(value ?? '').split(/\r?\n/)
    .map(line => clean(line).replace(/^\*\*(.*?)\*\*$/, '$1').replace(/^●\s*/, '• '))
    .filter(Boolean)
  return lines.flatMap((line, index) => [...inlineBlocks(line), ...(index < lines.length - 1 ? [{ type: 'break' }] : [])])
}

function parseNoteTable(config) {
  let sourceRows = (config.tableRows ?? []).map(row => row.map(cell => String(cell ?? '')))
  let headers = (config.tableHeaders ?? []).map(value => clean(value).replace(/^\*\*(.*?)\*\*$/, '$1'))
  const headersAreEmpty = headers.length === 0 || headers.every(value => !value)
  const firstRow = sourceRows[0] ?? []
  // TID marks embedded header rows with markdown bold (e.g. **Growth**).
  // Plain first rows (Cam15 Nutmeg: "Middle Ages", gap [8]) are body data.
  const firstRowLooksLikeHeaders = firstRow.length > 1 && firstRow.some(value => /\*\*.+?\*\*/.test(value))
  if (headersAreEmpty && firstRowLooksLikeHeaders) {
    headers = firstRow.map(value => clean(value).replace(/^\*\*(.*?)\*\*$/, '$1'))
    sourceRows = sourceRows.slice(1)
  }
  const gapNumbers = sourceRows.flatMap(row => row.flatMap(cell => [...cell.matchAll(/\[(\d+)]/g)].map(match => Number(match[1]))))
  return {
    title: clean(config.tableTitle || config.tableInlineTitle) || undefined,
    headers,
    gapNumbers,
    rows: sourceRows.map(row => ({ cells: row.map(parseTableCell) })),
  }
}

const TYPES = {
  tfng: ['tfng', 'true-false-not-given'],
  ynng: ['ynng', 'yes-no-not-given'],
  'matching-info': ['matching-paragraph', 'matching-paragraph'],
  'matching-feature': ['matching-features', 'matching-features'],
  'matching-features': ['matching-features', 'matching-features'],
  'matching-heading': ['matching-headings', 'matching-headings'],
  'matching-headings': ['matching-headings', 'matching-headings'],
  'note-completion': ['gap-fill', 'gap-fill'],
  'fill-blank': ['gap-fill', 'gap-fill'],
  'gap-filling': ['gap-fill', 'gap-fill'],
  'sentence-completion': ['gap-fill', 'gap-fill'],
  'summary-completion': ['summary-completion', 'gap-fill'],
  'table-completion': ['gap-fill', 'gap-fill'],
  'flow-chart-completion': ['gap-fill', 'gap-fill'],
  'flowchart-completion': ['gap-fill', 'gap-fill'],
  'sentence-ending': ['sentence-ending', 'sentence-ending'],
  'multiple-choice': ['multiple-choice', 'multiple-choice'],
  'multiple-choice-2': ['multiple-choice', 'multiple-choice'],
  'yes-no': ['ynng', 'yes-no-not-given'],
}

export function crawlRowsToPayload(rows, cam, test, warn = console.warn) {
  const base = `cam-${cam}-${test}`
  const parts = rows.slice().sort((a, b) => Number(a.youpass_id?.split('-').at(-1)) - Number(b.youpass_id?.split('-').at(-1))).map((row, partIndex) => {
    const groups = new Map()
    let activeKey = null
    let activeType = null
    for (const question of row.questions ?? []) {
      const questionType = clean(question.displayType ?? question._blockConfig?.type ?? question.type).toLowerCase()
      const explicitKey = question.groupId ?? question.group_id ?? question.blockId
      // Crawl often stores group_id/blockId only on the first question of a
      // run. Inherit that group while the display type stays the same; start a
      // new run when the type changes (Cam9 T4 has 8 such runs).
      const key = explicitKey
        ?? (activeKey && activeType === questionType ? activeKey : `solo-${question.id}`)
      activeKey = key
      activeType = questionType
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(question)
    }
    const questionGroups = [...groups.values()].map(items => {
      const head = items.find(item => item._blockConfig) ?? items[0]
      const config = head._blockConfig ?? {}
      const sourceType = clean(head.displayType ?? config.type ?? head.type).toLowerCase()
      const mapped = TYPES[sourceType]
      if (!mapped) {
        warn(`[reading-crawl] ${base} P${partIndex + 1} Q${items[0]?.id}-${items.at(-1)?.id}: unknown displayType "${sourceType}"; preserved unchanged`)
        return { range: `Questions ${items[0]?.id}-${items.at(-1)?.id}`, instruction: groupInstruction(head.groupHtml), type: sourceType, questions: items.map(item => ({ ...item })) }
      }
      const [groupType, questionType] = mapped
      const questions = items.map((item, index) => ({
        number: Number(item.id ?? item.number), type: questionType,
        prompt: clean(item.text ?? item.question_text ?? item.question) || `Question ${item.id}`,
        options: (item.options ?? []).filter(option => clean(option)).map((label, i) => ({ id: LETTERS[i], label: clean(label) })),
        answer: clean(item.answer), explanation: clean(item.explanation), answerConfidence: 'key',
        ...(sourceType === 'sentence-ending' && nonEmpty(config.sentenceStems)[index] ? { prompt: nonEmpty(config.sentenceStems)[index] } : {}),
      }))
      const actualStart = Math.min(...questions.map(question => question.number))
      const actualEnd = Math.max(...questions.map(question => question.number))
      const group = { range: `Questions ${actualStart}-${actualEnd}`, instruction: groupInstruction(head.groupHtml), type: groupType, questions }
      if (groupType === 'matching-paragraph') group.paragraphLetters = nonEmpty(config.sectionLabels ?? config.paragraphs)
      if (groupType === 'matching-features') group.features = nonEmpty(config.featureOptions).map((name, i) => ({ id: LETTERS[i], name }))
      if (groupType === 'matching-headings') group.headings = nonEmpty(config.headings).map((label, i) => ({ id: LETTERS[i], label }))
      if (groupType === 'sentence-ending') group.features = nonEmpty(config.sentenceEndings).map((name, i) => ({ id: LETTERS[i], name }))
      if (nonEmpty(config.phraseOptions).length) group.wordBank = nonEmpty(config.phraseOptions).map((label, i) => ({ id: LETTERS[i], label }))
      if (['note-completion', 'summary-completion', 'flow-chart-completion', 'flowchart-completion'].includes(sourceType)) {
        group.notesTitle = clean(config.noteTitle)
        group.notePassage = parseNoteContent(config.noteContent)
      }
      if (sourceType === 'table-completion') group.noteTable = parseNoteTable(config)
      return group
    })
    return { partNumber: partIndex + 1, rangeLabel: '', passageTitle: clean(row.title) || `Passage ${partIndex + 1}`, passage: htmlToBlocks(row.content_html), questionGroups }
  })
  return { version: 1, title: `Cambridge ${cam} Test ${test} Reading`, durationMinutes: 60, bandHint: `IELTS Academic · Cambridge ${cam} · Test ${test}`, examTrack: 'ielts', parts }
}

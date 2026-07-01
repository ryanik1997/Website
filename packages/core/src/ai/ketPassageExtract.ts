export type KetPartNumber = 1 | 2 | 3 | 4 | 5

export interface KetPassageBlock {
  label?: string
  text: string
}

const FOOTER_CUT = /Copyright Material|Review Only|Not for Redistribution|\bp\.\s*\d+/i

function cleanChunk(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function cutAtFooter(text: string): string {
  const m = text.search(FOOTER_CUT)
  return m > 80 ? text.slice(0, m).trim() : text.trim()
}

function stripPartHeader(text: string): string {
  return text
    .replace(/^[\s\S]*?For each question[^\n]*\n/i, '')
    .replace(/^[\s\S]*?Write ONE word[^\n]*\n/i, '')
    .replace(/^[\s\S]*?Example:\s*\d+[^\n]*\n/i, '')
    .trim()
}

function extractNamedProfiles(text: string, names: string[]): KetPassageBlock[] {
  const blocks: KetPassageBlock[] = []
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i]
    const startRe = new RegExp(`(?:^|\\n)\\s*${name}\\s*(?:\\n|$)`, 'i')
    const startMatch = text.match(startRe)
    if (!startMatch || startMatch.index == null) continue

    const start = startMatch.index + startMatch[0].length
    let end = text.length
    for (let j = i + 1; j < names.length; j += 1) {
      const nextRe = new RegExp(`(?:^|\\n)\\s*${names[j]}\\s*(?:\\n|$)`, 'i')
      const nextMatch = text.slice(start).match(nextRe)
      if (nextMatch?.index != null && nextMatch.index > 20) {
        end = Math.min(end, start + nextMatch.index)
      }
    }
    const footerIdx = text.slice(start, end).search(FOOTER_CUT)
    if (footerIdx > 40) end = start + footerIdx

    const body = text.slice(start, end).replace(/\s+/g, ' ').trim()
    if (body.length > 40) blocks.push({ label: name, text: body })
  }
  return blocks
}

function stripAnswerKeyLines(text: string): string {
  return text
    .split('\n')
    .filter(line => !/^\s*\d{1,2}\s+[A-D]\s+/i.test(line.trim()))
    .join('\n')
    .replace(/\s+\d{1,2}\s+[A-D]\s+[\w\s]+$/gi, '')
    .trim()
}

function extractTitleAndBody(slice: string): { title?: string; blocks: KetPassageBlock[] } {
  const body = cutAtFooter(stripPartHeader(cleanChunk(slice)))
  const titleMatch = body.match(
    /(?:^|\n)([A-Z][A-Za-z0-9'’\-\s]{6,72})\n([\s\S]+)/,
  )
  if (!titleMatch) {
    const paragraphs = body
      .split(/\n{2,}/)
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 60 && !/^PART\s/i.test(p) && !/^QUESTIONS?/i.test(p))
    return { blocks: paragraphs.map(text => ({ text })) }
  }

  const title = titleMatch[1].trim()
  let rest = stripAnswerKeyLines(titleMatch[2])
  rest = rest.replace(/\s+/g, ' ').trim()
  if (rest.length < 40) return { title, blocks: [] }

  const sentences = rest.match(/[^.!?]+[.!?]+/g) ?? [rest]
  const blocks: KetPassageBlock[] = []
  let chunk = ''
  for (const sentence of sentences) {
    const next = `${chunk} ${sentence}`.trim()
    if (next.length > 320 && chunk.length > 80) {
      blocks.push({ text: chunk.trim() })
      chunk = sentence.trim()
    } else {
      chunk = next
    }
  }
  if (chunk.trim()) blocks.push({ text: chunk.trim() })
  return { title, blocks: blocks.length ? blocks : [{ text: rest }] }
}

function extractEmailBlocks(slice: string): KetPassageBlock[] {
  const body = cutAtFooter(stripPartHeader(cleanChunk(slice)))
  const blocks: KetPassageBlock[] = []
  const fromRe = /From:\s*([^\n]+)\nTo:\s*([^\n]+)\n([\s\S]*?)(?=From:|$)/gi
  let match = fromRe.exec(body)
  while (match) {
    const from = match[1].trim()
    const to = match[2].trim()
    const text = match[3].replace(/\s+/g, ' ').trim()
    if (text.length > 20) {
      blocks.push({
        label: `${from} → ${to}`,
        text,
      })
    }
    match = fromRe.exec(body)
  }
  return blocks
}

/** Trích passage từ raw text của từng PART khi AI trả passage rỗng. */
export function extractKetPassageFromSlice(
  partNumber: KetPartNumber,
  slice: string,
): KetPassageBlock[] {
  const text = cleanChunk(slice)
  if (!text) return []

  if (partNumber === 1) {
    return [{
      text: 'Đọc ba thông báo/tin nhắn bên dưới (A, B, C) và chọn đáp án đúng cho mỗi câu.',
    }]
  }

  if (partNumber === 2) {
    const body = cutAtFooter(text)
    const titleMatch = body.match(/(?:^|\n)([A-Z][^\n]{8,64})\n\s*Angus\b/i)
    const profiles = extractNamedProfiles(body, ['Angus', 'Frank', 'Zac'])
    if (profiles.length) return profiles
    if (titleMatch) {
      return [{ text: `Đọc văn bản "${titleMatch[1].trim()}" và ghép với từng câu hỏi.` }]
    }
  }

  if (partNumber === 3 || partNumber === 4) {
    const { blocks } = extractTitleAndBody(text)
    if (blocks.length) return blocks
  }

  if (partNumber === 5) {
    const emails = extractEmailBlocks(text)
    if (emails.length) return emails
    const { blocks } = extractTitleAndBody(text)
    if (blocks.length) return blocks
  }

  const fallback = cutAtFooter(stripPartHeader(text))
    .split(/\n{2,}/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 80 && !/^PART\s/i.test(p))
    .slice(0, 6)
    .map(text => ({ text }))

  return fallback
}

export function ketPassageTitleFromSlice(partNumber: KetPartNumber, slice: string): string | undefined {
  if (partNumber === 2) {
    const m = cleanChunk(slice).match(/(?:^|\n)([A-Z][A-Za-z0-9'’\-\s]{8,64})\n\s*Angus\b/i)
    return m?.[1]?.trim()
  }
  if (partNumber === 3 || partNumber === 4) {
    const { title } = extractTitleAndBody(slice)
    return title
  }
  return undefined
}
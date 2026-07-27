import fs from 'node:fs/promises'
import path from 'node:path'

const root = 'D:/App-English-Ryan/Tainguyen/Import Cambridge/FCE_B2/Reading'
const outPath = path.resolve('tmp/fce-b2-source-semantic-report.json')

function sample(value, max = 6000) {
  const text = String(value ?? '')
  return text.length > max ? `${text.slice(0, max)}...<truncated ${text.length - max} chars>` : text
}

function summarizeQuestion(q) {
  return {
    number: q?.number,
    type: q?.type,
    format: q?.format,
    questionText: q?.questionText,
    prompt: q?.prompt,
    keyword: q?.keyword,
    baseWord: q?.baseWord,
    size: q?.size,
    options: q?.options,
    remainingFields: Object.fromEntries(
      Object.entries(q ?? {}).filter(([key]) => ![
        'number',
        'type',
        'format',
        'questionText',
        'prompt',
        'keyword',
        'baseWord',
        'size',
        'options',
      ].includes(key)),
    ),
  }
}

const tests = {}

for (const testNumber of [1, 13, 26]) {
  const file = path.join(root, `fce-reading-test${testNumber}`, 'exam', 'exam.json')
  const raw = JSON.parse(await fs.readFile(file, 'utf8'))
  tests[testNumber] = {
    file,
    source: raw.source,
    title: raw.title,
    crawledAt: raw.crawledAt,
    pages: raw.pages
      .filter(page => Number(page.partNumber) >= 1 && Number(page.partNumber) <= 7)
      .map(page => ({
        pageNumber: page.pageNumber,
        partNumber: page.partNumber,
        partTitle: page.partTitle,
        instructions: page.instructions,
        passageTitle: page.passageTitle,
        passageTextHtmlLength: String(page.passageTextHtml ?? '').length,
        passageTextHtml: sample(page.passageTextHtml),
        rawHtmlSampleLength: String(page.rawHtmlSample ?? '').length,
        rawHtmlSample: sample(page.rawHtmlSample, 2500),
        questionCount: page.questions?.length ?? 0,
        questions: (page.questions ?? []).map(summarizeQuestion),
      })),
  }
}

await fs.mkdir(path.dirname(outPath), { recursive: true })
await fs.writeFile(outPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), tests }, null, 2)}\n`)
console.log(outPath)

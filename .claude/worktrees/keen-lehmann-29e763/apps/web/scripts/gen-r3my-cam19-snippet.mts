import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const s = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '../../../cam19-r3my-sample.json'), 'utf8'),
) as {
  passageTitle: string
  passageSubtitle?: string
  passage: Array<{ text: string }>
  questionGroups: Array<{
    range: string
    instruction: string
    type: string
    note?: string
    wordBank?: Array<{ id: string; label: string }>
    questions: Array<{
      number: number
      type: string
      prompt: string
      options?: Array<{ id: string; label: string }>
      answer: string
      explanation?: string
    }>
  }>
}

function esc(str: string): string {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n')
}

const bank = s.questionGroups[1].wordBank ?? []
const noteParts = (s.questionGroups[1].note ?? '').split('\n')

// Correct Cam19 mapping (phrase bank letters)
const summaryAns: Record<number, string> = {
  31: 'h', // frequent exposure
  32: 'j', // different ideas
  33: 'g', // mental operation
  34: 'b', // additional evidence
  35: 'e', // short period
  36: 'c', // different locations
}
const summaryExpl: Record<number, string> = {
  31: 'frequent exposure',
  32: 'different ideas',
  33: 'mental operation',
  34: 'additional evidence',
  35: 'short period',
  36: 'different locations',
}

let code = ''
code += 'const CAM19_T1_MISINFO_WORD_BANK = [\n'
for (const w of bank) {
  code += `  { id: '${w.id}', label: '${esc(w.label)}' },\n`
}
code += ']\n\n'

code += 'const CAM19_T1_MISINFO_SUMMARY_NOTE = [\n'
for (const line of noteParts) {
  code += `  '${esc(line)}',\n`
}
code += "].join('\\n')\n\n"

code += `/**
 * r3my — MC Q27–30 + Summary bank A–J Q31–36 + YNNG Q37–40
 * SAMPLE: Cam19 Test 1 P3 (The persistence and peril of misinformation)
 * ⚠️ Thứ tự: MC → summary bank → YNNG (khác r3ysm: YNNG → summary → MC)
 */
export function ieltsReadingP3McSummaryYnngPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: '${esc(s.passageTitle)}',
    passageSubtitle: '${esc(s.passageSubtitle ?? '')}',
    passage: [
`

for (const b of s.passage) {
  code += `      { text: '${esc(b.text)}' },\n`
}

code += `    ],
    questionGroups: [
      {
        range: 'Questions 27–30',
        instruction: 'Choose the correct letter, A, B, C or D.',
        type: 'multiple-choice',
        questions: [
`

const g0 = s.questionGroups[0]
for (const q of g0.questions) {
  code += `          {
            number: ${q.number},
            type: 'multiple-choice',
            prompt: '${esc(q.prompt)}',
            options: [
`
  for (const o of q.options ?? []) {
    code += `              { id: '${o.id}', label: '${esc(o.label)}' },\n`
  }
  code += `            ],
            answer: '${q.answer}',
            explanation: '${esc(q.explanation ?? '')}',
          },
`
}

code += `        ],
      },
      {
        range: 'Questions 31–36',
        instruction: 'Complete the summary using the list of phrases, A–J, below.',
        type: 'summary-completion',
        note: CAM19_T1_MISINFO_SUMMARY_NOTE,
        wordBank: CAM19_T1_MISINFO_WORD_BANK,
        questions: [
`

for (const n of [31, 32, 33, 34, 35, 36]) {
  code += `          { number: ${n}, type: 'summary-completion', prompt: 'Gap (${n})', options: [], answer: '${summaryAns[n]}', explanation: '${summaryExpl[n]}' },\n`
}

const g2 = s.questionGroups[2]
code += `        ],
      },
      {
        range: 'Questions 37–40',
        instruction: '${esc(g2.instruction)}',
        type: 'ynng',
        questions: [
`

for (const q of g2.questions) {
  code += `          {
            number: ${q.number},
            type: 'yes-no-not-given',
            prompt: '${esc(q.prompt)}',
            options: [...YNNG_OPTIONS],
            answer: '${q.answer}',
            explanation: '${esc(q.explanation ?? '')}',
          },
`
}

code += `        ],
      },
    ],
  }
}
`

const outPath = resolve(import.meta.dirname, '../../../cam19-r3my-fn.ts.snippet')
writeFileSync(outPath, code)
console.log('OK', outPath, code.length)

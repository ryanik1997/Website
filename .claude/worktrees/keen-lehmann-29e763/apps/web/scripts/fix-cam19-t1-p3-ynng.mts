/**
 * Fix Cam 19 Test 1 Reading Part 3 on Supabase:
 * - Q27–30: MC A–D (were wrongly ynng)
 * - Q37–40: ynng (were group.type multiple-choice → double YES/NO UI)
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(import.meta.dirname, '../.env.local')
const env = readFileSync(envPath, 'utf8')
const url = env.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim()
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim()
if (!url || !key) throw new Error('Missing Supabase env')

const EXAM_ID = 'reading-manual-1783584609723'

const YNNG = [
  { id: 'yes', label: 'YES' },
  { id: 'no', label: 'NO' },
  { id: 'not-given', label: 'NOT GIVEN' },
]

const MC = {
  27: {
    prompt: 'What point does the writer make about misinformation in the first paragraph?',
    answer: 'd',
    options: [
      { id: 'a', label: 'Misinformation is a relatively recent phenomenon.' },
      { id: 'b', label: 'Some people find it easy to identify misinformation.' },
      { id: 'c', label: 'Misinformation changes as it is passed from one person to another.' },
      { id: 'd', label: 'There may be a number of reasons for the spread of misinformation.' },
    ],
  },
  28: {
    prompt: 'What does the writer say about the role of technology?',
    answer: 'a',
    options: [
      { id: 'a', label: 'It may at some point provide us with a solution to misinformation.' },
      { id: 'b', label: 'It could fundamentally alter the way in which people regard information.' },
      { id: 'c', label: 'It has changed the way in which organisations use misinformation.' },
      { id: 'd', label: 'It has made it easier for people to check whether information is accurate.' },
    ],
  },
  29: {
    prompt: 'What is the writer doing in the fourth paragraph?',
    answer: 'c',
    options: [
      { id: 'a', label: 'comparing the different opinions people have of misinformation' },
      { id: 'b', label: 'explaining how the effects of misinformation have changed over time' },
      { id: 'c', label: 'outlining which issues connected with misinformation are significant today' },
      { id: 'd', label: 'describing the attitude of policy makers towards misinformation in the media' },
    ],
  },
  30: {
    prompt: 'What point does the writer make about regulation in the USA?',
    answer: 'd',
    options: [
      { id: 'a', label: 'The guidelines issued by the FDA need to be simplified.' },
      { id: 'b', label: "Regulation does not affect people's opinions of new prescription drugs." },
      { id: 'c', label: 'The USA has more regulatory bodies than most other countries.' },
      { id: 'd', label: 'Regulation fails to prevent misinformation from appearing in the media.' },
    ],
  },
} as const

const YNNG_ANS: Record<number, string> = {
  37: 'yes',
  38: 'not-given',
  39: 'no',
  40: 'not-given',
}

const SUMMARY_ANS: Record<number, string> = {
  31: 'g',
  32: 'j',
  33: 'h',
  34: 'b',
  35: 'e',
  36: 'c',
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

const getRes = await fetch(
  `${url}/rest/v1/reading_exam_published?id=eq.${EXAM_ID}&select=*`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
)
const rows = await getRes.json() as Array<{ parts: Array<Record<string, unknown>> }>
if (!rows[0]) throw new Error('Exam not found')

const parts = rows[0].parts as Array<{
  partNumber: number
  questionGroups: Array<{
    range?: string
    type?: string
    instruction?: string
    wordBank?: unknown
    questions: Array<{
      number: number
      type?: string
      prompt?: string
      options?: Array<{ id: string; label: string }>
      answer?: string
    }>
  }>
}>

const p3 = parts.find(p => p.partNumber === 3)
if (!p3) throw new Error('Part 3 missing')

p3.questionGroups = p3.questionGroups.map(g => {
  const nums = g.questions.map(q => q.number)

  if (nums.includes(27) && nums.includes(30)) {
    return {
      ...g,
      type: 'multiple-choice',
      instruction: 'Choose the correct letter, A, B, C or D.',
      wordBank: undefined,
      questions: g.questions.map(q => {
        const meta = MC[q.number as keyof typeof MC]
        return {
          ...q,
          type: 'multiple-choice',
          prompt: meta?.prompt ?? q.prompt,
          options: meta ? [...meta.options] : q.options,
          answer: meta?.answer ?? q.answer,
        }
      }),
    }
  }

  if (nums.includes(37) && nums.includes(40)) {
    return {
      ...g,
      type: 'ynng',
      instruction:
        'Do the following statements agree with the claims of the writer in the Reading Passage? In boxes 37–40 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
      wordBank: undefined,
      questions: g.questions.map(q => ({
        ...q,
        type: 'yes-no-not-given',
        options: YNNG.map(o => ({ ...o })),
        answer: YNNG_ANS[q.number] ?? q.answer,
      })),
    }
  }

  if (nums.includes(31) && nums.includes(36)) {
    return {
      ...g,
      type: 'summary-completion',
      questions: g.questions.map(q => ({
        ...q,
        type: 'summary-completion',
        answer: SUMMARY_ANS[q.number] ?? q.answer,
      })),
    }
  }

  return g
})

const patchRes = await fetch(
  `${url}/rest/v1/reading_exam_published?id=eq.${EXAM_ID}`,
  {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      parts,
      updated_at: new Date().toISOString(),
    }),
  },
)

const patchBody = await patchRes.text()
console.log('PATCH', patchRes.status, patchBody.slice(0, 400))
if (!patchRes.ok) {
  console.error('PATCH failed — may need service role / admin session. Local sanitize+UI still fixes double YNNG.')
  process.exit(1)
}

const verify = await fetch(
  `${url}/rest/v1/reading_exam_published?id=eq.${EXAM_ID}&select=parts`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
)
const p3v = ((await verify.json()) as typeof rows)[0].parts.find(p => p.partNumber === 3) as typeof p3
for (const g of p3v.questionGroups) {
  console.log(
    g.range,
    g.type,
    g.questions.map(q => `${q.number}:${q.type}:${q.answer}:n${q.options?.length ?? 0}`).join(' | '),
  )
}
console.log('OK Cam19 T1 P3 fixed')

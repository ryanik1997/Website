/**
 * Update Cam19 T1 Reading P3 via direct Postgres (service DB password).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import pg from 'pg'

const deployEnv = readFileSync(resolve(import.meta.dirname, '../../../.env.deploy'), 'utf8')
const pass = deployEnv.match(/SUPABASE_DB_PASSWORD=(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, '')
if (!pass) throw new Error('No SUPABASE_DB_PASSWORD')

const YNNG = [
  { id: 'yes', label: 'YES' },
  { id: 'no', label: 'NO' },
  { id: 'not-given', label: 'NOT GIVEN' },
]

const MC: Record<number, { prompt: string; answer: string; options: Array<{ id: string; label: string }> }> = {
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
}

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

function fixParts(parts: unknown): unknown {
  if (!Array.isArray(parts)) return parts
  return parts.map((part: Record<string, unknown>) => {
    if (part.partNumber !== 3) return part
    const groups = part.questionGroups as Array<Record<string, unknown>>
    if (!Array.isArray(groups)) return part
    return {
      ...part,
      questionGroups: groups.map(g => {
        const questions = g.questions as Array<Record<string, unknown>>
        if (!Array.isArray(questions)) return g
        const nums = questions.map(q => Number(q.number))

        if (nums.includes(27) && nums.includes(30)) {
          return {
            ...g,
            type: 'multiple-choice',
            instruction: 'Choose the correct letter, A, B, C or D.',
            wordBank: undefined,
            questions: questions.map(q => {
              const n = Number(q.number)
              const meta = MC[n]
              return {
                ...q,
                type: 'multiple-choice',
                prompt: meta?.prompt ?? q.prompt,
                options: meta ? meta.options.map(o => ({ ...o })) : q.options,
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
            questions: questions.map(q => ({
              ...q,
              type: 'yes-no-not-given',
              options: YNNG.map(o => ({ ...o })),
              answer: YNNG_ANS[Number(q.number)] ?? q.answer,
            })),
          }
        }

        if (nums.includes(31) && nums.includes(36)) {
          return {
            ...g,
            type: 'summary-completion',
            questions: questions.map(q => ({
              ...q,
              type: 'summary-completion',
              answer: SUMMARY_ANS[Number(q.number)] ?? q.answer,
            })),
          }
        }

        return g
      }),
    }
  })
}

const hosts = [
  { host: 'db.ntcagvtkwxwsmlxlumfo.supabase.co', user: 'postgres', port: 5432 },
  { host: 'aws-0-ap-southeast-1.pooler.supabase.com', user: 'postgres.ntcagvtkwxwsmlxlumfo', port: 6543 },
  { host: 'aws-0-ap-southeast-1.pooler.supabase.com', user: 'postgres.ntcagvtkwxwsmlxlumfo', port: 5432 },
]

let client: pg.Client | null = null
for (const h of hosts) {
  const c = new pg.Client({
    host: h.host,
    port: h.port,
    user: h.user,
    password: pass,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  })
  try {
    await c.connect()
    console.log('connected', h.host, h.port, h.user)
    client = c
    break
  } catch (e) {
    console.log('fail', h.host, h.port, (e as Error).message)
  }
}

if (!client) throw new Error('Could not connect to Postgres')

const EXAM_ID = 'reading-manual-1783584609723'
const { rows } = await client.query(
  'select id, title, parts from reading_exam_published where id = $1',
  [EXAM_ID],
)
if (!rows[0]) {
  await client.end()
  throw new Error('Exam not found')
}

const fixedParts = fixParts(rows[0].parts)
await client.query(
  'update reading_exam_published set parts = $1::jsonb, updated_at = now() where id = $2',
  [JSON.stringify(fixedParts), EXAM_ID],
)

const { rows: check } = await client.query(
  'select parts from reading_exam_published where id = $1',
  [EXAM_ID],
)
const p3 = (check[0].parts as Array<{ partNumber: number; questionGroups: Array<{ range: string; type: string; questions: Array<{ number: number; type: string; answer: string; options?: unknown[] }> }> }>).find(p => p.partNumber === 3)
for (const g of p3?.questionGroups ?? []) {
  console.log(
    g.range,
    g.type,
    g.questions.map(q => `${q.number}:${q.type}:${q.answer}:n${q.options?.length ?? 0}`).join(' | '),
  )
}

await client.end()
console.log('OK updated via DB')

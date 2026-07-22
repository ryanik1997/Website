import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import pg from 'pg'

const deployEnv = readFileSync(resolve(import.meta.dirname, '../../../.env.deploy'), 'utf8')
const pass = deployEnv.match(/SUPABASE_DB_PASSWORD=(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, '')
if (!pass) throw new Error('no db password')

const client = new pg.Client({
  host: 'db.ntcagvtkwxwsmlxlumfo.supabase.co',
  port: 5432,
  user: 'postgres',
  password: pass,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})
await client.connect()

const id = 'reading-manual-1783587241597'
const { rows } = await client.query('select parts from reading_exam_published where id=$1', [id])
const parts = rows[0].parts as Array<{
  partNumber: number
  questionGroups: Array<{
    range?: string
    instruction?: string
    questions: Array<{
      number: number
      prompt?: string
      options?: Array<{ id: string; label: string }>
    }>
  }>
}>

const p2 = parts.find(p => p.partNumber === 2)
if (!p2) throw new Error('no p2')

// Full option banks for Cam19 T2 (if both empty, inject SAMPLE-like banks)
const RADUCANU = [
  { id: 'a', label: 'the stage at which she dropped out of the tournament' },
  { id: 'b', label: 'symptoms of her performance stress at the tournament' },
  { id: 'c', label: 'measures she took to control her stress levels' },
  { id: 'd', label: 'aspects of the Wimbledon tournament which increased her stress levels' },
  { id: 'e', label: 'reactions to her posts on social media' },
]
const ANXIETY = [
  { id: 'a', label: 'how severe it may be depends on a person\'s demands and resources' },
  { id: 'b', label: 'how long it takes for its effects to become apparent' },
  { id: 'c', label: 'which of its symptoms are the most common' },
  { id: 'd', label: 'which types of athletes are most likely to suffer from it' },
  { id: 'e', label: 'what can happen if athletes experience it too often' },
]

for (const g of p2.questionGroups) {
  const qs = g.questions || []
  if (qs.length !== 2) continue
  if (!/choose two/i.test(g.instruction ?? '')) continue

  const nums = qs.map(q => q.number)
  let bank = qs[0].options?.length ? qs[0].options : qs[1].options
  if (!bank || bank.length < 3) {
    if (nums.includes(23)) bank = RADUCANU
    else if (nums.includes(25)) bank = ANXIETY
  }
  if (!bank || bank.length < 3) {
    console.log('skip', g.range, 'no bank')
    continue
  }

  for (const q of qs) {
    if ((q.options?.length ?? 0) < 3) {
      q.options = bank.map(o => ({ ...o }))
      console.log('filled options for Q', q.number)
    }
    if (!q.prompt?.trim()) {
      const other = qs.find(x => x.prompt?.trim())
      if (other?.prompt) {
        q.prompt = other.prompt.includes('first') || other.prompt.includes('second')
          ? other.prompt.replace(/first/i, 'second').replace(/second/i, 'first')
          : `${other.prompt} (second answer)`
      }
    }
  }
}

await client.query(
  'update reading_exam_published set parts=$1::jsonb, updated_at=now() where id=$2',
  [JSON.stringify(parts), id],
)
await client.end()
console.log('OK Cam19 T2 P2 Choose TWO options fixed')

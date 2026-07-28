import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildIeltsListeningP2Template,
  ieltsListeningP2TemplateFilename,
  type IeltsListeningP2TemplateKind,
} from '../apps/web/src/features/exam/ieltsListeningP2Templates.ts'

const KINDS: IeltsListeningP2TemplateKind[] = [
  'p2-a6', 'p2-a7', 'p2-a8', 'p2-a9', 'p2-a10',
  'p2-a11', 'p2-a12', 'p2-a13', 'p2-a14',
]

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'Tainguyen', 'templates')

mkdirSync(OUT_DIR, { recursive: true })

for (const kind of KINDS) {
  const name = ieltsListeningP2TemplateFilename(kind)
  const payload = buildIeltsListeningP2Template(kind)
  const path = join(OUT_DIR, name)
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`✓ ${path}`)
}
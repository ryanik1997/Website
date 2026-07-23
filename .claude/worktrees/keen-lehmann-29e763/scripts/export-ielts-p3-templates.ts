import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildIeltsListeningP3Template,
  ieltsListeningP3TemplateFilename,
  type IeltsListeningP3TemplateKind,
} from '../apps/web/src/features/exam/ieltsListeningP3Templates.ts'

const KINDS: IeltsListeningP3TemplateKind[] = [
  'p3-c1', 'p3-c2', 'p3-c3', 'p3-c4', 'p3-c5', 'p3-c6', 'p3-c7',
]

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'Tainguyen', 'templates')

mkdirSync(OUT_DIR, { recursive: true })

for (const kind of KINDS) {
  const name = ieltsListeningP3TemplateFilename(kind)
  const payload = buildIeltsListeningP3Template(kind)
  const path = join(OUT_DIR, name)
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`✓ ${path}`)
}
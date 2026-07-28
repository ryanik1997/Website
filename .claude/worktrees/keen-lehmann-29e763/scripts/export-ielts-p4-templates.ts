import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildIeltsListeningP4Template,
  ieltsListeningP4TemplateFilename,
  type IeltsListeningP4TemplateKind,
} from '../apps/web/src/features/exam/ieltsListeningP4Templates.ts'

const KINDS: IeltsListeningP4TemplateKind[] = ['p4-d1', 'p4-d2', 'p4-d3']

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'Tainguyen', 'templates')

mkdirSync(OUT_DIR, { recursive: true })

for (const kind of KINDS) {
  const name = ieltsListeningP4TemplateFilename(kind)
  const payload = buildIeltsListeningP4Template(kind)
  const path = join(OUT_DIR, name)
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`✓ ${path}`)
}
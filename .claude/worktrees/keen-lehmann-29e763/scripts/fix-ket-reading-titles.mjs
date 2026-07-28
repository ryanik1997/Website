/**
 * Đặt title KET Reading: "KET A2 Reading — Book {B} — Test {T}"
 * B = số từ KET A2_Cam {B} trong đường dẫn; T = số từ thư mục Test {T}
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = [
  'Tainguyen/Import Cambridge',
  'Tainguyen/Cambridge A2-C2/KET A2',
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (name === 'exam.json') out.push(p)
  }
  return out
}

let updated = 0
for (const root of roots) {
  const abs = join(process.cwd(), root)
  try {
    for (const file of walk(abs)) {
      const cam = file.match(/KET A2_Cam (\d+)/i)
      const test = file.match(/Test (\d+)[/\\]/i)
      if (!cam || !test) continue
      const book = Number(cam[1])
      const t = Number(test[1])
      const json = JSON.parse(readFileSync(file, 'utf8'))
      const title = `KET A2 Reading — Book ${book} — Test ${t}`
      if (json.title === title) continue
      json.title = title
      writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, 'utf8')
      console.log(`✓ ${file}\n  → ${title}`)
      updated++
    }
  } catch {
    // skip missing root
  }
}

console.log(`Done: ${updated} file(s)`)
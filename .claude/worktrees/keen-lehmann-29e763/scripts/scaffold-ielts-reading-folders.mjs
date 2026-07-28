/**
 * Scaffold IELTS Reading bundle folders (Cam 9–20 × Test 1–4).
 *
 *   node scripts/scaffold-ielts-reading-folders.mjs
 *   node scripts/scaffold-ielts-reading-folders.mjs --force-meta
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const IELTS_ROOT = join(ROOT, 'Tainguyen', 'IELTS')

const CAM_MIN = 9
const CAM_MAX = 20
const TEST_MIN = 1
const TEST_MAX = 4

const forceMeta = process.argv.includes('--force-meta')

function folderName(cam, test) {
  return `Reading IELTS_Test${test}_Cam${cam}`
}

function buildMeta(cam, test) {
  return {
    version: 1,
    cambridge: cam,
    test,
    title: `IELTS Reading — Cambridge ${cam} Test ${test}`,
    bandHint: `IELTS Academic · Cambridge ${cam} · Test ${test} · 3 passages · 40 câu`,
    examTrack: 'ielts',
    durationMinutes: 60,
    passages: [
      { partNumber: 1, template: 'r1-TBD', file: 'exam_passage1.json', note: 'Q1–13 · TFNG/MC/Headings/Gap' },
      { partNumber: 2, template: 'r2-TBD', file: 'exam_passage2.json', note: 'Q14–26 · Match paragraph/MC/YNNG' },
      { partNumber: 3, template: 'r3-TBD', file: 'exam_passage3.json', note: 'Q27–40 · TFNG/YNNG/MC' },
    ],
  }
}

const answerKeyTemplate = `1 
2 
3 
...
40 
`

const readme = `═══════════════════════════════════════════════════════════════
IELTS Reading — Cam 9–20 · Test 1–4 (48 đề)
═══════════════════════════════════════════════════════════════

Mỗi folder: Reading IELTS_Test{N}_Cam{X}/

── BẠN THẢ VÀO FOLDER (tối thiểu) ──

  *.pdf / *.txt          Đề Reading (OCR text) + Answer Key 1–40
  answer-key.txt         Paste đáp án (mẫu có sẵn)

── TÙY CHỌN (diagram / table trong passage) ──

  part1-p0.jpg …         Ảnh đoạn văn (imageFile trong JSON)
  diagram.jpg

── AGENT / CHATGPT TẠO SAU ──

  exam_passage1.json … exam_passage3.json
  exam.json              (pnpm ielts:reading:bundle)
  *.zip                  (import thử trong app)

── SỬA meta.json ──

  Đổi template từng passage (r1, r2-headings, r3-ynng…) khi biết dạng đề.
  Xem: HDSD/Import Reading IELTS.txt · HDSD/Prompt-IELTS-Reading-Cam9-Cam20.txt

── LỆNH SAU KHI CÓ JSON ──

  pnpm ielts:reading:validate "IELTS/Reading IELTS_Test{N}_Cam{X}"
  pnpm ielts:reading:bundle "IELTS/Reading IELTS_Test{N}_Cam{X}"

── PILOT ĐÃ CÓ SẴN (pnpm ielts:reading:export-pilots) ──

  Cam 10 Test 1 — đề đủ 40 câu (mock ielts-reading-01)
  Cam 11 Test 3 — Passage 1 Matching Headings
  Cam 10 Test 4 — Passage 2 YNNG

Tổng: 12 sách (Cam 9–20) × 4 test = 48 folder.
`

let created = 0
let metaWritten = 0
let metaSkipped = 0
let keyWritten = 0

for (let cam = CAM_MIN; cam <= CAM_MAX; cam++) {
  for (let test = TEST_MIN; test <= TEST_MAX; test++) {
    const name = folderName(cam, test)
    const dir = join(IELTS_ROOT, name)

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      created++
    }

    const metaPath = join(dir, 'meta.json')
    if (existsSync(metaPath) && !forceMeta) {
      metaSkipped++
    } else {
      writeFileSync(metaPath, `${JSON.stringify(buildMeta(cam, test), null, 2)}\n`, 'utf8')
      metaWritten++
    }

    const keyPath = join(dir, 'answer-key.txt')
    if (!existsSync(keyPath)) {
      writeFileSync(keyPath, answerKeyTemplate, 'utf8')
      keyWritten++
    }
  }
}

writeFileSync(join(IELTS_ROOT, 'README-IELTS-READING-FOLDERS.txt'), readme, 'utf8')

console.log(`✓ IELTS Reading scaffold: ${IELTS_ROOT}`)
console.log(`  Folders created: ${created}`)
console.log(`  meta.json written: ${metaWritten}`)
console.log(`  meta.json skipped (đã có): ${metaSkipped}`)
console.log(`  answer-key.txt written: ${keyWritten}`)
console.log(`  Tổng đề: ${(CAM_MAX - CAM_MIN + 1) * (TEST_MAX - TEST_MIN + 1)}`)
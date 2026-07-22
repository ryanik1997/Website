/**
 * Scaffold IELTS Listening bundle folders (Cam 9–20 × Test 1–4).
 *
 *   node scripts/scaffold-ielts-listening-folders.mjs
 *   node scripts/scaffold-ielts-listening-folders.mjs --force-meta
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
  return `Listening IELTS_Test${test}_Cam${cam}`
}

function buildMeta(cam, test) {
  return {
    version: 1,
    cambridge: cam,
    test,
    title: `IELTS Listening — Cambridge ${cam} Test ${test}`,
    bandHint: `IELTS · Cambridge ${cam} · Test ${test} · 4 parts · 40 câu`,
    examType: 'ielts',
    examMode: 'practice',
    durationMinutes: 30,
    audioFile: 'listening.mp3',
    parts: [
      { partNumber: 1, template: 'p1-TBD', file: 'exam_part1.json', note: 'Sửa template: p1-a2|a3|a4|a5 sau khi nhìn PDF' },
      { partNumber: 2, template: 'p2-TBD', file: 'exam_part2.json', note: 'Sửa template: p2-a6…a14' },
      { partNumber: 3, template: 'p3-TBD', file: 'exam_part3.json', note: 'Sửa template: p3-c1…c7' },
      { partNumber: 4, template: 'p4-TBD', file: 'exam_part4.json', note: 'Sửa template: p4-d1|d2|d3' },
    ],
  }
}

const readme = `═══════════════════════════════════════════════════════════════
IELTS Listening — Cam 9–20 · Test 1–4 (48 đề)
═══════════════════════════════════════════════════════════════

Mỗi folder: Listening IELTS_Test{N}_Cam{X}/

── BẠN THẢ VÀO FOLDER (tối thiểu) ──

  listening.mp3          Bắt buộc — audio ~30 phút
  *.pdf                  Đề Listening (tên tùy ý, vd. IELTS_Test2_Cam10.pdf)
  Answer Key.pdf         Hoặc answer-key.txt (paste đáp án 1–40)

── TÙY CHỌN (Part 2 có map/diagram) ──

  map.jpg
  diagram.jpg
  a3.jpg                 Ảnh form Part 1 (nếu PDF có hình)

── AGENT / CHATGPT TẠO SAU ──

  exam_part1.json … exam_part4.json
  exam.json              (pnpm ielts:bundle)
  *.zip                  (pack import thử trong app)

── SỬA meta.json ──

  Đổi template từng part (p1-a3, p2-a6, p3-c3, p4-d1…) khi biết dạng đề.
  Xem: HDSD/Import Listening IELTS.txt · Giaodien/a1–a5, Part2-Listening/

── LỆNH SAU KHI CÓ JSON ──

  pnpm ielts:validate "IELTS/Listening IELTS_Test{N}_Cam{X}"
  pnpm ielts:bundle "IELTS/Listening IELTS_Test{N}_Cam{X}"

── ĐỀ ĐÃ CÓ SẴN exam.json (chưa bundle) ──

  Cam9 Test1, Cam20 Test1, Cam9 Test2 (pilot đầy đủ) — giữ nguyên;
  có thể migrate sang exam_partN.json sau.

Tổng: 12 sách (Cam 9–20) × 4 test = 48 folder.
`

let created = 0
let metaWritten = 0
let metaSkipped = 0

for (let cam = CAM_MIN; cam <= CAM_MAX; cam++) {
  for (let test = TEST_MIN; test <= TEST_MAX; test++) {
    const name = folderName(cam, test)
    const dir = join(IELTS_ROOT, name)

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      created++
    }

    const metaPath = join(dir, 'meta.json')
    const isPilotMeta = cam === 9 && test === 2 && existsSync(metaPath)

    if (existsSync(metaPath) && (!forceMeta || isPilotMeta)) {
      metaSkipped++
      continue
    }

    writeFileSync(metaPath, `${JSON.stringify(buildMeta(cam, test), null, 2)}\n`, 'utf8')
    metaWritten++
  }
}

writeFileSync(join(IELTS_ROOT, 'README-IELTS-LISTENING-FOLDERS.txt'), readme, 'utf8')

console.log(`✓ IELTS scaffold: ${IELTS_ROOT}`)
console.log(`  Folders created: ${created}`)
console.log(`  meta.json written: ${metaWritten}`)
console.log(`  meta.json skipped (đã có): ${metaSkipped}`)
console.log(`  Tổng đề: ${(CAM_MAX - CAM_MIN + 1) * (TEST_MAX - TEST_MIN + 1)}`)
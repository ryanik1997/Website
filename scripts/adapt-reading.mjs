#!/usr/bin/env node
// Map reading_passages (TID/Supabase) → ReadingImportPayload của app.
//   node scripts/adapt-reading.mjs reading_passages.json
// Xuất: out-reading/reading-<base>.json  (vd cam-20-1) + in cảnh báo cần soi tay.

import { readFile, writeFile, mkdir } from 'node:fs/promises'

const inFile = process.argv[2] ?? 'reading_passages.json'
const OUT_DIR = 'out-reading'
const warnings = []

// ── youpass_id "cam-20-1-1" → base "cam-20-1", passage 1 ──
function splitId(youpassId) {
  const m = String(youpassId).match(/^(.*)-(\d+)$/)
  return m ? { base: m[1], part: Number(m[2]) } : { base: String(youpassId), part: 1 }
}

// ── Type nguồn (displayType | _blockConfig.type) → { group, q } của app ──
function mapType(src) {
  switch (String(src ?? '').toLowerCase().trim()) {
    case 'tfng':               return { group: 'tfng', q: 'true-false-not-given' }
    case 'ynng':               return { group: 'ynng', q: 'yes-no-not-given' }
    case 'matching-info':      return { group: 'matching-paragraph', q: 'matching-paragraph' }
    case 'matching-feature':   return { group: 'matching-features', q: 'matching-features' }
    case 'note-completion':    return { group: 'gap-fill', q: 'gap-fill' }
    case 'summary-completion': return { group: 'summary-completion', q: 'gap-fill' }
    case 'multiple-choice':    return { group: 'multiple-choice', q: 'multiple-choice' }
    case 'sentence-ending':    return { group: 'matching-features', q: 'matching-features', flag: 'sentence-ending' }
    default:                   return { group: 'multiple-choice', q: 'multiple-choice', flag: `type lạ: ${src}` }
  }
}

const LETTERS = 'ABCDEFGHIJKLMNOP'.split('')

// ── strip HTML → text giữ xuống dòng đoạn ──
function htmlToText(html) {
  if (!html) return ''
  return String(html)
    .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ').replace(/&/gi, '&')
    .replace(/</gi, '<').replace(/>/gi, '>').replace(/&#39;|&rsquo;/gi, "'")
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n')
    .trim()
}

function passageBlocks(html) {
  return htmlToText(html).split(/\n{2,}/).map(t => t.trim()).filter(Boolean).map(t => ({ text: t }))
}

// ── 1 câu hỏi nguồn → câu của app ──
function mapQuestion(q, qType, blk) {
  const number = Number(q.id) || Number(q.number) || 0
  const out = {
    number,
    type: qType,
    prompt: (q.text ?? q.question ?? '').trim(),
    answer: String(q.answer ?? '').trim(),
  }
  if (q.explanation) out.explanation = String(q.explanation).trim()

  // Options: MC lấy từ q.options (lọc "" thừa); YNNG tự bơm nếu thiếu
  if (qType === 'multiple-choice') {
    const opts = (q.options ?? blk?.options ?? []).filter(o => String(o).trim())
    out.options = opts.map((label, i) => ({ id: LETTERS[i], label: String(label).trim() }))
  } else if (qType === 'yes-no-not-given') {
    out.options = [{ id: 'yes', label: 'YES' }, { id: 'no', label: 'NO' }, { id: 'not-given', label: 'NOT GIVEN' }]
  }
  if (!out.prompt) out.prompt = qType === 'gap-fill' ? `Gap (${number})` : `Question ${number}`
  return out
}

// ── gom câu phẳng thành group theo groupId||blockId ──
function buildGroups(questions, partNumber, baseId) {
  const order = []
  const map = new Map()
  for (const q of questions) {
    const key = q.groupId ?? q.blockId ?? `solo-${q.id}`
    if (!map.has(key)) { map.set(key, []); order.push(key) }
    map.get(key).push(q)
  }

  return order.map(key => {
    const items = map.get(key)
    const head = items.find(x => x._blockConfig) ?? items[0]
    const blk = head._blockConfig ?? {}
    const t = mapType(head.displayType ?? blk.type ?? head.type)
    if (t.flag) warnings.push(`${baseId} P${partNumber} Q${blk.qStart ?? '?'}–${blk.qEnd ?? '?'}: ${t.flag} → cần soi tay`)

    const qStart = blk.qStart ?? items[0].id
    const qEnd = blk.qEnd ?? items[items.length - 1].id
    const group = {
      range: `Questions ${qStart}–${qEnd}`,
      instruction: htmlToText(head.groupHtml).replace(/^Questions?\s*\d+\s*[–-]\s*\d+\s*/i, '').trim()
        || 'Choose the correct answer.',
      type: t.group,
      questions: items.map(q => mapQuestion(q, t.q, blk)),
    }

    // matching-paragraph: bảng chữ A–G
    if (t.group === 'matching-paragraph') {
      group.paragraphLetters = (blk.sectionLabels ?? blk.paragraphs ?? []).filter(Boolean)
    }
    // matching-features: features từ featureOptions (Matt Elliot…)  hoặc endings (sentence-ending)
    if (t.group === 'matching-features') {
      const src = t.flag === 'sentence-ending'
        ? (blk.sentenceEndings ?? []).filter(Boolean)
        : (blk.featureOptions ?? []).filter(Boolean)
      group.features = src.map((name, i) => ({ id: LETTERS[i], name: String(name).trim() }))
    }
    // matching-headings (nếu có)
    if (t.group === 'matching-headings') {
      group.headings = (blk.headings ?? []).filter(Boolean).map((label, i) => ({ id: LETTERS[i], label }))
    }
    // note/summary completion: giữ noteContent + tiêu đề để render gap
    if (t.group === 'gap-fill' || t.group === 'summary-completion') {
      if (blk.noteTitle || head.blockTitle) group.notesTitle = (blk.noteTitle || head.blockTitle).trim()
      if (blk.noteContent) group.note = blk.noteContent
      warnings.push(`${baseId} P${partNumber} Q${qStart}–${qEnd}: ${t.group} (bố cục note/bảng) → nên xem lại layout`)
    }
    return group
  })
}

async function main() {
  const rows = JSON.parse(await readFile(inFile, 'utf8'))
  if (!Array.isArray(rows)) throw new Error('Input phải là mảng.')

  const byExam = new Map()
  for (const row of rows) {
    const { base, part } = splitId(row.youpass_id)
    if (!byExam.has(base)) byExam.set(base, [])
    byExam.get(base).push({ row, part })
  }

  await mkdir(OUT_DIR, { recursive: true })
  let count = 0

  for (const [base, entries] of byExam) {
    const parts = entries
      .sort((a, b) => a.part - b.part)
      .map(({ row, part }) => ({
        partNumber: part,
        rangeLabel: '',
        passageTitle: (row.title ?? `Passage ${part}`).trim(),
        passage: passageBlocks(row.content_html),
        questionGroups: buildGroups(row.questions ?? [], part, base),
      }))

    const payload = {
      version: 1,
      title: base.toUpperCase().replace(/-/g, ' '),
      durationMinutes: 60,
      examTrack: 'ielts',
      parts,
    }
    const out = `${OUT_DIR}/reading-${base}.json`
    await writeFile(out, JSON.stringify(payload, null, 2), 'utf8')
    const q = parts.reduce((s, p) => s + p.questionGroups.reduce((a, g) => a + g.questions.length, 0), 0)
    console.log(`  ${out} · ${parts.length} passage · ${q} câu`)
    count++
  }

  console.log(`\nXong: ${count} đề → ${OUT_DIR}/`)
  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} chỗ cần soi tay:`)
    for (const w of warnings) console.log('  - ' + w)
  }
}

main().catch(e => { console.error('Lỗi:', e.message); process.exit(1) })
// mapType: đổi nhánh sentence-ending
case 'sentence-ending': return { group: 'sentence-ending', q: 'sentence-ending' }

// trong buildGroups, thêm nhánh gán endings + stems (đặt cạnh khối matching-features):
if (t.group === 'sentence-ending') {
  const endings = (blk.sentenceEndings ?? []).filter(Boolean)
  group.features = endings.map((name, i) => ({ id: LETTERS[i], name: String(name).trim() }))
  const stems = (blk.sentenceStems ?? []).filter(Boolean)
  group.questions.forEach((q, i) => {
    if (stems[i]) q.prompt = stems[i].trim()   // câu dẫn thật, không phải "Question N"
  })
}
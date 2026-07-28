#!/usr/bin/env node
// Kéo toàn bộ 1 bảng Supabase (PostgREST) qua phân trang, lưu ra JSON.
//
// Chạy:
//   export TID_BASE="https://wssvofzcejnglukkboov.supabase.co/rest/v1"
//   export TID_APIKEY="<anon key trong tab Headers>"
//   export TID_TOKEN="<Bearer token>"          # thường trùng anon key
//   node scripts/pull-reading.mjs reading_passages
//
// Tham số 1 = tên bảng (mặc định: reading_passages)

import { writeFile } from 'node:fs/promises'

const BASE = process.env.TID_BASE
const APIKEY = process.env.TID_APIKEY
const TOKEN = process.env.TID_TOKEN ?? APIKEY

if (!BASE || !APIKEY) {
  console.error('Thiếu env TID_BASE hoặc TID_APIKEY. Xem hướng dẫn đầu file.')
  process.exit(1)
}

const table = process.argv[2] ?? 'reading_passages'
const PAGE = 1000          // số dòng mỗi lần kéo
const SELECT = '*'         // đổi sang cột cụ thể nếu payload quá to
const OUT = `${table}.json`

// PostgREST: Range header + Prefer: count=exact để biết tổng số dòng.
async function fetchPage(from, to) {
  const url = `${BASE}/${table}?select=${encodeURIComponent(SELECT)}`
  const res = await fetch(url, {
    headers: {
      apikey: APIKEY,
      Authorization: `Bearer ${TOKEN}`,
      'Accept-Profile': 'public',
      Range: `${from}-${to}`,
      'Range-Unit': 'items',
      Prefer: 'count=exact',
    },
  })

  if (!res.ok && res.status !== 206) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status} tại ${from}-${to}: ${body.slice(0, 300)}`)
  }

  // Content-Range: "0-999/4213" → phần sau dấu / là tổng số dòng
  const contentRange = res.headers.get('content-range') ?? ''
  const total = Number(contentRange.split('/')[1]) || null
  const rows = await res.json()
  return { rows, total }
}

async function main() {
  const all = []
  let from = 0
  let total = null

  console.log(`Kéo bảng "${table}"...`)

  for (;;) {
    const to = from + PAGE - 1
    const { rows, total: t } = await fetchPage(from, to)
    if (t != null) total = t

    all.push(...rows)
    console.log(`  ${all.length}${total ? '/' + total : ''} dòng`)

    // Dừng: trang trả về ít hơn PAGE, hoặc đã đủ tổng
    if (rows.length < PAGE) break
    if (total != null && all.length >= total) break

    from += PAGE
    await new Promise(r => setTimeout(r, 250)) // nhẹ tay, tránh rate-limit
  }

  await writeFile(OUT, JSON.stringify(all, null, 2), 'utf8')
  console.log(`Xong: ${all.length} dòng → ${OUT}`)
}

main().catch(err => {
  console.error('Lỗi:', err.message)
  process.exit(1)
})
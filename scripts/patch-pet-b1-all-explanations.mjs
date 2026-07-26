#!/usr/bin/env node

/**
 * patch-pet-b1-all-explanations.mjs
 *
 * Sinh explanation cho tất cả các Part còn thiếu (Part 2-5) cho 5 đề PET B1 Reading.
 * Part 1 đã có từ nguồn, Part 6 đã xử lý riêng.
 *
 * Usage: node scripts/patch-pet-b1-all-explanations.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { unzipSync, zipSync, strToU8, strFromU8 } from '../apps/web/node_modules/fflate/esm/browser.js'

const BUNDLES_DIR = 'pet-reading-bundles'
const TESTS = ['test14', 'test15', 'test16', 'test17', 'test18']

/* ── Context extraction ── */

function findGapContext(text, gapNum) {
  if (!text) return null
  const pattern = new RegExp(`\\(${gapNum}\\)\\s*_{6,}`)
  const match = pattern.exec(text)
  if (!match) return null
  const idx = match.index
  const before = text.slice(Math.max(0, idx - 60), idx).trim()
  const after = text.slice(idx + match[0].length, idx + match[0].length + 60).trim()
  return { before, after, snippet: before + ' ___ ' + after }
}

function joinAllText(passage) {
  return passage.map(b => b.text || '').filter(Boolean).join(' ')
}

/* ── Explanation generators ── */

function genPart2Explanation(q, answerLabel, passage) {
  const descBlock = passage.find(b => b.label && b.label.toLowerCase() === answerLabel.toLowerCase())
  const desc = descBlock ? descBlock.text : ''
  const shortDesc = desc ? (desc.length > 120 ? desc.slice(0, 120) + '...' : desc) : ''
  const prompt = q.prompt || ''
  const personRef = prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt

  if (answerLabel && shortDesc) {
    return `Đáp án ${answerLabel}. Người "${personRef}" phù hợp với mô tả: "${shortDesc}"`
  }
  return `Đáp án ${answerLabel}.`
}

function genPart3Explanation(q, answerLabel, options, allText) {
  const correctOption = options.find(o => o.id.toLowerCase() === answerLabel.toLowerCase())
  const label = correctOption?.label || answerLabel
  const shortLabel = label.length > 120 ? label.slice(0, 120) + '...' : label
  const prompt = q.prompt || ''
  const passageRef = allText.length > 150 ? allText.slice(0, 150) + '...' : allText

  return `Đáp án ${answerLabel}. "${shortLabel}" — Câu hỏi: "${prompt}" — Dựa vào bài đọc: "${passageRef}"`
}

function genPart4Explanation(q, answerLabel, features, allText) {
  const feature = features.find(f => f.id.toLowerCase() === answerLabel.toLowerCase())
  const featureText = feature ? feature.name : ''
  const gapNum = q.number
  const ctx = findGapContext(allText, gapNum)
  const shortFeature = featureText.length > 100 ? featureText.slice(0, 100) + '...' : featureText
  const context = ctx ? `Ngữ cảnh: "${ctx.snippet}"` : ''

  return `Đáp án ${answerLabel}. "${shortFeature}" — ${context}`
}

function genPart5Explanation(q, answerLabel, options, allText) {
  const correctOption = options.find(o => o.id.toLowerCase() === answerLabel.toLowerCase())
  const label = correctOption?.label || answerLabel
  const gapNum = q.number
  const ctx = findGapContext(allText, gapNum)

  if (ctx) {
    return `Đáp án ${answerLabel}. "${label}" — "${ctx.snippet}"`
  }
  return `Đáp án ${answerLabel}. "${label}"`
}

/* ── Main ── */

function main() {
  let totalPatched = 0

  for (const testLabel of TESTS) {
    const zipPath = path.join(BUNDLES_DIR, `${testLabel}-import.zip`)
    if (!fs.existsSync(zipPath)) { console.error(`Missing: ${zipPath}`); continue }

    const raw = fs.readFileSync(zipPath)
    const entries = unzipSync(new Uint8Array(raw))

    const bodyKey = Object.keys(entries).find(k => k.endsWith('.json') && !k.includes('answers') && !k.includes('meta'))
    const ansKey = Object.keys(entries).find(k => k.endsWith('.answers.json'))
    if (!bodyKey || !ansKey) { console.error(`Missing body/answers in ${testLabel}`); continue }

    const body = JSON.parse(strFromU8(entries[bodyKey]))
    const answers = JSON.parse(strFromU8(entries[ansKey]))

    let patched = 0

    for (const part of body.parts) {
      const pn = part.partNumber
      if (pn === 1 || pn === 6) continue  // Part 1 & 6 đã có explanation

      const allText = joinAllText(part.passage)

      for (const group of part.questionGroups) {
        for (const q of group.questions) {
          const entry = answers.answers[q.id]
          if (!entry) continue
          // Chỉ patch nếu explanation trống hoặc chứa lỗi "undefined" từ lần chạy trước
          if (entry.explanation && entry.explanation.trim() && !entry.explanation.includes('undefined')) continue

          const answerLabel = entry.answer || ''

          let expl = ''
          if (pn === 2) {
            expl = genPart2Explanation(q, answerLabel, part.passage)
          } else if (pn === 3) {
            expl = genPart3Explanation(q, answerLabel, q.options || [], allText)
          } else if (pn === 4) {
            expl = genPart4Explanation(q, answerLabel, group.features || [], allText)
          } else if (pn === 5) {
            expl = genPart5Explanation(q, answerLabel, q.options || [], allText)
          }

          if (expl) {
            entry.explanation = expl
            patched++
            totalPatched++
          }
        }
      }
    }

    if (patched > 0) {
      entries[ansKey] = strToU8(JSON.stringify(answers, null, 2))
      const newZip = zipSync(entries, { level: 9 })
      fs.writeFileSync(zipPath, Buffer.from(newZip))
      console.log(`${testLabel}: patched ${patched} explanations`)
    } else {
      console.log(`${testLabel}: nothing to patch`)
    }
  }

  console.log(`\nDone: ${totalPatched} explanations generated.`)
}
main()

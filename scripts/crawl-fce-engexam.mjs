#!/usr/bin/env node
/**
 * Crawl FCE B2 Reading and Use of English practice tests from engexam.info
 *
 * Usage:
 *   node scripts/crawl-fce-engexam.mjs                    # crawl tests 1-26
 *   node scripts/crawl-fce-engexam.mjs --test 13          # crawl only test 13
 *   node scripts/crawl-fce-engexam.mjs --quick            # crawl only 3 tests (1, 13, 26)
 *   node scripts/crawl-fce-engexam.mjs --delay 300        # custom delay ms
 *   node scripts/crawl-fce-engexam.mjs --test 4 --part 5   # refresh one source part
 *   node scripts/crawl-fce-engexam.mjs --materialize-existing # write cached full-page artifacts
 *
 * Output: D:\App-English-Ryan\Tainguyen\fce-reading-test{N}\exam\exam.json
 */

import * as https from 'node:https'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { createHash } from 'node:crypto'
import { resolveTainguyenPath } from './tainguyen-path.mjs'

const BASE = 'https://engexam.info'
const ROOT = '/fce-reading-and-use-of-english-practice-tests/fce-reading-and-use-of-english-practice-test-'
const OUT_DIR = path.join(resolveTainguyenPath(), 'Import Cambridge', 'FCE_B2', 'Reading')

// ── Parse CLI args ──
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const quickMode = args.includes('--quick')
const delayIdx = args.indexOf('--delay')
const delayMs = delayIdx !== -1 ? parseInt(args[delayIdx + 1], 10) : 1200
const singleTestIdx = args.indexOf('--test')
const singleTest = singleTestIdx !== -1 ? parseInt(args[singleTestIdx + 1], 10) : null
const singlePageIdx = args.indexOf('--page')
const singlePartIdx = args.indexOf('--part')
const pagesIdx = args.indexOf('--pages')
const requestedPages = singlePageIdx !== -1
  ? [parseInt(args[singlePageIdx + 1], 10)]
  : singlePartIdx !== -1
    ? [parseInt(args[singlePartIdx + 1], 10)]
    : pagesIdx !== -1
      ? args[pagesIdx + 1].split(',').map(value => parseInt(value, 10))
      : null
const backup = args.includes('--backup')
const materializeExisting = args.includes('--materialize-existing')

if (requestedPages && !singleTest) {
  throw new Error('--page/--part/--pages requires --test')
}
if (requestedPages?.some(page => !Number.isInteger(page) || page < 1 || page > 8)) {
  throw new Error(`Invalid page list: ${requestedPages.join(',')}`)
}

let tests
if (singleTest) tests = [singleTest]
else if (quickMode) tests = [1, 13, 26]
else tests = Array.from({ length: 26 }, (_, i) => i + 1)

// ── HTTP fetch ──
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 30000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirected = new URL(res.headers.location, url).toString()
        res.resume()
        resolve(fetch(redirected))
        return
      }
      if (res.statusCode !== 200) {
        res.resume()
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (data.length < 1000) {
          reject(new Error(`Response too short (${data.length} bytes) for ${url}`))
          return
        }
        resolve(data)
      })
    })
      .on('error', reject)
      .on('timeout', function () { this.destroy(); reject(new Error('timeout')) })
  })
}

// ── HTML extraction helpers ──
function extractBetween(html, startTag, endTag) {
  const s = html.indexOf(startTag)
  if (s === -1) return ''
  const from = s + startTag.length
  const e = html.indexOf(endTag, from)
  return e === -1 ? html.slice(from) : html.slice(from, e)
}

function extractEntryContent(html) {
  const marker = html.search(/class=["'][^"']*\bentry-content\b[^"']*["']/i)
  if (marker === -1) return ''
  const openEnd = html.indexOf('>', marker)
  if (openEnd === -1) return ''
  const from = openEnd + 1
  const boundaryPatterns = [
    /<div[^>]*class=["'][^"']*\bpage-links\b/i,
    /<footer\b/i,
    /<div[^>]*class=["'][^"']*\bentry-footer\b/i,
  ]
  let end = html.length
  for (const pattern of boundaryPatterns) {
    const match = pattern.exec(html.slice(from))
    if (match && from + match.index < end) end = from + match.index
  }
  return html.slice(from, end)
}

function extractHeading(html, level = 2) {
  const match = String(html ?? '').match(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'i'))
  return match ? stripAllTags(match[1]) : ''
}

function extractExample(html) {
  const paragraphs = String(html ?? '').match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) ?? []
  const paragraph = paragraphs.find(value => /<strong\b[^>]*>\s*Example\s*:/i.test(value))
  return paragraph ? stripAllTags(paragraph).replace(/^Example\s*:?\s*/i, '').trim() : ''
}

function passageFromHeadingToScore(html) {
  const heading = String(html ?? '').match(/<h2\b[^>]*>[\s\S]*?<\/h2>/i)
  const firstWidget = String(html ?? '').search(/<(?:select|input)\b[^>]*id=["']q\d+/i)
  const start = heading?.index ?? (firstWidget === -1 ? -1 : String(html).lastIndexOf('<p', firstWidget))
  if (start == null || start < 0) return ''
  const scoreRelative = html.slice(start).search(/class=["']score-container["']/i)
  const end = scoreRelative === -1 ? html.length : start + scoreRelative
  return html.slice(start, end).trim()
}

function stripAllTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#?[a-z0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

// ── Parse page ──
function parsePage(html, testNumber, pageNumber, sourceUrl) {
  const entryContent = extractEntryContent(html)
  if (!entryContent || entryContent.length < 100) return null

  const result = {
    testNumber,
    pageNumber,
    sourceUrl,
    fetchedAt: new Date().toISOString(),
    origin: 'source',
    isAnswerPage: entryContent.includes('Answer Keys'),
    partNumber: null,
    partTitle: null,
    instructions: null,
    example: null,
    passageTitle: null,
    passageTextHtml: '',
    questions: [],
    entryContentHtml: entryContent,
    fullHtml: html,
    rawHtmlSample: entryContent.slice(0, 2000),
  }

  // ── Detect answer page ──
  if (result.isAnswerPage) {
    result.answers = parseAnswerKeys(entryContent)
    return result
  }

  // ── Part number ──
  const h1Match = entryContent.match(/<h1>\s*Part\s+(\d+)\s*<\/h1>/i)
  if (h1Match) result.partNumber = parseInt(h1Match[1], 10)

  // ── Instructions and source example ──
  const instMatch = entryContent.match(/<em\b[^>]*>([\s\S]*?)<\/em>/i)
  if (instMatch) result.instructions = stripAllTags(instMatch[1])
  result.example = extractExample(entryContent) || null

  // ── Passage title — first h2, including h2 elements with attributes ──
  result.passageTitle = extractHeading(entryContent, 2) || null

  // ── Extract questions based on part type ──
  switch (result.partNumber) {
    case 1:
      parsePart1(entryContent, result)
      break
    case 2:
    case 3:
      parsePart2or3(entryContent, result)
      break
    case 4:
      parsePart4(entryContent, result)
      break
    case 5:
      parsePart5(entryContent, result)
      break
    case 6:
      parsePart6(entryContent, result)
      break
    case 7:
      parsePart7(entryContent, result)
      break
  }

  result.questions.sort((a, b) => a.number - b.number)
  return result
}

// ── Part 1: Multiple-choice cloze (<select>) ──
function parsePart1(html, result) {
  result.passageTextHtml = passageFromHeadingToScore(html)

  // Extract <select> questions
  const selectRe = /<select[^>]*id="q(\d+)"[^>]*>([\s\S]*?)<\/select>/gi
  let m
  while ((m = selectRe.exec(html)) !== null) {
    const qNum = parseInt(m[1], 10)
    const options = []
    const optRe = /<option[^>]*value="(\d+)"[^>]*>([\s\S]*?)<\/option>/gi
    let om
    while ((om = optRe.exec(m[2])) !== null) {
      const val = parseInt(om[1], 10)
      if (val > 0) {
        options.push({ value: val, label: stripAllTags(om[2]) })
      }
    }
    result.questions.push({ number: qNum, type: 'multiple-choice-cloze', format: 'select', options })
  }
}

// ── Part 2 (Open cloze) & Part 3 (Word formation): <input> ──
function parsePart2or3(html, result) {
  result.passageTextHtml = passageFromHeadingToScore(html)

  const inputRe = /<input[^>]*id="q(\d+)"[^>]*>/gi
  let m
  while ((m = inputRe.exec(html)) !== null) {
    const qNum = parseInt(m[1], 10)
    if (!isNaN(qNum)) {
      const sizeMatch = m[0].match(/size="(\d+)"/)
      result.questions.push({
        number: qNum,
        type: result.partNumber === 2 ? 'open-cloze' : 'word-formation',
        format: 'input',
        size: sizeMatch ? parseInt(sizeMatch[1], 10) : 10,
      })
    }
  }
}

// ── Part 4: Key word transformations ──
function parsePart4(html, result) {
  // Find all input elements for questions 25-30
  const inputRe = /<input[^>]*id="q(\d+)"[^>]*>/gi
  let m
  while ((m = inputRe.exec(html)) !== null) {
    const qNum = parseInt(m[1], 10)
    if (isNaN(qNum) || qNum < 25 || qNum > 30) continue

    // Find the question block before this input
    // Look backwards for the question number (just digits at start of line)
    const beforeInput = html.substring(0, m.index)
    const lastP = beforeInput.lastIndexOf('<p')
    const block = lastP !== -1 ? beforeInput.substring(lastP) : beforeInput

    // Find keyword: <strong>WORD</strong> (short, all-caps word)
    const kwMatch = block.match(/<strong>\s*([A-Z]{2,})\s*<\/strong>/)
    const keyword = kwMatch ? kwMatch[1].trim() : ''

    // Find question text (before the keyword)
    // Remove <strong>keyword</strong> and extract text
    let promptHtml = block
    if (kwMatch) promptHtml = promptHtml.replace(kwMatch[0], '')
    const prompt = stripAllTags(promptHtml).replace(/^\d+\s*/, '').trim()

    result.questions.push({
      number: qNum,
      type: 'key-word-transformation',
      format: 'input',
      keyword,
      prompt,
    })
  }
}

// ── Part 5: Multiple choice (radio) ──
function extractPart5Passage(html) {
  const questionStart = html.search(/<p\b[^>]*id=["']d31["']/i)
  if (questionStart === -1) return ''

  const beforeQuestions = html.slice(0, questionStart)
  const heading = beforeQuestions.match(/<h2\b[^>]*>[\s\S]*?<\/h2>/i)
  if (heading?.index != null) {
    return beforeQuestions.slice(heading.index).trim()
  }

  const partHeading = beforeQuestions.match(/<h1\b[^>]*>\s*Part\s+5\s*<\/h1>/i)
  if (partHeading?.index == null) return ''

  let passage = beforeQuestions.slice(partHeading.index + partHeading[0].length)
  passage = passage.replace(
    /^\s*<p\b[^>]*>\s*<em\b[^>]*>[\s\S]*?<\/em>\s*<\/p>/i,
    '',
  )
  return passage.trim()
}

function parsePart5(html, result) {
  result.passageTextHtml = extractPart5Passage(html)

  // Find all question ids: d31, d32, etc.
  const idRe = /<p[^>]*id="d(\d+)"[^>]*>/gi
  const questionStarts = []
  let m
  while ((m = idRe.exec(html)) !== null) {
    questionStarts.push({ num: parseInt(m[1], 10), idx: m.index })
  }

  for (let i = 0; i < questionStarts.length; i++) {
    const { num: qNum, idx: start } = questionStarts[i]
    const end = i < questionStarts.length - 1 ? questionStarts[i + 1].idx : html.length
    const block = html.slice(start, end)

    // Find closing </p> of this block
    const closeP = block.indexOf('</p>')
    const content = closeP !== -1 ? block.slice(0, closeP) : block

    // Extract options: <input ... value="A" /> <strong>A</strong> text
    const options = []
    const optRe = /<input[^>]*value="([A-D])"[^>]*>(?:\s*<strong>\1<\/strong>\s*)?([\s\S]*?)(?=(?:<input|<br\s*\/?>|$))/gi
    let om
    while ((om = optRe.exec(content)) !== null) {
      const text = stripAllTags(om[2]).trim()
      if (text) {
        options.push({ letter: om[1], text })
      }
    }

    // Question text (before first <input>)
    const beforeInput = content.split('<input')[0] || ''
    const qText = stripAllTags(beforeInput).replace(/^\d+\s*/, '').trim()

    result.questions.push({
      number: qNum,
      type: 'multiple-choice',
      format: 'radio',
      questionText: qText,
      options,
    })
  }
}

// ── Part 6: Gapped text (<select> with A-G) ──
function parsePart6(html, result) {
  result.passageTextHtml = passageFromHeadingToScore(html)

  const selectRe = /<select[^>]*id="q(\d+)"[^>]*>([\s\S]*?)<\/select>/gi
  let m
  while ((m = selectRe.exec(html)) !== null) {
    const qNum = parseInt(m[1], 10)
    if (isNaN(qNum)) continue
    const options = []
    const optRe = /<option[^>]*value="(\d+)"[^>]*>([\s\S]*?)<\/option>/gi
    let om
    while ((om = optRe.exec(m[2])) !== null) {
      const val = parseInt(om[1], 10)
      if (val > 0) {
        options.push({ value: om[2].trim(), label: om[2].trim() })
      }
    }
    result.questions.push({ number: qNum, type: 'gapped-text', format: 'select', options })
  }
}

// ── Part 7: Multiple matching (<select> with A-D) ──
function parsePart7(html, result) {
  const heading = html.match(/<h2\b[^>]*>[\s\S]*?<\/h2>/i)
  const scoreStart = heading?.index != null
    ? html.slice(heading.index).search(/<div[^>]*id=["']scoreFinal["']/i)
    : -1
  if (heading?.index != null) {
    const end = scoreStart === -1 ? html.length : heading.index + scoreStart
    result.passageTextHtml = html.slice(heading.index, end).trim()
  }

  const selectRe = /<select[^>]*id="q(\d+)"[^>]*>([\s\S]*?)<\/select>/gi
  let m
  while ((m = selectRe.exec(html)) !== null) {
    const qNum = parseInt(m[1], 10)
    if (isNaN(qNum)) continue
    const options = []
    const optRe = /<option[^>]*value="(\d+)"[^>]*>([\s\S]*?)<\/option>/gi
    let om
    while ((om = optRe.exec(m[2])) !== null) {
      const val = parseInt(om[1], 10)
      if (val > 0) options.push({ value: om[2].trim(), label: om[2].trim() })
    }
    const paragraphStart = html.lastIndexOf('<p', m.index)
    const beforeSelect = paragraphStart === -1 ? html.slice(0, m.index) : html.slice(paragraphStart, m.index)
    const afterPreviousBreak = beforeSelect.split(/<br\s*\/?>/i).pop() ?? beforeSelect
    const questionText = stripAllTags(afterPreviousBreak)
      .replace(new RegExp(`^${qNum}\\.?\\s*`), '')
      .trim()
    result.questions.push({
      number: qNum,
      type: 'multiple-matching',
      format: 'select',
      questionText,
      options,
    })
  }
}

// ── Helpers for answer key parsing ──
function findPart(qNum, starts, counts) {
  for (let p = 1; p <= 7; p++) {
    const end = starts[p] + counts[p] - 1
    if (qNum >= starts[p] && qNum <= end) return p
  }
  return null
}

function extractInlineItem(qNum, rawContent, answers) {
  if (isNaN(qNum)) return
  const remainder = rawContent.trim()
  const letterMatch = remainder.match(/^([A-Z])(?:\s*[.\u2013]\s*|\s+)/)
  let answer, explanation
  if (letterMatch) {
    answer = letterMatch[1]
    explanation = stripAllTags(remainder.slice(letterMatch[0].length))
  } else {
    const dotIdx = remainder.indexOf('. ')
    if (dotIdx > 0 && dotIdx < 100) {
      answer = remainder.slice(0, dotIdx).replace(/[.\u2013]/g, '').trim()
      explanation = stripAllTags(remainder.slice(dotIdx + 1))
    } else {
      answer = remainder.replace(/[.].*/s, '').trim()
      explanation = stripAllTags(remainder)
    }
  }
  const part = findPart(qNum, { 1: 1, 2: 9, 3: 17, 4: 25, 5: 31, 6: 37, 7: 43 }, [0, 8, 8, 8, 6, 6, 6, 10])
  if (part) {
    if (!answers[part]) answers[part] = []
    answers[part].push({ questionNumber: qNum, answer, explanation })
  }
}

// ── Parse <li> items using balanced-counter (handles headings inside <ol>) ──
function parseLiItems(html) {
  const items = []
  let pos = 0

  while (pos < html.length) {
    // Find next <li
    const liStart = html.indexOf('<li', pos)
    if (liStart === -1) break

    // Skip past the opening > of <li...>
    const tagEnd = html.indexOf('>', liStart)
    if (tagEnd === -1) break

    // Walk forward with balanced counter, but detect <h2>Part N</h2> boundaries
    // that split <li> items (engexam puts Part headings INSIDE <li> elements)
    let depth = 1
    let scanPos = tagEnd + 1
    let headingBreak = false

    while (scanPos < html.length && depth > 0) {
      const nextOpen = html.indexOf('<li', scanPos)
      const nextClose = html.indexOf('</li>', scanPos)

      if (nextClose === -1) { scanPos = html.length; break }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Check if a <h2>Part heading lies between scanPos and nextOpen.
        // If so, the next <li> is NOT nested — it starts a new top-level item.
        // This handles engexam's broken HTML where <h2>Part N</h2> is inside <li>.
        const heading = html.indexOf('<h2>Part', scanPos)
        if (heading !== -1 && heading < nextOpen) {
          depth--
          scanPos = heading
          headingBreak = true
          break
        }
        depth++
        scanPos = nextOpen + 3 // skip '<li'
      } else {
        depth--
        scanPos = nextClose + 5 // skip '</li>'
      }
    }

    // If headingBreak, extract content UP TO the heading (the heading + everything
    // after belongs to the next Part and will be picked up by the outer loop).
    const endOffset = headingBreak ? 0 : 5
    const liContent = html.substring(tagEnd + 1, scanPos - endOffset)
    pos = scanPos

    // Extract answer from <strong> inside <li>
    const strongMatch = liContent.match(/<strong>\s*([\s\S]*?)<\/strong>/)
    if (!strongMatch) {
      const rawText = stripAllTags(liContent)
      if (rawText && rawText.length > 0) {
        items.push({ answer: rawText, explanation: '' })
      }
      continue
    }

    const strongContent = strongMatch[1].trim()

    // Try numbered letter format: "9. D – text"
    const numberedLetter = strongContent.match(/^(\d+)\s*[\.\u2013]\s*([A-Z]+)\s*[\.\u2013]?\s*/)
    if (numberedLetter && numberedLetter[2].length <= 2) {
      items.push({
        questionNumber: parseInt(numberedLetter[1], 10),
        answer: numberedLetter[2],
        explanation: stripAllTags(strongContent.slice(numberedLetter[0].length)),
      })
      continue
    }

    const letterMatch = strongContent.match(/^([A-Z]+)\s*[.\u2013]?\s*/)
    if (letterMatch && letterMatch[1].length <= 2) {
      items.push({
        questionNumber: null,
        answer: letterMatch[1],
        explanation: stripAllTags(strongContent.slice(letterMatch[0].length)),
      })
    } else {
      const dotIdx = strongContent.indexOf('. ')
      if (dotIdx > 0 && dotIdx < 100) {
        items.push({
          questionNumber: null,
          answer: strongContent.slice(0, dotIdx).replace(/[.\u2013]/g, '').trim(),
          explanation: stripAllTags(strongContent.slice(dotIdx + 1)),
        })
      } else {
        items.push({
          questionNumber: null,
          answer: strongContent.replace(/[.].*/s, '').trim(),
          explanation: stripAllTags(strongContent),
        })
      }
    }
  }

  return items
}

// ── Parse Answer Keys (page 8) ──
function parseAnswerKeys(html) {
  // Part question counts: P1=8, P2=8, P3=8, P4=6, P5=6, P6=6, P7=10
  const partCounts = [0, 8, 8, 8, 6, 6, 6, 10]
  const partStartNumbers = { 1: 1, 2: 9, 3: 17, 4: 25, 5: 31, 6: 37, 7: 43 }

  // Get the answer key section (before Vocabulary h2)
  const vocabPos = html.indexOf('<h2>Vocabulary</h2>')
  const answerSection = vocabPos !== -1 ? html.substring(0, vocabPos) : html

  // Detect format: multiple formats across different test numbers
  const hasOrderedList = /<ol[^>]*>/i.test(answerSection)
  const hasNumberedStrong = /<strong>\s*\d+[\.\s]/.test(answerSection)
  const hasNumberedBold = /<b>\s*\d+[\.\s]/.test(answerSection)
  // ── Format 1: <p><strong>1 D – text</strong>  (test 1 style — no <li>, numbers in <strong>) ──
  // ── Format 3: <p><b>1 B – text</b>  (test 13+ style — uses <b> instead of <strong>, <h2> instead of <h3>) ──
  // ── Format 4: <h5>Part N</h5> <p><strong>1. C – text</strong>  (test 3 style — period after number) ──
  // Both share the same format: <strong/b>N LETTER – text</strong/b>
  const inlineAnswerFormat = (hasNumberedStrong || hasNumberedBold) && !hasOrderedList
  if (inlineAnswerFormat) {
    const answers = {}
    // Match both <strong> and <b> tags. Handle <br /> inside the opening tag.
    // Allow optional period after the number: "1 C" or "1. C"
    const ansRe = /<(?:strong|b)>(?:\s|<br\s*\/?>)*(\d+)[\.\s]+([\s\S]*?)<\/(?:strong|b)>/gi
    let am
    while ((am = ansRe.exec(answerSection)) !== null) {
      const qNum = parseInt(am[1], 10)
      if (isNaN(qNum)) continue
      extractInlineItem(qNum, am[2].trim(), answers)
    }

    // Second pass: catch "N <strong>Letter.</strong>" format where number is OUTSIDE the tag
    // (e.g., "41 <strong>E.</strong> explanation" in test 01 Part 6)
    const outsideRe = /(?:^|[^>])(\d+)\s*<strong>([A-Z]+)\s*[\.\u2013]?\s*([\s\S]*?)<\/strong>/gi
    while ((am = outsideRe.exec(answerSection)) !== null) {
      const qNum = parseInt(am[1], 10)
      if (isNaN(qNum)) continue
      // Skip if this question was already captured in the first pass
      const targetPart = partStartNumbers[1] <= qNum && qNum <= 52 ? findPart(qNum, partStartNumbers, partCounts) : null
      if (targetPart && answers[targetPart]?.some(i => i.questionNumber === qNum)) continue
      
      const answer = am[2]
      const explanation = stripAllTags(am[3])
      const part = findPart(qNum, partStartNumbers, partCounts)
      if (part) {
        if (!answers[part]) answers[part] = []
        answers[part].push({ questionNumber: qNum, answer, explanation })
      }
    }

    // Sort answers by question number for each part
    for (let p = 1; p <= 7; p++) {
      if (answers[p]) answers[p].sort((a, b) => a.questionNumber - b.questionNumber)
    }
    return answers
  }

  // ── Format 2: <ol><li><strong>answer</strong> (test 2+ style) ──
  // Collect ALL <li> items with a balanced-counter approach that handles
  // <h3>Part N</h3> headings INSIDE the single <ol> (which can split <li></li> across boundaries)
  const allItems = parseLiItems(answerSection)

  // Check if items have embedded question numbers (Format 1 variant with <li>) or not
  if (allItems.length > 0 && allItems[0].questionNumber !== null) {
    // Has question numbers — group by Part
    const answers = {}
    for (const item of allItems) {
      for (let p = 1; p <= 7; p++) {
        const start = partStartNumbers[p]
        const end = start + partCounts[p] - 1
        if (item.questionNumber >= start && item.questionNumber <= end) {
          if (!answers[p]) answers[p] = []
          answers[p].push(item)
          break
        }
      }
    }
    return answers
  }

  // Format 2 standard: no question numbers — infer from position by Part counts
  const answers = {}
  let idx = 0
  for (let p = 1; p <= 7; p++) {
    const count = partCounts[p]
    const partItems = allItems.slice(idx, idx + count)
    if (partItems.length > 0) {
      const startNum = partStartNumbers[p]
      partItems.forEach((item, i) => {
        item.questionNumber = startNum + i
      })
      answers[p] = partItems
    }
    idx += count
  }

  return answers
}

// ── Crawl one test ──
async function writeJsonAtomic(filePath, data) {
  const tempPath = `${filePath}.tmp-${process.pid}`
  fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  JSON.parse(fs.readFileSync(tempPath, 'utf8'))
  fs.renameSync(tempPath, filePath)
}

function recrawlArtifact(page, testNumber, crawledAt) {
  const fullHtml = String(page.fullHtml ?? '')
  const pagePath = Number(page.pageNumber) === 1 ? '' : `${page.pageNumber}/`
  return {
    sourceUrl: page.sourceUrl ?? `${BASE}${ROOT}${testNumber}/${pagePath}`,
    fetchedAt: page.fetchedAt ?? crawledAt,
    status: 200,
    contentHash: createHash('sha256').update(fullHtml).digest('hex'),
    title: page.passageTitle ?? page.partTitle ?? `Part ${page.partNumber}`,
    instructionsHtml: page.instructions ?? '',
    passageHtml: page.passageTextHtml ?? '',
    questionHtml: page.entryContentHtml ?? '',
    answerHtml: page.isAnswerPage ? page.entryContentHtml ?? '' : '',
  }
}

async function writeRecrawlArtifacts(testRoot, pages, testNumber, crawledAt) {
  const pagesDir = path.join(testRoot, 'pages')
  fs.mkdirSync(pagesDir, { recursive: true })
  let written = 0
  for (const page of pages) {
    if (!Number.isInteger(page.partNumber) || !String(page.fullHtml ?? '').trim()) continue
    const stem = `part-${page.partNumber}.full`
    fs.writeFileSync(path.join(pagesDir, `${stem}.html`), String(page.fullHtml), 'utf8')
    await writeJsonAtomic(
      path.join(pagesDir, `${stem}.json`),
      recrawlArtifact(page, testNumber, crawledAt),
    )
    written += 1
  }
  return written
}

async function crawlTest(testNumber) {
  const testRoot = path.join(OUT_DIR, `fce-reading-test${testNumber}`)
  const testDir = path.join(testRoot, 'exam')
  const filePath = path.join(testDir, 'exam.json')
  let existing = null
  if ((requestedPages || materializeExisting) && fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }
  if (materializeExisting) {
    const selectedPages = (existing?.pages ?? []).filter(page => (
      !requestedPages || requestedPages.includes(Number(page.pageNumber))
    ))
    const written = await writeRecrawlArtifacts(
      testRoot,
      selectedPages,
      testNumber,
      existing?.crawledAt,
    )
    console.log(`  💾 Materialized ${written} existing full-page artifact(s) for Source Test ${testNumber}`)
    return existing
  }
  const pages = requestedPages ?? Array.from({ length: 8 }, (_, i) => i + 1)
  const crawledPages = []

  console.log(`\n📥 Crawling test ${testNumber}${requestedPages ? ` pages ${requestedPages.join(',')}` : ''}...`)

  for (const page of pages) {
    // Page 1 is the default page (WordPress: /1/ redirects to /)
    const pagePath = page === 1 ? '' : `${page}/`
    const url = `${BASE}${ROOT}${testNumber}/${pagePath}`

    if (dryRun) {
      console.log(`  ${url}`)
      continue
    }

    try {
      const html = await fetch(url)
      const parsed = parsePage(html, testNumber, page, url)

      if (parsed) {
        crawledPages.push(parsed)
        if (parsed.isAnswerPage) {
          const totalAnswers = parsed.answers ? Object.values(parsed.answers).reduce((s, a) => s + a.length, 0) : 0
          console.log(`  ✅ Page ${page}: Answer Keys (${totalAnswers} answers)`)
        } else {
          if (parsed.partNumber) {
            console.log(`  ✅ Page ${page}: Part ${parsed.partNumber} (${parsed.questions.length} questions)`)
          } else {
            console.log(`  ✅ Page ${page}: parsed (${parsed.questions?.length || 0} questions)`)
          }
        }
      } else {
        console.log(`  ⚠️  Page ${page}: No content found`)
      }
    } catch (err) {
      console.error(`  ❌ Page ${page}: ${err.message}`)
    }

    await new Promise(r => setTimeout(r, delayMs))
  }

  if (dryRun) return

  fs.mkdirSync(testDir, { recursive: true })

  const refreshedPages = new Set(pages)
  const mergedPages = existing
    ? [...(existing.pages ?? []).filter(page => !refreshedPages.has(Number(page.pageNumber))), ...crawledPages]
        .sort((a, b) => Number(a.pageNumber) - Number(b.pageNumber))
    : crawledPages
  const examData = {
    ...(existing ?? {}),
    source: 'engexam.info',
    origin: 'source',
    testNumber,
    title: `FCE Reading and Use of English Practice Test ${testNumber}`,
    level: 'B2',
    examType: 'FCE',
    totalPages: mergedPages.length,
    crawledAt: new Date().toISOString(),
    pages: mergedPages,
  }

  if (backup && fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`
    fs.copyFileSync(filePath, backupPath)
    console.log(`  🛟 Backup: ${backupPath}`)
  }
  await writeJsonAtomic(filePath, examData)
  await writeRecrawlArtifacts(testRoot, crawledPages, testNumber, examData.crawledAt)
  console.log(`  💾 Saved: ${filePath} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`)

  return examData
}

// ── Main ──
async function main() {
  console.log(`🚀 FCE Reading Crawler — ${tests.length} test(s): [${tests.join(', ')}]`)
  if (dryRun) console.log('🏁 DRY RUN — no data saved\n')

  for (const t of tests) {
    await crawlTest(t)
  }

  console.log('\n✅ Crawl complete!')

  if (!dryRun) {
    console.log(`\n📂 Output: ${OUT_DIR}\\fce-reading-test{N}\\exam\\exam.json`)
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})

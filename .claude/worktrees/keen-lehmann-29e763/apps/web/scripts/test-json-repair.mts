/**
 * Smoke test for AI JSON repair (unescaped quotes / trailing commas).
 * Logic mirrored from ieltsReadingAiGenerate.extractJsonObject — keep in sync.
 */

function sliceOuterJsonObject(text: string): string {
  const start = text.indexOf('{')
  if (start < 0) return text
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escape) {
        escape = false
        continue
      }
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return text.slice(start)
}

function repairAiJsonText(input: string): string {
  let s = input
    .replace(/^\uFEFF/, '')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')

  let out = ''
  let inString = false
  let escape = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (!inString) {
      out += ch
      if (ch === '"') inString = true
      continue
    }
    if (escape) {
      out += ch
      escape = false
      continue
    }
    if (ch === '\\') {
      out += ch
      escape = true
      continue
    }
    if (ch === '\n' || ch === '\r') {
      out += ch === '\n' ? '\\n' : '\\r'
      continue
    }
    if (ch === '\t') {
      out += '\\t'
      continue
    }
    if (ch === '"') {
      let j = i + 1
      while (j < s.length && /[ \t\r\n]/.test(s[j]!)) j++
      const next = s[j]
      if (next === undefined || next === ',' || next === '}' || next === ']' || next === ':') {
        out += '"'
        inString = false
      } else {
        out += '\\"'
      }
      continue
    }
    out += ch
  }
  return out
}

function parseLikeGenerate(text: string): unknown {
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  let candidate = fence ? fence[1]!.trim() : trimmed
  candidate = sliceOuterJsonObject(candidate)
  try {
    return JSON.parse(candidate)
  } catch {
    return JSON.parse(repairAiJsonText(candidate))
  }
}

// 1) Unescaped quotes in string
const broken1 = `{
  "part": {
    "partNumber": 3,
    "passageTitle": "Test",
    "passage": [{ "text": "He said "hello" then left." }],
    "questionGroups": []
  }
}`
const p1 = parseLikeGenerate(broken1) as { part: { passage: Array<{ text: string }> } }
if (!/hello/.test(p1.part.passage[0].text)) throw new Error('broken1 text')
console.log('PASS unescaped quotes →', p1.part.passage[0].text)

// 2) Trailing comma + fence
const broken2 = '```json\n{"a":1,"b":{"c":2,},}\n```'
const p2 = parseLikeGenerate(broken2) as { a: number; b: { c: number } }
if (p2.a !== 1 || p2.b.c !== 2) throw new Error('broken2')
console.log('PASS trailing comma + fence')

// 3) Smart quotes
const broken3 = `{ “x”: “yes” }`
const p3 = parseLikeGenerate(broken3) as { x: string }
if (p3.x !== 'yes') throw new Error('broken3 ' + p3.x)
console.log('PASS smart quotes')

console.log('PASS all json-repair smoke')

#!/usr/bin/env node

/**
 * patch-pet-b1-part6-explanations.mjs
 *
 * Sinh explanation cho Part 6 (open gap-fill) của cả 5 đề PET B1 Reading.
 * Đọc ZIP → phân tích ngữ cảnh quanh gap → sinh explanation → ghi đè ZIP.
 *
 * Usage: node scripts/patch-pet-b1-part6-explanations.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { unzipSync, zipSync, strToU8, strFromU8 } from '../apps/web/node_modules/fflate/esm/browser.js'

const BUNDLES_DIR = 'pet-reading-bundles'
const TESTS = ['test14', 'test15', 'test16', 'test17', 'test18']

/**
 * Trích xuất ngữ cảnh xung quanh gap number từ passage text.
 * Tìm `(N) ______` và lấy ~60 ký tự trước và sau.
 */
function getContext(text, gapNum) {
  if (!text) return null
  const pattern = new RegExp(`\\(${gapNum}\\)\\s*_{6,}`)
  const match = pattern.exec(text)
  if (!match) return null

  const idx = match.index
  const before = text.slice(Math.max(0, idx - 50), idx).trim()
  const after = text.slice(idx + match[0].length, idx + match[0].length + 60).trim()
  return { before, after, full: before + ' ___ ' + after }
}

/**
 * Sinh explanation dựa trên đáp án và ngữ cảnh.
 * Dùng logic đơn giản, không gọi LLM — mỗi Part 6 gap-fill thuộc một
 * loại ngữ pháp/từ vựng phổ biến trong PET B1.
 */
function generateExplanation(answer, context) {
  const a = answer.toLowerCase().trim()

  // Articles
  if (a === 'a' || a === 'an') {
    const hint = a === 'an' ? 'an đứng trước nguyên âm' : 'a đứng trước phụ âm'
    const ctx = context ? `"${context}"` : ''
    return `${a} — ${ctx} — ${hint}.`
  }
  if (a === 'the') {
    const ctx = context ? `"${context}"` : ''
    return `the — ${ctx} — the dùng khi danh từ đã xác định.`
  }

  // Prepositions
  const prepositions = {
    on: 'on — chỉ ngày/thứ trong tuần hoặc bề mặt.',
    at: 'at — chỉ thời điểm hoặc địa điểm cụ thể.',
    in: 'in — chỉ bên trong, tháng/năm/mùa hoặc vị trí.',
    by: 'by — chỉ phương tiện hoặc cách thức.',
    for: 'for — chỉ mục đích hoặc khoảng thời gian.',
    to: 'to — chỉ hướng, đích đến hoặc động từ nguyên mẫu.',
    from: 'from — chỉ nguồn gốc hoặc điểm xuất phát.',
    of: 'of — chỉ sở hữu hoặc liên kết.',
    with: 'with — chỉ cùng với hoặc bằng công cụ.',
    about: 'about — chỉ về chủ đề hoặc khoảng chừng.',
    than: 'than — dùng trong so sánh hơn.',
    like: 'like — chỉ tương tự hoặc giống như.',
    as: 'as — chỉ vai trò hoặc sự tương đồng.',
  }
  if (prepositions[a]) {
    const ctx = context ? `"${context}"` : ''
    return `${a} — ${ctx} — ${prepositions[a]}`
  }

  // Conjunctions
  const conjunctions = {
    and: 'and — nối hai vế/ý tương đương.',
    but: 'but — chỉ sự tương phản hoặc đối lập.',
    or: 'or — chỉ lựa chọn hoặc thay thế.',
    so: 'so — chỉ kết quả hoặc mục đích.',
    because: 'because — chỉ nguyên nhân hoặc lý do.',
    if: 'if — chỉ điều kiện.',
    when: 'when — chỉ thời gian.',
    where: 'where — chỉ địa điểm hoặc nơi chốn.',
    while: 'while — chỉ đồng thời hoặc tương phản.',
    although: 'although — chỉ sự nhượng bộ.',
    though: 'though — chỉ sự nhượng bộ (thân mật).',
  }
  if (conjunctions[a]) {
    const ctx = context ? `"${context}"` : ''
    return `${a} — ${ctx} — ${conjunctions[a]}`
  }

  // Quantifiers
  const quantifiers = {
    some: 'some — chỉ một lượng không xác định, thường dùng trong câu khẳng định.',
    any: 'any — chỉ bất kỳ, thường dùng trong câu phủ định/nghi vấn.',
    many: 'many — chỉ số lượng nhiều (đếm được).',
    much: 'much — chỉ số lượng nhiều (không đếm được).',
    all: 'all — chỉ tất cả.',
    every: 'every — chỉ mỗi/mọi (số ít).',
    each: 'each — chỉ từng cái một.',
    both: 'both — chỉ cả hai.',
    either: 'either — chỉ một trong hai.',
    neither: 'neither — chỉ không cái nào trong hai.',
    no: 'no — chỉ không có.',
    none: 'none — chỉ không ai/cái gì.',
  }
  if (quantifiers[a]) {
    const ctx = context ? `"${context}"` : ''
    return `${a} — ${ctx} — ${quantifiers[a]}`
  }

  // Pronouns
  const pronouns = {
    i: 'I — đại từ chủ ngữ ngôi thứ nhất.',
    you: 'you — đại từ ngôi thứ hai (số ít/nhiều).',
    he: 'he — đại từ chủ ngữ ngôi thứ ba nam.',
    she: 'she — đại từ chủ ngữ ngôi thứ ba nữ.',
    it: 'it — đại từ chủ ngữ vật/việc.',
    we: 'we — đại từ chủ ngữ ngôi thứ nhất số nhiều.',
    they: 'they — đại từ chủ ngữ ngôi thứ ba số nhiều.',
    me: 'me — đại từ tân ngữ ngôi thứ nhất.',
    him: 'him — đại từ tân ngữ ngôi thứ ba nam.',
    her: 'her — đại từ tân ngữ ngôi thứ ba nữ / tính từ sở hữu.',
    us: 'us — đại từ tân ngữ ngôi thứ nhất số nhiều.',
    them: 'them — đại từ tân ngữ ngôi thứ ba số nhiều.',
    my: 'my — tính từ sở hữu ngôi thứ nhất.',
    your: 'your — tính từ sở hữu ngôi thứ hai.',
    his: 'his — tính từ sở hữu ngôi thứ ba nam.',
    its: 'its — tính từ sở hữu vật/việc.',
    our: 'our — tính từ sở hữu ngôi thứ nhất số nhiều.',
    their: 'their — tính từ sở hữu ngôi thứ ba số nhiều.',
    mine: 'mine — đại từ sở hữu ngôi thứ nhất.',
    yours: 'yours — đại từ sở hữu ngôi thứ hai.',
    who: 'who — chỉ người (chủ ngữ).',
    whom: 'whom — chỉ người (tân ngữ, trang trọng).',
    whose: 'whose — chỉ sở hữu của người.',
    which: 'which — chỉ vật/việc.',
    that: 'that — chỉ cả người lẫn vật (mệnh đề quan hệ xác định).',
    this: 'this — chỉ này (số ít, gần).',
    these: 'these — chỉ những... này (số nhiều, gần).',
    there: 'there — chỉ có (there is/are) hoặc ở đó.',
  }
  if (pronouns[a]) {
    const ctx = context ? `"${context}"` : ''
    return `${a} — ${ctx} — ${pronouns[a]}`
  }

  // Special common words
  const special = {
    very: 'very — trạng từ chỉ mức độ, rất.',
    too: 'too — quá (vượt mức) hoặc cũng vậy.',
    also: 'also — cũng vậy (thường đứng giữa câu).',
    only: 'only — chỉ, duy nhất.',
    just: 'just — vừa mới, chỉ.',
    still: 'still — vẫn còn.',
    already: 'already — đã... rồi.',
    yet: 'yet — chưa (phủ định) hoặc nhưng (trang trọng).',
    ever: 'ever — từng (trong câu hỏi/phủ định).',
    never: 'never — không bao giờ.',
    always: 'always — luôn luôn.',
    usually: 'usually — thường thường.',
    sometimes: 'sometimes — thỉnh thoảng.',
    often: 'often — thường xuyên.',
    rarely: 'rarely — hiếm khi.',
    once: 'once — một lần / đã từng.',
    first: 'first — thứ nhất, đầu tiên.',
    then: 'then — sau đó, rồi thì.',
    now: 'now — bây giờ, hiện tại.',
    here: 'here — ở đây.',
    well: 'well — tốt, giỏi (trạng từ).',
    good: 'good — tốt (tính từ).',
    new: 'new — mới.',
    old: 'old — cũ, già.',
    big: 'big — to, lớn.',
    small: 'small — nhỏ, bé.',
    more: 'more — nhiều hơn (so sánh hơn).',
    most: 'most — nhất (so sánh nhất) hoặc hầu hết.',
    less: 'less — ít hơn.',
    few: 'few — ít (đếm được).',
    little: 'little — ít (không đếm được).',
    enough: 'enough — đủ.',
    own: 'own — của riêng (own + danh từ).',
    other: 'other — khác (số ít), others — những cái khác.',
    another: 'another — một cái khác (số ít).',
    same: 'same — cùng, giống nhau.',
    different: 'different — khác nhau.',
    how: 'how — như thế nào (hỏi cách thức/mức độ).',
    what: 'what — cái gì (hỏi vật/việc).',
    why: 'why — tại sao (hỏi lý do).',
  }
  if (special[a]) {
    const ctx = context ? `"${context}"` : ''
    return `${a} — ${ctx} — ${special[a]}`
  }

  // Verb forms
  const verbs = {
    is: 'is — động từ to be ngôi thứ ba số ít (hiện tại).',
    am: 'am — động từ to be ngôi thứ nhất (hiện tại).',
    are: 'are — động từ to be ngôi số nhiều (hiện tại).',
    was: 'was — động từ to be ngôi thứ ba số ít (quá khứ).',
    were: 'were — động từ to be ngôi số nhiều (quá khứ).',
    been: 'been — quá khứ phân từ của to be.',
    being: 'being — hiện tại phân từ/danh động từ của to be.',
    have: 'have — động từ have ngôi số nhiều / nguyên mẫu.',
    has: 'has — động từ have ngôi thứ ba số ít.',
    had: 'had — quá khứ/quá khứ phân từ của have.',
    do: 'do — trợ động từ / làm (nguyên mẫu).',
    does: 'does — trợ động từ ngôi thứ ba số ít.',
    did: 'did — trợ động từ quá khứ.',
    can: 'can — động từ khuyết thiếu chỉ khả năng.',
    could: 'could — quá khứ của can / lịch sự.',
    will: 'will — trợ động từ tương lai.',
    would: 'would — quá khứ của will / câu điều kiện.',
    should: 'should — nên (lời khuyên).',
    may: 'may — có thể (xin phép / khả năng).',
    might: 'might — có thể (khả năng thấp).',
    must: 'must — phải (bắt buộc / suy luận).',
    need: 'need — cần.',
    dare: 'dare — dám.',
    used: 'used — used to: đã từng / be used to: quen với.',
    take: 'take — cầm, lấy, mang đi.',
    takes: 'takes — ngôi thứ ba số ít của take.',
    taken: 'taken — quá khứ phân từ của take.',
    make: 'make — làm, chế tạo.',
    made: 'made — quá khứ/quá khứ phân từ của make.',
    get: 'get — nhận, lấy, trở nên.',
    got: 'got — quá khứ của get.',
    go: 'go — đi.',
    went: 'went — quá khứ của go.',
    gone: 'gone — quá khứ phân từ của go.',
    come: 'come — đến.',
    came: 'came — quá khứ của come.',
    see: 'see — thấy, nhìn.',
    saw: 'saw — quá khứ của see.',
    seen: 'seen — quá khứ phân từ của see.',
  }
  if (verbs[a]) {
    const ctx = context ? `"${context}"` : ''
    return `${a} — ${ctx} — ${verbs[a]}`
  }

  // Fallback
  const ctx = context ? `"${context}"` : ''
  return `${a} — ${ctx} — ${a} phù hợp ngữ cảnh.`
}

function extractP6Context(body) {
  // Ghép passage text Part 6 thành một chuỗi, tìm context cho từng gap
  const allText = body.parts[5].passage.map(b => b.text || '').join(' ')
  return (gapNum) => {
    const ctx = getContext(allText, gapNum)
    return ctx ? ctx.full : null
  }
}

function main() {
  let totalPatched = 0

  for (const testLabel of TESTS) {
    const zipPath = path.join(BUNDLES_DIR, `${testLabel}-import.zip`)
    if (!fs.existsSync(zipPath)) {
      console.error(`Không tìm thấy: ${zipPath}`)
      continue
    }

    const raw = fs.readFileSync(zipPath)
    const entries = unzipSync(new Uint8Array(raw))

    // Tìm body và answers
    const bodyKey = Object.keys(entries).find(k => k.endsWith('.json') && !k.includes('answers') && !k.includes('meta'))
    const ansKey = Object.keys(entries).find(k => k.endsWith('.answers.json'))
    if (!bodyKey || !ansKey) {
      console.error(`Thiếu body/answers trong ${testLabel}`)
      continue
    }

    const body = JSON.parse(strFromU8(entries[bodyKey]))
    const answers = JSON.parse(strFromU8(entries[ansKey]))
    const getCtx = extractP6Context(body)

    let patched = 0
    for (let n = 27; n <= 32; n++) {
      const part6 = body.parts[5]
      const q = part6.questionGroups[0].questions.find(qq => qq.number === n)
      if (!q) continue

      const entry = answers.answers[q.id]
      if (!entry) continue

      // Bỏ qua nếu đã có explanation
      if (entry.explanation && entry.explanation.trim()) continue

      const context = getCtx(n)
      entry.explanation = generateExplanation(entry.answer, context)
      patched++
    }

    if (patched === 0) {
      console.log(`${testLabel}: không có Part 6 nào cần patch.`)
      continue
    }

    // Ghi đè answers và rebuild ZIP
    entries[ansKey] = strToU8(JSON.stringify(answers, null, 2))
    const newZip = zipSync(entries, { level: 9 })
    fs.writeFileSync(zipPath, Buffer.from(newZip))

    console.log(`${testLabel}: patched ${patched}/6 Part 6 explanations.`)
    totalPatched += patched

    // Verify
    const verify = unzipSync(new Uint8Array(fs.readFileSync(zipPath)))
    const vAns = JSON.parse(strFromU8(verify[ansKey]))
    for (let n = 27; n <= 32; n++) {
      const part6 = body.parts[5]
      const q = part6.questionGroups[0].questions.find(qq => qq.number === n)
      const ex = vAns.answers[q.id]?.explanation || ''
      console.log(`  Q${n}: ${vAns.answers[q.id].answer} → "${ex.substring(0, 100)}..."`)
    }
  }

  console.log(`\nDone: ${totalPatched} explanations generated.`)
}

main()

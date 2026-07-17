/**
 * Gói từ điển offline (không cần mạng / AI).
 * Nguồn:
 * - Part 1: ~300 từ A2–C2 (Tainguyen/TuDien/Part1.json)
 * - Part 2: +6000 từ EN→VI từ GitHub open-vn-en-dict (MIT)
 * - Part 2–5: +6000 mỗi part (không trùng các part trước)
 * - Phrasal ~2000 / Idioms ~3000 / Collocations ~10000 (scripts/build-dict-multi.mjs)
 * - Cụm từ / collocation bổ sung (PHRASE_PACK)
 * Free/basic: tra offline; AI dictionary khi Pro (dictionary_ai).
 */
import type { DictResult } from '@ryan/core'
import part1 from './data/offlinePart1.json'
import part2 from './data/offlinePart2.json'
import part3 from './data/offlinePart3.json'
import part4 from './data/offlinePart4.json'
import part5 from './data/offlinePart5.json'
import phrasalPack from './data/offlinePhrasal.json'
import idiomsPack from './data/offlineIdioms.json'
import collocationsPack from './data/offlineCollocations.json'

type PackEntry = Omit<DictResult, 'word'> & { word: string }

type PartDef = {
  meaning: string
  example?: string
  exampleVi?: string
}

type PartCard = {
  phrase: string
  meaning?: string
  example?: string
  exampleVi?: string
  ipaUS?: string
  ipaUK?: string
  pos?: string
  level?: string
  definitions?: PartDef[]
  collocations?: string[]
  synonyms?: string[]
}

function stripIpaSlashes(ipa?: string): string | undefined {
  if (!ipa) return undefined
  // Clean messy multi-forms: /ði:, ði, ðə/ → /ðiː/
  let s = ipa.replace(/^\/+|\/+$/g, '').trim()
  s = s.split(/[;,|]/)[0]?.trim() || s
  s = s.replace(/[\[\]]/g, '').trim()
  if (!s || s.length > 48) return undefined
  return `/${s}/`
}

/** Map nhãn POS tiếng Việt / hỗn hợp → dạng hiển thị gọn (như true.jpg: adjective) */
function normalizePos(pos?: string): string | undefined {
  if (!pos) return undefined
  const p = pos.trim().toLowerCase()
  const map: Record<string, string> = {
    'danh từ': 'noun',
    'động từ': 'verb',
    'tính từ': 'adjective',
    'phó từ': 'adverb',
    'trạng từ': 'adverb',
    'giới từ': 'preposition',
    'liên từ': 'conjunction',
    'đại từ': 'pronoun',
    'hạn định từ': 'determiner',
    'số từ': 'numeral',
    'thán từ': 'interjection',
    'cụm từ': 'phrase',
    'cụm động từ': 'phrase',
    noun: 'noun',
    verb: 'verb',
    adjective: 'adjective',
    adverb: 'adverb',
    phrase: 'phrase',
    preposition: 'preposition',
    conjunction: 'conjunction',
    pronoun: 'pronoun',
    determiner: 'determiner',
  }
  return map[p] ?? pos
}

/** Tách nghĩa dài (nối bằng ; / ,) thành các sense gọn — UI dạng true.jpg */
function splitMeanings(raw: string): string[] {
  const text = raw.replace(/\s+/g, ' ').trim()
  if (!text) return []
  // Ưu tiên tách theo ; hoặc dấu chấm phẩy fullwidth
  let parts = text.split(/[;；]/).map(s => s.trim()).filter(Boolean)
  if (parts.length === 1 && text.length > 80) {
    // fallback: tách theo dấu phẩy nếu đoạn quá dài
    parts = text.split(/,(?=\s)/).map(s => s.trim()).filter(s => s.length >= 2)
  }
  const out: string[] = []
  const seen = new Set<string>()
  for (const p of parts) {
    let m = p.replace(/^[•·\-–—\d.)]+\s*/, '').trim()
    if (m.length < 2) continue
    // gộp sense quá ngắn vào trước
    if (m.length < 4 && out.length) {
      out[out.length - 1] = `${out[out.length - 1]}, ${m}`
      continue
    }
    const key = m.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(m)
    if (out.length >= 5) break
  }
  return out
}

function cardToEntry(c: PartCard): PackEntry {
  const word = c.phrase.trim()
  let definitions: PartDef[] = []

  if (c.definitions?.length) {
    definitions = c.definitions
      .map(d => ({
        meaning: (d.meaning || '').trim(),
        example: d.example?.trim() || undefined,
        exampleVi: d.exampleVi?.trim() || undefined,
      }))
      .filter(d => d.meaning)
  } else if (c.meaning?.trim()) {
    const senses = splitMeanings(c.meaning)
    definitions = senses.map((meaning, i) => ({
      meaning,
      // gán example cho sense đầu (nếu có)
      example: i === 0 ? c.example?.trim() || undefined : undefined,
      exampleVi: i === 0 ? c.exampleVi?.trim() || undefined : undefined,
    }))
  }

  if (!definitions.length) {
    definitions = [{ meaning: c.meaning?.trim() || word, example: c.example }]
  }

  return {
    word,
    pos: normalizePos(c.pos),
    ipaUS: stripIpaSlashes(c.ipaUS),
    ipaUK: stripIpaSlashes(c.ipaUK),
    definitions: definitions.map(d => ({
      meaning: d.meaning,
      example: d.example,
      exampleVi: d.exampleVi || '',
    })),
    collocations: c.collocations,
    synonyms: c.synonyms,
    level: c.level,
  }
}

function e(
  word: string,
  pos: string,
  meaning: string,
  example: string,
  exampleVi: string,
  extra?: Partial<PackEntry>,
): PackEntry {
  return {
    word,
    pos,
    definitions: [{ meaning, example, exampleVi }],
    ...extra,
  }
}

/** Cụm từ / collocation bổ sung (không trùng Part 1 single words) */
const PHRASE_PACK: PackEntry[] = [
  e('according to', 'phrase', 'theo (ai/cái gì)', 'According to the report, ...', 'Theo báo cáo, ...', { level: 'B1' }),
  e('as a result', 'phrase', 'kết quả là', 'As a result, sales increased.', 'Kết quả là doanh số tăng.', { level: 'B1' }),
  e('for example', 'phrase', 'ví dụ', 'For example, Japan...', 'Ví dụ, Nhật Bản...', { level: 'A2' }),
  e('in addition', 'phrase', 'ngoài ra', 'In addition, costs fell.', 'Ngoài ra, chi phí giảm.', { level: 'B1' }),
  e('in conclusion', 'phrase', 'kết luận', 'In conclusion, I believe...', 'Kết luận, tôi tin rằng...', { level: 'B1' }),
  e('in my opinion', 'phrase', 'theo tôi', 'In my opinion, education is key.', 'Theo tôi, giáo dục là then chốt.', { level: 'A2' }),
  e('on the other hand', 'phrase', 'mặt khác', 'On the other hand, risks remain.', 'Mặt khác, rủi ro vẫn còn.', { level: 'B1' }),
  e('due to', 'phrase', 'do (nguyên nhân)', 'Due to rain, the match was delayed.', 'Do mưa, trận đấu bị hoãn.', { level: 'B1' }),
  e('instead of', 'phrase', 'thay vì', 'Walk instead of driving.', 'Đi bộ thay vì lái xe.', { level: 'A2' }),
  e('rely on', 'phrase', 'dựa vào', 'Don\'t rely on luck.', 'Đừng dựa vào may mắn.', { level: 'B1' }),
  e('take place', 'phrase', 'diễn ra', 'The meeting will take place tomorrow.', 'Cuộc họp sẽ diễn ra vào ngày mai.', { level: 'B1' }),
  e('make sense', 'phrase', 'hợp lý, có nghĩa', 'That doesn\'t make sense.', 'Điều đó không hợp lý.', { level: 'B1' }),
  e('look up', 'phrase', 'tra cứu', 'Look up the word in a dictionary.', 'Tra từ trong từ điển.', { level: 'A2' }),
  e('give up', 'phrase', 'bỏ cuộc', 'Never give up learning.', 'Đừng bao giờ bỏ cuộc học.', { level: 'A2' }),
  e('carry out', 'phrase', 'thực hiện', 'They carried out the plan.', 'Họ thực hiện kế hoạch.', { level: 'B2' }),
  e('deal with', 'phrase', 'xử lý, đối phó', 'How do you deal with stress?', 'Bạn xử lý căng thẳng thế nào?', { level: 'B1' }),
  e('focus on', 'phrase', 'tập trung vào', 'Focus on your goals.', 'Tập trung vào mục tiêu của bạn.', { level: 'B1' }),
  e('lead to', 'phrase', 'dẫn đến', 'Smoking can lead to disease.', 'Hút thuốc có thể dẫn đến bệnh.', { level: 'B1' }),
  e('contribute to', 'phrase', 'góp phần vào', 'Exercise contributes to health.', 'Tập thể dục góp phần vào sức khỏe.', { level: 'B2' }),
  e('be aware of', 'phrase', 'nhận thức được', 'Be aware of the risks.', 'Hãy nhận thức rủi ro.', { level: 'B2' }),
  e('in order to', 'phrase', 'để (mục đích)', 'I study in order to improve.', 'Tôi học để cải thiện.', { level: 'B1' }),
  e('as well as', 'phrase', 'cũng như', 'English as well as French.', 'Tiếng Anh cũng như tiếng Pháp.', { level: 'B1' }),
  e('such as', 'phrase', 'chẳng hạn như', 'Sports such as football.', 'Thể thao chẳng hạn như bóng đá.', { level: 'A2' }),
  e('rather than', 'phrase', 'hơn là', 'Walk rather than drive.', 'Đi bộ hơn là lái xe.', { level: 'B2' }),
  e('responsible for', 'phrase', 'chịu trách nhiệm về', 'Who is responsible for this?', 'Ai chịu trách nhiệm việc này?', { level: 'B1' }),
  e('interested in', 'phrase', 'quan tâm đến', 'I am interested in history.', 'Tôi quan tâm đến lịch sử.', { level: 'A2' }),
  e('good at', 'phrase', 'giỏi về', 'She is good at math.', 'Cô ấy giỏi toán.', { level: 'A2' }),
  e('depend on', 'phrase', 'phụ thuộc vào', 'Success depends on effort.', 'Thành công phụ thuộc vào nỗ lực.', { level: 'B1' }),
  e('agree with', 'phrase', 'đồng ý với', 'I agree with your idea.', 'Tôi đồng ý với ý kiến của bạn.', { level: 'A2' }),
  e('disagree with', 'phrase', 'không đồng ý với', 'I disagree with that view.', 'Tôi không đồng ý quan điểm đó.', { level: 'A2' }),
  e('look forward to', 'phrase', 'mong đợi', 'I look forward to hearing from you.', 'Tôi mong được nghe tin từ bạn.', { level: 'B1' }),
  e('take care of', 'phrase', 'chăm sóc', 'Take care of your health.', 'Hãy chăm sóc sức khỏe của bạn.', { level: 'A2' }),
  e('get used to', 'phrase', 'làm quen với', 'I got used to waking early.', 'Tôi đã quen dậy sớm.', { level: 'B1' }),
  e('be used to', 'phrase', 'quen với', 'I am used to the noise.', 'Tôi quen với tiếng ồn.', { level: 'B1' }),
  e('make sure', 'phrase', 'đảm bảo', 'Make sure you lock the door.', 'Hãy chắc chắn khóa cửa.', { level: 'A2' }),
  e('find out', 'phrase', 'tìm ra, phát hiện', 'We need to find out why.', 'Chúng ta cần tìm ra lý do.', { level: 'A2' }),
  e('point out', 'phrase', 'chỉ ra', 'He pointed out the mistake.', 'Anh ấy chỉ ra lỗi sai.', { level: 'B1' }),
  e('set up', 'phrase', 'thiết lập, thành lập', 'They set up a company.', 'Họ thành lập một công ty.', { level: 'B1' }),
  e('figure out', 'phrase', 'hiểu ra, tìm cách', 'I can\'t figure out this problem.', 'Tôi không giải được bài này.', { level: 'B1' }),
  e('come up with', 'phrase', 'nghĩ ra', 'She came up with a solution.', 'Cô ấy nghĩ ra một giải pháp.', { level: 'B2' }),
  e('end up', 'phrase', 'cuối cùng thì', 'We ended up staying home.', 'Cuối cùng chúng tôi ở nhà.', { level: 'B1' }),
  e('turn out', 'phrase', 'hóa ra', 'It turned out to be true.', 'Hóa ra điều đó là đúng.', { level: 'B1' }),
  e('work out', 'phrase', 'giải quyết; tập gym', 'Things will work out.', 'Mọi thứ sẽ ổn thôi.', { level: 'B1' }),
  e('break down', 'phrase', 'hỏng; suy sụp', 'The car broke down.', 'Xe bị hỏng.', { level: 'B1' }),
  e('bring about', 'phrase', 'mang lại, gây ra', 'This will bring about change.', 'Điều này sẽ mang lại thay đổi.', { level: 'B2' }),
  e('put off', 'phrase', 'hoãn lại', 'Don\'t put off your homework.', 'Đừng hoãn bài tập.', { level: 'B1' }),
  e('run out of', 'phrase', 'hết (cái gì)', 'We ran out of time.', 'Chúng tôi hết thời gian.', { level: 'B1' }),
  e('keep up with', 'phrase', 'theo kịp', 'It\'s hard to keep up with news.', 'Khó theo kịp tin tức.', { level: 'B2' }),
  e('cut down on', 'phrase', 'giảm bớt', 'Cut down on sugar.', 'Hãy giảm đường.', { level: 'B1' }),
  e('look after', 'phrase', 'chăm sóc', 'Can you look after my dog?', 'Bạn có thể trông chó giúp tôi không?', { level: 'A2' }),
  e('look for', 'phrase', 'tìm kiếm', 'I am looking for a job.', 'Tôi đang tìm việc.', { level: 'A1' }),
  e('think about', 'phrase', 'nghĩ về', 'Think about your future.', 'Hãy nghĩ về tương lai của bạn.', { level: 'A1' }),
  e('talk about', 'phrase', 'nói về', 'Let\'s talk about the plan.', 'Hãy nói về kế hoạch.', { level: 'A1' }),
  e('worry about', 'phrase', 'lo lắng về', 'Don\'t worry about it.', 'Đừng lo về việc đó.', { level: 'A2' }),
  e('listen to', 'phrase', 'lắng nghe', 'Listen to the teacher.', 'Hãy lắng nghe giáo viên.', { level: 'A1' }),
  e('belong to', 'phrase', 'thuộc về', 'This book belongs to me.', 'Cuốn sách này thuộc về tôi.', { level: 'A2' }),
  e('consist of', 'phrase', 'bao gồm', 'The team consists of five people.', 'Nhóm gồm năm người.', { level: 'B1' }),
  e('based on', 'phrase', 'dựa trên', 'The film is based on a book.', 'Phim dựa trên một cuốn sách.', { level: 'B1' }),
  e('related to', 'phrase', 'liên quan đến', 'This is related to your topic.', 'Điều này liên quan đến chủ đề của bạn.', { level: 'B1' }),
  e('similar to', 'phrase', 'tương tự', 'Your idea is similar to mine.', 'Ý bạn tương tự ý tôi.', { level: 'A2' }),
  e('different from', 'phrase', 'khác với', 'This is different from that.', 'Cái này khác cái kia.', { level: 'A2' }),
  e('famous for', 'phrase', 'nổi tiếng vì', 'Paris is famous for art.', 'Paris nổi tiếng về nghệ thuật.', { level: 'A2' }),
]

const part1Cards = (part1 as { cards: PartCard[] }).cards ?? []
const part2Cards = (part2 as { cards: PartCard[] }).cards ?? []
const part3Cards = (part3 as { cards: PartCard[] }).cards ?? []
const part4Cards = (part4 as { cards: PartCard[] }).cards ?? []
const part5Cards = (part5 as { cards: PartCard[] }).cards ?? []
const phrasalCards = (phrasalPack as { cards: PartCard[] }).cards ?? []
const idiomsCards = (idiomsPack as { cards: PartCard[] }).cards ?? []
const collocationCards = (collocationsPack as { cards: PartCard[] }).cards ?? []
const part1Entries = part1Cards.map(cardToEntry)
const part2Entries = part2Cards.map(cardToEntry)
const part3Entries = part3Cards.map(cardToEntry)
const part4Entries = part4Cards.map(cardToEntry)
const part5Entries = part5Cards.map(cardToEntry)
const phrasalEntries = phrasalCards.map(cardToEntry)
const idiomsEntries = idiomsCards.map(cardToEntry)
const collocationEntries = collocationCards.map(cardToEntry)

const PACK: PackEntry[] = []
const BY_KEY = new Map<string, PackEntry>()

function add(entry: PackEntry) {
  const key = entry.word.toLowerCase().trim().replace(/\s+/g, ' ')
  if (!key || BY_KEY.has(key)) return
  BY_KEY.set(key, entry)
  PACK.push(entry)
}

// Part1 ưu tiên → Part2–5 → multi-word packs → PHRASE_PACK
for (const item of part1Entries) add(item)
for (const item of part2Entries) add(item)
for (const item of part3Entries) add(item)
for (const item of part4Entries) add(item)
for (const item of part5Entries) add(item)
for (const item of phrasalEntries) add(item)
for (const item of idiomsEntries) add(item)
for (const item of collocationEntries) add(item)
for (const item of PHRASE_PACK) add(item)

export function offlineDictSize(): number {
  return PACK.length
}

export function offlineDictPart1Size(): number {
  return part1Entries.length
}

export function offlineDictPart2Size(): number {
  return part2Entries.length
}

export function offlineDictPart3Size(): number {
  return part3Entries.length
}

export function offlineDictPart4Size(): number {
  return part4Entries.length
}

export function offlineDictPart5Size(): number {
  return part5Entries.length
}

export function offlineDictPhrasalSize(): number {
  return phrasalEntries.length
}

export function offlineDictIdiomsSize(): number {
  return idiomsEntries.length
}

export function offlineDictCollocationsSize(): number {
  return collocationEntries.length
}

export function lookupOfflineDict(word: string): DictResult | null {
  const key = word.toLowerCase().trim().replace(/\s+/g, ' ')
  if (!key) return null
  const hit = BY_KEY.get(key)
  if (hit) return { ...hit, word: hit.word }

  // Thử dạng số nhiều đơn giản
  if (key.endsWith('ies') && key.length > 4) {
    const alt = BY_KEY.get(`${key.slice(0, -3)}y`)
    if (alt) return { ...alt }
  }
  if (key.endsWith('s') && key.length > 2) {
    const alt = BY_KEY.get(key.slice(0, -1))
    if (alt) return { ...alt }
  }
  if (key.endsWith('ed') && key.length > 3) {
    const alt = BY_KEY.get(key.slice(0, -2)) ?? BY_KEY.get(key.slice(0, -1))
    if (alt) return { ...alt }
  }
  if (key.endsWith('ing') && key.length > 4) {
    const alt = BY_KEY.get(key.slice(0, -3))
    if (alt) return { ...alt }
  }
  return null
}

export function listOfflineDictSample(limit = 20): string[] {
  return PACK.slice(0, limit).map(p => p.word)
}

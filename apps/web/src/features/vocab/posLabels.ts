/** Chuẩn hóa / suy luận nhãn từ loại tiếng Việt */

export const POS_OPTIONS = [
  'Danh từ',
  'Động từ',
  'Tính từ',
  'Trạng từ',
  'Giới từ',
  'Liên từ',
  'Đại từ',
  'Cụm động từ',
  'Cụm từ',
  'Thán từ',
] as const

export type PosLabel = (typeof POS_OPTIONS)[number]

const POS_ALIASES: Record<string, PosLabel> = {
  n: 'Danh từ',
  noun: 'Danh từ',
  'danh từ': 'Danh từ',
  'danh tu': 'Danh từ',
  v: 'Động từ',
  verb: 'Động từ',
  'động từ': 'Động từ',
  'dong tu': 'Động từ',
  adj: 'Tính từ',
  adjective: 'Tính từ',
  a: 'Tính từ',
  'tính từ': 'Tính từ',
  'tinh tu': 'Tính từ',
  adv: 'Trạng từ',
  adverb: 'Trạng từ',
  'trạng từ': 'Trạng từ',
  'trang tu': 'Trạng từ',
  prep: 'Giới từ',
  preposition: 'Giới từ',
  'giới từ': 'Giới từ',
  conj: 'Liên từ',
  conjunction: 'Liên từ',
  'liên từ': 'Liên từ',
  pron: 'Đại từ',
  pronoun: 'Đại từ',
  'đại từ': 'Đại từ',
  'phrasal verb': 'Cụm động từ',
  'phr v': 'Cụm động từ',
  'phr. v': 'Cụm động từ',
  'cụm động từ': 'Cụm động từ',
  phrase: 'Cụm từ',
  'cụm từ': 'Cụm từ',
  interjection: 'Thán từ',
  'thán từ': 'Thán từ',
}

const PHRASAL_STARTS = [
  'look ', 'take ', 'get ', 'go ', 'come ', 'put ', 'turn ', 'give ', 'make ',
  'bring ', 'run ', 'set ', 'keep ', 'hold ', 'break ', 'pick ', 'carry ',
  'find ', 'work ', 'miss ', 'pay ', 'play ', 'wait ', 'try ', 'fill ',
]

const COMMON_VERBS = new Set([
  'look', 'go', 'run', 'take', 'make', 'get', 'see', 'know', 'think', 'come',
  'want', 'use', 'find', 'give', 'tell', 'work', 'call', 'try', 'ask', 'need',
  'feel', 'leave', 'put', 'mean', 'keep', 'let', 'begin', 'seem', 'help',
  'show', 'hear', 'play', 'move', 'live', 'hold', 'bring', 'write', 'sit',
  'stand', 'lose', 'pay', 'meet', 'learn', 'change', 'watch', 'follow', 'stop',
  'open', 'walk', 'offer', 'remember', 'love', 'appear', 'buy', 'wait', 'send',
  'build', 'stay', 'fall', 'cut', 'reach', 'miss', 'visit', 'pass', 'carry',
  'talk', 'turn', 'start', 'raise', 'sell', 'decide', 'return', 'explain', 'eat',
])

const COMMON_ADJ = new Set([
  'good', 'bad', 'new', 'old', 'young', 'long', 'great', 'little', 'own', 'other',
  'right', 'big', 'high', 'small', 'large', 'next', 'early', 'important', 'few',
  'public', 'best', 'better', 'sure', 'able', 'free', 'full', 'special', 'easy',
  'hard', 'strong', 'weak', 'fast', 'slow', 'happy', 'sad', 'beautiful', 'hot',
  'cold', 'warm', 'cool', 'nice', 'fine', 'poor', 'rich', 'busy', 'ready',
])

export function normalizePos(raw: string): PosLabel | null {
  const key = raw.trim().toLowerCase()
  if (!key) return null
  const hit = POS_ALIASES[key]
  if (hit) return hit
  const match = POS_OPTIONS.find(o => o.toLowerCase() === key)
  return match ?? null
}

export function inferPos(phrase: string): PosLabel {
  const p = phrase.trim().toLowerCase()
  if (!p) return 'Danh từ'

  if (p.includes(' ')) {
    if (p.startsWith('to ') || PHRASAL_STARTS.some(s => p.startsWith(s))) return 'Cụm động từ'
    return 'Cụm từ'
  }

  if (/(tion|sion|ment|ness|ity|ism|ance|ence|ship|hood|dom|er|or|ist)$/.test(p)) return 'Danh từ'
  if (/ly$/.test(p) && p.length > 4) return 'Trạng từ'
  if (/(ful|ous|ive|able|ible|less|ish|al|ic|ant|ent|y)$/.test(p)) return 'Tính từ'
  if (/(ate|ify|ize|ise|en)$/.test(p)) return 'Động từ'
  if (COMMON_VERBS.has(p)) return 'Động từ'
  if (COMMON_ADJ.has(p)) return 'Tính từ'

  return 'Danh từ'
}

export function resolvePos(phrase: string, pos?: string): PosLabel {
  if (pos?.trim()) {
    const normalized = normalizePos(pos)
    if (normalized) return normalized
  }
  return inferPos(phrase)
}
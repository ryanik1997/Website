import { cardRepo, db, type Card, type Deck } from '@ryan/db'

export interface SeedDeckDef {
  name: string
  description: string
  color: string
  icon: string
  words: number
}

export interface SeedGroupDef {
  id: string
  name: string
  order: number
  decks: SeedDeckDef[]
}

export const PRESET_GROUP_IDS = ['ielts', 'oxford', 'toeic', 'academic', 'sat', 'toefl'] as const
export type PresetGroupId = (typeof PRESET_GROUP_IDS)[number]

export const GROUP_LABELS: Record<PresetGroupId, string> = {
  ielts: 'IELTS',
  oxford: 'Oxford',
  toeic: 'TOEIC',
  academic: 'Học thuật',
  sat: 'SAT',
  toefl: 'TOEFL',
}

const IELTS_DECKS: SeedDeckDef[] = [
  { name: 'Môi trường', description: 'Biến đổi khí hậu, tài nguyên và phát triển bền vững.', color: '#4CAF82', icon: '🌿', words: 100 },
  { name: 'Công nghệ', description: 'Thuật ngữ công nghệ, AI và chuyển đổi số.', color: '#2EC4B6', icon: '💻', words: 99 },
  { name: 'Xã hội & Văn hóa', description: 'Cộng đồng, bản sắc và các vấn đề xã hội.', color: '#E05C5C', icon: '🏛️', words: 101 },
  { name: 'Lịch sử & Khảo cổ học', description: 'Văn minh, di sản và khám phá khảo cổ học.', color: '#E09B3D', icon: '🏺', words: 100 },
  { name: 'Kinh tế & Kinh doanh', description: 'Thị trường, thương mại và tài chính.', color: '#E05C8A', icon: '💼', words: 100 },
  { name: 'Sức khỏe & Y tế', description: 'Y học, dịch tễ và lối sống lành mạnh.', color: '#5B8DD9', icon: '⚕️', words: 100 },
  { name: 'Giáo dục & Tâm lý học', description: 'Học tập, nhận thức và hành vi con người.', color: '#9B59B6', icon: '📚', words: 100 },
  { name: 'Đô thị & Kiến trúc', description: 'Quy hoạch, xây dựng và không gian sống.', color: '#1BA39C', icon: '🏙️', words: 100 },
]

const OXFORD_DECKS: SeedDeckDef[] = [
  { name: 'Đời sống hằng ngày', description: 'Giao tiếp, thói quen và tình huống sinh hoạt.', color: '#3D8B7A', icon: '🏠', words: 120 },
  { name: 'Du lịch & Văn hóa', description: 'Khám phá, phong tục và trải nghiệm địa phương.', color: '#D4A03C', icon: '✈️', words: 110 },
  { name: 'Công việc & Sự nghiệp', description: 'Văn phòng, phỏng vấn và phát triển nghề nghiệp.', color: '#4A6FA5', icon: '👔', words: 115 },
  { name: 'Học đường', description: 'Lớp học, kỳ thi và kỹ năng học tập.', color: '#7B5EA7', icon: '🎓', words: 105 },
  { name: 'Ẩm thực & Sức khỏe', description: 'Nấu ăn, dinh dưỡng và lối sống lành mạnh.', color: '#E07A5F', icon: '🥗', words: 100 },
  { name: 'Thiên nhiên', description: 'Động vật, thời tiết và môi trường sống.', color: '#52B788', icon: '🌳', words: 98 },
  { name: 'Nghệ thuật & Giải trí', description: 'Âm nhạc, phim ảnh và sở thích cá nhân.', color: '#C77DFF', icon: '🎭', words: 102 },
  { name: 'Khoa học phổ thông', description: 'Khái niệm khoa học cơ bản trong đời sống.', color: '#4895EF', icon: '🔬', words: 108 },
]

const TOEIC_DECKS: SeedDeckDef[] = [
  { name: 'Văn phòng & Họp', description: 'Email, lịch họp và giao tiếp nội bộ.', color: '#2563EB', icon: '📋', words: 150 },
  { name: 'Công tác & Du lịch', description: 'Đặt phòng, sân bay và lịch trình kinh doanh.', color: '#0891B2', icon: '🧳', words: 130 },
  { name: 'Tài chính & Ngân hàng', description: 'Ngân sách, thanh toán và báo cáo tài chính.', color: '#059669', icon: '🏦', words: 140 },
  { name: 'Marketing & Bán hàng', description: 'Khách hàng, quảng cáo và chốt deal.', color: '#DB2777', icon: '📈', words: 135 },
  { name: 'Nhân sự', description: 'Tuyển dụng, lương thưởng và đào tạo.', color: '#7C3AED', icon: '👥', words: 125 },
  { name: 'Sản xuất & Logistics', description: 'Kho hàng, vận chuyển và chuỗi cung ứng.', color: '#B45309', icon: '🏭', words: 128 },
  { name: 'Hợp đồng & Pháp lý', description: 'Thương lượng, điều khoản và tuân thủ.', color: '#4B5563', icon: '⚖️', words: 120 },
  { name: 'CNTT doanh nghiệp', description: 'Phần mềm, bảo mật và hạ tầng công ty.', color: '#0D9488', icon: '🖥️', words: 132 },
]

const ACADEMIC_DECKS: SeedDeckDef[] = [
  { name: 'Phương pháp nghiên cứu', description: 'Giả thuyết, mẫu thử và đánh giá kết quả.', color: '#5C4D7D', icon: '🔍', words: 110 },
  { name: 'Viết học thuật', description: 'Luận văn, trích dẫn và cấu trúc bài viết.', color: '#3D5A80', icon: '✍️', words: 115 },
  { name: 'Thống kê & Dữ liệu', description: 'Biến số, tương quan và diễn giải số liệu.', color: '#2A9D8F', icon: '📊', words: 105 },
  { name: 'Triết học', description: 'Lý thuyết, luận điểm và tư duy phản biện.', color: '#6D597A', icon: '💭', words: 100 },
  { name: 'Xã hội học', description: 'Cấu trúc xã hội, văn hóa và hành vi tập thể.', color: '#E76F51', icon: '🌐', words: 108 },
  { name: 'Sinh học', description: 'Tế bào, hệ sinh thái và tiến hóa.', color: '#43AA8B', icon: '🧬', words: 112 },
  { name: 'Vật lý', description: 'Lực, năng lượng và mô hình vật chất.', color: '#577590', icon: '⚛️', words: 102 },
  { name: 'Kinh tế học', description: 'Cung cầu, thị trường và chính sách vĩ mô.', color: '#F4A261', icon: '📉', words: 110 },
]

const SAT_DECKS: SeedDeckDef[] = [
  { name: 'Đọc hiểu SAT', description: 'Từ vựng văn bản học thuật và suy luận.', color: '#1D3557', icon: '📖', words: 200 },
  { name: 'Toán SAT', description: 'Đại số, hình học và thuật ngữ bài toán.', color: '#457B9D', icon: '➗', words: 150 },
  { name: 'Khoa học SAT', description: 'Sinh, hóa, vật lý trong đoạn đọc ngắn.', color: '#2A9D8F', icon: '🧪', words: 130 },
  { name: 'Lịch sử & Chính trị', description: 'Hiến pháp, sự kiện và tư tưởng Mỹ.', color: '#BC6C25', icon: '🗽', words: 120 },
  { name: 'Văn học', description: 'Ẩn dụ, giọng điệu và phân tích tác phẩm.', color: '#9B2226', icon: '📜', words: 125 },
  { name: 'Ngữ pháp nền', description: 'Cấu trúc câu, liên từ và sửa lỗi.', color: '#6A4C93', icon: '✏️', words: 110 },
  { name: 'Lập luận', description: 'Bằng chứng, giả định và suy diễn logic.', color: '#386641', icon: '🧩', words: 115 },
  { name: 'Chuẩn bị đại học', description: 'Từ khóa đại học, campus và đơn xin học.', color: '#E09F3E', icon: '🎯', words: 105 },
]

const TOEFL_DECKS: SeedDeckDef[] = [
  { name: 'Đời sống campus', description: 'Ký túc xá, câu lạc bộ và sinh hoạt sinh viên.', color: '#0077B6', icon: '🏫', words: 130 },
  { name: 'Bài giảng & Ghi chú', description: 'Nghe hiểu, khái niệm và tóm tắt bài học.', color: '#00B4D8', icon: '🎧', words: 140 },
  { name: 'Khoa học TOEFL', description: 'Thí nghiệm, giả thuyết và thuật ngữ lab.', color: '#48CAE4', icon: '🔭', words: 135 },
  { name: 'Khoa học xã hội', description: 'Tâm lý, nhân chủng và nghiên cứu xã hội.', color: '#90E0EF', icon: '🧠', words: 128 },
  { name: 'Kỹ năng tích hợp', description: 'Đọc-nghe-nói-viết trong một chủ đề.', color: '#023E8A', icon: '🔗', words: 120 },
  { name: 'Ngữ cảnh nghe', description: 'Hội thoại, thông báo và hướng dẫn.', color: '#0096C7', icon: '🔊', words: 125 },
  { name: 'Chủ đề Speaking', description: 'Ý kiến, so sánh và giải thích quan điểm.', color: '#ADE8F4', icon: '🗣️', words: 115 },
  { name: 'Chủ đề Writing', description: 'Luận điểm, ví dụ và kết luận bài luận.', color: '#03045E', icon: '📝', words: 122 },
]

export const SEED_GROUPS: SeedGroupDef[] = [
  { id: 'ielts', name: 'IELTS', order: 1, decks: IELTS_DECKS },
  { id: 'oxford', name: 'Oxford', order: 2, decks: OXFORD_DECKS },
  { id: 'toeic', name: 'TOEIC', order: 3, decks: TOEIC_DECKS },
  { id: 'academic', name: 'Học thuật', order: 4, decks: ACADEMIC_DECKS },
  { id: 'sat', name: 'SAT', order: 5, decks: SAT_DECKS },
  { id: 'toefl', name: 'TOEFL', order: 6, decks: TOEFL_DECKS },
]

const PRESET_GROUP_SET = new Set<string>(PRESET_GROUP_IDS)

/** ID cố định cho bộ preset — tránh duplicate khi seed/sync chạy song song. */
export function stablePresetDeckId(groupId: string, deckName: string): string {
  const slug = deckName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `preset:${groupId}:${slug || 'deck'}`
}

/** Khóa so khớp phrase (publish + merge + dedupe) — NFD, trim, gộp space. */
export function phraseKeyForCard(phrase: string): string {
  return phrase
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/** Hash ổn định (FNV-1a × 2) — id thẻ không phụ thuộc UUID random khi Admin publish. */
function hashPhraseKey(key: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < key.length; i++) {
    const c = key.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193)
    h2 = Math.imul(h2 ^ c, 0x811c9dc5)
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)
}

/**
 * ID thẻ preset ổn định theo deck + phrase.
 * Re-publish / re-import cùng từ → cùng id → bulkPut ghi đè, không double.
 */
export function stablePresetCardId(deckId: string, phrase: string): string {
  const key = phraseKeyForCard(phrase)
  if (!key) return `pcard:${deckId}:empty`
  return `pcard:${deckId}:${hashPhraseKey(key)}`
}

export function isStablePresetCardId(id: string): boolean {
  return id.startsWith('pcard:')
}

export function isStablePresetDeckId(id: string): boolean {
  return id.startsWith('preset:')
}

async function removeDeckRecord(deckId: string): Promise<void> {
  const cardIds = (await db.cards.where('deckId').equals(deckId).primaryKeys()) as string[]
  await db.srs.bulkDelete(cardIds)
  if (cardIds.length) await db.reviewLog.where('cardId').anyOf(cardIds).delete()
  await db.cards.where('deckId').equals(deckId).delete()
  await db.decks.delete(deckId)
}

/**
 * Chuyển thẻ sang deck đích + rekey id → `pcard:…` (idempotent).
 * Gộp phrase trùng, giữ SRS tốt hơn.
 */
async function migrateDeckCards(fromDeckId: string, toDeckId: string): Promise<void> {
  if (fromDeckId === toDeckId) {
    await rekeyCardsInDeck(toDeckId)
    return
  }
  const cards = await db.cards.where('deckId').equals(fromDeckId).toArray()
  const ts = Date.now()
  for (const card of cards) {
    await rekeyOneCard(card, toDeckId, ts)
  }
  await cardRepo.dedupeByPhrase(toDeckId)
}

async function rekeyOneCard(card: Card, toDeckId: string, ts: number): Promise<void> {
  const stableId = stablePresetCardId(toDeckId, card.phrase)
  const srs = await db.srs.get(card.id)
  const existing = stableId !== card.id ? await db.cards.get(stableId) : undefined

  if (existing && existing.id !== card.id) {
    // Gộp field vào thẻ stable, xóa bản UUID/cũ
    const patch: Record<string, unknown> = { updatedAt: ts, deckId: toDeckId }
    if (!existing.meaning?.trim() && card.meaning?.trim()) patch.meaning = card.meaning
    if (!existing.example?.trim() && card.example?.trim()) patch.example = card.example
    if (!existing.ipaUS?.trim() && card.ipaUS?.trim()) patch.ipaUS = card.ipaUS
    if (!existing.ipaUK?.trim() && card.ipaUK?.trim()) patch.ipaUK = card.ipaUK
    if (!existing.pos?.trim() && card.pos?.trim()) patch.pos = card.pos
    await db.cards.update(stableId, patch)
    if (srs) {
      const keepSrs = await db.srs.get(stableId)
      if (!keepSrs || (srs.reps ?? 0) > (keepSrs.reps ?? 0)) {
        await db.srs.put({ ...srs, cardId: stableId, deckId: toDeckId })
      }
      await db.srs.delete(card.id)
    }
    const logs = await db.reviewLog.where('cardId').equals(card.id).toArray()
    for (const log of logs) {
      if (log.id != null) await db.reviewLog.update(log.id, { cardId: stableId })
    }
    await db.cards.delete(card.id)
    return
  }

  if (card.id === stableId && card.deckId === toDeckId) {
    if (srs && srs.deckId !== toDeckId) await db.srs.put({ ...srs, deckId: toDeckId })
    return
  }

  // Đổi id: put stable, xóa cũ
  await db.cards.put({
    ...card,
    id: stableId,
    deckId: toDeckId,
    updatedAt: ts,
  })
  if (srs) {
    await db.srs.put({ ...srs, cardId: stableId, deckId: toDeckId })
    if (card.id !== stableId) await db.srs.delete(card.id)
  }
  if (card.id !== stableId) {
    const logs = await db.reviewLog.where('cardId').equals(card.id).toArray()
    for (const log of logs) {
      if (log.id != null) await db.reviewLog.update(log.id, { cardId: stableId })
    }
    await db.cards.delete(card.id)
  }
}

/** Rekey mọi thẻ trong deck preset → pcard: + dedupe phrase. */
async function rekeyCardsInDeck(deckId: string): Promise<void> {
  const cards = await db.cards.where('deckId').equals(deckId).toArray()
  const ts = Date.now()
  for (const card of cards) {
    await rekeyOneCard(card, deckId, ts)
  }
  await cardRepo.dedupeByPhrase(deckId)
}

/** Map stableId → tên seed chuẩn (để rename + gộp). */
function knownPresetStableIds(): Map<string, { groupId: string; name: string }> {
  const map = new Map<string, { groupId: string; name: string }>()
  for (const g of SEED_GROUPS) {
    for (const d of g.decks) {
      map.set(stablePresetDeckId(g.id, d.name), { groupId: g.id, name: d.name })
    }
  }
  return map
}

/** Tên seed (normalize) → stableId khi tên là duy nhất toàn bộ preset. */
function uniqueSeedNameToStable(): Map<string, string> {
  const counts = new Map<string, string[]>()
  for (const g of SEED_GROUPS) {
    for (const d of g.decks) {
      const key = phraseKeyForCard(d.name)
      const id = stablePresetDeckId(g.id, d.name)
      const list = counts.get(key) ?? []
      list.push(id)
      counts.set(key, list)
    }
  }
  const unique = new Map<string, string>()
  for (const [key, ids] of counts) {
    if (ids.length === 1) unique.set(key, ids[0]!)
  }
  return unique
}

/**
 * Gộp bộ preset trùng theo **stable slug** (không phụ thuộc exact name / origin).
 * VD: "Công nghệ" + "Cong nghe" + UUID deck → `preset:ielts:cong-nghe`.
 * Giữ bản có nhiều thẻ nhất, chuẩn hoá ID + tên seed + rekey card.
 */
export async function dedupePresetDecks(): Promise<number> {
  const known = knownPresetStableIds()
  const uniqueName = uniqueSeedNameToStable()
  // Mọi deck: group preset HOẶC tên khớp seed (kể cả group_name cloud sai/null)
  const allDecks = await db.decks.toArray()
  const candidates = allDecks.filter(d => {
    if (known.has(d.id) || isStablePresetDeckId(d.id)) return true
    if (PRESET_GROUP_SET.has(d.groupId)) return true
    if (uniqueName.has(phraseKeyForCard(d.name))) return true
    return false
  })

  const buckets = new Map<string, Deck[]>()
  for (const deck of candidates) {
    let stableId: string | null = null
    if (known.has(deck.id)) {
      stableId = deck.id
    } else if (PRESET_GROUP_SET.has(deck.groupId)) {
      const fromName = stablePresetDeckId(deck.groupId, deck.name)
      if (known.has(fromName)) stableId = fromName
    }
    if (!stableId) {
      const byName = uniqueName.get(phraseKeyForCard(deck.name))
      if (byName) stableId = byName
    }
    if (!stableId) continue
    const list = buckets.get(stableId) ?? []
    list.push(deck)
    buckets.set(stableId, list)
  }

  let removed = 0
  for (const [stableId, dupes] of buckets) {
    if (!dupes.length) continue
    const meta = known.get(stableId)!

    const ranked = await Promise.all(
      dupes.map(async deck => ({
        deck,
        cards: await db.cards.where('deckId').equals(deck.id).count(),
      })),
    )
    ranked.sort((a, b) => b.cards - a.cards || a.deck.createdAt - b.deck.createdAt)
    const best = ranked[0]!.deck

    await db.decks.put({
      ...best,
      id: stableId,
      groupId: meta.groupId,
      name: meta.name,
      origin: 'preset',
      updatedAt: Date.now(),
    })

    for (const { deck } of ranked) {
      if (deck.id === stableId) continue
      await migrateDeckCards(deck.id, stableId)
      await removeDeckRecord(deck.id)
      removed++
    }

    // Rekey UUID card → pcard: + gộp phrase
    await rekeyCardsInDeck(stableId)
  }

  return removed
}

async function seedGroup(group: SeedGroupDef): Promise<void> {
  const existingGroup = await db.groups.get(group.id)
  await db.groups.put({
    id: group.id,
    name: group.name,
    order: group.order,
    createdAt: existingGroup?.createdAt ?? Date.now(),
  })

  const now = Date.now()
  for (const d of group.decks) {
    const id = stablePresetDeckId(group.id, d.name)
    const existing = await db.decks.get(id)
    await db.decks.put({
      id,
      groupId: group.id,
      name: d.name,
      book: d.description,
      description: d.description,
      color: d.color,
      icon: d.icon,
      origin: 'preset',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    })
  }
}

/**
 * Gắn origin cho deck cũ trong DB đã tồn tại trước khi có field origin:
 * bất kỳ deck nào nằm trong PRESET_GROUP_IDS và trùng tên với SEED_GROUPS →
 * đánh dấu `preset` để không cho phép xóa.
 */
async function repairPresetOrigin(): Promise<void> {
  const namesByGroup = new Map<string, Set<string>>(
    SEED_GROUPS.map(g => [g.id, new Set(g.decks.map(d => d.name))]),
  )
  const legacy = await db.decks
    .filter(d => d.origin === undefined && namesByGroup.has(d.groupId))
    .toArray()
  for (const d of legacy) {
    const seedNames = namesByGroup.get(d.groupId)
    if (seedNames?.has(d.name)) {
      await db.decks.update(d.id, { origin: 'preset' })
    } else {
      await db.decks.update(d.id, { origin: 'user' })
    }
  }
}

let seedTask: Promise<void> | null = null

/** Seed tất cả bộ preset (IELTS, Oxford, TOEIC, …) — idempotent, không tạo bản trùng. */
export async function seedPresetDecks(): Promise<void> {
  if (!seedTask) {
    seedTask = (async () => {
      for (const group of SEED_GROUPS) {
        await seedGroup(group)
      }
      await repairPresetOrigin()
      await dedupePresetDecks()
      // Dọn thẻ phrase trùng trên mọi deck (preset + user) — an toàn, idempotent
      await cardRepo.dedupeAllDecks()
    })().finally(() => {
      seedTask = null
    })
  }
  await seedTask
}

/**
 * Chạy tay / nút «Dọn thẻ trùng» — gộp deck preset + rekey card + dedupe phrase.
 * @returns số deck ghost đã xoá
 */
export async function repairVocabDuplicates(): Promise<{ decksRemoved: number }> {
  seedTask = null
  await seedPresetDecks()
  const decksRemoved = await dedupePresetDecks()
  await cardRepo.dedupeAllDecks()
  return { decksRemoved }
}

/** @deprecated Dùng seedPresetDecks */
export async function seedIeltsDecks(): Promise<void> {
  await seedPresetDecks()
}
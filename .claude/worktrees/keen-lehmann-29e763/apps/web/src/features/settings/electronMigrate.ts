/**
 * Migrate user data from Electron app (P15.x) → Web Dexie.
 *
 * Supported formats:
 * 1. Web backup v1–3: { app: 'RyanEnglish', version, data: {...} }
 * 2. Electron vocab v2: { type: 'ryan-vocabulary-export-v2', vocabularyDB: { stores } }
 * 3. Legacy quick backup: { storage: { flashcardCustomDecks_v6, ... } }
 * 4. Legacy storage map: { flashcardCustomDecks_v6, flashcardSrs_v1, ... }
 */
import { db, type Card, type Deck, type Group, type Srs } from '@ryan/db'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type MigrateResult = {
  source: string
  counts: Record<string, number>
  warnings: string[]
  idRemaps: number
}

function isObj(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

function safeStr(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  return String(v).trim()
}

function isUuid(id: string): boolean {
  return UUID_RE.test(id)
}

/** Deterministic UUID-shaped id from arbitrary string (for non-UUID Electron ids). */
export function stableUuidFromString(input: string): string {
  if (isUuid(input)) return input.toLowerCase()
  let h1 = 0x811c9dc5
  let h2 = 0x811c9dc5 ^ 0x9e3779b9
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193)
    h2 = Math.imul(h2 ^ (c + i), 0x01000193)
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0')
  const a = hex(h1)
  const b = hex(h2)
  const c = hex(h1 ^ h2)
  const d = hex(~h1)
  return `${a.slice(0, 8)}-${b.slice(0, 4)}-4${b.slice(5, 8)}-a${c.slice(1, 4)}-${d}${a.slice(0, 4)}`
}

function nowTs(): number {
  return Date.now()
}

function parseJsonMaybe(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ── Electron v2 stores → Web ─────────────────────────────────

type ElectronCard = {
  id?: string
  deckId?: string
  deck_id?: string
  phrase?: string
  front?: string
  meaning?: string
  back?: string
  example?: string
  ipaUS?: string
  ipa?: string
  ipaUK?: string
  pos?: string
  createdAt?: number
  updatedAt?: number
}

type ElectronDeck = {
  id?: string
  groupId?: string
  group_id?: string
  name?: string
  book?: string
  unit?: string
  createdAt?: number
  updatedAt?: number
}

type ElectronGroup = {
  id?: string
  name?: string
  order?: number
  createdAt?: number
}

type ElectronSrs = {
  cardId?: string
  cardKey?: string
  card_id?: string
  deckId?: string
  ease?: number
  interval?: number
  intervalDays?: number
  interval_days?: number
  reps?: number
  lapses?: number
  dueAt?: number | string
  nextReview?: number | string
  lastReviewedAt?: number | string
  state?: string
}

function mapElectronGroups(
  rows: unknown[],
  idMap: Map<string, string>,
): Group[] {
  const out: Group[] = []
  rows.forEach((raw, index) => {
    if (!isObj(raw)) return
    const g = raw as ElectronGroup
    const oldId = safeStr(g.id) || `group-${index}`
    const id = stableUuidFromString(oldId)
    if (oldId !== id) idMap.set(oldId, id)
    idMap.set(oldId, id)
    out.push({
      id,
      name: safeStr(g.name, 'Nhóm'),
      order: typeof g.order === 'number' ? g.order : index,
      createdAt: typeof g.createdAt === 'number' ? g.createdAt : nowTs(),
    })
  })
  return out
}

function mapElectronDecks(
  rows: unknown[],
  idMap: Map<string, string>,
): Deck[] {
  const out: Deck[] = []
  for (const raw of rows) {
    if (!isObj(raw)) continue
    const d = raw as ElectronDeck
    const oldId = safeStr(d.id)
    if (!oldId) continue
    const id = stableUuidFromString(oldId)
    idMap.set(oldId, id)
    const oldGroup = safeStr(d.groupId ?? d.group_id)
    const groupId = oldGroup
      ? (idMap.get(oldGroup) ?? stableUuidFromString(oldGroup))
      : stableUuidFromString('electron-default-group')
    const t = nowTs()
    out.push({
      id,
      groupId,
      name: safeStr(d.name, 'Bộ thẻ'),
      book: d.book ? safeStr(d.book) : undefined,
      unit: d.unit ? safeStr(d.unit) : undefined,
      origin: 'user',
      createdAt: typeof d.createdAt === 'number' ? d.createdAt : t,
      updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : t,
    })
  }
  return out
}

function mapElectronCards(
  rows: unknown[],
  idMap: Map<string, string>,
): Card[] {
  const out: Card[] = []
  for (const raw of rows) {
    if (!isObj(raw)) continue
    const c = raw as ElectronCard
    const oldId = safeStr(c.id)
    if (!oldId) continue
    const phrase = safeStr(c.phrase ?? c.front)
    const meaning = safeStr(c.meaning ?? c.back)
    if (!phrase || !meaning) continue
    const id = stableUuidFromString(oldId)
    idMap.set(oldId, id)
    const oldDeck = safeStr(c.deckId ?? c.deck_id)
    const deckId = oldDeck
      ? (idMap.get(oldDeck) ?? stableUuidFromString(oldDeck))
      : ''
    if (!deckId) continue
    const t = nowTs()
    out.push({
      id,
      deckId,
      phrase,
      meaning,
      example: c.example ? safeStr(c.example) : undefined,
      ipaUS: safeStr(c.ipaUS ?? c.ipa) || undefined,
      ipaUK: c.ipaUK ? safeStr(c.ipaUK) : undefined,
      pos: c.pos ? safeStr(c.pos) : undefined,
      sourceKind: 'import',
      createdAt: typeof c.createdAt === 'number' ? c.createdAt : t,
      updatedAt: typeof c.updatedAt === 'number' ? c.updatedAt : t,
    })
  }
  return out
}

function mapElectronSrs(
  rows: unknown[],
  idMap: Map<string, string>,
  cardDeckMap: Map<string, string>,
): Srs[] {
  const out: Srs[] = []
  for (const raw of rows) {
    if (!isObj(raw)) continue
    const s = raw as ElectronSrs
    const oldCard = safeStr(s.cardId ?? s.cardKey ?? s.card_id)
    if (!oldCard) continue
    const cardId = idMap.get(oldCard) ?? (isUuid(oldCard) ? oldCard : stableUuidFromString(oldCard))
    const dueRaw = s.dueAt ?? s.nextReview
    let dueAt = nowTs()
    if (typeof dueRaw === 'number') dueAt = dueRaw
    else if (typeof dueRaw === 'string') {
      const t = new Date(dueRaw).getTime()
      if (!Number.isNaN(t)) dueAt = t
    }
    let lastReviewedAt: number | undefined
    if (typeof s.lastReviewedAt === 'number') lastReviewedAt = s.lastReviewedAt
    else if (typeof s.lastReviewedAt === 'string') {
      const t = new Date(s.lastReviewedAt).getTime()
      if (!Number.isNaN(t)) lastReviewedAt = t
    }
    const stateRaw = safeStr(s.state, 'new')
    const state =
      stateRaw === 'learning' || stateRaw === 'review' || stateRaw === 'new'
        ? stateRaw
        : 'new'
    out.push({
      cardId,
      deckId: cardDeckMap.get(cardId) ?? '',
      ease: typeof s.ease === 'number' ? s.ease : 2.5,
      interval: Number(s.interval ?? s.intervalDays ?? s.interval_days ?? 0) || 0,
      reps: typeof s.reps === 'number' ? s.reps : 0,
      lapses: typeof s.lapses === 'number' ? s.lapses : 0,
      dueAt,
      lastReviewedAt,
      state,
    })
  }
  return out
}

function fromVocabStores(stores: Record<string, unknown>): {
  groups: Group[]
  decks: Deck[]
  cards: Card[]
  srs: Srs[]
  idRemaps: number
} {
  const idMap = new Map<string, string>()
  const groups = mapElectronGroups(asArray(stores.groups), idMap)
  // Ensure default group if empty
  if (groups.length === 0) {
    const id = stableUuidFromString('electron-default-group')
    groups.push({ id, name: 'Từ Electron', order: 0, createdAt: nowTs() })
    idMap.set('electron-default-group', id)
  }
  const decks = mapElectronDecks(asArray(stores.decks), idMap)
  const cards = mapElectronCards(asArray(stores.cards), idMap)
  const cardDeckMap = new Map(cards.map(c => [c.id, c.deckId]))
  const srs = mapElectronSrs(asArray(stores.srs), idMap, cardDeckMap)
  let idRemaps = 0
  for (const [oldId, newId] of idMap) {
    if (oldId !== newId) idRemaps += 1
  }
  return { groups, decks, cards, srs, idRemaps }
}

/** Legacy localStorage map → pseudo decks/cards */
function fromLegacyStorageMap(storage: Record<string, unknown>): {
  groups: Group[]
  decks: Deck[]
  cards: Card[]
  srs: Srs[]
  idRemaps: number
  warnings: string[]
} {
  const warnings: string[] = []
  const idMap = new Map<string, string>()

  const customDecksRaw = parseJsonMaybe(storage.flashcardCustomDecks_v6)
  const groupsRaw = parseJsonMaybe(storage.flashcardGroups_v6)
  const srsRaw = parseJsonMaybe(storage.flashcardSrs_v1)
  const deckToGroup = parseJsonMaybe(storage.flashcardDeckToGroup_v6)

  const groups: Group[] = []
  if (Array.isArray(groupsRaw)) {
    groupsRaw.forEach((g, i) => {
      if (!isObj(g) && typeof g !== 'string') return
      const name = typeof g === 'string' ? g : safeStr(g.name, `Nhóm ${i + 1}`)
      const oldId = isObj(g) ? safeStr(g.id, name) : name
      const id = stableUuidFromString(`legacy-group:${oldId}`)
      idMap.set(oldId, id)
      groups.push({ id, name, order: i, createdAt: nowTs() })
    })
  }
  if (groups.length === 0) {
    const id = stableUuidFromString('electron-default-group')
    groups.push({ id, name: 'Từ Electron', order: 0, createdAt: nowTs() })
  }

  const decks: Deck[] = []
  const cards: Card[] = []

  // customDecks can be { deckName: Card[] } or { deckId: { name, cards } }
  if (isObj(customDecksRaw)) {
    let deckIndex = 0
    for (const [key, value] of Object.entries(customDecksRaw)) {
      deckIndex += 1
      const deckOldId = key
      const deckId = stableUuidFromString(`legacy-deck:${deckOldId}`)
      idMap.set(deckOldId, deckId)

      let deckName = key
      let cardList: unknown[] = []

      if (Array.isArray(value)) {
        cardList = value
      } else if (isObj(value)) {
        deckName = safeStr(value.name, key)
        cardList = asArray(value.cards ?? value.items ?? value.words)
      }

      let groupId = groups[0]!.id
      if (isObj(deckToGroup) && deckToGroup[key]) {
        const gOld = safeStr(deckToGroup[key])
        groupId = idMap.get(gOld) ?? stableUuidFromString(`legacy-group:${gOld}`)
      }

      const t = nowTs()
      decks.push({
        id: deckId,
        groupId,
        name: deckName,
        origin: 'user',
        createdAt: t,
        updatedAt: t,
      })

      cardList.forEach((item, ci) => {
        if (!isObj(item) && typeof item !== 'string') return
        let phrase = ''
        let meaning = ''
        let example: string | undefined
        let oldCardId = `${deckOldId}:card:${ci}`

        if (typeof item === 'string') {
          const parts = item.split(/[|=\t]/)
          phrase = safeStr(parts[0])
          meaning = safeStr(parts[1], phrase)
        } else {
          phrase = safeStr(item.phrase ?? item.front ?? item.word ?? item.en)
          meaning = safeStr(item.meaning ?? item.back ?? item.vi ?? item.def)
          example = item.example ? safeStr(item.example) : undefined
          if (item.id) oldCardId = safeStr(item.id, oldCardId)
        }
        if (!phrase || !meaning) return
        const cardId = stableUuidFromString(`legacy-card:${oldCardId}`)
        idMap.set(oldCardId, cardId)
        cards.push({
          id: cardId,
          deckId,
          phrase,
          meaning,
          example,
          sourceKind: 'import',
          createdAt: t,
          updatedAt: t,
        })
      })
    }
  } else {
    warnings.push('Không tìm thấy flashcardCustomDecks_v6 trong backup legacy.')
  }

  const cardDeckMap = new Map(cards.map(c => [c.id, c.deckId]))
  const srsRows: unknown[] = []
  if (isObj(srsRaw)) {
    for (const [cardKey, state] of Object.entries(srsRaw)) {
      if (isObj(state)) srsRows.push({ ...state, cardKey })
      else if (typeof state === 'number') srsRows.push({ cardKey, dueAt: state })
    }
  } else if (Array.isArray(srsRaw)) {
    srsRows.push(...srsRaw)
  }

  const srs = mapElectronSrs(srsRows, idMap, cardDeckMap)
  let idRemaps = 0
  for (const [a, b] of idMap) if (a !== b) idRemaps += 1

  if (decks.length === 0) warnings.push('Không có bộ thẻ nào trong backup legacy.')

  return { groups, decks, cards, srs, idRemaps, warnings }
}

export function detectMigrateSource(raw: unknown): {
  ok: boolean
  type: string
  reason?: string
} {
  if (!isObj(raw)) return { ok: false, type: 'unknown', reason: 'JSON không hợp lệ.' }

  // Web backup
  if (
    (raw.app === 'RyanEnglish' || raw.app === 'Ryan English') &&
    raw.data &&
    isObj(raw.data) &&
    [1, 2, 3, 4].includes(Number(raw.version))
  ) {
    return { ok: true, type: 'web-backup' }
  }

  if (
    raw.type === 'ryan-vocabulary-export-v2' ||
    (isObj(raw.vocabularyDB) && isObj((raw.vocabularyDB as Record<string, unknown>).stores))
  ) {
    return { ok: true, type: 'electron-vocab-v2' }
  }

  if (
    isObj(raw.storage) &&
    (raw.storage.flashcardCustomDecks_v6 ||
      raw.storage.flashcardSrs_v1 ||
      raw.storage.flashcardGroups_v6)
  ) {
    return { ok: true, type: 'legacy-quick-backup' }
  }

  if (
    raw.flashcardCustomDecks_v6 ||
    raw.flashcardSrs_v1 ||
    raw.flashcardGroups_v6
  ) {
    return { ok: true, type: 'legacy-storage-map' }
  }

  return {
    ok: false,
    type: 'unknown',
    reason:
      'Không nhận ra format. Hỗ trợ: backup Web (RyanEnglish), Electron Vocabulary v2, hoặc legacy flashcardCustomDecks_v6.',
  }
}

/**
 * Import Electron / legacy vocab into Dexie (merge via bulkPut).
 * Does not clear existing web data.
 */
export async function importElectronOrLegacyBackup(
  file: File,
): Promise<MigrateResult> {
  const text = await file.text()
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('File JSON không hợp lệ.')
  }

  const detected = detectMigrateSource(raw)
  if (!detected.ok) throw new Error(detected.reason || 'Format không hỗ trợ.')

  const warnings: string[] = []
  let groups: Group[] = []
  let decks: Deck[] = []
  let cards: Card[] = []
  let srs: Srs[] = []
  let idRemaps = 0
  let source = detected.type

  if (detected.type === 'web-backup') {
    // Delegate shape already handled by importBackup — re-implement minimal merge here
    // for a single entry path from Settings "Migrate from Electron"
    const data = (raw as { data: Record<string, unknown> }).data
    await db.transaction(
      'rw',
      [db.groups, db.decks, db.cards, db.srs, db.writingDocs, db.mindmaps, db.translationSets, db.lessons, db.readingExams, db.listeningExams, db.notebookEntries],
      async () => {
        for (const [table, rows] of Object.entries(data)) {
          if (!Array.isArray(rows) || rows.length === 0) continue
          if (db.table(table)) {
            await db.table(table).bulkPut(rows)
          }
        }
      },
    )
    const counts: Record<string, number> = {}
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v) && v.length) counts[k] = v.length
    }
    return { source: 'web-backup', counts, warnings: [], idRemaps: 0 }
  }

  if (detected.type === 'electron-vocab-v2') {
    const stores = isObj(raw) && isObj(raw.vocabularyDB)
      ? ((raw.vocabularyDB as { stores?: Record<string, unknown> }).stores ?? {})
      : {}
    const mapped = fromVocabStores(stores)
    groups = mapped.groups
    decks = mapped.decks
    cards = mapped.cards
    srs = mapped.srs
    idRemaps = mapped.idRemaps
    source = 'electron-vocab-v2'
  } else if (detected.type === 'legacy-quick-backup') {
    const storage = isObj(raw) && isObj(raw.storage) ? raw.storage : {}
    const mapped = fromLegacyStorageMap(storage)
    groups = mapped.groups
    decks = mapped.decks
    cards = mapped.cards
    srs = mapped.srs
    idRemaps = mapped.idRemaps
    warnings.push(...mapped.warnings)
    source = 'legacy-quick-backup'
  } else {
    const mapped = fromLegacyStorageMap(isObj(raw) ? raw : {})
    groups = mapped.groups
    decks = mapped.decks
    cards = mapped.cards
    srs = mapped.srs
    idRemaps = mapped.idRemaps
    warnings.push(...mapped.warnings)
    source = 'legacy-storage-map'
  }

  await db.transaction('rw', [db.groups, db.decks, db.cards, db.srs], async () => {
    if (groups.length) await db.groups.bulkPut(groups)
    if (decks.length) await db.decks.bulkPut(decks)
    if (cards.length) await db.cards.bulkPut(cards)
    if (srs.length) await db.srs.bulkPut(srs)
  })

  return {
    source,
    counts: {
      groups: groups.length,
      decks: decks.length,
      cards: cards.length,
      srs: srs.length,
    },
    warnings,
    idRemaps,
  }
}

export function formatMigrateSummary(result: MigrateResult): string {
  const parts = Object.entries(result.counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} ${k}`)
  const base = parts.length ? parts.join(', ') : 'Không có dữ liệu'
  const extra =
    result.idRemaps > 0
      ? ` · ${result.idRemaps} id đã chuẩn hóa UUID để sync cloud`
      : ''
  return `${base}${extra}`
}

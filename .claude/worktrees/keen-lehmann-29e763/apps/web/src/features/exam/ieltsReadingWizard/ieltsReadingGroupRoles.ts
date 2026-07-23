/**
 * Nhận dạng role nhóm câu (Match / TFNG / YNNG / Choose TWO / Summary…)
 * không phụ thuộc thứ tự paste — dùng cho infer template + reorder về SAMPLE.
 */
import type { ReadingImportPartJson, ReadingImportQuestionGroupJson } from '../importReadingManualUtils'
import type { IeltsReadingWizardTemplateKind } from './ieltsReadingWizardConfig'

export type ReadingGroupRole =
  | 'matching-paragraph'
  | 'matching-headings'
  | 'matching-features'
  | 'tfng'
  | 'ynng'
  | 'choose-two'
  | 'multiple-choice'
  | 'summary-bank'
  | 'summary-gap'
  | 'notes'
  | 'table'
  | 'sentence'
  | 'gap'
  | 'unknown'

type GroupLike = {
  type?: string
  instruction?: string
  note?: string
  noteTable?: { headers?: string[] } | null
  notePassage?: unknown[] | null
  wordBank?: Array<{ id?: string; label?: string }> | null
  features?: unknown[] | null
  headings?: unknown[] | null
  paragraphLetters?: unknown[] | null
  imageFile?: string
  questions?: Array<{
    number?: number
    type?: string
    options?: Array<{ id?: string; label?: string }>
    prompt?: string
  }>
}

function instr(g: GroupLike): string {
  return typeof g.instruction === 'string' ? g.instruction : ''
}

export function isChooseTwoGroup(g: GroupLike): boolean {
  if (/choose two|which two|choose\s*2\b/i.test(instr(g))) return true
  const qs = g.questions ?? []
  if (qs.length === 2) {
    const o0 = qs[0]?.options?.length ?? 0
    const o1 = qs[1]?.options?.length ?? 0
    if (o0 >= 4 && o0 === o1 && o0 <= 6) {
      // Cùng set options + instruction/prompt gợi ý
      const p = `${qs[0]?.prompt ?? ''} ${qs[1]?.prompt ?? ''}`
      if (/first answer|second answer|which two|choose two/i.test(p)) return true
      if (/choose two/i.test(instr(g))) return true
    }
  }
  return false
}

/** Role ngữ nghĩa của 1 question group (từ type + instruction + layout). */
export function classifyReadingGroupRole(g: GroupLike): ReadingGroupRole {
  const t = String(g.type ?? '').toLowerCase()
  const i = instr(g)

  if (g.noteTable?.headers?.length || /complete the table|table below/i.test(i)) return 'table'
  if (g.notePassage?.length || /complete the notes|notes below/i.test(i)) return 'notes'

  if (t === 'matching-paragraph' || /which (paragraph|section) contains|which section contains/i.test(i)) {
    return 'matching-paragraph'
  }
  if (t === 'matching-headings' || /choose the correct heading|list of headings/i.test(i)) {
    return 'matching-headings'
  }
  if (t === 'matching-features' || (g.features?.length && /match|which.*person|list of/i.test(i))) {
    return 'matching-features'
  }
  if (g.features?.length && t !== 'multiple-choice') return 'matching-features'
  if (g.headings?.length) return 'matching-headings'
  if (g.paragraphLetters?.length && t !== 'matching-headings') return 'matching-paragraph'

  if (t === 'ynng' || /yes if the statement|claims of the writer|views of the writer/i.test(i)) {
    return 'ynng'
  }
  if (t === 'tfng' || /true if the statement|FALSE if the statement|true-false/i.test(i)) {
    return 'tfng'
  }
  // TFNG vs YNNG khi type generic
  if (/not given/i.test(i) && /true if|false if/i.test(i) && !/yes if/i.test(i)) return 'tfng'
  if (/not given/i.test(i) && /yes if|no if/i.test(i)) return 'ynng'

  if (isChooseTwoGroup(g)) return 'choose-two'

  const hasBank = (g.wordBank?.length ?? 0) >= 3
    || /list of (phrases|words|options)/i.test(i)
    || /using the list of/i.test(i)
  if (
    t === 'summary-completion'
    || (hasBank && /summary|complete the sentences with|ending/i.test(i))
  ) {
    return hasBank || t === 'summary-completion' ? 'summary-bank' : 'summary-gap'
  }
  if (hasBank) return 'summary-bank'

  if (
    t === 'sentence-completion'
    || /complete the sentences|complete each sentence/i.test(i)
  ) {
    return 'sentence'
  }

  if (
    (t === 'gap-fill' || t === 'summary-completion')
    && g.note
    && /\d{1,2}_{2,}/.test(g.note)
    && /summary/i.test(i)
  ) {
    return hasBank ? 'summary-bank' : 'summary-gap'
  }

  if (t === 'multiple-choice') return 'multiple-choice'
  if (t === 'gap-fill') return 'gap'
  if (t === 'sentence-completion') return 'sentence'

  return 'unknown'
}

/** Role ổn định hơn cho multiset (gộp gap variants). */
export function normalizeRoleForSignature(role: ReadingGroupRole): string {
  switch (role) {
    case 'summary-gap':
    case 'gap':
      return 'gap'
    case 'sentence':
      return 'sentence'
    case 'summary-bank':
      return 'summary-bank'
    case 'choose-two':
      return 'choose-two'
    case 'notes':
      return 'notes'
    case 'table':
      return 'table'
    default:
      return role
  }
}

export function partRoleSignature(part: ReadingImportPartJson): string {
  return part.questionGroups.map(g => normalizeRoleForSignature(classifyReadingGroupRole(g))).join('|')
}

/** Multiset signature — bỏ qua thứ tự (sort). */
export function partRoleMultisetKey(part: ReadingImportPartJson): string {
  return part.questionGroups
    .map(g => normalizeRoleForSignature(classifyReadingGroupRole(g)))
    .sort()
    .join('+')
}

/** Map type SAMPLE → role (SAMPLE tin cậy hơn instruction). */
export function roleFromTemplateGroup(g: ReadingImportQuestionGroupJson): ReadingGroupRole {
  return classifyReadingGroupRole(g)
}

function typeCompatible(role: ReadingGroupRole, tplRole: ReadingGroupRole): boolean {
  if (role === tplRole) return true
  // AI hay nhầm
  if (role === 'gap' && (tplRole === 'summary-gap' || tplRole === 'sentence' || tplRole === 'notes' || tplRole === 'table')) {
    return true
  }
  if (role === 'summary-gap' && (tplRole === 'gap' || tplRole === 'summary-bank')) return true
  if (role === 'summary-bank' && (tplRole === 'summary-gap' || tplRole === 'gap')) return true
  if (role === 'sentence' && (tplRole === 'gap' || tplRole === 'summary-gap')) return true
  if (role === 'multiple-choice' && tplRole === 'choose-two') return true
  if (role === 'choose-two' && tplRole === 'multiple-choice') return true
  if (role === 'unknown') return true
  return false
}

function groupNumbers(g: GroupLike): number[] {
  return (g.questions ?? [])
    .map(q => q.number)
    .filter((n): n is number => typeof n === 'number' && n > 0)
}

/**
 * Điểm khớp 1 group AI với 1 slot SAMPLE (càng cao càng tốt).
 */
export function scoreGroupAgainstTemplateSlot(
  group: GroupLike,
  tpl: GroupLike,
): number {
  const role = classifyReadingGroupRole(group)
  const tplRole = classifyReadingGroupRole(tpl)
  let score = 0

  if (role === tplRole) score += 100
  else if (typeCompatible(role, tplRole)) score += 40
  else score -= 50

  const gNums = groupNumbers(group)
  const tNums = groupNumbers(tpl)
  if (gNums.length && tNums.length) {
    const set = new Set(tNums)
    const overlap = gNums.filter(n => set.has(n)).length
    score += overlap * 45
    const gMin = Math.min(...gNums)
    const gMax = Math.max(...gNums)
    const tMin = Math.min(...tNums)
    const tMax = Math.max(...tNums)
    // Cùng dải Q (Cam 27–30 vs 37–40) — tín hiệu mạnh khi xáo trộn type
    if (gMin === tMin) score += 35
    if (gMax === tMax) score += 25
    // Phạt lệch dải (YNNG 37–40 không khớp slot YNNG SAMPLE 27–30)
    const gMid = (gMin + gMax) / 2
    const tMid = (tMin + tMax) / 2
    score -= Math.abs(gMid - tMid) * 4
    if (overlap === 0 && (gMax < tMin || tMax < gMin)) score -= 60
  }

  // Instruction hints
  const gi = instr(group).toLowerCase()
  const ti = instr(tpl).toLowerCase()
  if (ti && gi) {
    if (/choose two/i.test(ti) && /choose two/i.test(gi)) score += 30
    if (/which (paragraph|section)/i.test(ti) && /which (paragraph|section)/i.test(gi)) score += 25
    if (/list of phrases|list of words/i.test(ti) && /list of phrases|list of words/i.test(gi)) score += 25
    if (/claims of the writer|views of the writer/i.test(ti) && /claims of the writer|views of the writer/i.test(gi)) {
      score += 20
    }
    if (/true if the statement/i.test(ti) && /true if the statement/i.test(gi)) score += 20
  }

  if ((tpl.wordBank?.length ?? 0) >= 3) {
    if ((group.wordBank?.length ?? 0) >= 3) score += 40
    else if (/list of/i.test(gi)) score += 20
  }
  if (tpl.notePassage?.length && group.notePassage?.length) score += 40
  if (tpl.noteTable?.headers?.length && group.noteTable?.headers?.length) score += 50
  if (tpl.headings?.length && group.headings?.length) score += 30
  if (tpl.features?.length && group.features?.length) score += 30

  // Số câu gần bằng
  const qc = group.questions?.length ?? 0
  const tc = tpl.questions?.length ?? 0
  if (qc && tc) {
    if (qc === tc) score += 20
    else score -= Math.abs(qc - tc) * 5
  }

  return score
}

/**
 * Sắp lại questionGroups AI theo thứ tự SAMPLE (khớp role + số câu).
 * Paste xáo trộn Match / TFNG / Choose TWO → reorder về đúng template.
 */
export function reorderPartGroupsToTemplate(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  const aiGroups = part.questionGroups
  const tplGroups = templatePart.questionGroups
  if (!aiGroups.length || !tplGroups.length) return part

  // Đã đúng thứ tự role? giữ nguyên
  const aiRoles = aiGroups.map(g => normalizeRoleForSignature(classifyReadingGroupRole(g)))
  const tplRoles = tplGroups.map(g => normalizeRoleForSignature(classifyReadingGroupRole(g)))
  if (
    aiGroups.length === tplGroups.length
    && aiRoles.every((r, i) => r === tplRoles[i] || typeCompatible(r as ReadingGroupRole, tplRoles[i] as ReadingGroupRole))
  ) {
    // Kiểm tra thêm overlap số câu theo index
    let ok = true
    for (let i = 0; i < tplGroups.length; i++) {
      const score = scoreGroupAgainstTemplateSlot(aiGroups[i], tplGroups[i])
      if (score < 30) {
        ok = false
        break
      }
    }
    if (ok) return part
  }

  const used = new Set<number>()
  const ordered: ReadingImportQuestionGroupJson[] = []

  for (const tpl of tplGroups) {
    let bestIdx = -1
    let bestScore = -1e9
    for (let i = 0; i < aiGroups.length; i++) {
      if (used.has(i)) continue
      const s = scoreGroupAgainstTemplateSlot(aiGroups[i], tpl)
      if (s > bestScore) {
        bestScore = s
        bestIdx = i
      }
    }
    if (bestIdx >= 0 && bestScore >= 20) {
      used.add(bestIdx)
      ordered.push(aiGroups[bestIdx])
    } else {
      // Placeholder: giữ slot bằng bản AI còn lại hoặc clone type từ template (không đủ data)
      // Lấy group chưa dùng có score cao nhất dù thấp
      let fallback = -1
      let fbScore = -1e9
      for (let i = 0; i < aiGroups.length; i++) {
        if (used.has(i)) continue
        const s = scoreGroupAgainstTemplateSlot(aiGroups[i], tpl)
        if (s > fbScore) {
          fbScore = s
          fallback = i
        }
      }
      if (fallback >= 0) {
        used.add(fallback)
        ordered.push(aiGroups[fallback])
      }
    }
  }

  // AI có nhóm thừa (không khớp SAMPLE) — append cuối để không mất data
  for (let i = 0; i < aiGroups.length; i++) {
    if (!used.has(i)) ordered.push(aiGroups[i])
  }

  if (!ordered.length) return part
  return { ...part, questionGroups: ordered }
}

/**
 * So khớp multiset role với SAMPLE known kinds.
 * Khi nhiều template cùng multiset (r3my vs r3ysm), chấm điểm assignment group↔SAMPLE.
 */
export function bestTemplateByRoleMultiset(
  part: ReadingImportPartJson,
  candidates: Array<{
    kind: IeltsReadingWizardTemplateKind
    multisetKey: string
    roleSig: string
    /** SAMPLE part — optional, để chấm assignment khi multiset trùng */
    sample?: ReadingImportPartJson
  }>,
): IeltsReadingWizardTemplateKind | null {
  const key = partRoleMultisetKey(part)
  const ordered = partRoleSignature(part)
  const exact = candidates.filter(c => c.multisetKey === key)

  const scoreCandidate = (c: (typeof candidates)[0]): number => {
    let score = 0
    if (c.roleSig === ordered) score += 80
    if (c.sample) {
      const reordered = reorderPartGroupsToTemplate(part, c.sample)
      const n = Math.min(reordered.questionGroups.length, c.sample.questionGroups.length)
      for (let i = 0; i < n; i++) {
        score += scoreGroupAgainstTemplateSlot(reordered.questionGroups[i], c.sample.questionGroups[i])
      }
      // Phạt nếu số nhóm lệch
      score -= Math.abs(reordered.questionGroups.length - c.sample.questionGroups.length) * 30
      // Bonus: dải số câu gốc (không reorder) khớp SAMPLE index — phân biệt r3my/r3ysm
      const m = Math.min(part.questionGroups.length, c.sample.questionGroups.length)
      for (let i = 0; i < m; i++) {
        const gn = groupNumbers(part.questionGroups[i])
        const tn = groupNumbers(c.sample.questionGroups[i])
        if (!gn.length || !tn.length) continue
        if (Math.min(...gn) === Math.min(...tn)) score += 40
      }
    }
    return score
  }

  if (exact.length === 1) return exact[0].kind
  if (exact.length > 1) {
    let best: { kind: IeltsReadingWizardTemplateKind; score: number } | null = null
    for (const c of exact) {
      const s = scoreCandidate(c)
      if (!best || s > best.score) best = { kind: c.kind, score: s }
    }
    return best?.kind ?? exact[0].kind
  }

  // Partial: cùng số nhóm, Jaccard roles + assignment
  const roles = part.questionGroups.map(g => normalizeRoleForSignature(classifyReadingGroupRole(g)))
  const roleSet = new Set(roles)
  let best: { kind: IeltsReadingWizardTemplateKind; score: number } | null = null
  for (const c of candidates) {
    if (c.roleSig.split('|').length !== roles.length) continue
    const cRoles = c.roleSig.split('|')
    const cSet = new Set(cRoles)
    let inter = 0
    for (const r of roleSet) if (cSet.has(r)) inter++
    const union = new Set([...roleSet, ...cSet]).size
    const jaccard = union ? inter / union : 0
    let score = jaccard * 100 + scoreCandidate(c) * 0.25
    for (const r of roles) {
      if (cRoles.includes(r)) score += 5
    }
    if (!best || score > best.score) best = { kind: c.kind, score }
  }
  if (best && best.score >= 70) return best.kind
  return null
}

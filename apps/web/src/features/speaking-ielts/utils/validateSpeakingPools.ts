import type { Part1Content, Part2Content, Part3Content, TopicGroup, Difficulty } from '../types/speakingContent'
import { TOPIC_GROUPS } from '../types/speakingContent'
import { PART1_QUESTIONS } from '../data/part1'
import { PART2_CUE_CARDS } from '../data/part2'
import { PART3_QUESTIONS } from '../data/part3'

const VALID_DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'advanced']
const PLACEHOLDER_PATTERNS = /\b(todo|tbd|example question|lorem ipsum|placeholder|fixme)\b/i

export type ValidationIssue = {
  check: string
  severity: 'error' | 'warning'
  message: string
  items?: string[]
}

function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
}

function checkUniqueIds(items: { id: string }[], label: string, issues: ValidationIssue[]) {
  const seen = new Map<string, number>()
  const dupes: string[] = []
  for (const item of items) {
    const count = seen.get(item.id) ?? 0
    if (count > 0) dupes.push(item.id)
    seen.set(item.id, count + 1)
  }
  if (dupes.length > 0) {
    issues.push({ check: 'unique-ids', severity: 'error', message: `${label}: ${dupes.length} duplicate ID(s)`, items: [...new Set(dupes)] })
  }
}

function checkNoEmptyFields(items: Record<string, unknown>[], label: string, requiredFields: string[], issues: ValidationIssue[]) {
  const empties: string[] = []
  for (const item of items) {
    for (const field of requiredFields) {
      const val = item[field]
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        empties.push(`${item.id ?? 'unknown'}.${field}`)
      }
    }
  }
  if (empties.length > 0) {
    issues.push({ check: 'no-empty-fields', severity: 'error', message: `${label}: ${empties.length} empty field(s)`, items: empties.slice(0, 20) })
  }
}

function checkQuestionEndsWithQuestionMark(items: { id: string; question?: string; cueCard?: string }[], label: string, field: 'question' | 'cueCard', issues: ValidationIssue[]) {
  const bad: string[] = []
  for (const item of items) {
    const text = item[field]
    if (text && !text.trim().endsWith('?') && field === 'question') {
      bad.push(item.id)
    }
  }
  if (bad.length > 0) {
    issues.push({ check: 'question-mark', severity: 'error', message: `${label}: ${bad.length} question(s) not ending with "?"`, items: bad.slice(0, 10) })
  }
}

function checkNoExactDuplicates(items: { id: string; question?: string; cueCard?: string }[], label: string, field: 'question' | 'cueCard', issues: ValidationIssue[]) {
  const normalized = new Map<string, string[]>()
  for (const item of items) {
    const text = item[field]
    if (!text) continue
    const key = normalizeKey(text)
    if (!normalized.has(key)) normalized.set(key, [])
    normalized.get(key)!.push(item.id)
  }
  const dupes: string[] = []
  for (const [key, ids] of normalized) {
    if (ids.length > 1) dupes.push(`${key} → ${ids.join(', ')}`)
  }
  if (dupes.length > 0) {
    issues.push({ check: 'no-exact-duplicate', severity: 'error', message: `${label}: ${dupes.length} exact duplicate question(s)`, items: dupes.slice(0, 10) })
  }
}

function checkDifficulty(items: { id: string; difficulty: string }[], label: string, issues: ValidationIssue[]) {
  const bad: string[] = []
  for (const item of items) {
    if (!VALID_DIFFICULTIES.includes(item.difficulty as Difficulty)) {
      bad.push(`${item.id}: "${item.difficulty}"`)
    }
  }
  if (bad.length > 0) {
    issues.push({ check: 'valid-difficulty', severity: 'error', message: `${label}: ${bad.length} invalid difficulty value(s)`, items: bad })
  }
}

function checkTopicGroup(items: { id: string; topicGroup: string }[], label: string, issues: ValidationIssue[]) {
  const validGroups = new Set<string>(TOPIC_GROUPS)
  const bad: string[] = []
  for (const item of items) {
    if (!validGroups.has(item.topicGroup)) {
      bad.push(`${item.id}: "${item.topicGroup}"`)
    }
  }
  if (bad.length > 0) {
    issues.push({ check: 'valid-topicGroup', severity: 'error', message: `${label}: ${bad.length} invalid topicGroup value(s)`, items: bad })
  }
}

function checkNoArrayIndexIds(items: { id: string }[], label: string, issues: ValidationIssue[]) {
  const bad: string[] = []
  for (const item of items) {
    if (/^\d+$/.test(item.id) || item.id === `${label}-0` || item.id === `${label}-1`) {
      bad.push(item.id)
    }
  }
  if (bad.length > 0) {
    issues.push({ check: 'no-array-index-id', severity: 'error', message: `${label}: ${bad.length} array-index ID(s)`, items: bad })
  }
}

function checkNoPlaceholders(items: { id: string; question?: string; cueCard?: string; title?: string }[], label: string, issues: ValidationIssue[]) {
  const bad: string[] = []
  for (const item of items) {
    const texts = [item.question, item.cueCard, item.title].filter(Boolean) as string[]
    for (const text of texts) {
      if (PLACEHOLDER_PATTERNS.test(text)) {
        bad.push(item.id)
        break
      }
    }
  }
  if (bad.length > 0) {
    issues.push({ check: 'no-placeholders', severity: 'error', message: `${label}: ${bad.length} item(s) with placeholder text`, items: bad })
  }
}

function checkTopicDistribution(items: { topicGroup: string }[], label: string, issues: ValidationIssue[]) {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item.topicGroup, (counts.get(item.topicGroup) ?? 0) + 1)
  }
  const maxAllowed = Math.ceil(items.length * 0.12)
  const over: string[] = []
  for (const [group, count] of counts) {
    if (count > maxAllowed) {
      over.push(`${group}: ${count} (max ${maxAllowed})`)
    }
  }
  if (over.length > 0) {
    issues.push({ check: 'topic-distribution', severity: 'warning', message: `${label}: ${over.length} group(s) exceed 12% limit`, items: over })
  }
}

function tokenize(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2))
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  let intersection = 0
  for (const w of a) if (b.has(w)) intersection++
  return intersection / (a.size + b.size - intersection)
}

function checkNearDuplicates(items: { id: string; question?: string; cueCard?: string }[], label: string, field: 'question' | 'cueCard'): string[] {
  const threshold = 0.75
  const dupes: string[] = []
  const tokens = items.map(item => ({ id: item.id, tokens: tokenize(item[field] ?? '') }))
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      const sim = jaccardSimilarity(tokens[i].tokens, tokens[j].tokens)
      if (sim > threshold) {
        dupes.push(`${tokens[i].id} ↔ ${tokens[j].id} (sim=${sim.toFixed(2)})`)
      }
    }
  }
  return dupes
}

export function validateSpeakingPools(): { issues: ValidationIssue[]; summary: Record<string, unknown> } {
  const issues: ValidationIssue[] = []

  // 1. Unique IDs
  checkUniqueIds(PART1_QUESTIONS, 'Part 1', issues)
  checkUniqueIds(PART2_CUE_CARDS, 'Part 2', issues)
  checkUniqueIds(PART3_QUESTIONS, 'Part 3', issues)

  // 2. Correct part numbers
  const wrongPart1 = PART1_QUESTIONS.filter(i => i.part !== 1).map(i => i.id)
  const wrongPart2 = PART2_CUE_CARDS.filter(i => i.part !== 2).map(i => i.id)
  const wrongPart3 = PART3_QUESTIONS.filter(i => i.part !== 3).map(i => i.id)
  if (wrongPart1.length) issues.push({ check: 'part-number', severity: 'error', message: `Part 1: ${wrongPart1.length} wrong part number`, items: wrongPart1 })
  if (wrongPart2.length) issues.push({ check: 'part-number', severity: 'error', message: `Part 2: ${wrongPart2.length} wrong part number`, items: wrongPart2 })
  if (wrongPart3.length) issues.push({ check: 'part-number', severity: 'error', message: `Part 3: ${wrongPart3.length} wrong part number`, items: wrongPart3 })

  // 3. No empty fields
  checkNoEmptyFields(PART1_QUESTIONS as unknown as Record<string, unknown>[], 'Part 1', ['id', 'topic', 'question', 'topicGroup', 'difficulty', 'tags', 'bandFocus'], issues)
  checkNoEmptyFields(PART2_CUE_CARDS as unknown as Record<string, unknown>[], 'Part 2', ['id', 'topic', 'title', 'cueCard', 'prompts', 'closingInstruction', 'topicGroup', 'linkedPart3Group', 'difficulty', 'tags', 'preparationSeconds', 'speakingSeconds'], issues)
  checkNoEmptyFields(PART3_QUESTIONS as unknown as Record<string, unknown>[], 'Part 3', ['id', 'topic', 'question', 'topicGroup', 'linkedPart3Group', 'difficulty', 'tags', 'bandFocus'], issues)

  // 4-6. Minimum counts
  if (PART1_QUESTIONS.length < 160) issues.push({ check: 'min-count-p1', severity: 'error', message: `Part 1: ${PART1_QUESTIONS.length} < 160` })
  if (PART2_CUE_CARDS.length < 100) issues.push({ check: 'min-count-p2', severity: 'error', message: `Part 2: ${PART2_CUE_CARDS.length} < 100` })
  if (PART3_QUESTIONS.length < 340) issues.push({ check: 'min-count-p3', severity: 'error', message: `Part 3: ${PART3_QUESTIONS.length} < 340` })

  // 7. Part 2 has exactly 4 prompts
  const badPrompts = PART2_CUE_CARDS.filter(c => !c.prompts || c.prompts.length !== 4).map(c => `${c.id}: ${c.prompts?.length ?? 0} prompts`)
  if (badPrompts.length) issues.push({ check: 'part2-prompts', severity: 'error', message: `Part 2: ${badPrompts.length} card(s) without exactly 4 prompts`, items: badPrompts })

  // 8. Every Part 2 linkedPart3Group has at least 10 Part 3 questions
  const part3ByGroup = new Map<string, number>()
  for (const q of PART3_QUESTIONS) {
    part3ByGroup.set(q.linkedPart3Group, (part3ByGroup.get(q.linkedPart3Group) ?? 0) + 1)
  }
  const missingGroups: string[] = []
  for (const card of PART2_CUE_CARDS) {
    const count = part3ByGroup.get(card.linkedPart3Group) ?? 0
    if (count < 10) missingGroups.push(`${card.id} → group "${card.linkedPart3Group}": ${count} Part 3 questions`)
  }
  if (missingGroups.length) issues.push({ check: 'part2-part3-linking', severity: 'error', message: `Part 2→3: ${missingGroups.length} card(s) with <10 linked Part 3 questions`, items: missingGroups.slice(0, 10) })

  // 9. Questions end with "?"
  checkQuestionEndsWithQuestionMark(PART1_QUESTIONS, 'Part 1', 'question', issues)
  checkQuestionEndsWithQuestionMark(PART3_QUESTIONS, 'Part 3', 'question', issues)

  // 10. No exact duplicates
  checkNoExactDuplicates(PART1_QUESTIONS, 'Part 1', 'question', issues)
  checkNoExactDuplicates(PART2_CUE_CARDS, 'Part 2', 'cueCard', issues)
  checkNoExactDuplicates(PART3_QUESTIONS, 'Part 3', 'question', issues)

  // 11. Valid difficulty
  checkDifficulty(PART1_QUESTIONS, 'Part 1', issues)
  checkDifficulty(PART2_CUE_CARDS, 'Part 2', issues)
  checkDifficulty(PART3_QUESTIONS, 'Part 3', issues)

  // 12. Valid topicGroup
  checkTopicGroup(PART1_QUESTIONS, 'Part 1', issues)
  checkTopicGroup(PART2_CUE_CARDS, 'Part 2', issues)
  checkTopicGroup(PART3_QUESTIONS, 'Part 3', issues)

  // 13. preparationSeconds = 60
  const badPrep = PART2_CUE_CARDS.filter(c => c.preparationSeconds !== 60).map(c => c.id)
  if (badPrep.length) issues.push({ check: 'preparation-seconds', severity: 'error', message: `Part 2: ${badPrep.length} card(s) with preparationSeconds !== 60`, items: badPrep })

  // 14. speakingSeconds = 120
  const badSpeak = PART2_CUE_CARDS.filter(c => c.speakingSeconds !== 120).map(c => c.id)
  if (badSpeak.length) issues.push({ check: 'speaking-seconds', severity: 'error', message: `Part 2: ${badSpeak.length} card(s) with speakingSeconds !== 120`, items: badSpeak })

  // 15. No array index IDs
  checkNoArrayIndexIds(PART1_QUESTIONS, 'Part 1', issues)
  checkNoArrayIndexIds(PART2_CUE_CARDS, 'Part 2', issues)
  checkNoArrayIndexIds(PART3_QUESTIONS, 'Part 3', issues)

  // 16. No placeholders
  checkNoPlaceholders(PART1_QUESTIONS, 'Part 1', issues)
  checkNoPlaceholders(PART2_CUE_CARDS, 'Part 2', issues)
  checkNoPlaceholders(PART3_QUESTIONS, 'Part 3', issues)

  // Topic distribution (warning, not error)
  checkTopicDistribution(PART1_QUESTIONS, 'Part 1', issues)
  checkTopicDistribution(PART2_CUE_CARDS, 'Part 2', issues)
  checkTopicDistribution(PART3_QUESTIONS, 'Part 3', issues)

  // 17. Near-duplicate check (token Jaccard similarity > 0.75)
  const nearDupes = checkNearDuplicates(PART1_QUESTIONS, 'Part 1', 'question')
  if (nearDupes.length) issues.push({ check: 'near-duplicate-p1', severity: 'error', message: `Part 1: ${nearDupes.length} near-duplicate pair(s)`, items: nearDupes.slice(0, 10) })
  const nearDupes2 = checkNearDuplicates(PART2_CUE_CARDS, 'Part 2', 'cueCard')
  if (nearDupes2.length) issues.push({ check: 'near-duplicate-p2', severity: 'error', message: `Part 2: ${nearDupes2.length} near-duplicate pair(s)`, items: nearDupes2.slice(0, 10) })
  const nearDupes3 = checkNearDuplicates(PART3_QUESTIONS, 'Part 3', 'question')
  if (nearDupes3.length) issues.push({ check: 'near-duplicate-p3', severity: 'error', message: `Part 3: ${nearDupes3.length} near-duplicate pair(s)`, items: nearDupes3.slice(0, 10) })

  const summary = {
    part1Count: PART1_QUESTIONS.length,
    part2Count: PART2_CUE_CARDS.length,
    part3Count: PART3_QUESTIONS.length,
    total: PART1_QUESTIONS.length + PART2_CUE_CARDS.length + PART3_QUESTIONS.length,
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
  }

  return { issues, summary }
}

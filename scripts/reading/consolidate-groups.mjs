/**
 * Consolidator — bước tiền xử lý CHẠY TRƯỚC pipeline template detect.
 *
 * Vấn đề: generator cũ (TID) sinh 1 group / 1 câu → triplet dài (13 phần tử ở Cam9)
 * không có template nào khớp → pipeline rơi vào fallback 63%.
 *
 * Consolidator gộp các group LIỀN KỀ khi:
 *   - cùng `type` (multiple-choice, ynng, tfng, matching-headings, ...)
 *   - dải câu liên tục (group N kết thúc số M, group N+1 bắt đầu M+1)
 *
 * KHÔNG đụng normalize, không đụng questions/answers/passageBlocks/notePassage/noteTable.
 * Chỉ gộp vỏ group + rebuild `range`.
 *
 * Các group có payload đặc biệt (features, headings, wordBank, note, notesTitle,
 * paragraphLetters) chỉ gộp khi giá trị ĐỒNG NHẤT (deepEqual); khác → giữ nguyên
 * ranh giới (an toàn hơn — thà giữ fallback còn hơn ghép sai).
 *
 * Return: { part: <consolidated>, before: <n groups>, after: <n groups> }
 */

function deepEqual(a, b) {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a), kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) if (!deepEqual(a[k], b[k])) return false
  return true
}

const SAFE_MERGE_KEYS = new Set([
  'range', 'type', 'instruction', 'questions',
  // These are group-level payloads that MUST match identically to merge:
  'features', 'headings', 'wordBank', 'note', 'notesTitle', 'paragraphLetters',
  'options', // rare at group level
])

function questionNumbers(group) {
  const nums = (group.questions || []).map(q => Number(q.number)).filter(Number.isFinite)
  return { min: Math.min(...nums), max: Math.max(...nums), all: nums }
}

function isContiguous(prev, next) {
  const p = questionNumbers(prev)
  const n = questionNumbers(next)
  if (!Number.isFinite(p.max) || !Number.isFinite(n.min)) return false
  return n.min === p.max + 1
}

function payloadsCompatible(prev, next) {
  // For each key that's NOT a "shape" key (range/type/instruction/questions),
  // require deep equality if BOTH sides have it; if only one has it,
  // the merged group can carry that payload (as long as questions numbers respect it).
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
  for (const k of keys) {
    if (k === 'range' || k === 'type' || k === 'instruction' || k === 'questions') continue
    if (!SAFE_MERGE_KEYS.has(k)) {
      // Unknown key — be safe, refuse merge if it differs
      if (!deepEqual(prev[k], next[k])) return false
      continue
    }
    const hasPrev = prev[k] !== undefined
    const hasNext = next[k] !== undefined
    if (hasPrev && hasNext && !deepEqual(prev[k], next[k])) return false
  }
  return true
}

function buildRange(mergedQuestions) {
  const { min, max } = questionNumbers({ questions: mergedQuestions })
  return `Questions ${min}–${max}`
}

function mergeTwo(prev, next) {
  const merged = { ...prev }
  // Prefer non-empty instruction from prev; fall back to next
  if (!prev.instruction && next.instruction) merged.instruction = next.instruction
  // Carry over payload keys where prev lacks but next has (they must be compatible per payloadsCompatible)
  for (const k of Object.keys(next)) {
    if (k === 'range' || k === 'type' || k === 'instruction' || k === 'questions') continue
    if (merged[k] === undefined && next[k] !== undefined) merged[k] = next[k]
  }
  merged.questions = [...(prev.questions || []), ...(next.questions || [])]
  merged.range = buildRange(merged.questions)
  return merged
}

export function consolidateGroups(part) {
  const groups = part.questionGroups || []
  if (groups.length <= 1) return { part, before: groups.length, after: groups.length }

  const out = []
  for (const g of groups) {
    if (out.length === 0) { out.push({ ...g }); continue }
    const prev = out[out.length - 1]
    const sameType = String(prev.type ?? '') === String(g.type ?? '')
    if (sameType && isContiguous(prev, g) && payloadsCompatible(prev, g)) {
      out[out.length - 1] = mergeTwo(prev, g)
    } else {
      out.push({ ...g })
    }
  }
  return {
    part: { ...part, questionGroups: out },
    before: groups.length,
    after: out.length,
  }
}

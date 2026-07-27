#!/usr/bin/env node
/**
 * Phase 3+5 — Merge AI repairs into FCE B2 Reading exam data.
 *
 * Reads:
 *   - source exam.json from Tainguyen
 *   - AI repair cache from scripts/reading/generated/fce-b2/
 *   - tmp/fce-b2-ai-repair-plan.json
 *
 * Output: merged exam object with provenance annotations.
 *
 * Merge rules (Phase 5):
 *   source valid → keep source (never overwrite valid source with AI)
 *   source missing/empty → take AI repair
 *   priority: source > deterministic repair > AI repair
 *
 * This is called from the converter pipeline.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_ROOT = path.resolve(__dirname, 'generated', 'fce-b2')

/**
 * Load AI repair cache for a given source test + part.
 * @param {number} sourceTestNumber
 * @param {number} partNumber
 * @returns {Promise<object|null>}
 */
async function loadAiRepair(sourceTestNumber, partNumber) {
  const cachePath = path.join(
    CACHE_ROOT,
    `source-test${String(sourceTestNumber).padStart(2, '0')}`,
    `part-${String(partNumber).padStart(2, '0')}.repair.json`,
  )
  try {
    return JSON.parse(await fs.readFile(cachePath, 'utf8'))
  } catch {
    return null
  }
}

/**
 * Check if a repair file contains usable AI content.
 * @param {object|null} repair
 * @returns {boolean}
 */
function hasUsableRepair(repair) {
  if (!repair) return false
  if (repair.status === 'failed' || repair.status === 'pending_ai_key') return false
  return repair.repair != null && typeof repair.repair === 'object'
}

/**
 * Apply AI repair to a passage block.
 * Merges only if passage blocks are empty.
 */
function mergePassage(existingPassage, aiRepairPassage) {
  if (!existingPassage?.length || existingPassage.every(b => !b.text?.trim())) {
    if (aiRepairPassage?.length) {
      return aiRepairPassage.map((b, i) => ({
        ...(b.label ? { label: b.label } : {}),
        text: b.text ?? '',
        _provenance: 'ai-generated',
      }))
    }
  }
  return existingPassage?.length ? existingPassage : aiRepairPassage ?? []
}

/**
 * Check if text is a placeholder (e.g., "Question 43").
 */
function isPlaceholder(text) {
  if (!text) return true
  return /^Question\s+\d+$/i.test(text.trim())
}

/**
 * Merge AI repair into a single question.
 */
function mergeQuestion(existingQ, aiQ) {
  if (!aiQ) return existingQ

  const merged = { ...existingQ }

  // Fill missing or placeholder fields from AI
  const fieldsToFill = ['prompt', 'sourceSentence', 'keyword', 'targetSentence', 'baseWord', 'features']

  for (const field of fieldsToFill) {
    if ((!merged[field] || isPlaceholder(merged[field])) && aiQ[field]) {
      merged[field] = aiQ[field]
      merged[`_${field}_provenance`] = 'ai-generated'
    }
  }

  // Options: fill if empty
  if ((!merged.options || merged.options.length === 0) && aiQ.options?.length) {
    merged.options = aiQ.options.map(o => ({
      id: o.id,
      label: o.label,
      _provenance: 'ai-generated',
    }))
  }

  // Answer: fill if missing (but mark provenance)
  if (!merged.answer && aiQ.answer) {
    merged.answer = aiQ.answer
    merged.answerConfidence = 'ai-generated'
  }
  if (!merged.explanation && aiQ.explanation) {
    merged.explanation = aiQ.explanation
  }

  return merged
}

/**
 * Check if a passage passage is valid (has content with markers).
 */
function isValidPassage(passage) {
  if (!passage?.length) return false
  return passage.some(b => (b.text ?? '').length > 50)
}

/**
 * Check if Part 1 questions are complete.
 */
function isPart1Complete(passage, questions) {
  if (!isValidPassage(passage)) return false
  for (let n = 1; n <= 8; n++) {
    if (!passage.some(b => b.text?.includes(`(${n}) .....`))) return false
  }
  return questions.every(q => q.options?.length === 4 && q.answer)
}

/**
 * Check if Part 6 has features and markers.
 */
function isPart6Complete(passage, features) {
  if (!isValidPassage(passage)) return false
  for (let n = 37; n <= 42; n++) {
    if (!passage.some(b => b.text?.includes(`(${n}) .....`))) return false
  }
  return features?.length === 7
}

/**
 * Check if Part 7 has A-D sections.
 */
function isPart7Complete(passage) {
  if (!passage?.length) return false
  const labels = passage.map(b => b.label).filter(Boolean)
  const labelStr = labels.join(',')
  if (labelStr !== 'A,B,C,D') return false
  return passage.every(b => (b.text ?? '').trim().length > 20)
}

/**
 * Main merge entry point: takes a converted part and applies AI repairs.
 *
 * @param {object} part — converted part from fce-b2-pages-to-parts
 * @param {number} sourceTestNumber
 * @param {number} appTestNumber
 * @param {object} sourcePage — original page from source exam.json
 * @returns {Promise<object>} merged part
 */
export async function mergeAiRepairs(part, sourceTestNumber, appTestNumber, sourcePage) {
  const repair = await loadAiRepair(sourceTestNumber, part.partNumber)

  if (!hasUsableRepair(repair)) {
    return part
  }

  const ai = repair.repair
  const mergedPart = { ...part }
  const provenanceFields = []

  switch (part.partNumber) {
    case 1:
    case 2:
    case 3: {
      // Merge passage (only if invalid)
      if (!isValidPassage(part.passage) && ai.passage?.length) {
        mergedPart.passage = ai.passage.map(b => ({
          text: b.text ?? '',
          _provenance: 'ai-generated',
        }))
        provenanceFields.push('passage')
      }

      // Merge questions
      mergedPart.questionGroups = part.questionGroups.map(group => ({
        ...group,
        questions: group.questions.map(q => {
          const aiQ = ai.questions?.find(aq => aq.number === q.number)
          const merged = mergeQuestion(q, aiQ)
          if (merged.answerConfidence === 'ai-generated') provenanceFields.push(`Q${q.number}_answer`)
          return merged
        }),
      }))
      break
    }

    case 4: {
      // Part 4: merge sourceSentence/keyword/targetSentence
      mergedPart.questionGroups = part.questionGroups.map(group => ({
        ...group,
        questions: group.questions.map(q => {
          const aiQ = ai.questions?.find(aq => aq.number === q.number)
          const merged = mergeQuestion(q, aiQ)
          // Rebuild prompt if we got AI data
          if (merged.sourceSentence && merged.keyword && merged.targetSentence) {
            if (!merged.prompt || merged.prompt.endsWith('->') || merged.prompt.endsWith('→')) {
              merged.prompt = `${merged.sourceSentence} ${merged.keyword} -> ${merged.targetSentence}`
            }
          }
          return merged
        }),
      }))
      break
    }

    case 5: {
      if (!isValidPassage(part.passage) && ai.passage?.length) {
        mergedPart.passage = ai.passage
      }
      mergedPart.questionGroups = part.questionGroups.map(group => ({
        ...group,
        questions: group.questions.map(q => {
          const aiQ = ai.questions?.find(aq => aq.number === q.number)
          return mergeQuestion(q, aiQ)
        }),
      }))
      break
    }

    case 6: {
      if (!isPart6Complete(part.passage, part.questionGroups[0]?.features) && ai.passage?.length) {
        mergedPart.passage = mergePassage(part.passage, ai.passage)
      }
      // Merge features (sentences A-G) if missing
      const group = { ...part.questionGroups[0] }
      if ((group.features?.length ?? 0) < 7 && ai.features?.length) {
        group.features = ai.features.map(f => ({
          id: f.id.toLowerCase(),
          name: f.name ?? '',
          _provenance: 'ai-generated',
        }))
      }
      // Merge questions
      if (group.questions) {
        group.questions = group.questions.map(q => {
          const aiQ = ai.questions?.find(aq => aq.number === q.number)
          return mergeQuestion(q, aiQ)
        })
      }
      mergedPart.questionGroups = [group]
      break
    }

    case 7: {
      if (!isPart7Complete(part.passage) && ai.passage?.length) {
        mergedPart.passage = ai.passage.map((b, i) => ({
          label: b.label || String.fromCharCode(65 + i),
          text: b.text ?? '',
          _provenance: 'ai-generated',
        }))
      }
      mergedPart.questionGroups = part.questionGroups.map(group => ({
        ...group,
        questions: group.questions.map(q => {
          const aiQ = ai.questions?.find(aq => aq.number === q.number)
          return mergeQuestion(q, aiQ)
        }),
      }))
      break
    }
  }

  // Attach provenance
  if (provenanceFields.length > 0) {
    mergedPart._aiRepairMeta = {
      appliedAt: new Date().toISOString(),
      fields: [...new Set(provenanceFields)],
    }
  }

  return mergedPart
}

/**
 * Check if a repair cache exists for the given test+part.
 */
export async function hasAiRepair(sourceTestNumber, partNumber) {
  const repair = await loadAiRepair(sourceTestNumber, partNumber)
  return hasUsableRepair(repair)
}

/**
 * Resolve status: how many parts have usable AI repairs?
 * @param {number} sourceTestNumber
 * @returns {Promise<{total: number, repaired: number}>}
 */
export async function getTestRepairStatus(sourceTestNumber) {
  let repaired = 0
  for (let pn = 1; pn <= 7; pn++) {
    if (await hasAiRepair(sourceTestNumber, pn)) repaired++
  }
  return { total: 7, repaired }
}

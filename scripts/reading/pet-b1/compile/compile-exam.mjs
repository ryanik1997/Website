/**
 * Compile a PET B1 blueprint into runtime catalog format.
 * Produces identical output to the original generator for golden samples.
 */
import { partId, questionId, range } from '../lib/ids.mjs'

const letters = 'ABCDEFGH'.split('')
const option = (id, label) => ({ id, label })
const q = (id, number, type, prompt, options = []) => ({ id, number, type, prompt, options, answerConfidence: 'key' })

/**
 * §2 DELIMITER GUARD + TECHNICAL DEBT
 * ------------------------------------------------------------------
 * The runtime (splitReferenceText in readingB1ReferenceList.ts) recovers the
 * Part 2 option title by splitting the option text at the FIRST em-dash /
 * en-dash / "- " boundary. The compiler packs "Title — Description" into the
 * single `ReadingPassageBlock.text` string, because the runtime schema forces
 * one required `text: string` field (there is no place to put separate
 * title/description fields).
 *
 * Consequence: the TITLE must never itself contain a delimiter, otherwise the
 * split fires inside the title and the title/description boundary is lost.
 * A delimiter inside the DESCRIPTION is safe — the non-greedy split stops at
 * the first boundary, so later em-dashes stay in the body.
 *
 * TECHNICAL DEBT (preferred end state): emit explicit
 * `{ id, key, label, title, description, imageSlotId, assetId, alt, media }`
 * fields and have the renderer use option.title / option.description directly
 * with no parsing. Until the runtime schema gains explicit fields, this
 * validator + the splitReferenceText runtime-contract test guard the
 * delimiter-as-data-model.
 */
const TITLE_DELIMITER_RE = /[\u2014\u2013]|-\s|-$/
function assertPart2TitlesSafe(n, options) {
  for (const o of options) {
    if (o.title && TITLE_DELIMITER_RE.test(o.title)) {
      throw new Error(
        `[pet-b1][test ${n}] Part 2 option "${o.key}" title contains a delimiter ` +
        `and would break the em-dash title/description split: "${o.title}"`,
      )
    }
  }
}



export function compilePart1(n, blueprint) {
  const cards = blueprint.part1.cards
  const items = cards.map(card => [
    card.title,
    card.text,
    card.question.stem,
    card.question.options.map(o => o.text),
    String.fromCharCode(65 + card.question.options.findIndex(o => o.key === card.question.correctOptionKey)),
  ])
  return {
    id: partId(n, 1), partNumber: 1, renderMode: 'html-css', rangeLabel: range(1, 5),
    passageTitle: 'Part 1 \u2013 Short texts',
    passage: items.map(([title, text]) => ({ text: `${title}\n${text}` })),
    questionGroups: [{ id: `${partId(n, 1)}-g0`, range: range(1, 5), instruction: 'For each question, choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: items.map((x, i) => q(questionId(n, 1, i + 1), i + 1, 'multiple-choice', x[2], x[3].map((label, j) => option(String.fromCharCode(65 + j), label)))) }],
    _answers: items.map((x, i) => [questionId(n, 1, i + 1), { answer: x[4], explanation: `The answer is supported by the ${x[0].toLowerCase()}.` }]),
  }
}

export function compilePart2(n, blueprint) {
  const bp = blueprint.part2
  // §2 guard: reject any option title that would break the em-dash split.
  assertPart2TitlesSafe(n, bp.options)
  // Format: "Title — Description" activates runtime em-dash split (no runtime change needed)
  const options = bp.options.map(o => {
    const desc = o.description || o.text
    return o.title ? `${o.title} \u2014 ${desc}` : desc
  })
  const profiles = bp.profiles.map(p => p.text)
  const answers = bp.profiles.map(p => {
    const idx = bp.options.findIndex(o => o.key === p.correctOptionKey)
    return letters[idx]
  })
  const passage = [
    { text: `The people below want to choose from ${bp.domain}. Decide which option is most suitable.` },
    ...options.map((text, i) => {
      const o = bp.options[i]
      const block = {
        label: letters[i],
        text,
        imageSlotId: o.imageSlotId ?? `${partId(n, 2)}-option-${letters[i].toLowerCase()}-image`,
        imageRequired: false,
      }
      // §6 ASSET PRESERVATION: explicit asset fields on a blueprint option pass
      // straight through to the runtime block so regeneration never drops them.
      if (o.assetId != null) block.assetId = o.assetId
      if (o.alt != null) block.alt = o.alt
      if (o.media != null) block.media = o.media
      return block
    }),
  ]
  const questions = profiles.map((text, i) => q(questionId(n, 2, i + 6), i + 6, 'matching-features', text, []))
  return {
    id: partId(n, 2), partNumber: 2, rangeLabel: range(6, 10),
    passageTitle: 'Part 2 \u2013 Matching',
    passage,
    questionGroups: [{ id: `${partId(n, 2)}-g0`, range: range(6, 10), instruction: 'For each question, choose the most suitable option.', type: 'matching-features', features: options.map((text, i) => ({ id: letters[i].toLowerCase(), name: text })), questions }],
    _answers: questions.map((x, i) => [x.id, { answer: answers[i], explanation: `Option ${answers[i]} satisfies all constraints in the profile.` }]),
  }
}

export function compilePart3(n, blueprint) {
  const bp = blueprint.part3
  const paragraphs = [...bp.paragraphs]
  paragraphs[2] = `${paragraphs[2]}${bp.buildExtension}`
  const qs = bp.questions.map((x, i) => q(questionId(n, 3, i + 11), i + 11, 'multiple-choice', x.stem, x.options.map((label, j) => option(String.fromCharCode(65 + j), label))))
  return {
    id: partId(n, 3), partNumber: 3, rangeLabel: range(11, 15),
    passageTitle: `Part 3 \u2013 ${bp.title}`,
    passage: paragraphs.map(text => ({ text })),
    questionGroups: [{ id: `${partId(n, 3)}-g0`, range: range(11, 15), instruction: 'Read the text and choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: qs }],
    _answers: qs.map((x, i) => [x.id, { answer: String.fromCharCode(65 + bp.questions[i].correctIndex), explanation: 'The answer is supported by the passage evidence.' }]),
  }
}

export function compilePart4(n, blueprint) {
  const bp = blueprint.part4
  const expandedLayout = bp.layoutParagraphs.map((text, i) => `${text} ${bp.layoutExtensions[i]} ${bp.layoutClosers[i]}`)
  const order = bp.displayOrder
  const semanticOptions = bp.options.map((o, i) => ({ key: `test${n}-part4-option-${i}`, text: o.text, correctForGap: o.correctForGap }))
  const shuffledOptions = order.map(index => semanticOptions[index])
  const labels = letters.slice(0, 8)
  const answerLabels = Array.from({ length: 5 }, (_, gapIndex) => labels[shuffledOptions.findIndex(o => o.correctForGap === 16 + gapIndex)].toLowerCase())
  const qs = Array.from({ length: 5 }, (_, i) => q(questionId(n, 4, i + 16), i + 16, 'gap-fill', `Gap ${i + 16}`, []))
  return {
    id: partId(n, 4), partNumber: 4, rangeLabel: range(16, 20),
    passageTitle: `Part 4 \u2013 ${bp.title}`,
    passage: [...expandedLayout.map(text => ({ text })), ...shuffledOptions.map((x, i) => ({ label: labels[i], text: x.text, key: x.key, correctForGap: x.correctForGap }))],
    questionGroups: [{ id: `${partId(n, 4)}-g0`, range: range(16, 20), instruction: 'Choose the sentence which fits each gap.', type: 'matching-features', features: shuffledOptions.map((x, i) => ({ id: labels[i].toLowerCase(), name: x.text, key: x.key, correctForGap: x.correctForGap })), questions: qs }],
    _answers: qs.map((x, i) => [x.id, { answer: answerLabels[i], explanation: `Sentence ${answerLabels[i].toUpperCase()} fits the reference and sequence.` }]),
  }
}

export function compilePart5(n, blueprint) {
  const bp = blueprint.part5
  let passage = `${bp.text} ${bp.extra}`
  for (const [i, spec] of bp.specs.entries()) passage = passage.replace(spec.phrase, `(${i + 21}) .....`)
  const questions = bp.specs.map((spec, i) => q(questionId(n, 5, i + 21), i + 21, 'multiple-choice', `Gap (${i + 21})`, spec.options.map((label, j) => option(String.fromCharCode(65 + j), label))))
  return {
    id: partId(n, 5), partNumber: 5, rangeLabel: range(21, 26),
    passageTitle: 'Part 5 \u2013 Multiple-choice cloze',
    passage: [{ text: passage }],
    questionGroups: [{ id: `${partId(n, 5)}-g0`, range: range(21, 26), instruction: 'For each question, choose the correct answer A, B, C or D.', type: 'multiple-choice', questions }],
    _answers: questions.map((x, i) => [x.id, { answer: String.fromCharCode(97 + bp.specs[i].correctIndex), explanation: `The answer completes gap ${i + 21} naturally.` }]),
  }
}

export function compilePart6(n, blueprint) {
  const bp = blueprint.part6
  const qs = bp.answers.map((_, i) => q(questionId(n, 6, i + 27), i + 27, 'gap-fill', `Gap ${i + 27}`, []))
  return {
    id: partId(n, 6), partNumber: 6, rangeLabel: range(27, 32),
    passageTitle: 'Part 6 \u2013 Open cloze',
    passage: [{ text: `${bp.text} ${bp.extra} ${bp.tail}` }],
    questionGroups: [{ id: `${partId(n, 6)}-g0`, range: range(27, 32), instruction: 'Write one word for each gap.', type: 'gap-fill', questions: qs }],
    _answers: qs.map((x, i) => [x.id, { answer: bp.answers[i], explanation: `Grammar target: ${bp.targets[i]}.` }]),
  }
}

export function compileExam(blueprint) {
  const n = blueprint.testNumber
  const parts = [compilePart1(n, blueprint), compilePart2(n, blueprint), compilePart3(n, blueprint), compilePart4(n, blueprint), compilePart5(n, blueprint), compilePart6(n, blueprint)]
  const answers = Object.fromEntries(parts.flatMap(p => p._answers))
  for (const part of parts) delete part._answers
  return {
    body: { id: `catalog-reading-pet-b1-test${n}`, title: `PET B1 Reading \u2013 Test ${n}`, durationMinutes: 45, bandHint: 'B1 Preliminary Reading \u2013 6 parts', examTrack: 'cambridge', cambridgeLevel: 'b1', catalogCanonical: true, parts },
    answers: { examId: `catalog-reading-pet-b1-test${n}`, version: 1, mode: 'answers-vault', answers },
  }
}

/**
 * Compile a simplified blueprint (Tests 20-24 format).
 * Uses flat items/questions arrays instead of cards/layoutParagraphs/specs.
 */
export function compileExamSimple(blueprint) {
  const n = blueprint.testNumber
  const parts = [simplePart1(n, blueprint), compilePart2(n, blueprint), simplePart3(n, blueprint), simplePart4(n, blueprint), simplePart5(n, blueprint), simplePart6(n, blueprint)]
  const answers = Object.fromEntries(parts.flatMap(p => p._answers))
  for (const part of parts) delete part._answers
  return {
    body: { id: `catalog-reading-pet-b1-test${n}`, title: `PET B1 Reading \u2013 Test ${n}`, durationMinutes: 45, bandHint: 'B1 Preliminary Reading \u2013 6 parts', examTrack: 'cambridge', cambridgeLevel: 'b1', catalogCanonical: true, parts },
    answers: { examId: `catalog-reading-pet-b1-test${n}`, version: 1, mode: 'answers-vault', answers },
  }
}

function simplePart1(n, blueprint) {
  const items = blueprint.part1.items
  return {
    id: partId(n, 1), partNumber: 1, renderMode: 'html-css', rangeLabel: range(1, 5),
    passageTitle: 'Part 1 \u2013 Short texts',
    passage: items.map(item => ({ text: `${item.title}\n${item.text}` })),
    questionGroups: [{ id: `${partId(n, 1)}-g0`, range: range(1, 5), instruction: 'For each question, choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: items.map((item, i) => q(questionId(n, 1, i + 1), i + 1, 'multiple-choice', item.question, item.options.map((label, j) => option(String.fromCharCode(65 + j), label)))) }],
    _answers: items.map((item, i) => [questionId(n, 1, i + 1), { answer: item.answer, explanation: `The answer is supported by the ${item.title.toLowerCase()}.` }]),
  }
}

function simplePart3(n, blueprint) {
  const bp = blueprint.part3
  const qs = bp.questions.map((x, i) => q(questionId(n, 3, i + 11), i + 11, 'multiple-choice', x.question, x.options.map((label, j) => option(String.fromCharCode(65 + j), label))))
  return {
    id: partId(n, 3), partNumber: 3, rangeLabel: range(11, 15),
    passageTitle: `Part 3 \u2013 ${bp.title}`,
    passage: bp.paragraphs.map(text => ({ text })),
    questionGroups: [{ id: `${partId(n, 3)}-g0`, range: range(11, 15), instruction: 'Read the text and choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: qs }],
    _answers: qs.map((x, i) => [x.id, { answer: bp.questions[i].answer, explanation: 'The answer is supported by the passage evidence.' }]),
  }
}

function simplePart4(n, blueprint) {
  const bp = blueprint.part4
  const labels = letters.slice(0, 8)
  const qs = Array.from({ length: 5 }, (_, i) => q(questionId(n, 4, i + 16), i + 16, 'gap-fill', `Gap ${i + 16}`, []))
  return {
    id: partId(n, 4), partNumber: 4, rangeLabel: range(16, 20),
    passageTitle: `Part 4 \u2013 ${bp.title}`,
    passage: [{ text: bp.text }, ...bp.options.map((text, i) => ({ label: labels[i], text }))],
    questionGroups: [{ id: `${partId(n, 4)}-g0`, range: range(16, 20), instruction: 'Choose the sentence which fits each gap.', type: 'matching-features', features: bp.options.map((text, i) => ({ id: labels[i].toLowerCase(), name: text })), questions: qs }],
    _answers: qs.map((x, i) => [x.id, { answer: bp.answers[i].toLowerCase(), explanation: `Sentence ${bp.answers[i]} fits the gap.` }]),
  }
}

function simplePart5(n, blueprint) {
  const bp = blueprint.part5
  // Part 5 is MULTIPLE-CHOICE cloze: every gap needs four options A–D.
  // Blueprint shape: { text, items: [{ correct, wrong: [w1, w2, w3] }] }.
  // (Regression guard: the old shape { text, options, answers } emitted a
  //  zero-option gap-fill and broke the structural validator — do not restore.)
  const items = bp.items
  const qs = items.map((item, i) => {
    const labels = [item.correct, ...item.wrong].map((label, j) => option(String.fromCharCode(65 + j), label))
    return q(questionId(n, 5, i + 21), i + 21, 'multiple-choice', `Gap (${i + 21})`, labels)
  })
  return {
    id: partId(n, 5), partNumber: 5, rangeLabel: range(21, 26),
    passageTitle: 'Part 5 \u2013 Multiple-choice cloze',
    passage: [{ text: bp.text }],
    questionGroups: [{ id: `${partId(n, 5)}-g0`, range: range(21, 26), instruction: 'For each question, choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: qs }],
    _answers: qs.map((x, i) => [x.id, { answer: 'A', explanation: `The answer completes gap ${i + 21} naturally.` }]),
  }
}

function simplePart6(n, blueprint) {
  const bp = blueprint.part6
  const qs = bp.answers.map((_, i) => q(questionId(n, 6, i + 27), i + 27, 'gap-fill', `Gap ${i + 27}`, []))
  return {
    id: partId(n, 6), partNumber: 6, rangeLabel: range(27, 32),
    passageTitle: 'Part 6 \u2013 Open cloze',
    passage: [{ text: bp.text }],
    questionGroups: [{ id: `${partId(n, 6)}-g0`, range: range(27, 32), instruction: 'Write one word for each gap.', type: 'gap-fill', questions: qs }],
    _answers: qs.map((x, i) => [x.id, { answer: bp.answers[i], explanation: `Grammar target: ${bp.targets[i]}.` }]),
  }
}

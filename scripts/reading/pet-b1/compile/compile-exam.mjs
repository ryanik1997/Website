/**
 * Compile a PET B1 blueprint into runtime catalog format.
 * Produces identical output to the original generator for golden samples.
 */
import { partId, questionId, range } from '../lib/ids.mjs'
import { deterministicShuffle } from '../lib/deterministic-shuffle.mjs'
import { derivePart4Answers, labelDisplayedOptions } from '../lib/answer-mapping.mjs'

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

function normalizePart2Text(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function assertPart2MatchingIsSolvable(n, bp) {
  if (bp.options.length !== 8) throw new Error(`[pet-b1][test ${n}] Part 2 requires exactly 8 options`)
  if (bp.profiles.length !== 5) throw new Error(`[pet-b1][test ${n}] Part 2 requires exactly 5 profiles`)

  const optionTexts = bp.options.map(option => normalizePart2Text(`${option.title} ${option.description ?? option.text}`))
  const profileTexts = bp.profiles.map(profile => normalizePart2Text(profile.text))
  if (new Set(optionTexts).size !== optionTexts.length) {
    throw new Error(`[pet-b1][test ${n}] Part 2 options must contain eight distinct learner-facing choices`)
  }
  if (new Set(profileTexts).size !== profileTexts.length) {
    throw new Error(`[pet-b1][test ${n}] Part 2 profiles must describe five distinct learner needs`)
  }

  const optionKeys = new Set(bp.options.map(option => option.key))
  const answerKeys = bp.profiles.map(profile => profile.correctOptionKey)
  if (answerKeys.some(key => !optionKeys.has(key))) {
    throw new Error(`[pet-b1][test ${n}] Part 2 profile references an unknown option key`)
  }
  if (new Set(answerKeys).size !== answerKeys.length) {
    throw new Error(`[pet-b1][test ${n}] Part 2 profiles must map to five unique options`)
  }
}



export function compilePart1(n, blueprint) {
  const cards = blueprint.part1.cards
  if (cards.length !== 5) throw new Error(`[pet-b1][test ${n}] Part 1 requires exactly 5 cards`)
  const items = cards.map(card => {
    const options = card.question.options.map((item, index) => typeof item === 'string'
      ? { key: `option-${index}`, text: item }
      : item)
    if (options.length < 2 || options.length > 4) {
      throw new Error(`[pet-b1][test ${n}] Part 1 card "${card.key}" requires 3-4 options, got ${options.length}`)
    }
    if (options.some(option => !option.text?.trim()) || new Set(options.map(option => option.text.trim().toLowerCase())).size !== options.length) {
      throw new Error(`[pet-b1][test ${n}] Part 1 card "${card.key}" requires distinct non-blank labelled options`)
    }
    const correctIndex = options.findIndex(option => option.key === card.question.correctOptionKey)
    if (correctIndex < 0) throw new Error(`[pet-b1][test ${n}] Part 1 card "${card.key}" has an invalid correct option key`)
    return [
      card.title,
      card.text,
      card.question.stem,
      options.map(option => option.text),
      String.fromCharCode(65 + correctIndex),
    ]
  })
  // Contract (task_3 \u00a74): 3-option cards emit A/B/C instruction; legacy 4-option cards keep A-D.
  const optCount = cards[0].question.options.length
  const instruction = optCount === 3
    ? 'For each question, choose the correct answer A, B or C.'
    : 'For each question, choose the correct answer A, B, C or D.'
  return {
    id: partId(n, 1), partNumber: 1, renderMode: 'html-css', rangeLabel: range(1, 5),
    passageTitle: 'Part 1 \u2013 Short texts',
    passage: items.map(([title, text]) => ({ text: `${title}\n${text}` })),
    questionGroups: [{ id: `${partId(n, 1)}-g0`, range: range(1, 5), instruction, type: 'multiple-choice', questions: items.map((x, i) => q(questionId(n, 1, i + 1), i + 1, 'multiple-choice', x[2], x[3].map((label, j) => option(String.fromCharCode(65 + j), label)))) }],
    _answers: items.map((x, i) => [questionId(n, 1, i + 1), { answer: x[4], explanation: cards[i].explanation ?? `The answer is supported by the ${x[0].toLowerCase()}.` }]),
  }
}

export function compilePart2(n, blueprint) {
  const bp = blueprint.part2
  // §2 guard: reject any option title that would break the em-dash split.
  assertPart2TitlesSafe(n, bp.options)
  assertPart2MatchingIsSolvable(n, bp)
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

  // Legacy canonical blueprints (outside Task 8) still use three parallel
  // layout arrays plus an explicit display order. Preserve their byte-level
  // behavior until those tests are migrated separately.
  if (!Array.isArray(bp.paragraphs)) {
    const expandedLayout = bp.layoutParagraphs.map((text, index) => `${text} ${bp.layoutExtensions[index]} ${bp.layoutClosers[index]}`)
    const semanticOptions = bp.options.map((item, index) => ({
      key: `test${n}-part4-option-${index}`,
      text: item.text,
      correctForGap: item.correctForGap,
    }))
    const shuffledOptions = bp.displayOrder.map(index => semanticOptions[index])
    const labels = letters.slice(0, 8)
    const answerLabels = Array.from({ length: 5 }, (_, gapIndex) =>
      labels[shuffledOptions.findIndex(item => item.correctForGap === 16 + gapIndex)].toLowerCase())
    const qs = Array.from({ length: 5 }, (_, index) => q(questionId(n, 4, index + 16), index + 16, 'gap-fill', `Gap ${index + 16}`, []))
    return {
      id: partId(n, 4), partNumber: 4, rangeLabel: range(16, 20),
      passageTitle: `Part 4 \u2013 ${bp.title}`,
      passage: [
        ...expandedLayout.map(text => ({ text })),
        ...shuffledOptions.map((item, index) => ({
          label: labels[index],
          text: item.text,
          key: item.key,
          correctForGap: item.correctForGap,
        })),
      ],
      questionGroups: [{
        id: `${partId(n, 4)}-g0`,
        range: range(16, 20),
        instruction: 'Choose the sentence which fits each gap.',
        type: 'matching-features',
        features: shuffledOptions.map((item, index) => ({
          id: labels[index].toLowerCase(),
          name: item.text,
          key: item.key,
          correctForGap: item.correctForGap,
        })),
        questions: qs,
      }],
      _answers: qs.map((item, index) => [item.id, {
        answer: answerLabels[index],
        explanation: `Sentence ${answerLabels[index].toUpperCase()} fits the reference and sequence.`,
      }]),
    }
  }

  if (!bp.title?.trim()) throw new Error(`[pet-b1][test ${n}] Part 4 requires an explicit title`)
  if (bp.paragraphs.length !== 5) {
    throw new Error(`[pet-b1][test ${n}] Part 4 requires exactly five structured paragraphs`)
  }
  if (!Array.isArray(bp.options) || bp.options.length !== 8) {
    throw new Error(`[pet-b1][test ${n}] Part 4 requires exactly eight sentence options`)
  }

  const expectedGaps = [16, 17, 18, 19, 20]
  const paragraphTexts = bp.paragraphs.map((paragraph, paragraphIndex) => {
    if (!Array.isArray(paragraph.segments) || paragraph.segments.length < 3) {
      throw new Error(`[pet-b1][test ${n}] Part 4 paragraph ${paragraphIndex + 1} requires text before and after its gap`)
    }
    const gaps = paragraph.segments.filter(segment => segment.type === 'gap')
    if (gaps.length !== 1 || gaps[0].questionNumber !== expectedGaps[paragraphIndex]) {
      throw new Error(`[pet-b1][test ${n}] Part 4 paragraph ${paragraphIndex + 1} must contain only gap ${expectedGaps[paragraphIndex]}`)
    }
    const gapIndex = paragraph.segments.indexOf(gaps[0])
    const before = paragraph.segments.slice(0, gapIndex).map(segment => segment.value ?? '').join(' ').trim()
    const after = paragraph.segments.slice(gapIndex + 1).map(segment => segment.value ?? '').join(' ').trim()
    if (!before || !after) {
      throw new Error(`[pet-b1][test ${n}] Part 4 gap ${expectedGaps[paragraphIndex]} requires surrounding context`)
    }
    return paragraph.segments.map(segment => segment.type === 'gap'
      ? `(${segment.questionNumber}) .....`
      : String(segment.value ?? '').trim()).join(' ').replace(/\s+/g, ' ').trim()
  })

  const semanticOptions = bp.options.map((item, index) => ({
    key: item.key ?? `test${n}-part4-option-${index}`,
    text: String(item.text ?? '').trim(),
    correctForGap: item.correctForGap ?? null,
  }))
  if (semanticOptions.some(item => !item.text) || new Set(semanticOptions.map(item => item.text.toLowerCase())).size !== 8) {
    throw new Error(`[pet-b1][test ${n}] Part 4 requires eight distinct non-blank option sentences`)
  }
  if (semanticOptions.filter(item => item.correctForGap == null).length !== 3) {
    throw new Error(`[pet-b1][test ${n}] Part 4 requires exactly three distractors`)
  }
  for (const questionNumber of expectedGaps) {
    if (semanticOptions.filter(item => item.correctForGap === questionNumber).length !== 1) {
      throw new Error(`[pet-b1][test ${n}] Part 4 requires one semantic answer for Q${questionNumber}`)
    }
  }

  const displayedOptions = labelDisplayedOptions(deterministicShuffle(
    semanticOptions,
    `catalog-reading-pet-b1-test${n}:part4`,
  ))
  const semanticAnswers = derivePart4Answers(displayedOptions, questionNumber => questionId(n, 4, questionNumber))
  const qs = expectedGaps.map(number => q(questionId(n, 4, number), number, 'gap-fill', `Gap ${number}`, []))
  const optionBlocks = displayedOptions.map(item => ({
    label: item.displayLabel.toUpperCase(),
    text: item.text,
    key: item.key,
    correctForGap: item.correctForGap,
  }))

  return {
    id: partId(n, 4), partNumber: 4, rangeLabel: range(16, 20),
    passageTitle: `Part 4 \u2013 ${bp.title}`,
    passage: [...paragraphTexts.map(text => ({ text })), ...optionBlocks],
    questionGroups: [{
      id: `${partId(n, 4)}-g0`,
      range: range(16, 20),
      instruction: 'Choose the sentence which fits each gap.',
      type: 'matching-features',
      features: displayedOptions.map(item => ({
        id: item.displayLabel,
        name: item.text,
        key: item.key,
        correctForGap: item.correctForGap,
      })),
      questions: qs,
    }],
    _answers: qs.map(item => {
      const answer = semanticAnswers[item.id]
      return [item.id, { answer, explanation: `Sentence ${answer.toUpperCase()} fits the reference and sequence.` }]
    }),
  }
}

export function compilePart5(n, blueprint) {
  const bp = blueprint.part5
  let passage = `${bp.text} ${bp.extra}`
  for (const [i, spec] of bp.specs.entries()) passage = passage.replace(spec.phrase, `(${i + 21}) .....`)
  const questions = bp.specs.map((spec, i) => {
    const labels = spec.options.map(String)
    // Contract (task_3 §11/§13): tests 36+ must have exactly 4 unique single-word options per gap.
    // Legacy tests 14-30 keep lenient behavior (their Part 5 is out of task_3 scope).
    if (n >= 36) {
      if (labels.length !== 4) throw new Error(`[pet-b1][test ${n}] Part 5 gap ${i + 21} requires exactly 4 options, got ${labels.length}`)
      if (new Set(labels.map(l => l.trim().toLowerCase())).size !== 4) throw new Error(`[pet-b1][test ${n}] Part 5 gap ${i + 21} options must be unique`)
      for (const label of labels) {
        if (!/^[a-z][a-z'-]*$/i.test(label.trim())) {
          throw new Error(`[pet-b1][test ${n}] Part 5 gap ${i + 21} option "${label}" is not a single orthographic word`)
        }
      }
    }
    return q(questionId(n, 5, i + 21), i + 21, 'multiple-choice', `Gap (${i + 21})`, labels.map((label, j) => option(String.fromCharCode(65 + j), label)))
  })
  return {
    id: partId(n, 5), partNumber: 5, rangeLabel: range(21, 26),
    passageTitle: bp.title ? `Part 5 \u2013 ${bp.title}` : 'Part 5 \u2013 Multiple-choice cloze',
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
    passageTitle: bp.title ? `Part 6 \u2013 ${bp.title}` : 'Part 6 \u2013 Open cloze',
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
  const optCount = items[0]?.options?.length
  const instruction = optCount === 3
    ? 'For each question, choose the correct answer A, B or C.'
    : 'For each question, choose the correct answer A, B, C or D.'
  return {
    id: partId(n, 1), partNumber: 1, renderMode: 'html-css', rangeLabel: range(1, 5),
    passageTitle: 'Part 1 \u2013 Short texts',
    passage: items.map(item => ({ text: `${item.title}\n${item.text}` })),
    questionGroups: [{ id: `${partId(n, 1)}-g0`, range: range(1, 5), instruction, type: 'multiple-choice', questions: items.map((item, i) => q(questionId(n, 1, i + 1), i + 1, 'multiple-choice', item.question, item.options.map((label, j) => option(String.fromCharCode(65 + j), label)))) }],
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
    passageTitle: bp.title ? `Part 5 \u2013 ${bp.title}` : 'Part 5 \u2013 Multiple-choice cloze',
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
    passageTitle: bp.title ? `Part 6 \u2013 ${bp.title}` : 'Part 6 \u2013 Open cloze',
    passage: [{ text: bp.text }],
    questionGroups: [{ id: `${partId(n, 6)}-g0`, range: range(27, 32), instruction: 'Write one word for each gap.', type: 'gap-fill', questions: qs }],
    _answers: qs.map((x, i) => [x.id, { answer: bp.answers[i], explanation: `Grammar target: ${bp.targets[i]}.` }]),
  }
}

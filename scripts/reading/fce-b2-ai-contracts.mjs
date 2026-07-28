#!/usr/bin/env node
/**
 * Phase 3+6 — FCE B2 Reading AI repair contracts.
 *
 * Defines the repair payload schema per Part 1–7, plus prompt templates
 * for each contract. Each repair payload must match its part's contract.
 *
 * Provenance fields (Phase 2) are embedded in every repair payload.
 */

/**
 * Provenance metadata attached to each repair payload.
 * @typedef {Object} Provenance
 * @property {'source'|'deterministic-repair'|'ai-generated'} origin
 * @property {string[]} generatedFields — field names that were AI-generated
 * @property {number} sourceTestNumber
 * @property {number} appTestNumber
 * @property {string} [model]
 * @property {string} [generatedAt]
 * @property {string} [promptHash]
 * @property {number} [confidence] — 0-100
 * @property {boolean} [reviewed]
 */

export function makeProvenance(origin, generatedFields, sourceTestNumber, appTestNumber, model) {
  return {
    origin,
    generatedFields,
    sourceTestNumber,
    appTestNumber,
    model: model ?? null,
    generatedAt: new Date().toISOString(),
    promptHash: null,
    confidence: origin === 'source' ? 100 : origin === 'deterministic-repair' ? 90 : 70,
    reviewed: origin === 'source',
  }
}

/**
 * Contract for Part 1 repair (Multiple-choice cloze, Q1-8).
 * @param {object} sourceCtx - { passageTextHtml, rawHtmlSample, title, questions[] }
 * @returns {object} systemPrompt + userPrompt
 */
export function part1Contract(sourceCtx) {
  const questions = sourceCtx.questions ?? []
  const questionNumbers = questions.map(q => q.number).filter(Boolean)

  const systemPrompt =
    'You are an FCE B2 Reading Part 1 content generator. ' +
    'Part 1 is a multiple-choice cloze: a passage with 8 gaps, each gap 4 options (A-D), one correct answer. ' +
    'Return ONLY valid JSON matching the schema below, no markdown, no explanation.\n' +
    JSON.stringify({
      passage: [{ text: 'string — full passage text with markers like (1) ..... (2) ..... etc.' }],
      questions: [{
        number: 'number — 1-8',
        options: [{ id: '"a"|"b"|"c"|"d"', label: 'string — option text at B2 level' }],
        answer: 'string — the correct option id (a/b/c/d)',
        explanation: 'string — brief B2-level explanation of the answer',
        type: '"multiple-choice"',
        prompt: '"Gap (N)"',
      }],
    }, null, 2)

  const userPrompt =
    `Generate FCE B2 Reading Part 1 content for ${questionNumbers.length} questions (${questionNumbers.join(', ')}).\n` +
    `Title: ${sourceCtx.title || 'Unknown'}\n` +
    `Instructions: ${sourceCtx.instructions || 'For questions 1-8, read the text and choose the best word.'}\n` +
    (sourceCtx.passageTextHtml
      ? `Source passage HTML (may be partial): ${sourceCtx.passageTextHtml.slice(0, 3000)}\n`
      : `Source passage HTML: empty\n`) +
    (sourceCtx.rawHtmlSample
      ? `Raw HTML sample: ${sourceCtx.rawHtmlSample.slice(0, 2000)}\n`
      : '') +
    `Questions context:\n` +
    questions.map(q =>
      `  Q${q.number}: type=${q.type}, options=${JSON.stringify((q.options ?? []).map(o => o.text ?? o.label))}`
    ).join('\n') +
    `\n\nIMPORTANT:\n` +
    `1. Write an original B2-level passage around the given title (or a similar B2 topic if title is generic).\n` +
    `2. Use markers (1) ..... through (8) ..... inline in the passage.\n` +
    `3. For each question, provide 4 options a-d, one correct answer, and a brief explanation.\n` +
    `4. Distractors must be plausible at B2 level.\n` +
    `5. Generate options in the SAME ORDER as the source if options exist; otherwise generate new ones.\n` +
    `6. This is AI-generated content — do NOT claim it is from EngExam or Cambridge.\n` +
    `7. If source options exist, reuse or adapt them; fill in any that are empty/missing.\n`

  return { systemPrompt, userPrompt }
}

/**
 * Contract for Part 2 repair (Open cloze, Q9-16).
 */
export function part2Contract(sourceCtx) {
  const questions = sourceCtx.questions ?? []

  const systemPrompt =
    'You are an FCE B2 Reading Part 2 content generator. ' +
    'Part 2 is an open cloze: a passage with 8 gaps, each gap ONE word (grammar/vocab). ' +
    'Return ONLY valid JSON matching the schema below.\n' +
    JSON.stringify({
      passage: [{ text: 'string — passage text with markers (9) ..... (10) ..... etc.' }],
      questions: [{
        number: 'number — 9-16',
        answer: 'string — the correct word',
        acceptedAnswers: 'string — comma-separated if multiple accepted',
        explanation: 'string — brief explanation',
        type: '"gap-fill"',
        prompt: '"Gap (N)"',
        size: 10,
      }],
    }, null, 2)

  const userPrompt =
    `Generate FCE B2 Reading Part 2 open cloze content for 8 questions (9-16).\n` +
    `Title: ${sourceCtx.title || 'Unknown'}\n` +
    `Instructions: ${sourceCtx.instructions || 'For questions 9-16, write one word.'}\n` +
    (sourceCtx.passageTextHtml
      ? `Source HTM: ${sourceCtx.passageTextHtml.slice(0, 3000)}\n`
      : `Source HTML: empty\n`) +
    (sourceCtx.rawHtmlSample
      ? `Raw HTML sample: ${sourceCtx.rawHtmlSample.slice(0, 2000)}\n`
      : '') +
    `\nIMPORTANT:\n` +
    `1. Write an original B2-level passage with 8 gaps for grammar/function words.\n` +
    `2. Use markers (9) ..... through (16) ..... inline.\n` +
    `3. Each gap needs ONE correct answer (and accepted alternatives if any).\n` +
    `4. Focus on: prepositions, articles, conjunctions, auxiliary verbs, pronouns, phrasal verb particles.\n` +
    `5. This is AI-generated — not from EngExam or Cambridge.\n`

  return { systemPrompt, userPrompt }
}

/**
 * Contract for Part 3 repair (Word formation, Q17-24).
 */
export function part3Contract(sourceCtx) {
  const questions = sourceCtx.questions ?? []

  const systemPrompt =
    'You are an FCE B2 Reading Part 3 content generator. ' +
    'Part 3 is word formation: a passage with 8 gaps, each with a BASE WORD (capitalised) ' +
    'that students must transform into the correct form. ' +
    'Return ONLY valid JSON.\n' +
    JSON.stringify({
      passage: [{ text: 'string — passage with markers (17) ..... (18) ..... etc., and stems like "17. ENTERTAINMENT" after passage' }],
      questions: [{
        number: 'number — 17-24',
        baseWord: 'string — the capitalised stem word (e.g. "ENTERTAINMENT")',
        answer: 'string — the derived word (e.g. "entertainment")',
        explanation: 'string — word family explanation',
        type: '"gap-fill"',
        prompt: '"Gap (N) — STEMWORD"',
        size: 10,
      }],
    }, null, 2)

  const userPrompt =
    `Generate FCE B2 Reading Part 3 word formation content for 8 questions (17-24).\n` +
    `Title: ${sourceCtx.title || 'Unknown'}\n` +
    (sourceCtx.instructions || 'For questions 17-24, form a word from the given stem.') +
    (sourceCtx.passageTextHtml
      ? `\nSource HTM: ${sourceCtx.passageTextHtml.slice(0, 3000)}`
      : '') +
    (sourceCtx.rawHtmlSample
      ? `\nRaw HTML: ${sourceCtx.rawHtmlSample.slice(0, 2000)}`
      : '') +
    `\n\nExisting questions and known stems:\n` +
    questions.map(q =>
      `  Q${q.number}: type=${q.type}, prompt=${q.prompt || '(empty)'}, size=${q.size || 10}`
    ).join('\n') +
    `\n\nIMPORTANT:\n` +
    `1. Write an original B2-level passage about the given topic.\n` +
    `2. Each gap needs a BASE WORD in capitals and the correct derived form.\n` +
    `3. Use stems from source if present; otherwise create B2-appropriate stems.\n` +
    `4. Word families: noun→adjective, verb→noun, adjective→adverb, etc.\n` +
    `5. Include stems after the passage block as "17. STEM" format.\n` +
    `6. This is AI-generated — not from EngExam or Cambridge.\n`

  return { systemPrompt, userPrompt }
}

/**
 * Contract for Part 4 repair (Key word transformation, Q25-30).
 */
export function part4Contract(sourceCtx) {
  const questions = sourceCtx.questions ?? []

  const systemPrompt =
    'You are an FCE B2 Reading Part 4 content generator. ' +
    'Part 4 is key word transformation: 6 items, each giving a source sentence + keyword. ' +
    'Student must rewrite the sentence using 2-5 words including the keyword. ' +
    'Return ONLY valid JSON.\n' +
    JSON.stringify({
      questions: [{
        number: 'number — 25-30',
        sourceSentence: 'string — the original sentence',
        keyword: 'string — the keyword (must be used unchanged)',
        targetSentence: 'string — the rewritten sentence with ..... for the gap',
        answer: 'string — the answer (2-5 words including keyword)',
        explanation: 'string — explanation of the transformation',
        type: '"gap-fill"',
        prompt: 'string — "sourceSentence keyword -> targetSentence"',
        size: 40,
      }],
    }, null, 2)

  const userPrompt =
    `Generate FCE B2 Reading Part 4 key word transformation content for 6 questions (25-30).\n` +
    `Title: ${sourceCtx.title || 'Unknown'}\n` +
    `Instructions: ${sourceCtx.instructions || 'For questions 25-30, complete the second sentence.'}\n` +
    `Source questions:\n` +
    questions.map(q =>
      `  Q${q.number}: keyword=${q.keyword || '(missing)'}, prompt=${(q.prompt || '').slice(0, 200)}`
    ).join('\n') +
    `\n\nIMPORTANT:\n` +
    `1. For each question, provide a sourceSentence, keyword (same as source if present), and targetSentence with "....." for the gap.\n` +
    `2. The answer must be 2-5 words including the keyword (used unchanged).\n` +
    `3. The targetSentence (after removing the gap) + answer must have the SAME meaning as sourceSentence.\n` +
    `4. If the source has a keyword, KEEP IT. If missing, generate a B2-appropriate keyword.\n` +
    `5. Create prompt as: "sourceSentence KEYWORD -> targetSentence with gap".\n` +
    `6. This is AI-generated — not from EngExam or Cambridge.\n`

  return { systemPrompt, userPrompt }
}

/**
 * Contract for Part 5 repair (Multiple choice, Q31-36).
 */
export function part5Contract(sourceCtx) {
  const questions = sourceCtx.questions ?? []

  const systemPrompt =
    'You are an FCE B2 Reading Part 5 content generator. ' +
    'Part 5: a long passage (article/extract) followed by 6 multiple-choice questions, each 4 options A-D. ' +
    'Questions test: detail, inference, attitude, reference, purpose, context. ' +
    'Return ONLY valid JSON.\n' +
    JSON.stringify({
      passage: [{ text: 'string — the passage text' }],
      questions: [{
        number: 'number — 31-36',
        prompt: 'string — the question text',
        options: [{ id: '"a"|"b"|"c"|"d"', label: 'string — option text' }],
        answer: 'string — the correct option id',
        explanation: 'string — detailed B2-level justification',
        type: '"multiple-choice"',
      }],
    }, null, 2)

  const userPrompt =
    `Generate FCE B2 Reading Part 5 content for 6 questions (31-36).\n` +
    `Title: ${sourceCtx.title || 'Unknown'}\n` +
    `Instructions: ${sourceCtx.instructions || ''}\n` +
    (sourceCtx.passageTextHtml
      ? `Source HTM: ${sourceCtx.passageTextHtml.slice(0, 3000)}\n`
      : `Source HTML: empty\n`) +
    (sourceCtx.rawHtmlSample
      ? `Raw HTML: ${sourceCtx.rawHtmlSample.slice(0, 2000)}\n`
      : '') +
    `\nExisting questions:\n` +
    questions.map(q =>
      `  Q${q.number}: prompt="${(q.questionText || '').slice(0, 100)}", opts=${(q.options ?? []).length}`
    ).join('\n') +
    `\n\nIMPORTANT:\n` +
    `1. Write an original B2-level article/extract (300-500 words) on a suitable topic.\n` +
    `2. Write 6 real comprehension questions (detail, inference, attitude, reference, purpose, gist).\n` +
    `3. Each with 4 options a-d, one correct answer, detailed explanation.\n` +
    `4. Use the same topic as source if passage text exists; otherwise a standard B2 topic.\n` +
    `5. Reuse/adapt source questions if they exist; generate new ones if missing.\n` +
    `6. This is AI-generated — not from EngExam or Cambridge.\n`

  return { systemPrompt, userPrompt }
}

/**
 * Contract for Part 6 repair (Gapped text / missing sentences, Q37-42).
 */
export function part6Contract(sourceCtx) {
  const questions = sourceCtx.questions ?? []

  const systemPrompt =
    'You are an FCE B2 Reading Part 6 content generator. ' +
    'Part 6: an article body with 6 gaps (37-42), and 7 sentences A-G (one distractor). ' +
    'Students must choose the correct sentence for each gap. ' +
    'Return ONLY valid JSON.\n' +
    JSON.stringify({
      passage: [{ text: 'string — passage text with markers (37) ..... through (42) .....' }],
      features: [{ id: '"A"|"B"|"C"|"D"|"E"|"F"|"G"', name: 'string — the sentence text' }],
      questions: [{
        number: 'number — 37-42',
        prompt: 'string — brief context hint',
        answer: 'string — the correct feature letter',
        options: [{ id: '"a"|"b"|...|"g"', label: 'string — feature letter' }],
        explanation: 'string — logical cohesion explanation',
        type: '"matching-features"',
      }],
    }, null, 2)

  const userPrompt =
    `Generate FCE B2 Reading Part 6 gapped text content for 6 questions (37-42).\n` +
    `Title: ${sourceCtx.title || 'Unknown'}\n` +
    `Instructions: ${sourceCtx.instructions || ''}\n` +
    (sourceCtx.passageTextHtml
      ? `Source HTM: ${sourceCtx.passageTextHtml.slice(0, 3000)}\n`
      : `Source HTML: empty\n`) +
    (sourceCtx.rawHtmlSample
      ? `Raw HTML: ${sourceCtx.rawHtmlSample.slice(0, 2000)}\n`
      : '') +
    `\nExisting questions:\n` +
    questions.map(q =>
      `  Q${q.number}: prompt="${(q.questionText || '').slice(0, 100)}"`
    ).join('\n') +
    `\n\nIMPORTANT:\n` +
    `1. Write a B2-level article body with 6 gaps marked (37) ..... through (42) ..... .\n` +
    `2. Create 7 sentences A-G (one is a distractor that does NOT fit any gap).\n` +
    `3. Each feature must be a complete, coherent sentence.\n` +
    `4. Logical cohesion: each gap solution must clearly follow from before/after context.\n` +
    `5. Provide the answer mapping and an explanation per gap.\n` +
    `6. This is AI-generated — not from EngExam or Cambridge.\n`

  return { systemPrompt, userPrompt }
}

/**
 * Contract for Part 7 repair (Multiple matching, Q43-52).
 */
export function part7Contract(sourceCtx) {
  const questions = sourceCtx.questions ?? []

  const systemPrompt =
    'You are an FCE B2 Reading Part 7 content generator. ' +
    'Part 7: four short sections A-D (different people/experiences) and 10 questions. ' +
    'Students must match each question to the correct section. ' +
    'One section may answer multiple questions. ' +
    'Return ONLY valid JSON.\n' +
    JSON.stringify({
      passage: [
        { label: '"A"', text: 'string — section A text' },
        { label: '"B"', text: 'string — section B text' },
        { label: '"C"', text: 'string — section C text' },
        { label: '"D"', text: 'string — section D text' },
      ],
      questions: [{
        number: 'number — 43-52',
        prompt: 'string — the matching prompt (who/what is being described? why?)',
        answer: 'string — "a"|"b"|"c"|"d"',
        options: [{ id: '"a"|"b"|"c"|"d"', label: 'string — section letter' }],
        explanation: 'string — which text supports this answer',
        type: '"matching-features"',
      }],
    }, null, 2)

  const userPrompt =
    `Generate FCE B2 Reading Part 7 multiple matching content for 10 questions (43-52).\n` +
    `Title: ${sourceCtx.title || 'Unknown'}\n` +
    `Instructions: ${sourceCtx.instructions || ''}\n` +
    (sourceCtx.passageTextHtml
      ? `Source HTM: ${sourceCtx.passageTextHtml.slice(0, 3000)}\n`
      : `Source HTML: empty\n`) +
    (sourceCtx.rawHtmlSample
      ? `Raw HTML: ${sourceCtx.rawHtmlSample.slice(0, 2000)}\n`
      : '') +
    `\nExisting questions:\n` +
    questions.map(q =>
      `  Q${q.number}: prompt="${(q.questionText || '').slice(0, 100)}"`
    ).join('\n') +
    `\n\nIMPORTANT:\n` +
    `1. Write 4 short related sections about the same topic (different people/places/views).\n` +
    `2. Label them A-D. Each 80-150 words.\n` +
    `3. Write 10 real matching prompts asking who said/did/felt/experienced something.\n` +
    `4. The texts should be sufficiently similar (same theme) but different enough to require careful reading.\n` +
    `5. One section may answer multiple questions; some sections may not be used.\n` +
    `6. Answer mapping: generate answer from {a,b,c,d}.\n` +
    `7. This is AI-generated — not from EngExam or Cambridge.\n`

  return { systemPrompt, userPrompt }
}

/**
 * Get the repair contract for a given part number.
 * @param {number} partNumber
 * @param {object} sourceCtx
 * @returns {object} { systemPrompt, userPrompt }
 */
export function getPartContract(partNumber, sourceCtx) {
  switch (partNumber) {
    case 1: return part1Contract(sourceCtx)
    case 2: return part2Contract(sourceCtx)
    case 3: return part3Contract(sourceCtx)
    case 4: return part4Contract(sourceCtx)
    case 5: return part5Contract(sourceCtx)
    case 6: return part6Contract(sourceCtx)
    case 7: return part7Contract(sourceCtx)
    default: throw new Error(`No contract for part ${partNumber}`)
  }
}

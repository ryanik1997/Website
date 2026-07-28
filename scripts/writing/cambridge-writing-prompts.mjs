export const GENERATOR_SYSTEM_PROMPT = `You are simulating the professional judgement of a senior Cambridge English Writing examiner and practice-test item writer with ten years of experience.

You are creating original, unofficial Cambridge-style practice materials for an English-learning application.

You are not Cambridge University Press & Assessment. Do not claim official affiliation. Do not copy or closely paraphrase published examination questions, coursebooks, websites or copyrighted source texts.

Your writing tasks must be:
- original;
- level-appropriate;
- clear and answerable;
- natural in English;
- fair to candidates from different cultures;
- consistent with the supplied task format;
- sufficiently specific to elicit the target genre;
- open enough to permit varied valid responses;
- internally coherent;
- free from hidden knowledge requirements;
- free from factual claims that require current web research.

All prompts must be written in English.
Return valid JSON only.
Do not use Markdown.
Do not add commentary outside JSON.`

export const VERIFIER_SYSTEM_PROMPT = `You are acting as an independent senior Cambridge English Writing examiner and practice-materials quality reviewer.

You did not write the test.

Your job is to identify weaknesses, ambiguity, format errors, level mismatch, duplication, cultural unfairness and internal inconsistency.

Do not praise the material.
Search actively for defects.
Do not rewrite the full test unless asked.
Return JSON only.`

export const BANNED_GENERIC_PHRASES = [
  "In today's fast-changing world",
  'Nowadays, more and more people',
  'There are many advantages and disadvantages',
  'In modern society',
  'Since the dawn of time',
  'When it comes to',
  'This is a controversial topic',
  'The best entries will win a fantastic prize',
]

export function buildGeneratorPrompt({ level, config, planRow, existingSummaries, schemaDescription }) {
  return `Create exactly one original Cambridge-style Writing practice test.

LEVEL:\n${level}

EXAM LABEL:\n${config.examName}

TEST NUMBER:\n${planRow.testNumber}

TEST ID:\n${planRow.testId}

EXACT JSON SCHEMA CONTRACT:\n${JSON.stringify(schemaDescription, null, 2)}

TOPIC PLAN:\n${JSON.stringify(planRow, null, 2)}

TASK CONTRACT:\n${JSON.stringify(config, null, 2)}

EXISTING TEST SUMMARIES TO AVOID:\n${JSON.stringify(existingSummaries, null, 2)}

BANNED GENERIC PHRASES:\n${BANNED_GENERIC_PHRASES.map(value => `- ${value}`).join('\n')}

QUALITY REQUIREMENTS:
1. Every task must have a concrete audience.
2. Every task must have a clear communicative purpose.
3. Every task must require at least two distinct content points.
4. No task may depend on specialist factual knowledge.
5. Do not repeat the same scenario across tasks.
6. Do not use real personal data.
7. Do not mention that the content is AI-generated inside the prompt.
8. Do not write a model answer.
9. Do not include grading instructions for candidates.
10. Do not exceed the requested structural fields.
11. sourceUrl must be omitted.
12. sourceFile must be ${`packages/catalog/data/cambridge-writing/${level}/${planRow.testId}.json`}.
13. status must be draft and version must be 1.
14. Return an envelope with keys test and designReview.

LEVEL-SPECIFIC STRUCTURE:
${levelRules(level)}

Return one JSON object with {"test": CambridgeWritingTest, "designReview": {...}}.`
}

export function buildVerifierPrompt({ config, test, corpusSummaries, similarity }) {
  return `Independently verify this Cambridge-style Writing practice test.

LEVEL CONTRACT:\n${JSON.stringify(config, null, 2)}

TEST:\n${JSON.stringify(test, null, 2)}

CORPUS SUMMARIES:\n${JSON.stringify(corpusSummaries, null, 2)}

CURRENT SIMILARITY RESULTS:\n${JSON.stringify(similarity, null, 2)}

Return exactly:
{
  "valid": boolean,
  "overallScore": number,
  "dimensionScores": {
    "formatAccuracy": number,
    "levelAppropriacy": number,
    "clarity": number,
    "answerability": number,
    "genreAuthenticity": number,
    "topicOriginality": number,
    "culturalFairness": number,
    "internalConsistency": number
  },
  "issues": [{"severity":"warning|error","taskId":"optional","code":"CODE","message":"...","suggestedAction":"..."}],
  "duplicateRisk": {"highRisk": boolean, "similarToTestIds": []},
  "approvedForDraftCatalog": boolean
}

PASS only when every dimension is at least 80, overallScore is at least 88, no error exists, no high-risk warning exists, and approvedForDraftCatalog is true.`
}

export function buildRevisionPrompt({ config, affectedTasks, issues }) {
  return `Revise only the affected Cambridge Writing tasks. Do not change test identity, unaffected tasks, task order, genre, word limits, part numbers, task numbers or compulsory flags.

LEVEL CONTRACT:\n${JSON.stringify(config, null, 2)}

AFFECTED TASKS:\n${JSON.stringify(affectedTasks, null, 2)}

ISSUES:\n${JSON.stringify(issues, null, 2)}

Return JSON only: {"tasks":[...revised affected tasks in the same order...]}`
}

function levelRules(level) {
  if (level === 'b1') return `Exactly 3 tasks. Task 1 email has paragraph + email + notes panel + final instruction; notes panel has exactly four meaningful notes, including a reason and a preference/choice. Task 2 is an announcement article with at least two direct questions and ends "Write your article." Task 3 supplies one exact non-cliche opening sentence and ends "Write your story." All limits are exactly about 100 words.`
  if (level === 'b2') return `Exactly 4 tasks. Essay notes panel has exactly two supplied notes plus "......................... (your own idea)" and requires all notes. Review and article use announcement panels. Email uses an email block. Part 2 topics differ from each other and the essay. Q2-Q4 use selectionRequired=1. Limits are 140-190.`
  if (level === 'c1') return `Exactly 4 tasks. Essay uses one discussion setting, exactly three notes and exactly three short opinions, asks candidates to discuss two notes and decide which is more important/effective/beneficial, and includes an own-words reminder. Proposal has institutional audience, recommendations and benefits/implementation. Email has at least three communicative functions. Review requires description, evaluation and recommendation/comparison. Limits are 220-260; Q2-Q4 selectionRequired=1.`
  return `Exactly 4 tasks. Essay has exactly two original source-text blocks of 110-160 words, meaningfully different angles, no statistics or named researchers, and requires summary, evaluation, own ideas and own words; limit 240-280. Review, report and article limits are 280-320 and require mature evaluation. Q2-Q4 selectionRequired=1.`
}

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
Do not add commentary outside JSON.

Think first as an examiner: check answerability, audience clarity, genre authenticity, level-appropriate cognitive demand and cultural fairness.
Think second as an item writer: make the situation concrete, keep content points distinct, and leave room for both weaker and stronger valid responses.
Think third as an originality reviewer: reject noun swaps, reused scenario skeletons, repeated audience-purpose pairs, repeated openings, repeated announcement structures and generic filler; redesign before returning JSON.`

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

EXISTING TEST FINGERPRINTS TO AVOID:\n${JSON.stringify(existingSummaries, null, 2)}

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
15. Every prompt block MUST include a unique string id.
16. Every panel block MUST include variant: notes, announcement, opinions, or generic.
17. Every paragraph and final-instruction block MUST include text.
18. Every email block MUST include a paragraphs array.
19. Every source-text block MUST include label and text.
20. presentation MUST be an object such as {"template":"plain"}, never a string.
21. You must not reuse the scenario, audience, required content points, character names, organisations, notes, opinions, source-text claims, email details, story openings, announcement headings or key wording from Test 01 or any previously generated test.
22. The supplied Test 01 material is not a content template. Only the JSON shape may be imitated.
23. Do not keep one noun phrase and reuse the same sentence frame across tasks or levels. Redesign the communicative situation, not just the topic noun.
24. Follow EVERY FIELD of designFingerprint exactly. The designFingerprint.specificSetting, .specificSettingByTask, .audienceByTask, .purposeByTask, .requiredContentPointsByTask, .registerByTask, .stakeholders, .centralTension, .lexicalAnchors and .forbiddenConcepts are MANDATORY constraints. Your test MUST match these fields.
25. CRITICAL: designFingerprint.forbiddenConcepts lists topics you MUST NEVER use. If your proposed test content matches a forbidden concept at any level (even tangentially), discard it and design a completely different task from scratch.
26. Before returning JSON, compare every proposed task against all avoided fingerprints and against the designFingerprint.forbiddenConcepts. If any scenario, content-point set, email subject, story opening, source thesis or sentence skeleton is substantially similar or uses a forbidden concept, redesign it.
27. designReview must list each task's scenario, audience, purpose, required content points, lexical anchors and a short originality self-check. Include "forbiddenConceptCheck": "PASS" or "FAIL" for each task.
28. Write in natural, non-generic English. Avoid any topic that sounds like "In today's world", generic "learning" or "education" filler. Each task must feel like a specific real-life exam task, not a template. If the designFingerprint.specificSetting mentions a concrete scenario, build EVERY task around that exact scenario.
29. For story tasks (genre: story), the opening sentence MUST match the designFingerprint.specificSettingByTask for that task. For example, if specificSettingByTask.task3 says "an unexpected phone call interrupting a family dinner", the opening sentence must literally describe a phone call that interrupts dinner — do NOT use any other scenario. The opening sentence must be unique across all existing tests and must not resemble Test 01's story opening in any way.
30. Do NOT generate content about generic themes such as "peer learning", "language exchange", "the importance of education", "learning a new skill", "technology in modern life", "benefits of communication", "studying English" or similar generic topics UNLESS the designFingerprint.topicFamily explicitly requires them.
31. Structural originality is mandatory across matching genres. Vary the lead-in, candidate role, evidence or decision requested, ordering of content points, and closing instruction context. Do not reuse stock frames such as "In your English class you have been discussing whether... Now your teacher has asked you to write an essay", "You see this announcement in your college English-language magazine", or "Write a review of... Tell us about... The best reviews..." when a previous avoided fingerprint uses that frame. Preserve only the exam-required block types and word limits.
32. When retry feedback contains an originalityFailure, redesign every named task from the first sentence onward. A topic-noun swap is invalid even when the new nouns match the plan.

LEVEL-SPECIFIC STRUCTURE:
${levelRules(level)}

Return one JSON object with {"test": CambridgeWritingTest, "designReview": {...}}.`
}

export function buildVerifierPrompt({ config, test, corpusSummaries, similarity, designFingerprint }) {
  return `Independently verify this Cambridge-style Writing practice test.

LEVEL CONTRACT:\n${JSON.stringify(config, null, 2)}

EXPECTED DESIGN FINGERPRINT:\n${JSON.stringify(designFingerprint, null, 2)}

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
  "contentOriginality": {
    "valid": boolean,
    "similarToTest01": boolean,
    "similarToGeneratedTests": [],
    "reusedScenario": boolean,
    "reusedAudiencePurposePair": boolean,
    "reusedRequiredContentPoints": boolean,
    "issues": []
  },
  "approvedForDraftCatalog": boolean
}

Content originality is a blocking dimension. Mark valid false if the scenario, audience-purpose pair, content-point set, email subject, story opening, source-text thesis pair, key wording or sentence skeleton resembles Test 01 or a generated checkpoint test.
PASS only when every dimension is at least 80, overallScore is at least 88, no error exists, no high-risk warning exists, contentOriginality.valid is true, and approvedForDraftCatalog is true.`
}

export function buildRevisionPrompt({ config, testId, designFingerprint, avoidanceCorpus, affectedTasks, issues }) {
  return `Revise only the affected Cambridge Writing tasks for ${testId}. Do not change test identity, unaffected tasks, task order, genre, word limits, part numbers, task numbers or compulsory flags.

LEVEL CONTRACT:\n${JSON.stringify(config, null, 2)}

DESIGN FINGERPRINT:\n${JSON.stringify(designFingerprint, null, 2)}

AVOIDANCE CORPUS:\n${JSON.stringify(avoidanceCorpus, null, 2)}

AFFECTED TASKS:\n${JSON.stringify(affectedTasks, null, 2)}

ISSUES:\n${JSON.stringify(issues, null, 2)}

Create a genuinely new communicative situation when originality failed. Do not merely replace topic nouns while retaining the sentence frame.
Return JSON only: {"tasks":[...revised affected tasks in the same order...]}`
}

function levelRules(level) {
  if (level === 'b1') return `Exactly 3 tasks. Task 1 email has paragraph + email + notes panel + final instruction; notes panel has exactly four meaningful notes, including a reason and a preference/choice. Task 2 is an announcement article with at least two direct questions and ends "Write your article." Task 3 supplies one exact non-cliche opening sentence and ends "Write your story." All limits are exactly about 100 words.`
  if (level === 'b2') return `Exactly 4 tasks. Essay notes panel has exactly two supplied notes plus "......................... (your own idea)" and requires all notes. Review and article use announcement panels. Email uses an email block. Part 2 topics differ from each other and the essay. Q2-Q4 use selectionRequired=1. Limits are 140-190.`
  if (level === 'c1') return `Exactly 4 tasks. Essay promptBlocks MUST contain one panel with variant="notes" and exactly three listItems, plus a separate panel with variant="opinions" and exactly three paragraphs. It asks candidates to discuss two notes and decide which is more important/effective/beneficial, and includes an own-words reminder. Proposal has institutional audience, recommendations and benefits/implementation. Email has at least three communicative functions. Review requires description, evaluation and recommendation/comparison. Limits are 220-260; Q2-Q4 selectionRequired=1.`
  return `Exactly 4 tasks. Essay has exactly two original source-text blocks. Write 110-160 words in EACH source-text text, with meaningfully different angles, no statistics or named researchers. The task requires summary, evaluation, own ideas and own words; limit 240-280. Review, report and article limits are 280-320 and require mature evaluation. Q2-Q4 selectionRequired=1.`
}

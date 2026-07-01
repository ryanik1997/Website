import type { AIMessage } from './provider'

export interface CriterionScore {
  band: number
  feedback: string
}

export interface IELTSScore {
  overallBand: number
  taskAchievement: CriterionScore
  coherenceCohesion: CriterionScore
  lexicalResource: CriterionScore
  grammaticalRange: CriterionScore
  strengths: string[]
  improvements: string[]
}

/** Cambridge Writing — 4 tiêu chí chính thức (0–5), KHÔNG dùng band IELTS */
export interface CambridgeScore {
  framework: 'cambridge'
  overallScore: number
  levelLabel: string
  cambridgeScale?: number
  content: CriterionScore
  communicativeAchievement: CriterionScore
  organisation: CriterionScore
  language: CriterionScore
  strengths: string[]
  improvements: string[]
}

export type WritingScore = IELTSScore | CambridgeScore

export function isCambridgeScore(score: unknown): score is CambridgeScore {
  if (!score || typeof score !== 'object') return false
  const s = score as CambridgeScore
  return s.framework === 'cambridge'
    || (typeof s.overallScore === 'number' && !!s.content && !!s.communicativeAchievement)
}

export function isIELTSScore(score: unknown): score is IELTSScore {
  if (!score || typeof score !== 'object') return false
  if (isCambridgeScore(score)) return false
  return typeof (score as IELTSScore).overallBand === 'number'
}

const JSON_SCHEMA = `{
  "overallBand": <number 0-9, multiples of 0.5>,
  "taskAchievement":  { "band": <0-9>, "feedback": "<nhận xét 2-3 câu bằng tiếng Việt>" },
  "coherenceCohesion":{ "band": <0-9>, "feedback": "<nhận xét 2-3 câu bằng tiếng Việt>" },
  "lexicalResource":  { "band": <0-9>, "feedback": "<nhận xét 2-3 câu bằng tiếng Việt>" },
  "grammaticalRange": { "band": <0-9>, "feedback": "<nhận xét 2-3 câu bằng tiếng Việt>" },
  "strengths":    ["<điểm mạnh bằng tiếng Việt>", "<điểm mạnh>"],
  "improvements": ["<cần cải thiện bằng tiếng Việt>", "<cần cải thiện>", "<cần cải thiện>"]
}`

const SYSTEM_TASK2 = `You are a certified IELTS examiner scoring Writing Task 2. Apply the official IELTS band descriptors strictly. Write ALL feedback, strengths, and improvements in Vietnamese. Return ONLY this JSON object:\n${JSON_SCHEMA}`

const SYSTEM_TASK1 = `You are a certified IELTS examiner scoring Writing Task 1 Academic. Apply the official IELTS band descriptors strictly. Write ALL feedback, strengths, and improvements in Vietnamese. Return ONLY this JSON object:\n${JSON_SCHEMA}`

const SYSTEM_MASTER = `You are an expert English writing teacher. Analyse the text for content, structure, vocabulary, and grammar. Scores are 1–10. Write ALL feedback, strengths, and improvements in Vietnamese. Return ONLY this JSON object:\n${JSON_SCHEMA}`

export function buildIELTSTask2Prompt(taskPrompt: string, essay: string): AIMessage[] {
  return [
    { role: 'system', content: SYSTEM_TASK2 },
    { role: 'user', content: `Task prompt:\n${taskPrompt}\n\nStudent essay:\n${essay}` },
  ]
}

export function buildIELTSTask1Prompt(taskPrompt: string, report: string): AIMessage[] {
  return [
    { role: 'system', content: SYSTEM_TASK1 },
    { role: 'user', content: `Task 1 prompt:\n${taskPrompt}\n\nStudent report:\n${report}` },
  ]
}

export function buildMasterPrompt(text: string): AIMessage[] {
  return [
    { role: 'system', content: SYSTEM_MASTER },
    { role: 'user', content: text },
  ]
}

const CAMBRIDGE_JSON_SCHEMA = `{
  "framework": "cambridge",
  "overallScore": <number 0-5, multiples of 0.5 — trung bình 4 tiêu chí>,
  "levelLabel": "<A2|B1|B2|C1|C2>",
  "cambridgeScale": <number Cambridge English Scale gợi ý, VD A2: 120-140, B1: 140-160, B2: 160-180, C1: 180-200, C2: 200+>,
  "content": { "band": <0-5>, "feedback": "<nhận xét tiếng Việt>" },
  "communicativeAchievement": { "band": <0-5>, "feedback": "<nhận xét tiếng Việt>" },
  "organisation": { "band": <0-5>, "feedback": "<nhận xét tiếng Việt>" },
  "language": { "band": <0-5>, "feedback": "<nhận xét tiếng Việt>" },
  "strengths": ["<điểm mạnh tiếng Việt>"],
  "improvements": ["<cần cải thiện tiếng Việt>"]
}`

const CAMBRIDGE_LEVEL_HINT: Record<string, string> = {
  cambridge_a2: 'Cambridge A2 Key (KET) — bài ngắn (email/note ~35–45 từ)',
  cambridge_b1: 'Cambridge B1 Preliminary (PET) — ~100 từ',
  cambridge_b2: 'Cambridge B2 First (FCE) — essay/report ~140–190 từ',
  cambridge_c1: 'Cambridge C1 Advanced (CAE) — ~180–220 từ',
  cambridge_c2: 'Cambridge C2 Proficiency (CPE) — ~250–300 từ',
}

function cambridgeSystem(type: WritingDocType): string {
  const level = CAMBRIDGE_LEVEL_HINT[type] ?? 'Cambridge English Writing'
  return `You are a certified Cambridge English examiner. Score using OFFICIAL Cambridge Assessment Writing subscales (0–5 each, half marks allowed):
1. Content — all content relevant, sufficiently developed
2. Communicative Achievement — register, tone, format, target reader
3. Organisation — structure, logical flow, cohesive devices
4. Language — range and control of vocabulary and grammar

Level: ${level}

IMPORTANT: This is NOT IELTS. Do NOT use IELTS band descriptors, Task Achievement, Lexical Resource, or Grammatical Range labels.
Write ALL feedback, strengths, and improvements in Vietnamese.
Return ONLY this JSON object:\n${CAMBRIDGE_JSON_SCHEMA}`
}

export function buildCambridgePrompt(
  type: WritingDocType,
  taskPrompt: string,
  essay: string,
): AIMessage[] {
  return [
    { role: 'system', content: cambridgeSystem(type) },
    {
      role: 'user',
      content: `Task prompt:\n${taskPrompt}\n\nStudent writing:\n${essay}`,
    },
  ]
}

export function buildWritingGradePrompt(
  type: WritingDocType,
  taskPrompt: string,
  essay: string,
): AIMessage[] {
  if (type.startsWith('cambridge_')) return buildCambridgePrompt(type, taskPrompt, essay)
  if (type === 'ielts_task1') return buildIELTSTask1Prompt(taskPrompt, essay)
  if (type === 'master') return buildMasterPrompt(essay)
  return buildIELTSTask2Prompt(taskPrompt, essay)
}

// ── Writing guide (outline + sample 8.0) ─────────────────────────────────────

export interface WritingGuideOutline {
  heading: string
  bullets: string[]
}

export interface WritingGuidePhrase {
  phrase: string
  meaningVi: string
}

export interface WritingGuide {
  taskSummary: string
  imageAnalysis?: string | null
  outline: WritingGuideOutline[]
  keyPhrases: WritingGuidePhrase[]
  tips: string[]
  sampleEssay: string
  sampleNote: string
}

const GUIDE_SCHEMA = `{
  "taskSummary": "<tóm tắt đề bằng tiếng Việt, 2-4 câu>",
  "imageAnalysis": "<nếu có ảnh: mô tả chi tiết biểu đồ/bản đồ/quy trình bằng tiếng Việt; null nếu không có ảnh>",
  "outline": [
    { "heading": "<Introduction / Overview / Body 1...>", "bullets": ["<gợi ý nội dung bằng tiếng Việt>", "..."] }
  ],
  "keyPhrases": [
    { "phrase": "<cụm từ/academic English>", "meaningVi": "<nghĩa tiếng Việt>" }
  ],
  "tips": ["<mẹo viết band cao bằng tiếng Việt>", "..."],
  "sampleEssay": "<bài mẫu band 8.0 bằng tiếng Anh, đủ độ dài task>",
  "sampleNote": "<giải thích ngắn vì sao bài mẫu đạt band 8, tiếng Việt>"
}`

const CAMBRIDGE_LABELS: Record<string, string> = {
  cambridge_a2: 'Cambridge A2 (KET) Writing',
  cambridge_b1: 'Cambridge B1 (PET) Writing',
  cambridge_b2: 'Cambridge B2 (FCE) Writing',
  cambridge_c1: 'Cambridge C1 (CAE) Writing',
  cambridge_c2: 'Cambridge C2 (CPE) Writing',
}

function guideSystem(taskType: string, hasImage: boolean): string {
  const taskLabel =
    taskType === 'ielts_task1' ? 'IELTS Writing Task 1 Academic'
    : taskType === 'ielts_task2' || taskType === 'ielts' ? 'IELTS Writing Task 2'
    : CAMBRIDGE_LABELS[taskType] ?? 'English writing practice'

  const imageHint = hasImage
    ? ' Analyse the attached image carefully (chart type, trends, key figures, stages).'
    : ''

  return `You are an expert ${taskLabel} coach.${imageHint}
Help the student plan and write by providing a clear outline, useful phrases, practical tips, and a band 8.0 sample.
Write taskSummary, imageAnalysis, outline bullets, keyPhrases meanings, tips, and sampleNote in Vietnamese.
Write sampleEssay in natural academic English.
Return ONLY this JSON object:\n${GUIDE_SCHEMA}`
}

export function buildWritingGuidePrompt(
  taskType: WritingDocType,
  prompt: string,
  hasImage: boolean,
): AIMessage[] {
  const targetWords =
    taskType === 'ielts_task1' ? 'about 150 words'
    : taskType === 'ielts_task2' || taskType === 'ielts' ? 'about 250 words'
    : taskType === 'cambridge_a2' ? 'about 35–45 words'
    : taskType === 'cambridge_b1' ? 'about 100 words'
    : taskType === 'cambridge_b2' ? 'about 140–190 words'
    : taskType === 'cambridge_c1' ? 'about 180–220 words'
    : taskType === 'cambridge_c2' ? 'about 250–300 words'
    : 'appropriate length'

  const userText = `Task type: ${taskType}
Target length: ${targetWords}
Task prompt:
${prompt.trim() || '(no text prompt — rely on the image if provided)'}

Generate a practical writing guide the student can follow immediately.`

  const userContent: AIMessage['content'] = hasImage
    ? [
      { type: 'text', text: userText },
      { type: 'image_url', image_url: { url: '__IMAGE__', detail: 'high' } },
    ]
    : userText

  return [
    { role: 'system', content: guideSystem(taskType, hasImage) },
    { role: 'user', content: userContent },
  ]
}

export type WritingDocType =
  | 'ielts' | 'ielts_task1' | 'ielts_task2' | 'master'
  | 'cambridge_a2' | 'cambridge_b1' | 'cambridge_b2' | 'cambridge_c1' | 'cambridge_c2'

/** Gắn data URL vào prompt đã build (placeholder __IMAGE__) */
export function attachGuideImage(messages: AIMessage[], imageDataUrl: string): AIMessage[] {
  return messages.map(m => {
    if (m.role !== 'user' || typeof m.content === 'string') return m
    return {
      ...m,
      content: m.content.map(part =>
        part.type === 'image_url' && part.image_url.url === '__IMAGE__'
          ? { ...part, image_url: { ...part.image_url, url: imageDataUrl } }
          : part,
      ),
    }
  })
}

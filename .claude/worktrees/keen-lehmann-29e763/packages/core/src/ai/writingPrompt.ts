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

/** Gắn 1+ ảnh vào message user cuối (text → multimodal). */
export function attachImagesToUserMessage(
  messages: AIMessage[],
  imageDataUrls: string[],
  extraText?: string,
): AIMessage[] {
  if (!imageDataUrls.length) return messages
  const idx = [...messages].map((m, i) => (m.role === 'user' ? i : -1)).filter(i => i >= 0).pop()
  if (idx == null || idx < 0) return messages

  const userMsg = messages[idx]
  const baseText =
    (typeof userMsg.content === 'string'
      ? userMsg.content
      : userMsg.content.filter(p => p.type === 'text').map(p => p.text).join('\n'))
    + (extraText ? `\n\n${extraText}` : '')

  const content: AIMessage['content'] = [
    { type: 'text', text: baseText },
    ...imageDataUrls.map(url => ({
      type: 'image_url' as const,
      image_url: { url, detail: 'high' as const },
    })),
  ]

  const next = [...messages]
  next[idx] = { ...userMsg, content }
  return next
}

// ── Rewrite version 2 (side-by-side) ─────────────────────────────────────────

export interface WritingRewrite {
  rewrittenText: string
  /** Tóm tắt thay đổi chính (tiếng Việt) */
  changeSummary: string
  /** Danh sách chỉnh sửa cụ thể */
  changes: string[]
  /** Gợi ý học từ bản rewrite */
  focusNotes: string[]
}

const REWRITE_SCHEMA = `{
  "rewrittenText": "<bài viết lại đầy đủ bằng tiếng Anh — giữ ý chính, nâng band/score>",
  "changeSummary": "<tóm tắt 2-4 câu tiếng Việt về những gì đã sửa>",
  "changes": ["<thay đổi cụ thể tiếng Việt>", "..."],
  "focusNotes": ["<điểm học sinh nên học từ bản v2, tiếng Việt>", "..."]
}`

export function buildWritingRewritePrompt(
  type: WritingDocType,
  taskPrompt: string,
  originalEssay: string,
  scoreHints?: string,
): AIMessage[] {
  const framework = type.startsWith('cambridge_')
    ? 'Cambridge Writing criteria (Content, Communicative Achievement, Organisation, Language)'
    : type === 'ielts_task1'
      ? 'IELTS Writing Task 1 Academic band descriptors'
      : 'IELTS Writing Task 2 band descriptors'

  const system = `You are an expert English writing coach. Rewrite the student's essay to a stronger version (target +0.5 to +1.5 band / Cambridge mark) while keeping the same ideas and task response.
Apply ${framework}.
Write changeSummary, changes, and focusNotes in Vietnamese.
Write rewrittenText in natural English (full essay, not bullet points).
Return ONLY this JSON object:
${REWRITE_SCHEMA}`

  const hint = scoreHints?.trim()
    ? `\n\nExaminer feedback to address:\n${scoreHints.trim()}`
    : ''

  return [
    { role: 'system', content: system },
    {
      role: 'user',
      content: `Task type: ${type}
Task prompt:
${taskPrompt || '(none)'}

Student original:
${originalEssay}
${hint}

Produce version 2 (improved rewrite).`,
    },
  ]
}

// ── Chart OCR / mô tả biểu đồ Task 1 ─────────────────────────────────────────

export interface ChartDescribeResult {
  /** Mô tả chi tiết tiếng Việt (OCR + phân tích) */
  descriptionVi: string
  /** Prompt đề bài gợi ý tiếng Anh (để điền vào task prompt) */
  suggestedPromptEn: string
  chartType: string
  keyFigures: string[]
  trends: string[]
}

const CHART_DESCRIBE_SCHEMA = `{
  "descriptionVi": "<mô tả đầy đủ biểu đồ/bản đồ/quy trình bằng tiếng Việt: loại, trục, đơn vị, số liệu chính>",
  "suggestedPromptEn": "<đề IELTS Task 1 kiểu exam bằng tiếng Anh, 2-4 câu, dựa trên ảnh>",
  "chartType": "<line graph|bar chart|pie chart|table|process|map|mixed|other>",
  "keyFigures": ["<số liệu / mốc quan trọng tiếng Anh hoặc số>", "..."],
  "trends": ["<xu hướng chính tiếng Việt>", "..."]
}`

export function buildChartDescribePrompt(existingPrompt?: string): AIMessage[] {
  const extra = existingPrompt?.trim()
    ? `\nExisting text prompt (may be incomplete):\n${existingPrompt.trim()}`
    : ''

  return [
    {
      role: 'system',
      content: `You are an IELTS Writing Task 1 specialist. Analyse the attached chart/graph/map/process image.
Extract visible numbers/labels (OCR-style), identify chart type, key figures and trends.
Write descriptionVi and trends in Vietnamese. suggestedPromptEn in exam-style English.
Return ONLY this JSON object:
${CHART_DESCRIBE_SCHEMA}`,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Describe this Task 1 visual for a student preparing to write.${extra}`,
        },
        { type: 'image_url', image_url: { url: '__IMAGE__', detail: 'high' } },
      ],
    },
  ]
}

// ── Model answer (Cambridge RW / practice) ───────────────────────────────────

export interface WritingModelAnswer {
  modelAnswer: string
  bandOrLevelNote: string
  whyGood: string[]
  usefulPhrases: { phrase: string; meaningVi: string }[]
}

const MODEL_ANSWER_SCHEMA = `{
  "modelAnswer": "<bài mẫu đầy đủ tiếng Anh đúng độ dài task>",
  "bandOrLevelNote": "<ghi chú band IELTS hoặc Cambridge level bằng tiếng Việt>",
  "whyGood": ["<vì sao bài tốt, tiếng Việt>", "..."],
  "usefulPhrases": [{ "phrase": "<cụm tiếng Anh>", "meaningVi": "<nghĩa>" }]
}`

export function buildWritingModelAnswerPrompt(
  type: WritingDocType,
  taskPrompt: string,
  targetNote?: string,
): AIMessage[] {
  const target =
    targetNote
    || (type === 'ielts_task1' ? 'IELTS band 8.0 Task 1'
      : type.startsWith('cambridge_') ? `Strong pass at ${type.replace('cambridge_', '').toUpperCase()}`
        : 'IELTS band 8.0 Task 2')

  return [
    {
      role: 'system',
      content: `You write high-quality model answers for English exams (${type}).
Target: ${target}.
Write bandOrLevelNote and whyGood in Vietnamese; modelAnswer and phrases in English.
Return ONLY this JSON object:
${MODEL_ANSWER_SCHEMA}`,
    },
    {
      role: 'user',
      content: `Task type: ${type}
Task prompt:
${taskPrompt.trim() || '(see image if attached)'}

Write one complete model answer.`,
    },
  ]
}

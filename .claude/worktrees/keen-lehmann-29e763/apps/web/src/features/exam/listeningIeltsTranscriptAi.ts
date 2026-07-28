/**
 * Listening transcript theo câu bằng AI (IELTS + Cambridge A2–C2).
 * Song song nguồn import answer-key/audioscript (Cambridge).
 */
import { callAI } from '@ryan/core'
import { writingRepo } from '@ryan/db'
import {
  formatListeningAnswer,
  getListeningExamQuestions,
  type ListeningExam,
  type ListeningExamType,
} from './listeningExamData'
import { loadAiCredentials } from './examResultAiAnalyze'
import type { ListeningTranscriptMap } from './examListeningTranscriptStorage'

function examLabel(examType: ListeningExamType | undefined): string {
  switch (examType) {
    case 'ket': return 'Cambridge A2 Key (KET) Listening'
    case 'pet': return 'Cambridge B1 Preliminary (PET) Listening'
    case 'fce': return 'Cambridge B2 First (FCE) Listening'
    case 'cae': return 'Cambridge C1 Advanced (CAE) Listening'
    case 'cpe': return 'Cambridge C2 Proficiency (CPE) Listening'
    case 'ielts':
    default:
      return 'IELTS Academic Listening'
  }
}

function tryParseJsonObject(raw: string): unknown | null {
  const trimmed = raw.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fence ? fence[1] : trimmed).trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1))
  } catch {
    return null
  }
}

function parseTranscriptMap(raw: string): ListeningTranscriptMap {
  const out: ListeningTranscriptMap = {}
  const parsed = tryParseJsonObject(raw)
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const root = parsed as Record<string, unknown>
    const bag =
      (root.transcripts as Record<string, unknown> | undefined)
      ?? (root.transcript as Record<string, unknown> | undefined)
      ?? (root.scripts as Record<string, unknown> | undefined)
      ?? root
    for (const [k, v] of Object.entries(bag)) {
      const n = Number(String(k).replace(/\D/g, '')) || Number(k)
      if (!Number.isFinite(n) || n < 1 || n > 40) continue
      if (typeof v === 'string' && v.trim()) out[n] = v.trim()
      else if (v && typeof v === 'object') {
        const rec = v as Record<string, unknown>
        const t = rec.text ?? rec.transcript ?? rec.script ?? rec.dialogue
        if (typeof t === 'string' && t.trim()) out[n] = t.trim()
      }
    }
  }
  if (Object.keys(out).length) return out

  const blocks = raw.split(/(?=^#{1,3}\s*Câu\s*\d+|^Câu\s*\d+\s*[:\.])/im)
  for (const block of blocks) {
    const m = block.match(/(?:Câu|Question|Q)\s*(\d{1,2})/i)
    if (!m) continue
    const n = Number(m[1])
    const body = block.replace(/^.*?\n/, '').trim()
    if (n >= 1 && n <= 40 && body.length >= 12) out[n] = body.replace(/\s+/g, ' ').trim()
  }
  return out
}

/**
 * Gọi AI tạo đoạn transcript / dialogue ngắn cho từng câu
 * (dựa trên prompt, đáp án, part — không nghe audio thật).
 * Dùng cho IELTS và Cambridge A2–C2 (song song nguồn import).
 */
export async function generateListeningTranscriptsWithAi(
  exam: ListeningExam,
): Promise<ListeningTranscriptMap> {
  const { apiKey, provider } = await loadAiCredentials()
  const questions = getListeningExamQuestions(exam)
  const label = examLabel(exam.examType)

  const batches: typeof questions[] = []
  for (let i = 0; i < questions.length; i += 20) {
    batches.push(questions.slice(i, i + 20))
  }

  const merged: ListeningTranscriptMap = {}

  for (const batch of batches) {
    const lines = batch.map(q => {
      const part = exam.parts.find(p => (p.questions ?? []).some(x => x.id === q.id))
      const opts = (q.options ?? []).map(o => `${o.id.toUpperCase()}. ${o.label}`).join(' | ')
      const existing = q.ttsText?.trim()
      return [
        `Q${q.number}`,
        part ? `Part ${part.partNumber}${part.passageTitle ? ` — ${part.passageTitle}` : ''}` : '',
        part?.instruction ? `Instruction: ${part.instruction}` : '',
        `Type: ${q.type}`,
        `Prompt: ${[q.context, q.sectionTitle, q.prompt, q.gapLead, q.gapTrail].filter(Boolean).join(' | ')}`,
        opts ? `Options: ${opts}` : '',
        `Answer: ${formatListeningAnswer(q, q.answer)}`,
        existing ? `Existing transcript (prefer refine/keep style): ${existing.slice(0, 280)}` : '',
      ].filter(Boolean).join('\n')
    }).join('\n\n')

    const messages = [
      {
        role: 'system' as const,
        content: [
          `You reconstruct ${label} audio transcripts for review mode.`,
          'Respond with valid JSON only:',
          '{ "transcripts": { "1": "spoken English snippet…", "2": "…" } }',
          'Rules:',
          '- Keys = question numbers in this batch.',
          '- Each value = short dialogue or monologue the candidate would hear (English only).',
          '- Must support the given correct answer; do not invent a different answer.',
          '- Natural exam style for this test type; 1–5 short speaker turns or a clear monologue line.',
          '- If an existing transcript is provided, you may refine it for clarity but keep the same meaning.',
          '- Include every question number in the batch.',
        ].join('\n'),
      },
      {
        role: 'user' as const,
        content: `Exam: ${exam.title} (${label})\n\nGenerate listening transcript snippets:\n\n${lines}`,
      },
    ]

    const result = await callAI(messages, apiKey, provider, undefined, { jsonMode: true })
    const raw = result.content?.trim() ?? ''
    const tokens = (result.inputTokens ?? 0) + (result.outputTokens ?? 0)
    try {
      await writingRepo.recordUsage('exam_ai', tokens)
    } catch {
      /* non-fatal */
    }
    Object.assign(merged, parseTranscriptMap(raw))
  }

  if (!Object.keys(merged).length) {
    throw new Error('AI không trả transcript hợp lệ. Thử lại hoặc kiểm tra API key.')
  }
  return merged
}

/** @deprecated Dùng generateListeningTranscriptsWithAi */
export async function generateIeltsListeningTranscriptsWithAi(
  exam: ListeningExam,
): Promise<ListeningTranscriptMap> {
  return generateListeningTranscriptsWithAi(exam)
}

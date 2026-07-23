import { callAI, type AIProvider } from '@ryan/core'
import type { SentenceStructure } from '@ryan/db'
import { fillTemplate } from './types'

export interface StructureAiGradeResult {
  /** 0–10 */
  score: number
  /** pass if structure is used correctly (không bắt buộc khớp mẫu A/B) */
  pass: boolean
  /** Nhận xét ngắn tiếng Việt */
  feedbackVi: string
  /** Gợi ý sửa (nếu có) */
  suggestion?: string
  /** Câu đúng hơn (nếu AI viết lại) */
  improvedSentence?: string
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10))
}

function parseGradeJson(raw: string): StructureAiGradeResult {
  const fence = raw.trim().match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fence ? fence[1] : raw).trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) {
    return {
      score: 0,
      pass: false,
      feedbackVi: raw.trim().slice(0, 400) || 'AI không trả JSON hợp lệ.',
    }
  }
  try {
    const obj = JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>
    const score = clampScore(Number(obj.score ?? obj.diem ?? 0))
    const pass = Boolean(obj.pass ?? obj.ok ?? obj.correct ?? score >= 6)
    const feedbackVi = String(
      obj.feedbackVi ?? obj.feedback ?? obj.nhan_xet ?? obj.comment ?? '',
    ).trim() || (pass ? 'Câu dùng đúng cấu trúc.' : 'Cần chỉnh lại cho khớp cấu trúc.')
    const suggestion = String(obj.suggestion ?? obj.goi_y ?? '').trim() || undefined
    const improvedSentence = String(
      obj.improvedSentence ?? obj.improved ?? obj.cau_mau ?? '',
    ).trim() || undefined
    return { score, pass, feedbackVi, suggestion, improvedSentence }
  } catch {
    return {
      score: 0,
      pass: false,
      feedbackVi: 'Không đọc được phản hồi AI. Thử lại.',
    }
  }
}

/**
 * AI chấm ô A/B theo cấu trúc (chấp nhận paraphrase, không bắt khớp từng chữ mẫu).
 */
export async function gradeStructureWithAi(
  structure: SentenceStructure,
  inputA: string,
  inputB: string,
  apiKey: string,
  provider: AIProvider,
): Promise<{ result: StructureAiGradeResult; tokens: number }> {
  const a = inputA.trim()
  const b = inputB.trim()
  const userSentence = fillTemplate(structure.template, a, b)
  const sampleSentence = fillTemplate(structure.template, structure.exampleA, structure.exampleB)

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    {
      role: 'system',
      content: [
        'Bạn là giáo viên tiếng Anh. Chấm câu điền cấu trúc của học sinh.',
        'Trả về JSON thuần (không markdown):',
        '{',
        '  "score": number 0-10,',
        '  "pass": boolean,',
        '  "feedbackVi": "nhận xét ngắn tiếng Việt",',
        '  "suggestion": "gợi ý sửa (có thể rỗng)",',
        '  "improvedSentence": "câu cải thiện đầy đủ nếu cần"',
        '}',
        'Tiêu chí:',
        '- Đúng cấu trúc / template (quan trọng nhất)',
        '- Ngữ pháp, collocation tự nhiên',
        '- Ý nghĩa hợp lý (không bắt buộc giống ví dụ mẫu)',
        'pass=true nếu score >= 6 và cấu trúc đúng.',
        'score 9–10: rất tốt; 7–8: tốt; 6: đạt; <6: chưa đạt.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `Cấu trúc: ${structure.title}`,
        `Template: ${structure.template}`,
        `Mô tả: ${structure.description}`,
        `Ví dụ mẫu: ${sampleSentence}`,
        `A mẫu: ${structure.exampleA}`,
        `B mẫu: ${structure.exampleB}`,
        '',
        `Học sinh điền A: ${a}`,
        `Học sinh điền B: ${b}`,
        `Câu hoàn chỉnh: ${userSentence}`,
        '',
        'Hãy chấm JSON.',
      ].join('\n'),
    },
  ]

  const res = await callAI(messages, apiKey, provider, undefined, { jsonMode: true })
  const result = parseGradeJson(res.content ?? '')
  const tokens = (res.inputTokens ?? 0) + (res.outputTokens ?? 0)
  return { result, tokens }
}

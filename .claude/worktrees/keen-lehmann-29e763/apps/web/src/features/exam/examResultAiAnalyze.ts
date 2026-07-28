import { callAI, type AIProvider } from '@ryan/core'
import { writingRepo } from '@ryan/db'
import {
  mergeEvidences,
  parseEvidencesFromAiMarkdown,
  type ExamAiEvidence,
} from './examAiEvidence'

export interface ExamAiQuestionItem {
  number: number
  prompt: string
  userAnswer: string
  correctAnswer: string
  explanation?: string
  options?: string[]
  status: 'wrong' | 'skipped'
  /** Part / passage id for context */
  partLabel?: string
}

export async function loadAiCredentials(): Promise<{ apiKey: string; provider: AIProvider }> {
  const provider = ((await writingRepo.getSetting('ai_provider')) as AIProvider) ?? 'openai'
  const apiKey = String((await writingRepo.getSetting(`ai_key_${provider}`)) ?? '').trim()
  if (!apiKey) {
    throw new Error('Chưa có API key. Vào Cài đặt → AI để nhập key (OpenAI / DeepSeek…).')
  }
  return { apiKey, provider }
}

/** Bóc object JSON từ raw (kể cả bọc ```json). */
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

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function pickStr(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function pickQuotes(obj: Record<string, unknown>): string[] {
  const keys = [
    'đoạn_trong_đề',
    'doan_trong_de',
    'bằng_chứng',
    'bang_chung',
    'evidence',
    'quote',
    'passage_quote',
    'source',
    'clue',
  ]
  const out: string[] = []
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) out.push(v.trim())
    if (Array.isArray(v)) {
      for (const item of v) {
        if (typeof item === 'string' && item.trim()) out.push(item.trim())
      }
    }
  }
  return out
}

export interface FormattedExamAiAnalysis {
  markdown: string
  evidences: ExamAiEvidence[]
}

/**
 * Chuyển JSON AI (kiểu phân_tích / câu_N / điểm_yếu_chung…) thành markdown đọc được.
 */
export function formatExamAiAnalysisText(raw: string): FormattedExamAiAnalysis {
  const parsed = tryParseJsonObject(raw)
  if (!parsed) {
    const fence = raw.trim().match(/```(?:json|markdown|md)?\s*([\s\S]*?)```/i)
    const markdown = (fence ? fence[1] : raw).trim()
    return {
      markdown,
      evidences: parseEvidencesFromAiMarkdown(markdown),
    }
  }

  const root = asRecord(parsed)
  if (!root) {
    const markdown = raw.trim()
    return { markdown, evidences: parseEvidencesFromAiMarkdown(markdown) }
  }

  const lines: string[] = []
  const evidences: ExamAiEvidence[] = []
  const analysis = asRecord(root['phân_tích'] ?? root.phan_tich ?? root.analysis ?? root.questions ?? root)

  const questionEntries: Array<{ key: string; body: Record<string, unknown> }> = []
  if (analysis) {
    for (const [key, val] of Object.entries(analysis)) {
      const rec = asRecord(val)
      if (!rec) continue
      if (/^(câu|cau|question|q)[_\s-]?\d+/i.test(key) || rec['đáp_án_đúng'] || rec.dap_an_dung || rec.correct || rec.answer) {
        questionEntries.push({ key, body: rec })
      }
    }
  }

  questionEntries.sort((a, b) => {
    const na = Number(a.key.match(/\d+/)?.[0] ?? 0)
    const nb = Number(b.key.match(/\d+/)?.[0] ?? 0)
    return na - nb
  })

  for (const { key, body } of questionEntries) {
    const numStr = key.match(/\d+/)?.[0] ?? key
    const num = Number(numStr) || 0
    const correct = pickStr(body, ['đáp_án_đúng', 'dap_an_dung', 'correct', 'answer', 'correctAnswer', 'dap_an'])
    const meaning = pickStr(body, ['nghĩa', 'nghia', 'meaning', 'gloss'])
    const why = pickStr(body, ['giải_thích', 'giai_thich', 'why_correct', 'explanation', 'explain'])
    const mistake = pickStr(body, ['sai_lầm', 'sai_lam', 'mistake', 'why_wrong', 'error'])
    const tip = pickStr(body, ['mẹo', 'meo', 'tip', 'tips', 'strategy'])
    const quotes = pickQuotes(body)

    lines.push(`## Câu ${numStr}`)
    if (correct) lines.push(`- **Đáp án đúng:** ${correct}${meaning ? ` — ${meaning}` : ''}`)
    else if (meaning) lines.push(`- **Nghĩa:** ${meaning}`)
    for (const q of quotes) {
      lines.push(`- **Đoạn trong đề:** "${q}"`)
    }
    if (why) lines.push(`- **Vì sao đúng:** ${why}`)
    if (mistake) lines.push(`- **Vì sao sai / bỏ qua:** ${mistake}`)
    if (tip) lines.push(`- **Mẹo chọn:** ${tip}`)
    lines.push('')

    if (num && quotes.length) {
      evidences.push({ questionNumber: num, quotes })
    }
  }

  const weaknesses = root['điểm_yếu_chung'] ?? root.diem_yeu_chung ?? root.weaknesses ?? root.weak_points
  if (Array.isArray(weaknesses) && weaknesses.length) {
    lines.push('## Điểm yếu chung')
    for (const w of weaknesses) {
      if (typeof w === 'string' && w.trim()) lines.push(`- ${w.trim()}`)
    }
    lines.push('')
  }

  const plan = root['lộ_trình_ôn'] ?? root.lo_trinh_on ?? root.plan ?? root.study_plan ?? root.roadmap
  if (Array.isArray(plan) && plan.length) {
    lines.push('## Lộ trình ôn')
    for (const p of plan) {
      if (typeof p === 'string' && p.trim()) lines.push(`- ${p.trim()}`)
    }
    lines.push('')
  }

  if (!questionEntries.length && !Array.isArray(weaknesses) && !Array.isArray(plan)) {
    lines.push('## Phân tích')
    lines.push(JSON.stringify(parsed, null, 2))
  }

  const markdown = lines.join('\n').trim() || raw.trim()
  return {
    markdown,
    evidences: mergeEvidences(evidences, parseEvidencesFromAiMarkdown(markdown)),
  }
}

/**
 * Gọi AI phân tích các câu sai / bỏ qua: vì sao đúng, vì sao sai, đoạn trong đề.
 * jsonMode: false — nếu vẫn nhận JSON thì formatExamAiAnalysisText chuyển sang markdown.
 */
export async function analyzeExamAnswersWithAi(options: {
  skillLabel: 'Reading' | 'Listening'
  examTitle: string
  framework: 'ielts' | 'cambridge' | 'other'
  items: ExamAiQuestionItem[]
  /** Toàn bộ passage / transcript / note (cắt ngắn) để AI trích quote đúng */
  sourceText?: string
}): Promise<FormattedExamAiAnalysis> {
  const { skillLabel, examTitle, framework, items, sourceText } = options
  if (!items.length) {
    return {
      markdown: 'Bạn không có câu sai hoặc bỏ qua — không cần phân tích thêm. Tiếp tục luyện để giữ phong độ!',
      evidences: [],
    }
  }

  const limited = items.slice(0, 12)
  const more = items.length > limited.length
    ? `\n(Còn ${items.length - limited.length} câu khác — tóm tắt pattern chung nếu có.)`
    : ''

  const payload = limited.map(it => {
    const opts = it.options?.length
      ? `\nOptions: ${it.options.join(' | ')}`
      : ''
    return [
      `### Câu ${it.number} [${it.status === 'skipped' ? 'BỎ QUA' : 'SAI'}]`,
      it.partLabel ? `Part: ${it.partLabel}` : '',
      `Prompt: ${it.prompt}`,
      opts,
      `Bạn chọn: ${it.userAnswer || '(trống)'}`,
      `Đáp án đúng: ${it.correctAnswer}`,
      it.explanation ? `Gợi ý sẵn (nếu có): ${it.explanation}` : '',
    ].filter(Boolean).join('\n')
  }).join('\n\n')

  const frameworkLabel = framework === 'cambridge'
    ? 'Cambridge English'
    : framework === 'ielts'
      ? 'IELTS'
      : 'English exam'

  // Giới hạn context passage (~12k ký tự) để tránh token bung
  const sourceClip = (sourceText ?? '').replace(/\s+\n/g, '\n').trim().slice(0, 12000)

  const { apiKey, provider } = await loadAiCredentials()

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    {
      role: 'system',
      content: [
        `Bạn là giáo viên ${frameworkLabel} chuyên ${skillLabel}.`,
        'Viết bằng tiếng Việt, rõ ràng, khích lệ.',
        'CẤM trả JSON, CẤM object/key tiếng Việt kiểu "phân_tích", "câu_1".',
        'CHỈ viết văn bản markdown thuần túy cho học sinh đọc.',
        'Với MỖI câu dùng đúng format:',
        '## Câu N',
        '- **Đáp án đúng:** ...',
        '- **Đoạn trong đề:** "…trích NGUYÊN VĂN ngắn (8–40 từ) từ PASSAGE/NGUỒN bên dưới…"',
        '- **Vì sao đúng:** ...',
        '- **Vì sao sai / bỏ qua:** ...',
        '- **Mẹo chọn:** ...',
        'BẮT BUỘC có **Đoạn trong đề** khi có PASSAGE/NGUỒN: copy đúng chữ (không paraphrase) để app tô cam trên đề.',
        'Có thể 1–2 dòng **Đoạn trong đề** nếu cần. Nếu không có passage, viết clue từ options/prompt.',
        'Cuối bài:',
        '## Điểm yếu chung',
        '- ...',
        '## Lộ trình ôn',
        '- ...',
        'Không bịa passage; chỉ trích từ NGUỒN hoặc prompt/options/explanation.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `Bài: ${examTitle}`,
        `Kỹ năng: ${skillLabel}`,
        `Số câu cần phân tích: ${items.length}${more}`,
        '',
        sourceClip
          ? `=== NGUỒN (passage / đề — trích quote từ đây) ===\n${sourceClip}\n=== HẾT NGUỒN ===\n`
          : '(Không có full passage — trích từ prompt/options/explanation.)',
        '',
        'Dữ liệu câu:',
        payload,
        '',
        'Hãy trả lời bằng markdown tiếng Việt (không JSON). Mỗi câu sai/bỏ qua phải có **Đoạn trong đề** nếu tìm được trong NGUỒN.',
      ].join('\n'),
    },
  ]

  const result = await callAI(messages, apiKey, provider, undefined, { jsonMode: false })
  const text = result.content?.trim()
  if (!text) throw new Error('AI không trả nội dung. Thử lại hoặc đổi model/API key.')
  const tokens = (result.inputTokens ?? 0) + (result.outputTokens ?? 0)
  try {
    await writingRepo.recordUsage('exam_ai', tokens)
  } catch {
    /* usage tracking non-fatal */
  }
  return formatExamAiAnalysisText(text)
}

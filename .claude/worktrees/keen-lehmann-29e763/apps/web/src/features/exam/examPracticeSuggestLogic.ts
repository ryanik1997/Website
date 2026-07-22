import {
  CEFR_LABELS,
  practiceCefrFromScore,
  type CefrLevel,
} from '../../lib/cefr'

export type PracticeSuggestion = {
  cefr: CefrLevel
  cefrLabel: string
  summary: string
  items: Array<{
    id: string
    title: string
    description: string
    to: string
  }>
}

/**
 * Gợi ý ôn Translation + Cấu trúc câu theo kết quả exam.
 */
export function buildExamPracticeSuggestions(opts: {
  framework: 'ielts' | 'cambridge' | 'other'
  correct: number
  total: number
  band?: number
  skillLabel?: string
}): PracticeSuggestion {
  const cefr = practiceCefrFromScore({
    framework: opts.framework,
    correct: opts.correct,
    total: opts.total,
    band: opts.band,
  })
  const pct = opts.total > 0 ? Math.round((opts.correct / opts.total) * 100) : 0

  const summary =
    opts.framework === 'ielts' && opts.band != null
      ? `Band ~${opts.band.toFixed(1)} → nên ôn mức ${CEFR_LABELS[cefr]} (dịch + cấu trúc câu).`
      : `Đúng ${pct}% → gợi ý luyện ${CEFR_LABELS[cefr]}.`

  const items: PracticeSuggestion['items'] = [
    {
      id: 'translation',
      title: 'Dịch câu (Translation)',
      description: `Bộ câu gắn CEFR ${cefr} — collocation & essay phrases`,
      to: `/app/writing/translate?cefr=${cefr}`,
    },
    {
      id: 'structure',
      title: 'Cấu trúc câu',
      description: `Mẫu câu ${cefr}: although / so that / the more…`,
      to: `/app/sentence-structure?cefr=${cefr}`,
    },
  ]

  if (opts.skillLabel === 'Reading' || opts.skillLabel === 'Listening') {
    items.push({
      id: 'mindmap',
      title: 'MindMap chủ đề IELTS',
      description: 'Environment, Education, Technology… — mở rộng vocab',
      to: '/app/mindmap',
    })
  }

  return {
    cefr,
    cefrLabel: CEFR_LABELS[cefr],
    summary,
    items,
  }
}

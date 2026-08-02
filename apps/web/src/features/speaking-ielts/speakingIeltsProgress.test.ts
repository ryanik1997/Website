import { describe, expect, it } from 'vitest'
import { completedIeltsHistory, streakDays } from './speakingIeltsProgress'
import type { SpeakingHistory } from '../speaking-ai/speakingAiApi'

const make = (date: string, mode = 'IELTS_PART_1', turns = 1): SpeakingHistory => ({ conversation: { id: date, title: 'x', level: 'B1', topic: 'x', mode, started_at: `${date}T10:00:00Z`, speaking_messages: [] }, turns: Array.from({ length: turns }, () => ({ conversationId: date, transcript: 'x', reply: 'x', correction: { original: 'x', corrected: 'x', natural: 'x', explanation: 'x' }, vocabulary: [], followUpQuestion: '', usedSeconds: 10, dailyLimitSeconds: null, unlimited: true, retentionDays: 30 })) })

describe('Speaking IELTS progress', () => {
  it('counts only completed IELTS sessions in the current week', () => {
    expect(completedIeltsHistory([make('2026-08-03'), make('2026-08-03', 'SHADOWING'), make('2026-07-20')], new Date('2026-08-05'))).toHaveLength(1)
  })
  it('calculates unique consecutive days', () => {
    expect(streakDays([make('2026-08-05'), make('2026-08-04'), make('2026-08-04')], new Date('2026-08-05'))).toBe(2)
  })
})

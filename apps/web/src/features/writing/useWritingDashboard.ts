import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'
import type { CriterionScore, WritingScore } from '@ryan/core'
import { isCambridgeScore, isIELTSScore } from '@ryan/core'

export interface CriteriaAvg {
  key: string
  label: string
  avg: number
}

export interface RankedInsight {
  text: string
  count: number
}

export interface BandPoint {
  at: number
  band: number
  label: string
  /** Số lần chấm trong ngày (trend theo ngày) */
  count?: number
}

export interface CalendarDay {
  dateKey: string
  label: string
  /** 0 = không chấm; >0 = điểm TB trong ngày */
  avgBand: number
  count: number
  /** weekday 0=CN … 6=T7 (local) */
  weekday: number
}

export interface WritingDashboardData {
  totalGradings: number
  /** Lần chấm trong 30 ngày */
  gradingsLast30: number
  totalDocs: number
  avgBand: number
  avgBandLast30: number
  criteriaAvgs: CriteriaAvg[]
  weakest: CriteriaAvg | null
  strongest: CriteriaAvg | null
  /** Xu hướng theo từng lần chấm (gần đây) */
  bandTrend: BandPoint[]
  /** Điểm TB mỗi ngày trong 30 ngày (có gap = 0) */
  dailyTrend30: BandPoint[]
  /** Lưới lịch 30 ngày */
  calendar30: CalendarDay[]
  commonErrors: RankedInsight[]
  strengths: RankedInsight[]
  errorBankItems: { title: string; count: number }[]
}

const IELTS_CRITERIA: CriteriaAvg[] = [
  { key: 'taskAchievement', label: 'Task Achievement', avg: 0 },
  { key: 'coherenceCohesion', label: 'Coherence & Cohesion', avg: 0 },
  { key: 'lexicalResource', label: 'Lexical Resource', avg: 0 },
  { key: 'grammaticalRange', label: 'Grammatical Range', avg: 0 },
]

const CAMBRIDGE_CRITERIA: CriteriaAvg[] = [
  { key: 'content', label: 'Content', avg: 0 },
  { key: 'communicativeAchievement', label: 'Communicative Achievement', avg: 0 },
  { key: 'organisation', label: 'Organisation', avg: 0 },
  { key: 'language', label: 'Language', avg: 0 },
]

function normKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function rankItems(items: string[]): RankedInsight[] {
  const map = new Map<string, { text: string; count: number }>()
  for (const raw of items) {
    const text = raw.trim()
    if (!text) continue
    const key = normKey(text)
    const prev = map.get(key)
    if (prev) prev.count++
    else map.set(key, { text, count: 1 })
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 10)
}

function parseScore(raw: unknown): WritingScore | null {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value) as unknown
    } catch {
      return null
    }
  }
  if (!value || typeof value !== 'object') return null
  if (isCambridgeScore(value) || isIELTSScore(value)) return value

  const r = value as Record<string, unknown>
  if (typeof r.overallBand === 'number' && r.taskAchievement) return value as WritingScore
  if (typeof r.overallScore === 'number') {
    return { framework: 'cambridge', ...value } as WritingScore
  }
  return null
}

function overallFromScore(s: WritingScore): number {
  if (isCambridgeScore(s)) return s.overallScore
  return s.overallBand
}

function criteriaForScores(scores: WritingScore[]): CriteriaAvg[] {
  const cambridgeCount = scores.filter(isCambridgeScore).length
  const base = cambridgeCount > scores.length / 2 ? CAMBRIDGE_CRITERIA : IELTS_CRITERIA
  return base.map(c => ({ ...c }))
}

function getCriterionBand(score: WritingScore, key: string): number {
  const raw = (score as unknown as Record<string, unknown>)[key]
  if (raw && typeof raw === 'object' && 'band' in raw) {
    return (raw as CriterionScore).band ?? 0
  }
  return 0
}

function dayKey(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildLast30DayKeys(): string[] {
  const keys: string[] = []
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  for (let i = 29; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    keys.push(dayKey(x.getTime()))
  }
  return keys
}

export function useWritingDashboard(): WritingDashboardData | undefined {
  return useLiveQuery(async (): Promise<WritingDashboardData> => {
    const [history, docs, errorBankRaw] = await Promise.all([
      db.writingHistory.orderBy('at').reverse().toArray(),
      db.writingDocs.count(),
      db.errorBank.toArray(),
    ])
    const errorBank = [...errorBankRaw].sort((a, b) => b.count - a.count)

    const emptyCalendar = (): CalendarDay[] => {
      return buildLast30DayKeys().map(dateKey => {
        const [y, m, day] = dateKey.split('-').map(Number)
        const dt = new Date(y, m - 1, day, 12)
        return {
          dateKey,
          label: `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}`,
          avgBand: 0,
          count: 0,
          weekday: dt.getDay(),
        }
      })
    }

    const paired = history
      .map(h => ({ h, score: parseScore(h.score) }))
      .filter((x): x is { h: typeof history[0]; score: WritingScore } => x.score !== null)

    const scores = paired.map(p => p.score)
    const totalGradings = scores.length

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    const last30 = paired.filter(p => p.h.at >= cutoff)
    const scores30 = last30.map(p => p.score)
    const gradingsLast30 = scores30.length

    const dayKeys = buildLast30DayKeys()
    const byDay = new Map<string, number[]>()
    for (const p of last30) {
      const k = dayKey(p.h.at)
      const arr = byDay.get(k) ?? []
      arr.push(overallFromScore(p.score))
      byDay.set(k, arr)
    }

    const calendar30: CalendarDay[] = dayKeys.map(dateKey => {
      const bands = byDay.get(dateKey) ?? []
      const [y, m, day] = dateKey.split('-').map(Number)
      const dt = new Date(y, m - 1, day, 12)
      const avg = bands.length
        ? Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 10) / 10
        : 0
      return {
        dateKey,
        label: `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}`,
        avgBand: avg,
        count: bands.length,
        weekday: dt.getDay(),
      }
    })

    const dailyTrend30: BandPoint[] = calendar30
      .filter(d => d.count > 0)
      .map(d => ({
        at: new Date(d.dateKey + 'T12:00:00').getTime(),
        band: d.avgBand,
        label: d.label,
        count: d.count,
      }))

    if (totalGradings === 0) {
      return {
        totalGradings: 0,
        gradingsLast30: 0,
        totalDocs: docs,
        avgBand: 0,
        avgBandLast30: 0,
        criteriaAvgs: IELTS_CRITERIA.map(c => ({ ...c })),
        weakest: null,
        strongest: null,
        bandTrend: [],
        dailyTrend30: [],
        calendar30: emptyCalendar(),
        commonErrors: [],
        strengths: [],
        errorBankItems: errorBank.map(e => ({ title: e.title, count: e.count })),
      }
    }

    const avgBand = Math.round(
      (scores.reduce((a, s) => a + overallFromScore(s), 0) / totalGradings) * 10,
    ) / 10
    const avgBandLast30 = gradingsLast30
      ? Math.round(
        (scores30.reduce((a, s) => a + overallFromScore(s), 0) / gradingsLast30) * 10,
      ) / 10
      : 0

    const criteriaAvgs = criteriaForScores(scores).map(c => {
      const sum = scores.reduce((a, s) => a + getCriterionBand(s, c.key), 0)
      return { ...c, avg: Math.round((sum / totalGradings) * 10) / 10 }
    })

    const sorted = [...criteriaAvgs].sort((a, b) => a.avg - b.avg)
    const weakest = sorted[0] ?? null
    const strongest = sorted[sorted.length - 1] ?? null

    const allImprovements = scores.flatMap(s => s.improvements ?? [])
    const allStrengths = scores.flatMap(s => s.strengths ?? [])

    const bandTrend: BandPoint[] = history
      .slice(0, 16)
      .reverse()
      .map(h => {
        const s = parseScore(h.score)
        return {
          at: h.at,
          band: s ? overallFromScore(s) : 0,
          label: new Date(h.at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        }
      })
      .filter(p => p.band > 0)

    return {
      totalGradings,
      gradingsLast30,
      totalDocs: docs,
      avgBand,
      avgBandLast30,
      criteriaAvgs,
      weakest,
      strongest,
      bandTrend,
      dailyTrend30,
      calendar30,
      commonErrors: rankItems(allImprovements),
      strengths: rankItems(allStrengths),
      errorBankItems: errorBank.map(e => ({ title: e.title, count: e.count })),
    }
  }, [])
}
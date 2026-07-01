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
}

export interface WritingDashboardData {
  totalGradings: number
  totalDocs: number
  avgBand: number
  criteriaAvgs: CriteriaAvg[]
  weakest: CriteriaAvg | null
  strongest: CriteriaAvg | null
  bandTrend: BandPoint[]
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

export function useWritingDashboard(): WritingDashboardData | undefined {
  return useLiveQuery(async (): Promise<WritingDashboardData> => {
    const [history, docs, errorBankRaw] = await Promise.all([
      db.writingHistory.orderBy('at').reverse().toArray(),
      db.writingDocs.count(),
      db.errorBank.toArray(),
    ])
    const errorBank = [...errorBankRaw].sort((a, b) => b.count - a.count)

    const scores = history.map(h => parseScore(h.score)).filter((s): s is WritingScore => s !== null)
    const totalGradings = scores.length

    if (totalGradings === 0) {
      return {
        totalGradings: 0,
        totalDocs: docs,
        avgBand: 0,
        criteriaAvgs: IELTS_CRITERIA.map(c => ({ ...c })),
        weakest: null,
        strongest: null,
        bandTrend: [],
        commonErrors: [],
        strengths: [],
        errorBankItems: errorBank.map(e => ({ title: e.title, count: e.count })),
      }
    }

    const avgBand = Math.round(
      (scores.reduce((a, s) => a + overallFromScore(s), 0) / totalGradings) * 10,
    ) / 10

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
      .slice(0, 12)
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
      totalDocs: docs,
      avgBand,
      criteriaAvgs,
      weakest,
      strongest,
      bandTrend,
      commonErrors: rankItems(allImprovements),
      strengths: rankItems(allStrengths),
      errorBankItems: errorBank.map(e => ({ title: e.title, count: e.count })),
    }
  }, [])
}
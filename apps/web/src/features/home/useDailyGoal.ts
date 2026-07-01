import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, settingsRepo } from '@ryan/db'

const VOCAB_MODES = new Set(['srs', 'quiz', 'type'])
const DEFAULT_GOAL_WORDS = 10
const DEFAULT_GOAL_TRANSLATIONS = 5

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function parseGoal(value: unknown, fallback: number): number {
  return typeof value === 'number' && value >= 1 ? Math.min(100, Math.round(value)) : fallback
}

export function useDailyGoal() {
  const goalWords = useLiveQuery(
    () => settingsRepo.getSetting('daily_goal_words').then(v => parseGoal(v, DEFAULT_GOAL_WORDS)),
    [],
  ) ?? DEFAULT_GOAL_WORDS

  const goalTranslations = useLiveQuery(
    () => settingsRepo.getSetting('daily_goal_translations').then(v => parseGoal(v, DEFAULT_GOAL_TRANSLATIONS)),
    [],
  ) ?? DEFAULT_GOAL_TRANSLATIONS

  const reviewLogs = useLiveQuery(() => db.reviewLog.toArray(), []) ?? []

  const { wordsToday, translationsToday } = useMemo(() => {
    const tk = todayKey()
    let words = 0
    let translations = 0
    for (const log of reviewLogs) {
      if (new Date(log.at).toISOString().slice(0, 10) !== tk) continue
      if (log.mode === 'translation') translations++
      else if (VOCAB_MODES.has(log.mode)) words++
    }
    return { wordsToday: words, translationsToday: translations }
  }, [reviewLogs])

  const wordsPct = goalWords > 0 ? Math.min(100, Math.round((wordsToday / goalWords) * 100)) : 0
  const translationsPct = goalTranslations > 0
    ? Math.min(100, Math.round((translationsToday / goalTranslations) * 100))
    : 0

  const allDone = wordsToday >= goalWords && translationsToday >= goalTranslations

  const setGoalWords = useCallback((n: number) => {
    void settingsRepo.putSetting('daily_goal_words', Math.min(100, Math.max(1, Math.round(n))))
  }, [])

  const setGoalTranslations = useCallback((n: number) => {
    void settingsRepo.putSetting('daily_goal_translations', Math.min(100, Math.max(1, Math.round(n))))
  }, [])

  return {
    goalWords,
    goalTranslations,
    wordsToday,
    translationsToday,
    wordsPct,
    translationsPct,
    allDone,
    setGoalWords,
    setGoalTranslations,
  }
}
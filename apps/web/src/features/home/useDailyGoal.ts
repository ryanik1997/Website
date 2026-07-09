import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, settingsRepo } from '@ryan/db'

/** Modes that count as real vocab study (not check-in) */
const VOCAB_STUDY_MODES = new Set([
  'srs', 'quiz', 'type', 'listen', 'speak',
])

const DEFAULT_GOAL_WORDS = 10
const DEFAULT_GOAL_TRANSLATIONS = 5
/** Clear this many due reviews (or clear all dues if fewer) */
const DEFAULT_GOAL_DUE = 10

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

  const goalDue = useLiveQuery(
    () => settingsRepo.getSetting('daily_goal_due').then(v => parseGoal(v, DEFAULT_GOAL_DUE)),
    [],
  ) ?? DEFAULT_GOAL_DUE

  const reviewLogs = useLiveQuery(() => db.reviewLog.toArray(), []) ?? []
  const dueCount = useLiveQuery(
    () => db.srs.where('dueAt').belowOrEqual(Date.now()).count(),
    [],
  ) ?? 0

  const { wordsToday, translationsToday, dueReviewedToday } = useMemo(() => {
    const tk = todayKey()
    let words = 0
    let translations = 0
    let dueReviewed = 0
    for (const log of reviewLogs) {
      if (new Date(log.at).toISOString().slice(0, 10) !== tk) continue
      if (log.mode === 'checkin') continue
      if (log.mode === 'translation') translations++
      else if (VOCAB_STUDY_MODES.has(log.mode)) {
        words++
        dueReviewed++
      }
    }
    return { wordsToday: words, translationsToday: translations, dueReviewedToday: dueReviewed }
  }, [reviewLogs])

  // Due goal: reviewed enough today OR inbox empty after having studied
  const dueTarget = goalDue
  const duePct = Math.min(100, Math.round((dueReviewedToday / Math.max(1, dueTarget)) * 100))
  const dueGoalComplete = dueReviewedToday >= goalDue || (dueCount === 0 && dueReviewedToday > 0)

  const wordsPct = goalWords > 0 ? Math.min(100, Math.round((wordsToday / goalWords) * 100)) : 0
  const translationsPct = goalTranslations > 0
    ? Math.min(100, Math.round((translationsToday / goalTranslations) * 100))
    : 0

  const allDone =
    wordsToday >= goalWords
    && translationsToday >= goalTranslations
    && dueGoalComplete

  const setGoalWords = useCallback((n: number) => {
    void settingsRepo.putSetting('daily_goal_words', Math.min(100, Math.max(1, Math.round(n))))
  }, [])

  const setGoalTranslations = useCallback((n: number) => {
    void settingsRepo.putSetting('daily_goal_translations', Math.min(100, Math.max(1, Math.round(n))))
  }, [])

  const setGoalDue = useCallback((n: number) => {
    void settingsRepo.putSetting('daily_goal_due', Math.min(100, Math.max(1, Math.round(n))))
  }, [])

  return {
    goalWords,
    goalTranslations,
    goalDue,
    wordsToday,
    translationsToday,
    dueReviewedToday,
    dueCount,
    dueTarget,
    duePct,
    dueGoalComplete,
    wordsPct,
    translationsPct,
    allDone,
    setGoalWords,
    setGoalTranslations,
    setGoalDue,
  }
}

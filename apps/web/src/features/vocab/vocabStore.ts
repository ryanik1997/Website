import { create } from 'zustand'
import type { VocabUnitKind } from './vocabUnitKind'

export type StudyMode =
  | 'srs' | 'quiz' | 'type' | 'listen' | 'speak'
  | 'weak' | 'review' | 'stats' | 'notebook'
export type StudyFilter = 'all' | 'weak'

interface VocabState {
  activeDeckId: string | null
  /** Từ đơn vs cụm từ — lọc toàn module Vocab */
  unitKind: VocabUnitKind
  studyMode: StudyMode | null
  studyFilter: StudyFilter
  setActiveDeck: (id: string | null) => void
  setUnitKind: (kind: VocabUnitKind) => void
  startStudy: (mode: StudyMode, filter?: StudyFilter) => void
  stopStudy: () => void
}

export const useVocabStore = create<VocabState>()((set) => ({
  activeDeckId: null,
  unitKind: 'single',
  studyMode: null,
  studyFilter: 'all',
  setActiveDeck: (id) => set({ activeDeckId: id }),
  setUnitKind: (kind) => set({ unitKind: kind, activeDeckId: null, studyMode: null }),
  startStudy: (mode, filter) => set({ studyMode: mode, studyFilter: filter ?? 'all' }),
  stopStudy: () => set({ studyMode: null, studyFilter: 'all' }),
}))
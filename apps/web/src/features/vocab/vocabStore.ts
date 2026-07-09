import { create } from 'zustand'

export type StudyMode =
  | 'srs' | 'quiz' | 'type' | 'listen' | 'speak'
  | 'weak' | 'review' | 'stats' | 'notebook'
export type StudyFilter = 'all' | 'weak'

interface VocabState {
  activeDeckId: string | null
  studyMode: StudyMode | null
  studyFilter: StudyFilter
  setActiveDeck: (id: string | null) => void
  startStudy: (mode: StudyMode, filter?: StudyFilter) => void
  stopStudy: () => void
}

export const useVocabStore = create<VocabState>()((set) => ({
  activeDeckId: null,
  studyMode: null,
  studyFilter: 'all',
  setActiveDeck: (id) => set({ activeDeckId: id }),
  startStudy: (mode, filter) => set({ studyMode: mode, studyFilter: filter ?? 'all' }),
  stopStudy: () => set({ studyMode: null, studyFilter: 'all' }),
}))
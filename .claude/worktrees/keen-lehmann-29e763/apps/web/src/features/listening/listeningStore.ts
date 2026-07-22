import { create } from 'zustand'

interface ListeningState {
  activeLessonId: string | null
  studying: boolean
  tab: 'all' | 'user' | 'cambridge'
  setActiveLesson: (id: string | null) => void
  startStudy: () => void
  stopStudy: () => void
  setTab: (tab: 'all' | 'user' | 'cambridge') => void
}

export const useListeningStore = create<ListeningState>()((set) => ({
  activeLessonId: null,
  studying: false,
  tab: 'all',
  setActiveLesson: (id) => set({ activeLessonId: id }),
  startStudy: () => set({ studying: true }),
  stopStudy: () => set({ studying: false }),
  setTab: (tab) => set({ tab }),
}))

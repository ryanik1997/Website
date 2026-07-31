import { create } from 'zustand'
import type { WritingGuide, WritingScore } from '@ryan/core'

const ACTIVE_WRITING_DOC_KEY = 'ryan-writing-active-doc-id'

function readActiveDocId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(ACTIVE_WRITING_DOC_KEY)
  } catch {
    return null
  }
}

interface WritingState {
  activeDocId: string | null
  score: WritingScore | null
  isGrading: boolean
  gradingError: string | null
  guide: WritingGuide | null
  guideDocId: string | null
  isGuideLoading: boolean
  guideError: string | null
  setActiveDoc: (id: string | null) => void
  setScore: (score: WritingScore | null) => void
  setGrading: (v: boolean) => void
  setError: (err: string | null) => void
  clearScore: () => void
  setGuide: (docId: string, guide: WritingGuide | null) => void
  setGuideLoading: (v: boolean) => void
  setGuideError: (err: string | null) => void
  clearGuide: () => void
}

export const useWritingStore = create<WritingState>()((set) => ({
  activeDocId: readActiveDocId(),
  score: null,
  isGrading: false,
  gradingError: null,
  guide: null,
  guideDocId: null,
  isGuideLoading: false,
  guideError: null,
  setActiveDoc: (id) => {
    if (typeof window !== 'undefined') {
      try {
        if (id) window.localStorage.setItem(ACTIVE_WRITING_DOC_KEY, id)
        else window.localStorage.removeItem(ACTIVE_WRITING_DOC_KEY)
      } catch {
        // Local storage can be unavailable in privacy-restricted browsers.
      }
    }
    set({
    activeDocId: id,
    score: null,
    gradingError: null,
    guide: null,
    guideDocId: null,
    guideError: null,
    isGuideLoading: false,
    })
  },
  setScore: (score) => set({ score, gradingError: null }),
  setGrading: (v) => set({ isGrading: v }),
  setError: (err) => set({ gradingError: err, isGrading: false }),
  clearScore: () => set({ score: null, gradingError: null }),
  setGuide: (docId, guide) => set({ guide, guideDocId: docId, guideError: null }),
  setGuideLoading: (v) => set({ isGuideLoading: v }),
  setGuideError: (err) => set({ guideError: err, isGuideLoading: false }),
  clearGuide: () => set({ guide: null, guideDocId: null, guideError: null, isGuideLoading: false }),
}))

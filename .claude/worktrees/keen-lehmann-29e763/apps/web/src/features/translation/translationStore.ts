import { create } from 'zustand'

interface TranslationState {
  activeSetId: string | null
  practicing: boolean
  practiceSentenceId: string | null
  setActiveSetId: (id: string | null) => void
  startPractice: () => void
  startPracticeSentence: (sentenceId: string) => void
  stopPractice: () => void
}

export const useTranslationStore = create<TranslationState>()((set) => ({
  activeSetId: null,
  practicing: false,
  practiceSentenceId: null,
  setActiveSetId: (id) => set({ activeSetId: id }),
  startPractice: () => set({ practicing: true, practiceSentenceId: null }),
  startPracticeSentence: (sentenceId) => set({ practicing: true, practiceSentenceId: sentenceId }),
  stopPractice: () => set({ practicing: false, practiceSentenceId: null }),
}))
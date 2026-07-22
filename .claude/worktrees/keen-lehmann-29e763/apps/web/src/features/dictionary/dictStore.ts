import { create } from 'zustand'

interface DictState {
  isOpen: boolean
  initialQuery: string
  open: (word?: string) => void
  close: () => void
}

export const useDictStore = create<DictState>()((set) => ({
  isOpen: false,
  initialQuery: '',
  open: (word = '') => set({ isOpen: true, initialQuery: word }),
  close: () => set({ isOpen: false, initialQuery: '' }),
}))

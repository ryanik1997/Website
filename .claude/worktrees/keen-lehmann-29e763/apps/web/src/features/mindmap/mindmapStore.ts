import { create } from 'zustand'

interface MindmapState {
  activeMapId: string | null
  setActiveMap: (id: string | null) => void
}

export const useMindmapStore = create<MindmapState>()((set) => ({
  activeMapId: null,
  setActiveMap: (id) => set({ activeMapId: id }),
}))

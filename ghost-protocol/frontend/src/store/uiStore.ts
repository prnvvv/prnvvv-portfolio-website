import { create } from 'zustand'

interface UIState {
  activeSection: string
  isLoading: boolean
  loadingProgress: number
  isNavOpen: boolean
  setActiveSection: (section: string) => void
  setLoading: (loading: boolean) => void
  setLoadingProgress: (progress: number) => void
  toggleNav: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeSection: 'dossier',
  isLoading: true,
  loadingProgress: 0,
  isNavOpen: false,
  setActiveSection: (section) => set({ activeSection: section }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
}))

import { create } from 'zustand'
import { runTvTransition, isTvTransitionRunning } from '../components/effects/tvTransition'

export type Theme = 'commander' | 'noir'

export const THEME_STORAGE_KEY = 'ghost-theme'

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'commander' ? 'commander' : 'noir'
  } catch {
    return 'noir'
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

function prefersReducedMotion() {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    if (theme === get().theme || isTvTransitionRunning()) return
    const commit = () => {
      applyTheme(theme)
      set({ theme })
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* storage unavailable: theme still applies for this session */
    }
    // Reduced motion: immediate switch, no overlay.
    if (prefersReducedMotion()) commit()
    else runTvTransition(commit)
  },
}))

// Keep the attribute in sync with the store (the inline script in index.html
// sets it before first paint; this covers module-load and cross-tab changes).
applyTheme(useThemeStore.getState().theme)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_STORAGE_KEY) {
      const next: Theme = e.newValue === 'commander' ? 'commander' : 'noir'
      applyTheme(next)
      useThemeStore.setState({ theme: next })
    }
  })
}

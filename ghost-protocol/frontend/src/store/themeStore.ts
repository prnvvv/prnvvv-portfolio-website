import { create } from 'zustand'

export type Theme = 'commander' | 'noir'

export const THEME_STORAGE_KEY = 'ghost-theme'

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'noir' ? 'noir' : 'commander'
  } catch {
    return 'commander'
  }
}

let switchTimer: ReturnType<typeof setTimeout> | undefined

function applyTheme(theme: Theme, animate = false) {
  const root = document.documentElement
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (animate && !reduce && root.getAttribute('data-theme') !== theme) {
    root.classList.add('theme-switching')
    clearTimeout(switchTimer)
    switchTimer = setTimeout(() => root.classList.remove('theme-switching'), 400)
  }
  root.setAttribute('data-theme', theme)
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    applyTheme(theme, true)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* storage unavailable: theme still applies for this session */
    }
    set({ theme })
  },
}))

// Keep the attribute in sync with the store (the inline script in index.html
// sets it before first paint; this covers module-load and cross-tab changes).
applyTheme(useThemeStore.getState().theme)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_STORAGE_KEY) {
      const next: Theme = e.newValue === 'noir' ? 'noir' : 'commander'
      applyTheme(next)
      useThemeStore.setState({ theme: next })
    }
  })
}

import { Terminal, Moon } from 'lucide-react'
import { useThemeStore, type Theme } from '../../store/themeStore'

const OPTIONS: { value: Theme; label: string; icon: typeof Terminal }[] = [
  { value: 'commander', label: 'COMMANDER', icon: Terminal },
  { value: 'noir', label: 'NOIR', icon: Moon },
]

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Colour theme">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={`${label} theme`}
          className="theme-toggle__btn"
          onClick={() => setTheme(value)}
        >
          <Icon size={12} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

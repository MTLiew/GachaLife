import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import type { Theme } from '../context/ThemeContext'

const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'sakura', label: 'Sakura', icon: '🌸' },
  { id: 'cosmic', label: 'Cosmic', icon: '🌌' },
]

function ThemeDropdown() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const current = THEMES.find(t => t.id === theme)!

  return (
    <div className="theme-dropdown">
      <button className="theme-dropdown-btn" onClick={() => setOpen(prev => !prev)}>
        {current.icon} {current.label} ▾
      </button>
      {open && (
        <div className="theme-dropdown-menu">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-dropdown-item ${t.id === theme ? 'active' : ''}`}
              onClick={() => { setTheme(t.id); setOpen(false) }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ThemeDropdown
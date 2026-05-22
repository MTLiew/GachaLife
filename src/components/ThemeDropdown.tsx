import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import type { Theme } from '../context/ThemeContext'

const THEMES: { id: Theme; label: string;}[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark'},
  { id: 'sakura', label: 'Sakura'},
  { id: 'cosmic', label: 'Cosmic'},
]

function ThemeDropdown() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const current = THEMES.find(t => t.id === theme)!

  return (
    <div className="theme-dropdown">
      <button className="theme-dropdown-btn" onClick={() => setOpen(prev => !prev)}>
        {current.label} ▾
      </button>
      {open && (
        <div className="theme-dropdown-menu">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-dropdown-item ${t.id === theme ? 'active' : ''}`}
              onClick={() => { setTheme(t.id); setOpen(false) }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ThemeDropdown
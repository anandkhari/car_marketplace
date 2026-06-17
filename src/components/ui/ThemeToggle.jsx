'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const MonitorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
)

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    localStorage.removeItem('theme')
    setMounted(true)
  }, [])
  if (!mounted) return null

  const buttons = [
    { id: 'system', label: 'System', Icon: MonitorIcon },
    { id: 'light',  label: 'Light',  Icon: SunIcon },
    { id: 'dark',   label: 'Dark',   Icon: MoonIcon },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '4px',
        borderRadius: '999px',
        border: '0.5px solid',
        backdropFilter: 'blur(12px)',
        borderColor: theme === 'dark' ? '#2D2D2F' : '#E5E7EB',
        background: theme === 'dark' ? 'rgba(36,36,38,0.85)' : 'rgba(255,255,255,0.85)',
        boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
      }}
      aria-label="Theme selector"
    >
      {buttons.map(({ id, label, Icon }) => {
        const isActive = theme === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-label={`Switch to ${label} mode`}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
              fontSize: '14px',
              background: isActive
                ? (theme === 'dark' ? '#F2F2F7' : '#111827')
                : 'transparent',
              color: isActive
                ? (theme === 'dark' ? '#1C1C1E' : '#ffffff')
                : (theme === 'dark' ? '#6B6B70' : '#6B7280'),
            }}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}

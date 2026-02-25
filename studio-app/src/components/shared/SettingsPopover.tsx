import { useState, useRef, useEffect } from 'react'
import { GearSix, Moon, Sun, Check, SignOut } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, type AccentColor } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { GRADIENT_PRESETS } from '@/lib/gradientPresets'

const ACCENT_COLORS: { id: AccentColor; hex: string }[] = [
  { id: 'blue', hex: '#4A7FB5' },
  { id: 'red', hex: '#C95F5F' },
  { id: 'green', hex: '#5A9E65' },
  { id: 'purple', hex: '#8268B0' },
  { id: 'orange', hex: '#C08040' },
  { id: 'pink', hex: '#C45F82' },
]

export function SettingsPopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const darkMode = useUIStore(s => s.darkMode)
  const toggleDarkMode = useUIStore(s => s.toggleDarkMode)
  const accentColor = useUIStore(s => s.accentColor)
  const setAccentColor = useUIStore(s => s.setAccentColor)
  const gradientPreset = useUIStore(s => s.gradientPreset)
  const setGradientPreset = useUIStore(s => s.setGradientPreset)

  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const logout = useAuthStore(s => s.logout)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 transition-colors duration-150 cursor-pointer"
        style={{
          borderRadius: '4px',
          color: open ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          background: open ? 'var(--color-accent)10' : 'transparent',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#EFEDE9' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
        title="Settings"
      >
        <GearSix size={18} weight={open ? 'fill' : 'regular'} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 z-[60] overflow-hidden"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
            }}
          >
            {/* Dark mode toggle */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <span
                className="text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)' }}
              >
                Appearance
              </span>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium cursor-pointer transition-colors duration-150"
                style={{
                  fontFamily: 'var(--font-sans)',
                  borderRadius: '4px',
                  background: '#EFEDE9',
                  color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#E0DDD8')}
                onMouseLeave={e => (e.currentTarget.style.background = '#EFEDE9')}
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Accent color */}
            <div
              className="px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div
                className="text-[11px] uppercase tracking-wider font-semibold mb-2.5"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-tertiary)' }}
              >
                Accent Color
              </div>
              <div className="flex gap-2.5">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id)}
                    className="relative w-6 h-6 cursor-pointer transition-opacity duration-150 hover:opacity-80"
                    style={{ background: color.hex, borderRadius: '2px' }}
                  >
                    {accentColor === color.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={12} weight="bold" className="text-white" />
                      </div>
                    )}
                    {accentColor === color.id && (
                      <div
                        className="absolute -inset-[3px] pointer-events-none"
                        style={{ border: `2px solid ${color.hex}`, borderRadius: '3px' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Background preset */}
            <div
              className="px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div
                className="text-[11px] uppercase tracking-wider font-semibold mb-2"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-tertiary)' }}
              >
                Background
              </div>
              <div className="flex flex-col gap-0.5">
                {GRADIENT_PRESETS.map(preset => {
                  const isActive = gradientPreset === preset.id
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setGradientPreset(preset.id)}
                      className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-right cursor-pointer transition-colors duration-150"
                      style={{
                        fontFamily: 'var(--font-sans)',
                        borderRadius: '2px',
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        fontWeight: isActive ? 500 : 400,
                        background: isActive ? 'var(--color-accent)10' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#EFEDE9' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? 'var(--color-accent)10' : 'transparent' }}
                    >
                      <div
                        className="w-4 h-4 shrink-0"
                        style={{
                          background: darkMode ? preset.dark : preset.light,
                          border: '1px solid var(--color-border)',
                          borderRadius: '2px',
                        }}
                      />
                      <span className="flex-1 text-right">{preset.label}</span>
                      {isActive && <Check size={12} weight="bold" className="text-[var(--color-accent)] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* User info + sign out */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {isAdmin && (
                  <span
                    className="text-[9px] text-white px-1.5 py-0.5 font-semibold shrink-0"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      background: 'var(--color-accent)',
                      borderRadius: '2px',
                    }}
                  >
                    admin
                  </span>
                )}
                <span
                  className="text-[12px] truncate"
                  style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)' }}
                >
                  {user?.displayName || user?.email || ''}
                </span>
              </div>
              <button
                onClick={() => { logout(); setOpen(false) }}
                className="flex items-center gap-1 text-[12px] cursor-pointer shrink-0 transition-colors duration-150"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-tertiary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E5737E')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
              >
                <SignOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

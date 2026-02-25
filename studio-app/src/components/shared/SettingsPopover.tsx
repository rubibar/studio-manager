import { useState, useRef, useEffect } from 'react'
import { GearSix, Moon, Sun, Check, SignOut } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, type AccentColor } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { GRADIENT_PRESETS } from '@/lib/gradientPresets'

const ACCENT_COLORS: { id: AccentColor; hex: string }[] = [
  { id: 'red', hex: '#FF2D2D' },
  { id: 'blue', hex: '#448AFF' },
  { id: 'green', hex: '#00E676' },
  { id: 'orange', hex: '#FF8F00' },
  { id: 'purple', hex: '#B388FF' },
  { id: 'pink', hex: '#FF1493' },
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
        className={`
          p-1.5 rounded-[var(--radius-default)] transition-colors cursor-pointer
          ${open
            ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
            : 'hover:bg-[var(--color-surface-3)]/50 text-[var(--color-text-secondary)]'
          }
        `}
        title="Settings"
      >
        <GearSix size={18} weight={open ? 'fill' : 'regular'} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 glass-panel rounded-[var(--radius-xl)] shadow-lg z-[60] overflow-hidden"
          >
            {/* Dark mode toggle */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-border)]/30">
              <span className="text-[13px] font-medium">Appearance</span>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-surface-2)]/80 text-[12px] font-medium cursor-pointer hover:bg-[var(--color-surface-3)]/80 transition-colors"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Accent color */}
            <div className="px-4 py-3 border-b border-[var(--color-border)]/30">
              <div className="text-[11px] uppercase tracking-wider font-mono text-[var(--color-text-tertiary)] mb-2">
                Accent Color
              </div>
              <div className="flex gap-2.5">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id)}
                    className="relative w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer"
                    style={{ background: color.hex }}
                  >
                    {accentColor === color.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Check size={12} weight="bold" className="text-white" />
                      </motion.div>
                    )}
                    {accentColor === color.id && (
                      <div
                        className="absolute -inset-[3px] rounded-full border-2 pointer-events-none"
                        style={{ borderColor: color.hex }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Background preset */}
            <div className="px-4 py-3 border-b border-[var(--color-border)]/30">
              <div className="text-[11px] uppercase tracking-wider font-mono text-[var(--color-text-tertiary)] mb-2">
                Background
              </div>
              <div className="flex flex-col gap-0.5">
                {GRADIENT_PRESETS.map(preset => {
                  const isActive = gradientPreset === preset.id
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setGradientPreset(preset.id)}
                      className={`
                        flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] text-[12px]
                        transition-colors text-right cursor-pointer
                        ${isActive
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                          : 'hover:bg-[var(--color-surface-3)]/50 text-[var(--color-text-secondary)]'
                        }
                      `}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-[var(--color-border)] shrink-0"
                        style={{ background: darkMode ? preset.dark : preset.light }}
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
                  <span className="text-[9px] bg-[var(--color-accent)] text-white px-1.5 py-0.5 rounded-full font-mono shrink-0">
                    admin
                  </span>
                )}
                <span className="text-[12px] text-[var(--color-text-secondary)] truncate">
                  {user?.displayName || user?.email || ''}
                </span>
              </div>
              <button
                onClick={() => { logout(); setOpen(false) }}
                className="flex items-center gap-1 text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-red)] transition-colors cursor-pointer shrink-0"
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

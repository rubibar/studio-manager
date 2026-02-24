import { useState, useRef, useEffect } from 'react'
import { Drop, Check } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'
import { GRADIENT_PRESETS } from '@/lib/gradientPresets'

export function GradientPicker() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const gradientPreset = useUIStore(s => s.gradientPreset)
  const setGradientPreset = useUIStore(s => s.setGradientPreset)
  const darkMode = useUIStore(s => s.darkMode)

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
        className="p-1.5 rounded-[var(--radius-default)] hover:bg-[var(--color-surface-3)]/50 transition-colors"
        title="Background Theme"
      >
        <Drop size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-52 glass-panel rounded-[var(--radius-lg)] shadow-lg p-3 z-[60]"
          >
            <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--color-text-tertiary)] mb-2 px-1">
              Background
            </div>
            <div className="flex flex-col gap-0.5">
              {GRADIENT_PRESETS.map(preset => {
                const isActive = gradientPreset === preset.id
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setGradientPreset(preset.id)
                      setOpen(false)
                    }}
                    className={`
                      flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] text-[13px]
                      transition-colors text-right
                      ${isActive
                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                        : 'hover:bg-[var(--color-surface-3)]/50 text-[var(--color-text-secondary)]'
                      }
                    `}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-[var(--color-border)] shrink-0"
                      style={{ background: darkMode ? preset.dark : preset.light }}
                    />
                    <span className="flex-1 text-right">{preset.label}</span>
                    {isActive && <Check size={14} weight="bold" className="text-[var(--color-accent)] shrink-0" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

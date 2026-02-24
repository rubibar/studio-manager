import { useState, useRef, useEffect } from 'react'
import { Check, Palette } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, type AccentColor } from '@/stores/uiStore'

const ACCENT_COLORS: { id: AccentColor; label: string; hex: string }[] = [
  { id: 'blue', label: 'כחול', hex: '#007AFF' },
  { id: 'red', label: 'אדום', hex: '#FF3B30' },
  { id: 'purple', label: 'סגול', hex: '#AF52DE' },
  { id: 'green', label: 'ירוק', hex: '#34C759' },
  { id: 'orange', label: 'כתום', hex: '#FF9500' },
  { id: 'pink', label: 'ורוד', hex: '#FF2D55' },
]

export function AccentColorPicker() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const accentColor = useUIStore(s => s.accentColor)
  const setAccentColor = useUIStore(s => s.setAccentColor)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="p-1.5 rounded-[var(--radius-bento-sm)] hover:bg-[var(--color-surface-3)]/50 transition-colors"
      >
        <Palette size={18} className="text-[var(--color-text-secondary)]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 glass-panel rounded-[var(--radius-xl)] p-3 z-[60] shadow-lg"
          >
            <div className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2 px-1">
              Accent Color
            </div>
            <div className="flex gap-2">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => {
                    setAccentColor(color.id)
                    setOpen(false)
                  }}
                  className="relative w-7 h-7 rounded-full transition-transform hover:scale-110 cursor-pointer"
                  style={{ background: color.hex }}
                  title={color.label}
                >
                  {accentColor === color.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check size={14} weight="bold" className="text-white" />
                    </motion.div>
                  )}
                  {accentColor === color.id && (
                    <div
                      className="absolute -inset-1 rounded-full border-2 pointer-events-none"
                      style={{ borderColor: color.hex }}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

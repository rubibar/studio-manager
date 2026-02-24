import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function SlideOver({ open, onClose, title, children }: SlideOverProps) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-[#111111]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 left-0 h-full z-[100] w-[560px] max-w-[95vw] bg-[var(--color-surface)] shadow-2xl flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring' as const, damping: 30, stiffness: 300 }}
          >
            <div className="sticky top-0 z-10 glass-panel flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              {title && <h2 className="text-[16px] font-bold tracking-tight">{title}</h2>}
              <button
                onClick={onClose}
                className="p-2 rounded-[var(--radius-bento-sm)] hover:bg-[var(--color-surface-3)] transition-colors mr-auto"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

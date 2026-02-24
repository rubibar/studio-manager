import { useEffect, useRef } from 'react'
import { X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export function Modal({ open, onClose, title, children, width = '540px' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#000000]/40 backdrop-blur-sm" />

          {/* Content */}
          <motion.div
            className="relative glass-panel rounded-[var(--radius-xl)] shadow-lg overflow-hidden"
            style={{ width, maxWidth: '95vw', maxHeight: '85vh' }}
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--glass-border)]">
              <h2 className="text-[15px] font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-3)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: 'calc(85vh - 60px)' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

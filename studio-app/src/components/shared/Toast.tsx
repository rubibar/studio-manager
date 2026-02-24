import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void
  removeToast: (id: number) => void
}

let nextToastId = 1

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = nextToastId++
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 3000)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

export function toast(message: string, type?: 'success' | 'error' | 'info') {
  useToastStore.getState().addToast(message, type)
}

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)

  return (
    <div className="fixed bottom-4 left-4 z-[200] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              px-4 py-2.5 rounded-[var(--radius-default)] shadow-md text-[13px] font-medium
              ${t.type === 'error'
                ? 'bg-[var(--color-red)] text-white'
                : t.type === 'success'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface-dark)] text-white'
              }
            `}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

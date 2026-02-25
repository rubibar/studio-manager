import { useRef } from 'react'
import { motion } from 'framer-motion'
import { List, MagnifyingGlass, Eye, Plus } from '@phosphor-icons/react'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import { useMagnetic } from '@/hooks/useMagnetic'
import { SettingsPopover } from '@/components/shared/SettingsPopover'
import { VIEW_TITLES } from '@/lib/constants'

export function Topbar() {
  const activeView = useUIStore(s => s.activeView)
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const openModal = useUIStore(s => s.openModal)
  const openCommandPalette = useUIStore(s => s.openCommandPalette)
  const toggleReviewSidebar = useUIStore(s => s.toggleReviewSidebar)
  const tasks = useTaskStore(s => s.tasks)

  const reviewCount = tasks.filter(t => t.status === 'review').length
  const newTaskRef = useRef<HTMLButtonElement>(null)
  const { x: magnetX, y: magnetY } = useMagnetic(newTaskRef, 0.15)

  return (
    <header className="sticky top-0 z-30 glass-panel h-12 flex items-center justify-between px-4 gap-4 border-b border-[var(--glass-border)]">
      {/* Left: hamburger (mobile only) + title */}
      <div className="relative z-10 flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-[var(--radius-default)] hover:bg-[var(--color-surface-3)]/50 transition-colors"
        >
          <List size={20} />
        </button>
        <h1 className="text-[15px] font-semibold tracking-tight">
          {VIEW_TITLES[activeView] || ''}
        </h1>
      </div>

      {/* Center: command palette trigger */}
      <button
        onClick={openCommandPalette}
        className="relative z-10 hidden md:flex items-center gap-2 bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] rounded-[var(--radius-default)] px-4 py-1.5 flex-1 max-w-xs cursor-pointer transition-colors"
      >
        <MagnifyingGlass size={14} className="text-[var(--color-text-tertiary)]" />
        <span className="text-[12px] text-[var(--color-text-tertiary)] flex-1 text-right">Search...</span>
        <kbd className="text-[10px] bg-[var(--color-surface-3)]/60 text-[var(--color-text-tertiary)] px-1.5 py-0.5 rounded font-mono">
          Ctrl K
        </kbd>
      </button>

      {/* Right: actions */}
      <div className="relative z-10 flex items-center gap-2">
        {/* New task — magnetic */}
        <motion.button
          ref={newTaskRef}
          style={{ x: magnetX, y: magnetY }}
          onClick={() => openModal({ type: 'addTask' })}
          className="flex items-center gap-1.5 bg-[var(--color-accent)] text-white text-[12px] font-medium px-3 py-1.5 rounded-[var(--radius-default)] hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          <Plus size={14} weight="bold" />
          <span className="hidden sm:inline">New Task</span>
        </motion.button>

        {/* Review — dynamic island pill */}
        {reviewCount > 0 && (
          <motion.button
            layout
            onClick={toggleReviewSidebar}
            className="flex items-center gap-1.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full px-3 py-1.5 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          >
            <Eye size={14} weight="fill" />
            <motion.span layout className="text-[11px] font-bold font-mono">{reviewCount}</motion.span>
          </motion.button>
        )}

        {/* Settings gear — contains dark mode, accent color, background, user/logout */}
        <SettingsPopover />
      </div>
    </header>
  )
}

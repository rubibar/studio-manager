import { useRef } from 'react'
import { motion } from 'framer-motion'
import { List, MagnifyingGlass, Moon, Sun, Eye, Plus, SignOut } from '@phosphor-icons/react'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import { useMagnetic } from '@/hooks/useMagnetic'
import { VIEW_TITLES } from '@/lib/constants'

export function Topbar() {
  const activeView = useUIStore(s => s.activeView)
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const darkMode = useUIStore(s => s.darkMode)
  const toggleDarkMode = useUIStore(s => s.toggleDarkMode)
  const openModal = useUIStore(s => s.openModal)
  const openCommandPalette = useUIStore(s => s.openCommandPalette)
  const toggleReviewSidebar = useUIStore(s => s.toggleReviewSidebar)
  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const logout = useAuthStore(s => s.logout)
  const tasks = useTaskStore(s => s.tasks)

  const reviewCount = tasks.filter(t => t.status === 'review').length
  const newTaskRef = useRef<HTMLButtonElement>(null)
  const { x: magnetX, y: magnetY } = useMagnetic(newTaskRef, 0.15)

  return (
    <header className="sticky top-0 z-30 glass-panel h-14 flex items-center justify-between px-4 gap-4 border-b border-[var(--glass-border)]">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-[var(--radius-bento-sm)] hover:bg-[var(--color-surface-3)]/50 transition-colors"
        >
          <List size={20} />
        </button>
        <h1 className="text-[15px] font-bold tracking-tight">
          {VIEW_TITLES[activeView] || ''}
        </h1>
      </div>

      {/* Center: command palette trigger */}
      <button
        onClick={openCommandPalette}
        className="hidden md:flex items-center gap-2 bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] rounded-[var(--radius-bento-sm)] px-4 py-1.5 flex-1 max-w-xs cursor-pointer transition-colors"
      >
        <MagnifyingGlass size={14} className="text-[var(--color-text-tertiary)]" />
        <span className="text-[12px] text-[var(--color-text-tertiary)] flex-1 text-right">Search...</span>
        <kbd className="text-[10px] bg-[var(--color-surface-3)] text-[var(--color-text-tertiary)] px-1.5 py-0.5 rounded font-mono">
          Ctrl K
        </kbd>
      </button>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* New task — magnetic */}
        <motion.button
          ref={newTaskRef}
          style={{ x: magnetX, y: magnetY }}
          onClick={() => openModal({ type: 'addTask' })}
          className="flex items-center gap-1.5 bg-[var(--color-accent)] text-white text-[12px] font-medium px-3 py-1.5 rounded-[var(--radius-bento-sm)] hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          <Plus size={14} weight="bold" />
          <span className="hidden sm:inline">New Task</span>
        </motion.button>

        {/* Review — dynamic island pill */}
        {reviewCount > 0 && (
          <motion.button
            layout
            onClick={toggleReviewSidebar}
            className="flex items-center gap-1.5 bg-[var(--color-purple)]/10 text-[var(--color-purple)] rounded-full px-3 py-1.5 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          >
            <Eye size={14} weight="fill" />
            <motion.span layout className="text-[11px] font-bold font-mono">{reviewCount}</motion.span>
          </motion.button>
        )}

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-[var(--radius-bento-sm)] hover:bg-[var(--color-surface-3)]/50 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User + logout */}
        <div className="flex items-center gap-2 mr-2">
          {isAdmin && (
            <span className="text-[9px] bg-[var(--color-accent)] text-white px-1.5 py-0.5 rounded-full font-mono">
              admin
            </span>
          )}
          <span className="text-[12px] text-[var(--color-text-secondary)] hidden sm:inline truncate max-w-[100px]">
            {user?.displayName || user?.email || ''}
          </span>
          <button
            onClick={logout}
            className="p-1.5 rounded-[var(--radius-bento-sm)] hover:bg-[var(--color-surface-3)]/50 transition-colors text-[var(--color-text-tertiary)]"
            title="Sign Out"
          >
            <SignOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}

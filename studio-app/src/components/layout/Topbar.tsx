import { useRef } from 'react'
import { motion } from 'framer-motion'
import { List, MagnifyingGlass, Eye, Plus, CaretRight } from '@phosphor-icons/react'
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
    <header
      className="sticky top-0 z-30 h-11 flex items-center justify-between px-4 gap-4"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1 hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <List size={18} color="#8A8578" />
        </button>

        {/* Breadcrumb — terminal style */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span style={{ color: 'var(--color-accent)' }}>SYS</span>
          <CaretRight size={10} color="#504C44" />
          <span className="font-bold tracking-wide uppercase" style={{ color: 'var(--color-text-primary)' }}>
            {VIEW_TITLES[activeView] || ''}
          </span>
        </div>
      </div>

      {/* Center: command palette — terminal trigger */}
      <button
        onClick={openCommandPalette}
        className="hidden md:flex items-center gap-2 px-3 py-1 flex-1 max-w-xs cursor-pointer transition-colors"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
        }}
      >
        <MagnifyingGlass size={12} color="#504C44" />
        <span className="text-[10px] font-mono flex-1 text-right" style={{ color: 'var(--color-text-tertiary)' }}>
          search_
        </span>
        <kbd
          className="text-[9px] font-mono px-1 py-0.5"
          style={{
            background: 'var(--color-surface-3)',
            color: 'var(--color-text-tertiary)',
            border: '1px solid var(--color-border)',
          }}
        >
          ^K
        </kbd>
      </button>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* New task */}
        <motion.button
          ref={newTaskRef}
          style={{
            x: magnetX,
            y: magnetY,
            background: 'var(--color-accent)',
            boxShadow: 'var(--shadow-glow-accent)',
          }}
          onClick={() => openModal({ type: 'addTask' })}
          className="flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1.5 uppercase tracking-wider cursor-pointer"
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={12} weight="bold" color="#080807" />
          <span className="hidden sm:inline" style={{ color: '#080807' }}>
            NEW
          </span>
        </motion.button>

        {/* Review count — signal indicator */}
        {reviewCount > 0 && (
          <motion.button
            onClick={toggleReviewSidebar}
            className="flex items-center gap-1.5 px-2 py-1 cursor-pointer"
            style={{
              background: 'rgba(255, 45, 45, 0.08)',
              border: '1px solid rgba(255, 45, 45, 0.2)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye size={12} weight="fill" color="var(--color-accent)" />
            <span className="text-[10px] font-mono font-bold signal-blink" style={{ color: 'var(--color-accent)' }}>
              {reviewCount}
            </span>
          </motion.button>
        )}

        {/* Settings */}
        <SettingsPopover />
      </div>
    </header>
  )
}

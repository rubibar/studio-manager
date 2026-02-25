import { List, MagnifyingGlass, Eye, Plus, CaretLeft } from '@phosphor-icons/react'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
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

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 gap-4"
      style={{
        height: 44,
        background: '#FFFFFF',
        borderBottom: '1px solid var(--color-border, #E0DDD8)',
        fontFamily: 'var(--font-sans, "DM Sans", sans-serif)',
      }}
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden cursor-pointer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            background: 'transparent',
            border: 'none',
            borderRadius: 2,
            transition: 'background 150ms ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F7F6F4' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <List size={18} color="#7A756D" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span style={{ fontSize: 13, color: '#A8A39B' }}>
            Studio
          </span>
          <CaretLeft size={10} color="#A8A39B" />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#3D3A36',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {VIEW_TITLES[activeView] || ''}
          </span>
        </div>
      </div>

      {/* Center-right: search trigger */}
      <button
        onClick={openCommandPalette}
        className="hidden md:flex items-center gap-2 cursor-pointer"
        style={{
          maxWidth: 280,
          flex: '0 1 280px',
          padding: '5px 10px',
          background: '#F7F6F4',
          border: '1px solid var(--color-border, #E0DDD8)',
          borderRadius: 2,
          transition: 'border-color 150ms ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C8C4BC' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border, #E0DDD8)' }}
      >
        <MagnifyingGlass size={13} color="#A8A39B" />
        <span
          style={{
            fontSize: 13,
            color: '#A8A39B',
            flex: 1,
            textAlign: 'start',
          }}
        >
          Search...
        </span>
        <kbd
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-sans, "DM Sans", sans-serif)',
            color: '#A8A39B',
            padding: '1px 5px',
            background: '#FFFFFF',
            border: '1px solid var(--color-border, #E0DDD8)',
            borderRadius: 2,
            lineHeight: '16px',
          }}
        >
          Ctrl K
        </kbd>
      </button>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* New Task button */}
        <button
          onClick={() => openModal({ type: 'addTask' })}
          className="cursor-pointer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 12px',
            background: 'var(--color-accent, #4A7FB5)',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-sans, "DM Sans", sans-serif)',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        >
          <Plus size={13} weight="bold" color="#FFFFFF" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Review count badge */}
        {reviewCount > 0 && (
          <button
            onClick={toggleReviewSidebar}
            className="cursor-pointer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              background: 'rgba(74, 127, 181, 0.08)',
              color: 'var(--color-accent, #4A7FB5)',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'var(--font-sans, "DM Sans", sans-serif)',
              border: 'none',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74, 127, 181, 0.12)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74, 127, 181, 0.08)' }}
          >
            <Eye size={13} weight="fill" color="var(--color-accent, #4A7FB5)" />
            <span>{reviewCount}</span>
          </button>
        )}

        {/* Settings */}
        <SettingsPopover />
      </div>
    </header>
  )
}

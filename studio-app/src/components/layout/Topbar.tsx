import { List, MagnifyingGlass, Moon, Sun, Eye, Bell, Plus } from '@phosphor-icons/react'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import { useScoring } from '@/hooks/useScoring'
import { VIEW_TITLES } from '@/lib/constants'

export function Topbar() {
  const activeView = useUIStore(s => s.activeView)
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const darkMode = useUIStore(s => s.darkMode)
  const toggleDarkMode = useUIStore(s => s.toggleDarkMode)
  const openModal = useUIStore(s => s.openModal)
  const toggleReviewSidebar = useUIStore(s => s.toggleReviewSidebar)
  const searchQuery = useUIStore(s => s.searchQuery)
  const setSearchQuery = useUIStore(s => s.setSearchQuery)
  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const logout = useAuthStore(s => s.logout)
  const tasks = useTaskStore(s => s.tasks)
  const { getScore } = useScoring()

  const reviewCount = tasks.filter(t => t.status === 'review').length
  const activeTasks = tasks.filter(t => t.status !== 'done')
  const hotCount = activeTasks.filter(t => getScore(t.id) >= 70).length

  return (
    <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-4 gap-4">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-3)] transition-colors"
        >
          <List size={20} />
        </button>
        <h1 className="text-[15px] font-bold">
          {VIEW_TITLES[activeView] || ''}
        </h1>
      </div>

      {/* Center: search */}
      <div className="hidden md:flex items-center gap-2 bg-[var(--color-surface-2)] rounded-[var(--radius-default)] px-3 py-1.5 flex-1 max-w-xs">
        <MagnifyingGlass size={16} className="text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="חיפוש..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm outline-none flex-1 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
        />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Quick stats */}
        {hotCount > 0 && (
          <span className="text-[11px] bg-[rgba(220,38,38,0.08)] text-[var(--color-red)] px-2 py-0.5 rounded-full font-mono">
            {hotCount} hot
          </span>
        )}

        {/* Add task */}
        <button
          onClick={() => openModal({ type: 'addTask' })}
          className="flex items-center gap-1.5 bg-[var(--color-accent)] text-white text-[12px] font-medium px-3 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          <Plus size={14} weight="bold" />
          <span className="hidden sm:inline">משימה חדשה</span>
        </button>

        {/* Review bell */}
        {reviewCount > 0 && (
          <button
            onClick={toggleReviewSidebar}
            className="relative p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-3)] transition-colors"
          >
            <Eye size={18} />
            <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-[var(--color-purple)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {reviewCount}
            </span>
          </button>
        )}

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-3)] transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 mr-2">
          {isAdmin && (
            <span className="text-[9px] bg-[var(--color-accent)] text-white px-1.5 py-0.5 rounded-full">
              admin
            </span>
          )}
          <span className="text-[12px] text-[var(--color-text-secondary)] hidden sm:inline">
            {user?.displayName || user?.email || ''}
          </span>
          <button
            onClick={logout}
            className="text-[11px] text-[var(--color-text-tertiary)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1 hover:bg-[var(--color-surface-3)] transition-colors"
          >
            התנתק
          </button>
        </div>
      </div>
    </header>
  )
}

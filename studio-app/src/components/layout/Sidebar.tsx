import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBar, ListChecks, Kanban, CalendarBlank, ChartPie,
  DotsNine, Bank, ChartLine, FolderOpen, Scales,
  CalendarDots, TrendDown, ClockCounterClockwise, Rocket,
  GitBranch, Timer, CurrencyCircleDollar, Briefcase,
  Buildings, Target, GearSix, X,
} from '@phosphor-icons/react'
import { useUIStore, type ViewName } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const PRIMARY_ITEMS: { id: ViewName; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'calendar', label: 'Calendar', icon: CalendarBlank },
  { id: 'reports', label: 'Reports', icon: ChartPie },
]

const MORE_ITEMS: { id: ViewName; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: 'bank', label: 'Task Bank', icon: Bank },
  { id: 'gantt', label: 'Gantt', icon: ChartLine },
  { id: 'weekview', label: 'Week View', icon: CalendarDots },
  { id: 'timeline', label: 'Timeline', icon: Timer },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'workload', label: 'Workload', icon: Scales },
  { id: 'burndown', label: 'Burndown', icon: TrendDown },
  { id: 'velocity', label: 'Velocity', icon: Rocket },
  { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
  { id: 'activitylog', label: 'Activity Log', icon: ClockCounterClockwise },
  { id: 'pricing', label: 'Hours & Pricing', icon: CurrencyCircleDollar },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'clients', label: 'Clients', icon: Buildings },
  { id: 'okr', label: 'OKR', icon: Target },
  { id: 'admin', label: 'Admin', icon: GearSix, adminOnly: true },
]

export function Sidebar() {
  const activeView = useUIStore(s => s.activeView)
  const setView = useUIStore(s => s.setView)
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const isAdmin = useAuthStore(s => s.isAdmin)

  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const filteredMore = useMemo(
    () => MORE_ITEMS.filter(item => !item.adminOnly || isAdmin),
    [isAdmin]
  )

  const isMoreView = useMemo(
    () => filteredMore.some(item => item.id === activeView),
    [activeView, filteredMore]
  )

  // Close more popover on click outside
  useEffect(() => {
    if (!moreOpen) return
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreOpen])

  const handleNav = (id: ViewName) => {
    setView(id)
    setMoreOpen(false)
    if (window.innerWidth <= 1024) setSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar rail */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50 w-[68px] glass-panel glass-panel-elevated border-l border-[var(--glass-border)]
          flex flex-col items-center py-4 gap-1
          transition-transform duration-300
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <motion.div
          className="w-10 h-10 rounded-[var(--radius-default)] bg-[var(--color-accent)] flex items-center justify-center mb-4 cursor-default"
          style={{ boxShadow: 'var(--shadow-glow-accent)' }}
          animate={{ boxShadow: ['var(--shadow-glow-accent)', '0 0 28px color-mix(in srgb, var(--color-accent) 35%, transparent)', 'var(--shadow-glow-accent)'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </motion.div>

        {/* Primary icons */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {PRIMARY_ITEMS.map(item => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNav(item.id)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative group w-11 h-11 rounded-[var(--radius-default)] flex items-center justify-center
                  transition-colors duration-200 cursor-pointer
                  ${active
                    ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-glow-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]/50 hover:text-[var(--color-text-primary)]'
                  }
                `}
              >
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
                {/* Glass tooltip */}
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  whileInView={{ opacity: 0 }}
                  className="absolute right-full ml-3 px-2.5 py-1.5 rounded-[var(--radius-sm)] glass-panel text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] hidden lg:block"
                >
                  {item.label}
                </motion.span>
              </motion.button>
            )
          })}
        </nav>

        {/* Separator */}
        <div className="w-8 h-px bg-[var(--color-border)]/50 my-1" />

        {/* More button */}
        <div className="relative" ref={moreRef}>
          <motion.button
            onClick={() => setMoreOpen(prev => !prev)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-11 h-11 rounded-[var(--radius-default)] flex items-center justify-center
              transition-colors duration-200 cursor-pointer
              ${isMoreView || moreOpen
                ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-3)]/50 hover:text-[var(--color-text-primary)]'
              }
            `}
          >
            <DotsNine size={20} weight={isMoreView ? 'fill' : 'regular'} />
          </motion.button>

          {/* More popover — RTL-safe: opens towards content area (left in RTL) */}
          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -8 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="absolute bottom-0 right-full ml-2 glass-panel rounded-[var(--radius-xl)] p-3 w-[280px] z-[60] shadow-lg"
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    More Views
                  </span>
                  <button
                    onClick={() => setMoreOpen(false)}
                    className="p-0.5 rounded hover:bg-[var(--color-surface-3)]/50 transition-colors"
                  >
                    <X size={12} className="text-[var(--color-text-tertiary)]" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {filteredMore.map(item => {
                    const Icon = item.icon
                    const active = activeView === item.id
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          flex flex-col items-center gap-1 p-2.5 rounded-[var(--radius-default)]
                          transition-colors duration-200 cursor-pointer
                          ${active
                            ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]/50'
                          }
                        `}
                      >
                        <Icon size={18} weight={active ? 'fill' : 'regular'} />
                        <span className="text-[10px] font-medium leading-tight text-center">
                          {item.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  )
}

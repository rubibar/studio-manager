import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBar, ListChecks, Kanban, CalendarBlank, ChartPie,
  DotsNine, Bank, ChartLine, FolderOpen, Scales,
  CalendarDots, TrendDown, ClockCounterClockwise, Rocket,
  GitBranch, Timer, CurrencyCircleDollar, Briefcase,
  Buildings, Target, GearSix, X, Warning,
} from '@phosphor-icons/react'
import { useUIStore, type ViewName } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const PRIMARY_ITEMS: { id: ViewName; label: string; icon: React.ElementType; index: string }[] = [
  { id: 'dashboard', label: 'DASH', icon: ChartBar, index: '01' },
  { id: 'tasks', label: 'TASKS', icon: ListChecks, index: '02' },
  { id: 'kanban', label: 'BOARD', icon: Kanban, index: '03' },
  { id: 'calendar', label: 'CAL', icon: CalendarBlank, index: '04' },
  { id: 'reports', label: 'DATA', icon: ChartPie, index: '05' },
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — industrial rail */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50 w-[72px] bg-[var(--color-surface)]
          border-l border-[var(--color-border)]
          flex flex-col items-center py-3 gap-0
          transition-transform duration-200
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
        style={{ borderLeft: '2px solid var(--color-border)' }}
      >
        {/* Signal mark */}
        <div className="w-full flex items-center justify-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{
              background: 'var(--color-accent)',
              boxShadow: 'var(--shadow-glow-accent)',
            }}
          >
            <Warning size={16} weight="fill" color="#080807" />
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex flex-col items-center gap-0 flex-1 w-full">
          {PRIMARY_ITEMS.map(item => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNav(item.id)}
                whileTap={{ scale: 0.92 }}
                className="relative w-full group cursor-pointer"
                style={{
                  height: 56,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  background: active ? 'rgba(255, 45, 45, 0.06)' : 'transparent',
                }}
              >
                {/* Active signal bar */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1 bottom-1 w-[3px]"
                    style={{ background: 'var(--color-accent)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <Icon
                  size={20}
                  weight={active ? 'fill' : 'bold'}
                  color={active ? 'var(--color-accent)' : '#8A8578'}
                  style={{ display: 'block', flexShrink: 0, minWidth: 20, minHeight: 20 }}
                />
                <span
                  className="font-mono text-[8px] tracking-[0.15em] uppercase"
                  style={{
                    color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {item.label}
                </span>

                {/* Index number */}
                <span
                  className="absolute top-1 right-1 font-mono text-[7px]"
                  style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }}
                >
                  {item.index}
                </span>

                {/* Tooltip */}
                <span
                  className="absolute right-full mr-2 px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] hidden lg:block"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {item.label}
                </span>
              </motion.button>
            )
          })}
        </nav>

        {/* Separator — signal line */}
        <div className="w-full h-px my-1" style={{ background: 'var(--color-border)' }} />

        {/* More button */}
        <div className="relative w-full" ref={moreRef}>
          <motion.button
            onClick={() => setMoreOpen(prev => !prev)}
            whileTap={{ scale: 0.92 }}
            className="w-full flex flex-col items-center justify-center cursor-pointer"
            style={{
              height: 48,
              color: isMoreView || moreOpen ? 'var(--color-accent)' : '#8A8578',
              background: isMoreView || moreOpen ? 'rgba(255, 45, 45, 0.06)' : 'transparent',
            }}
          >
            <DotsNine
              size={20}
              weight={isMoreView ? 'fill' : 'bold'}
              color={isMoreView || moreOpen ? 'var(--color-accent)' : '#8A8578'}
              style={{ display: 'block', flexShrink: 0, minWidth: 20, minHeight: 20 }}
            />
            <span
              className="font-mono text-[8px] tracking-[0.15em] uppercase"
              style={{ color: isMoreView || moreOpen ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
            >
              MORE
            </span>
          </motion.button>

          {/* More popover — brutalist panel */}
          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.1 }}
                className="absolute bottom-0 right-full mr-1 bg-[var(--color-surface)] border border-[var(--color-border)] p-2 w-[260px] z-[60]"
                style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.3)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--color-accent)' }}>
                    // MORE VIEWS
                  </span>
                  <button
                    onClick={() => setMoreOpen(false)}
                    className="p-0.5 hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <X size={12} color="#8A8578" />
                  </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-px" style={{ background: 'var(--color-border)' }}>
                  {filteredMore.map(item => {
                    const Icon = item.icon
                    const active = activeView === item.id
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-1 p-2.5 cursor-pointer"
                        style={{
                          background: active ? 'rgba(255, 45, 45, 0.08)' : 'var(--color-surface)',
                          borderLeft: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                        }}
                      >
                        <Icon
                          size={18}
                          weight={active ? 'fill' : 'bold'}
                          color={active ? 'var(--color-accent)' : '#8A8578'}
                          style={{ display: 'block', flexShrink: 0, minWidth: 18, minHeight: 18 }}
                        />
                        <span
                          className="text-[8px] font-mono leading-tight text-center uppercase tracking-wider"
                          style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
                        >
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

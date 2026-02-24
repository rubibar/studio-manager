import { useMemo } from 'react'
import {
  ChartBar, Bank, ListChecks, ChartLine, CalendarBlank,
  FolderOpen, Scales, CalendarDots, Kanban, TrendDown,
  ClockCounterClockwise, ChartPie, Rocket, GitBranch,
  Timer, CurrencyCircleDollar, Briefcase, Buildings,
  Target, GearSix,
} from '@phosphor-icons/react'
import { useUIStore, type ViewName } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'

type NavGroup = 'core' | 'planning' | 'analytics' | 'management'

const NAV_ITEMS: { id: ViewName; label: string; icon: React.ElementType; group: NavGroup; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: ChartBar, group: 'core' },
  { id: 'bank', label: 'Task Bank', icon: Bank, group: 'core' },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, group: 'core' },
  { id: 'kanban', label: 'Kanban', icon: Kanban, group: 'core' },
  { id: 'gantt', label: 'Gantt Chart', icon: ChartLine, group: 'planning' },
  { id: 'calendar', label: 'Calendar', icon: CalendarBlank, group: 'planning' },
  { id: 'weekview', label: 'Week View', icon: CalendarDots, group: 'planning' },
  { id: 'timeline', label: 'Timeline', icon: Timer, group: 'planning' },
  { id: 'categories', label: 'Categories', icon: FolderOpen, group: 'analytics' },
  { id: 'workload', label: 'Workload', icon: Scales, group: 'analytics' },
  { id: 'burndown', label: 'Burndown', icon: TrendDown, group: 'analytics' },
  { id: 'velocity', label: 'Velocity', icon: Rocket, group: 'analytics' },
  { id: 'dependencies', label: 'Dependencies', icon: GitBranch, group: 'analytics' },
  { id: 'reports', label: 'Reports', icon: ChartPie, group: 'management' },
  { id: 'activitylog', label: 'Activity Log', icon: ClockCounterClockwise, group: 'management' },
  { id: 'pricing', label: 'Hours & Pricing', icon: CurrencyCircleDollar, group: 'management' },
  { id: 'projects', label: 'Projects', icon: Briefcase, group: 'management' },
  { id: 'clients', label: 'Clients', icon: Buildings, group: 'management' },
  { id: 'okr', label: 'OKR', icon: Target, group: 'management' },
  { id: 'admin', label: 'Admin', icon: GearSix, group: 'management', adminOnly: true },
]

const GROUP_LABELS: Record<NavGroup, string> = {
  core: 'Core',
  planning: 'Planning',
  analytics: 'Analytics',
  management: 'Management',
}

const GROUPS: NavGroup[] = ['core', 'planning', 'analytics', 'management']

export function Sidebar() {
  const activeView = useUIStore(s => s.activeView)
  const setView = useUIStore(s => s.setView)
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const tasks = useTaskStore(s => s.tasks)

  const taskCounts = useMemo(() => {
    const active = tasks.filter(t => t.status !== 'done')
    const bank = tasks.filter(t => !t.assignee || !t.startDate || !t.endDate)
    return {
      tasks: active.length,
      kanban: active.length,
      bank: bank.length,
      reports: tasks.length,
    } as Record<string, number>
  }, [tasks])

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#111111]/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 h-full z-50 w-[220px] glass-panel border-l border-[var(--glass-border)]
          transition-transform duration-300 overflow-y-auto
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 p-4 border-b border-[var(--color-border)]/50">
          <div className="w-8 h-8 rounded-[var(--radius-bento-sm)] bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-glow-accent)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-[13px] tracking-tight leading-none">Studio</div>
            <div className="text-[9px] font-mono text-[var(--color-text-tertiary)] tracking-wider">MANAGER</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-2 flex flex-col gap-0.5">
          {GROUPS.map((group, gi) => {
            const items = NAV_ITEMS.filter(item => item.group === group && (!item.adminOnly || isAdmin))
            if (items.length === 0) return null
            return (
              <div key={group}>
                {gi > 0 && <div className="my-2 mx-2" />}
                <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                  <div className="w-1 h-3 rounded-full bg-[var(--color-accent)]/20" />
                  <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-mono">
                    {GROUP_LABELS[group]}
                  </span>
                </div>
                {items.map(item => {
                  const Icon = item.icon
                  const active = activeView === item.id
                  const count = taskCounts[item.id]
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setView(item.id)
                        if (window.innerWidth <= 1024) setSidebarOpen(false)
                      }}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-bento-sm)] text-[13px] font-medium
                        transition-all duration-200 cursor-pointer w-full text-right tracking-tight
                        ${active
                          ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-glow-accent)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]/40 hover:text-[var(--color-text-primary)]'
                        }
                      `}
                    >
                      <Icon size={18} weight={active ? 'fill' : 'regular'} />
                      <span className="flex-1 text-right">{item.label}</span>
                      {count && count > 0 && !active && (
                        <span className="text-[9px] font-mono bg-[var(--color-surface-3)]/60 text-[var(--color-text-tertiary)] px-1.5 py-0.5 rounded-full">
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

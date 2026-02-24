import {
  ChartBar, Bank, ListChecks, ChartLine, CalendarBlank,
  FolderOpen, Scales, CalendarDots, Kanban, TrendDown,
  ClockCounterClockwise, ChartPie, Rocket, GitBranch,
  Timer, CurrencyCircleDollar, Briefcase, Buildings,
  Target, GearSix,
} from '@phosphor-icons/react'
import { useUIStore, type ViewName } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const NAV_ITEMS: { id: ViewName; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'דשבורד', icon: ChartBar },
  { id: 'bank', label: 'בנק משימות', icon: Bank },
  { id: 'tasks', label: 'משימות', icon: ListChecks },
  { id: 'gantt', label: 'תרשים גאנט', icon: ChartLine },
  { id: 'calendar', label: 'קלנדר', icon: CalendarBlank },
  { id: 'categories', label: 'לפי קטגוריה', icon: FolderOpen },
  { id: 'workload', label: 'עומסים', icon: Scales },
  { id: 'weekview', label: 'שבוע נוכחי', icon: CalendarDots },
  { id: 'kanban', label: 'קנבאן', icon: Kanban },
  { id: 'burndown', label: 'ברנדאון', icon: TrendDown },
  { id: 'activitylog', label: 'לוג פעילות', icon: ClockCounterClockwise },
  { id: 'reports', label: 'דוחות', icon: ChartPie },
  { id: 'velocity', label: 'מהירות', icon: Rocket },
  { id: 'dependencies', label: 'תלויות', icon: GitBranch },
  { id: 'timeline', label: 'ציר זמן אישי', icon: Timer },
  { id: 'pricing', label: 'שעות ותמחור', icon: CurrencyCircleDollar },
  { id: 'projects', label: 'פרויקטים', icon: Briefcase },
  { id: 'clients', label: 'לקוחות', icon: Buildings },
  { id: 'okr', label: 'OKR', icon: Target },
  { id: 'admin', label: 'ניהול', icon: GearSix, adminOnly: true },
]

export function Sidebar() {
  const activeView = useUIStore(s => s.activeView)
  const setView = useUIStore(s => s.setView)
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const isAdmin = useAuthStore(s => s.isAdmin)

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 h-full z-50 w-56 bg-[var(--color-surface)] border-l border-[var(--color-border)]
          transition-transform duration-300 overflow-y-auto
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 border-b border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <span className="font-bold text-sm">Studio Manager</span>
        </div>

        {/* Nav items */}
        <nav className="p-2 flex flex-col gap-0.5">
          {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map(item => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id)
                  if (window.innerWidth <= 1024) setSidebarOpen(false)
                }}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium
                  transition-all duration-200 cursor-pointer w-full text-right
                  ${active
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]'
                  }
                `}
              >
                <Icon size={18} weight={active ? 'fill' : 'regular'} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

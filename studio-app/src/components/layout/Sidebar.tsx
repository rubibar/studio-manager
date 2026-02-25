import { useState, useRef, useEffect, useMemo } from 'react'
import {
  ChartBar, ListChecks, Kanban, CalendarBlank, ChartPie,
  DotsNine, Bank, ChartLine, FolderOpen, Scales,
  CalendarDots, TrendDown, ClockCounterClockwise, Rocket,
  GitBranch, Timer, CurrencyCircleDollar, Briefcase,
  Buildings, Target, GearSix,
  CaretLeft, CaretRight,
} from '@phosphor-icons/react'
import { useUIStore, type ViewName } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const PRIMARY_ITEMS: { id: ViewName; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'kanban', label: 'Board', icon: Kanban },
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
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed)
  const toggleSidebarCollapse = useUIStore(s => s.toggleSidebarCollapse)
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

  const expanded = !sidebarCollapsed
  const sidebarWidth = expanded ? 200 : 48

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50
          flex flex-col
          transition-all duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          background: '#EFEDE9',
          borderLeft: '1px solid var(--color-border, #E0DDD8)',
          fontFamily: 'var(--font-sans, "DM Sans", sans-serif)',
        }}
      >
        {/* Logo area */}
        <div
          className="flex items-center h-11 px-3 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border, #E0DDD8)' }}
        >
          {expanded ? (
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#3D3A36',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              Studio
            </span>
          ) : (
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#3D3A36',
                width: '100%',
                textAlign: 'center',
                display: 'block',
              }}
            >
              S
            </span>
          )}
        </div>

        {/* Primary nav */}
        <nav className="flex flex-col py-1 shrink-0">
          {PRIMARY_ITEMS.map(item => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="relative group cursor-pointer"
                title={!expanded ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 34,
                  paddingLeft: expanded ? 12 : 0,
                  paddingRight: expanded ? 12 : 0,
                  justifyContent: expanded ? 'flex-start' : 'center',
                  background: active ? 'rgba(74, 127, 181, 0.06)' : 'transparent',
                  borderRight: active ? '3px solid var(--color-accent, #4A7FB5)' : '3px solid transparent',
                  transition: 'background 150ms ease',
                  border: 'none',
                  borderLeft: 'none',
                  outline: 'none',
                  width: '100%',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = '#E6E3DD'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {/* Active indicator — right border in RTL means physically left */}
                {active && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      bottom: 4,
                      width: 3,
                      background: 'var(--color-accent, #4A7FB5)',
                      borderRadius: 1,
                    }}
                  />
                )}
                <Icon
                  size={16}
                  weight={active ? 'fill' : 'regular'}
                  color={active ? 'var(--color-accent, #4A7FB5)' : '#7A756D'}
                  style={{ flexShrink: 0 }}
                />
                {expanded && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 500 : 400,
                      color: active ? 'var(--color-accent, #4A7FB5)' : '#7A756D',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {!expanded && (
                  <span
                    className="pointer-events-none opacity-0 group-hover:opacity-100"
                    style={{
                      position: 'absolute',
                      right: '100%',
                      marginRight: 6,
                      padding: '4px 8px',
                      background: '#3D3A36',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      borderRadius: 2,
                      zIndex: 60,
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Separator */}
        <div style={{ height: 1, background: 'var(--color-border, #E0DDD8)', margin: '2px 0' }} />

        {/* More section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" ref={moreRef}>
          {expanded ? (
            /* Expanded: show all more items inline */
            <nav className="flex flex-col py-1">
              {filteredMore.map(item => {
                const Icon = item.icon
                const active = activeView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className="relative group cursor-pointer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 34,
                      paddingLeft: 12,
                      paddingRight: 12,
                      background: active ? 'rgba(74, 127, 181, 0.06)' : 'transparent',
                      transition: 'background 150ms ease',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = '#E6E3DD'
                    }}
                    onMouseLeave={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    {active && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 4,
                          bottom: 4,
                          width: 3,
                          background: 'var(--color-accent, #4A7FB5)',
                          borderRadius: 1,
                        }}
                      />
                    )}
                    <Icon
                      size={16}
                      weight={active ? 'fill' : 'regular'}
                      color={active ? 'var(--color-accent, #4A7FB5)' : '#7A756D'}
                      style={{ flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: active ? 500 : 400,
                        color: active ? 'var(--color-accent, #4A7FB5)' : '#7A756D',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </nav>
          ) : (
            /* Collapsed: DotsNine icon that opens a popover */
            <div className="relative flex flex-col items-center py-1">
              <button
                onClick={() => setMoreOpen(prev => !prev)}
                className="group cursor-pointer"
                title="More views"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 34,
                  width: '100%',
                  background: isMoreView || moreOpen ? 'rgba(74, 127, 181, 0.06)' : 'transparent',
                  transition: 'background 150ms ease',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  if (!isMoreView && !moreOpen) (e.currentTarget as HTMLElement).style.background = '#E6E3DD'
                }}
                onMouseLeave={e => {
                  if (!isMoreView && !moreOpen) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <DotsNine
                  size={16}
                  weight={isMoreView ? 'fill' : 'regular'}
                  color={isMoreView || moreOpen ? 'var(--color-accent, #4A7FB5)' : '#7A756D'}
                />
              </button>

              {/* Popover */}
              {moreOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: '100%',
                    marginRight: 4,
                    width: 200,
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border, #E0DDD8)',
                    borderRadius: 4,
                    zIndex: 60,
                    maxHeight: 400,
                    overflowY: 'auto',
                    padding: '4px 0',
                  }}
                >
                  <div
                    style={{
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 500,
                      color: '#A8A39B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    More Views
                  </div>
                  {filteredMore.map(item => {
                    const Icon = item.icon
                    const active = activeView === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          height: 32,
                          width: '100%',
                          paddingLeft: 12,
                          paddingRight: 12,
                          background: active ? 'rgba(74, 127, 181, 0.06)' : 'transparent',
                          transition: 'background 150ms ease',
                          border: 'none',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          if (!active) (e.currentTarget as HTMLElement).style.background = '#F7F6F4'
                        }}
                        onMouseLeave={e => {
                          if (!active) (e.currentTarget as HTMLElement).style.background = active ? 'rgba(74, 127, 181, 0.06)' : 'transparent'
                        }}
                      >
                        <Icon
                          size={14}
                          weight={active ? 'fill' : 'regular'}
                          color={active ? 'var(--color-accent, #4A7FB5)' : '#7A756D'}
                          style={{ flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: active ? 500 : 400,
                            color: active ? 'var(--color-accent, #4A7FB5)' : '#3D3A36',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom: Collapse toggle */}
        <div
          className="shrink-0"
          style={{ borderTop: '1px solid var(--color-border, #E0DDD8)' }}
        >
          <button
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex items-center justify-center cursor-pointer"
            title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{
              height: 36,
              width: '100%',
              background: 'transparent',
              transition: 'background 150ms ease',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E6E3DD' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            {/* In RTL: CaretRight visually points toward content (collapse), CaretLeft points away (expand) */}
            {expanded ? (
              <CaretRight size={14} color="#7A756D" />
            ) : (
              <CaretLeft size={14} color="#7A756D" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

import { useMemo } from 'react'
import { Plus, CalendarBlank, Lightning, Users, CheckCircle } from '@phosphor-icons/react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { StaggeredList, StaggeredItem } from '@/components/shared/StaggeredList'
import { TEAM } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'

export function Dashboard() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const openModal = useUIStore(s => s.openModal)
  const user = useAuthStore(s => s.user)

  const active = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks])
  const done = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks])
  const overdue = useMemo(() => active.filter(t => t.endDate && new Date(t.endDate) < new Date()), [active])
  const inReview = useMemo(() => tasks.filter(t => t.status === 'review'), [tasks])

  const todayTasks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const horizon = new Date(today)
    horizon.setDate(horizon.getDate() + 3)
    return active
      .filter(t => {
        if (!t.endDate) return false
        const d = new Date(t.endDate)
        return d <= horizon
      })
      .sort((a, b) => getScore(b.id) - getScore(a.id))
      .slice(0, 8)
  }, [active, getScore])

  const teamStats = useMemo(() =>
    TEAM.map(m => {
      const memberTasks = active.filter(t => t.assignee === m.id)
      return {
        ...m,
        total: memberTasks.length,
        inProgress: memberTasks.filter(t => t.status === 'in-progress').length,
      }
    }),
    [active]
  )

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <StaggeredList className="space-y-4 max-w-6xl">
      {/* Header bar */}
      <StaggeredItem>
        <div className="flex items-center justify-between py-2">
          <div>
            <h2
              className="text-[18px] font-semibold"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)' }}
            >
              {greeting}, {user?.displayName?.split(' ')[0] || 'there'}
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              {todayStr}
            </p>
          </div>
          <button
            onClick={() => openModal({ type: 'addTask' })}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 text-white cursor-pointer transition-opacity duration-150 hover:opacity-90"
            style={{
              fontFamily: 'var(--font-sans)',
              background: 'var(--color-accent)',
              borderRadius: '4px',
            }}
          >
            <Plus size={15} weight="bold" />
            New Task
          </button>
        </div>
      </StaggeredItem>

      {/* Stats row */}
      <StaggeredItem>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBlock label="Active" value={active.length} icon={Lightning} />
          <StatBlock label="Overdue" value={overdue.length} icon={CalendarBlank} alert={overdue.length > 0} />
          <StatBlock label="In Review" value={inReview.length} icon={Users} />
          <StatBlock label="Completed" value={done.length} icon={CheckCircle} />
        </div>
      </StaggeredItem>

      {/* Two-column layout */}
      <StaggeredItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-3">
            <TodayFocusSection tasks={todayTasks} getScore={getScore} onTaskClick={openSlideOver} />
          </div>
          <div className="lg:col-span-2">
            <TeamActivitySection teamStats={teamStats} />
          </div>
        </div>
      </StaggeredItem>
    </StaggeredList>
  )
}

/* -- Stat Block -- */
function StatBlock({ label, value, icon: Icon, alert }: {
  label: string
  value: number
  icon: React.ElementType
  alert?: boolean
}) {
  return (
    <div
      className="relative p-4"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        borderLeft: alert ? '3px solid #E5737E' : '1px solid var(--color-border)',
      }}
    >
      <div className="absolute top-3 right-3">
        <Icon
          size={16}
          weight="regular"
          color={alert ? '#E5737E' : 'var(--color-text-tertiary)'}
        />
      </div>
      <div
        className="text-[11px] font-semibold uppercase tracking-wide mb-2"
        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)' }}
      >
        {label}
      </div>
      <AnimatedNumber
        value={value}
        className={`text-[28px] font-semibold tracking-tight block`}
        style={{
          fontFamily: 'var(--font-sans)',
          color: alert ? '#E5737E' : 'var(--color-text-primary)',
        }}
      />
    </div>
  )
}

/* -- Today's Focus Section -- */
function TodayFocusSection({ tasks, getScore, onTaskClick }: {
  tasks: ReturnType<typeof useVisibleTasks>
  getScore: (id: number) => number
  onTaskClick: (id: number) => void
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
      }}
    >
      <div className="px-4 pt-4 pb-2">
        <h3
          className="text-[12px] font-semibold uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)' }}
        >
          Today's Focus
        </h3>
      </div>

      <div>
        {tasks.length === 0 && (
          <p
            className="text-[13px] py-10 text-center"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-tertiary)' }}
          >
            Nothing due soon
          </p>
        )}
        {tasks.map((t) => {
          const score = getScore(t.id)
          const member = TEAM.find(m => m.id === t.assignee)
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150"
              style={{ borderBottom: '1px solid var(--color-border)' }}
              onClick={() => onTaskClick(t.id)}
              onMouseEnter={e => (e.currentTarget.style.background = '#EFEDE9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ScoreBadge score={score} />
              <span
                className="flex-1 min-w-0 text-[13px] truncate"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)' }}
              >
                {t.name}
              </span>
              {member && (
                <span className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="w-2 h-2 shrink-0"
                    style={{ background: member.color, borderRadius: '2px' }}
                  />
                  <span
                    className="text-[11px]"
                    style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)' }}
                  >
                    {member.name}
                  </span>
                </span>
              )}
              {t.endDate && (
                <span
                  className="text-[11px] shrink-0"
                  style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-tertiary)' }}
                >
                  {formatDate(t.endDate)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* -- Team Activity Section -- */
function TeamActivitySection({ teamStats }: {
  teamStats: { id: string; name: string; color: string; total: number; inProgress: number }[]
}) {
  const maxTasks = Math.max(...teamStats.map(m => m.total), 1)

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
      }}
    >
      <div className="px-4 pt-4 pb-2">
        <h3
          className="text-[12px] font-semibold uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)' }}
        >
          Team Activity
        </h3>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {teamStats.map(m => (
          <div key={m.id}>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2.5 h-2.5 shrink-0"
                style={{ background: m.color, borderRadius: '2px' }}
              />
              <span
                className="text-[13px] font-medium flex-1"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)' }}
              >
                {m.name}
              </span>
              {m.inProgress > 0 && (
                <span
                  className="w-2 h-2 shrink-0 rounded-full"
                  style={{ background: '#7EC886' }}
                />
              )}
              <span
                className="text-[12px] font-semibold"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)' }}
              >
                {m.total}
              </span>
            </div>
            <div
              className="h-[3px] w-full overflow-hidden"
              style={{ background: '#EFEDE9', borderRadius: '2px' }}
            >
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  background: m.color,
                  width: `${(m.total / maxTasks) * 100}%`,
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

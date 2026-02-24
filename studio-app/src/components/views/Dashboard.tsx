import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, CalendarBlank, Lightning, Users } from '@phosphor-icons/react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { StaggeredList, StaggeredItem } from '@/components/shared/StaggeredList'
import { useTiltSpring } from '@/hooks/useTilt'
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
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 3)
    return active
      .filter(t => {
        if (!t.endDate) return false
        const d = new Date(t.endDate)
        return d <= tomorrow
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

  const { ref: welcomeRef, onMouseMove: onWelcomeMove, onMouseLeave: onWelcomeLeave, style: tiltStyle } = useTiltSpring({ maxTilt: 5 })

  const todayStr = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <StaggeredList className="space-y-5 max-w-5xl">
      {/* Welcome card */}
      <StaggeredItem>
        <motion.div
          ref={welcomeRef}
          onMouseMove={onWelcomeMove}
          onMouseLeave={onWelcomeLeave}
          style={tiltStyle}
          className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight mb-1">
                {greeting}, {user?.displayName?.split(' ')[0] || 'there'}
              </h2>
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                {todayStr}
              </p>
            </div>
            <motion.button
              onClick={() => openModal({ type: 'addTask' })}
              className="flex items-center gap-2 bg-[var(--color-accent)] text-white text-[13px] font-medium px-4 py-2.5 rounded-[var(--radius-default)] hover:bg-[var(--color-accent-hover)] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={16} weight="bold" />
              New Task
            </motion.button>
          </div>
        </motion.div>
      </StaggeredItem>

      {/* Stats row */}
      <StaggeredItem>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Active" value={active.length} icon="lightning" delay={0} />
          <StatCard label="Overdue" value={overdue.length} icon="calendar" delay={80} alert={overdue.length > 0} />
          <StatCard label="In Review" value={inReview.length} icon="users" delay={160} />
          <StatCard label="Completed" value={done.length} icon="check" delay={240} />
        </div>
      </StaggeredItem>

      {/* Today's Focus + Team Activity */}
      <StaggeredItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <TodayFocusWidget tasks={todayTasks} getScore={getScore} onTaskClick={openSlideOver} />
          </div>
          <div className="lg:col-span-2">
            <TeamActivityWidget teamStats={teamStats} />
          </div>
        </div>
      </StaggeredItem>
    </StaggeredList>
  )
}

/* ── Stat Card ── */
function StatCard({ label, value, icon, delay, alert }: {
  label: string
  value: number
  icon: string
  delay: number
  alert?: boolean
}) {
  const IconMap = {
    lightning: Lightning,
    calendar: CalendarBlank,
    users: Users,
    check: ({ size, className }: { size: number; className?: string }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  }
  const Icon = IconMap[icon as keyof typeof IconMap] || Lightning

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
          {label}
        </span>
        <Icon size={16} className={alert ? 'text-[var(--color-red)]' : 'text-[var(--color-text-tertiary)]'} />
      </div>
      <AnimatedNumber
        value={value}
        delay={delay}
        className={`text-[28px] font-semibold tracking-tight ${alert ? 'text-[var(--color-red)]' : ''}`}
      />
    </div>
  )
}

/* ── Today's Focus ── */
function TodayFocusWidget({ tasks, getScore, onTaskClick }: {
  tasks: ReturnType<typeof useVisibleTasks>
  getScore: (id: number) => number
  onTaskClick: (id: number) => void
}) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
        Today's Focus
      </h3>
      <div className="space-y-1">
        {tasks.length === 0 && (
          <p className="text-[13px] text-[var(--color-text-tertiary)] py-6 text-center">
            Nothing due soon
          </p>
        )}
        {tasks.map(t => {
          const score = getScore(t.id)
          const member = TEAM.find(m => m.id === t.assignee)
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 rounded-[var(--radius-default)] hover:bg-[var(--color-surface-2)]/50 cursor-pointer transition-colors"
              onClick={() => onTaskClick(t.id)}
            >
              <ScoreBadge score={score} />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium block truncate">{t.name}</span>
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  {member?.name}
                  {t.endDate && ` · ${formatDate(t.endDate)}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Team Activity ── */
function TeamActivityWidget({ teamStats }: {
  teamStats: { id: string; name: string; color: string; total: number; inProgress: number }[]
}) {
  const maxTasks = Math.max(...teamStats.map(m => m.total), 1)

  return (
    <div className="glass-card p-5">
      <h3 className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
        Team Activity
      </h3>
      <div className="space-y-4">
        {teamStats.map(m => (
          <div key={m.id} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: m.color }}
            >
              {m.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-medium">{m.name}</span>
                {m.inProgress > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full breathe" style={{ background: m.color }} />
                )}
                <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] mr-auto">
                  {m.total}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--color-surface-3)]/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: m.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.total / maxTasks) * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, CalendarBlank, Lightning, Users, CheckCircle } from '@phosphor-icons/react'
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
          className="glass-card p-6 relative overflow-hidden">
          {/* Subtle accent gradient ribbon */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] opacity-60 gradient-shift"
            style={{
              background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-light), var(--color-accent))',
              backgroundSize: '200% 100%',
            }}
          />
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
              className="flex items-center gap-2 bg-[var(--color-accent)] text-white text-[13px] font-medium px-4 py-2.5 rounded-[var(--radius-default)] hover:bg-[var(--color-accent-hover)] transition-colors shadow-[var(--shadow-glow-accent)]"
              whileHover={{ scale: 1.04, boxShadow: '0 0 24px color-mix(in srgb, var(--color-accent) 40%, transparent)' }}
              whileTap={{ scale: 0.96 }}
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
    check: CheckCircle,
  }
  const Icon = IconMap[icon as keyof typeof IconMap] || Lightning

  return (
    <motion.div
      className="glass-card p-4 group"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280, delay: delay / 1000 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
          {label}
        </span>
        <motion.div
          className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${
            alert
              ? 'bg-[var(--color-red)]/10 text-[var(--color-red)]'
              : 'bg-[var(--color-accent)]/8 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/12'
          } transition-colors`}
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <Icon size={16} weight="duotone" />
        </motion.div>
      </div>
      <AnimatedNumber
        value={value}
        delay={delay}
        className={`text-[28px] font-semibold tracking-tight ${alert ? 'text-[var(--color-red)]' : ''}`}
      />
    </motion.div>
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
        {tasks.map((t, i) => {
          const score = getScore(t.id)
          const member = TEAM.find(m => m.id === t.assignee)
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', damping: 25, stiffness: 300 }}
              whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
              className="flex items-center gap-3 p-3 rounded-[var(--radius-default)] cursor-pointer transition-colors"
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
            </motion.div>
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
        {teamStats.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', damping: 22, stiffness: 280 }}
            className="flex items-center gap-3 group"
          >
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: m.color }}
              whileHover={{ scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {m.name.charAt(0)}
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-medium">{m.name}</span>
                {m.inProgress > 0 && (
                  <span className="w-2 h-2 rounded-full breathe pulse-ring" style={{ background: m.color }} />
                )}
                <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] mr-auto">
                  {m.total}
                </span>
              </div>
              <div className="h-2 bg-[var(--color-surface-3)]/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}dd)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.total / maxTasks) * 100}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

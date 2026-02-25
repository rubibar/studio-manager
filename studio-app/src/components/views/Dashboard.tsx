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
    if (hour < 12) return 'GOOD MORNING'
    if (hour < 17) return 'GOOD AFTERNOON'
    return 'GOOD EVENING'
  }, [])

  const todayStr = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <StaggeredList className="space-y-4 max-w-6xl">
      {/* Welcome — brutalist header block */}
      <StaggeredItem>
        <div
          className="p-5 relative"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderLeft: '4px solid var(--color-accent)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-accent)' }}>
                  // {greeting}
                </span>
                <span className="font-mono text-[9px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              </div>
              <h2
                className="text-[28px] font-bold tracking-tight mb-1"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {user?.displayName?.split(' ')[0] || 'Operator'}
              </h2>
              <p className="text-[12px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                {todayStr}
              </p>
            </div>
            <motion.button
              onClick={() => openModal({ type: 'addTask' })}
              className="flex items-center gap-2 text-[11px] font-mono font-bold px-4 py-2 uppercase tracking-wider cursor-pointer"
              style={{
                background: 'var(--color-accent)',
                color: '#080807',
                boxShadow: 'var(--shadow-glow-accent)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={14} weight="bold" />
              NEW TASK
            </motion.button>
          </div>
        </div>
      </StaggeredItem>

      {/* Stats strip — raw data blocks */}
      <StaggeredItem>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'var(--color-border)' }}>
          <StatCard label="ACTIVE" value={active.length} icon="lightning" delay={0} />
          <StatCard label="OVERDUE" value={overdue.length} icon="calendar" delay={80} alert={overdue.length > 0} />
          <StatCard label="REVIEW" value={inReview.length} icon="users" delay={160} />
          <StatCard label="DONE" value={done.length} icon="check" delay={240} />
        </div>
      </StaggeredItem>

      {/* Focus + Team — asymmetric grid */}
      <StaggeredItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-px" style={{ background: 'var(--color-border)' }}>
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

/* ── Stat Card — signal block ── */
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
      className="p-4 relative"
      style={{
        background: 'var(--color-surface)',
        borderLeft: alert ? '3px solid var(--color-red)' : '3px solid transparent',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-mono font-bold tracking-[0.2em]" style={{ color: 'var(--color-text-tertiary)' }}>
          {label}
        </span>
        <Icon
          size={14}
          weight="bold"
          color={alert ? 'var(--color-red)' : 'var(--color-text-tertiary)'}
        />
      </div>
      <AnimatedNumber
        value={value}
        delay={delay}
        className={`text-[32px] font-bold tracking-tighter font-mono ${alert ? 'text-[var(--color-red)]' : ''}`}
      />
      {alert && value > 0 && (
        <div
          className="absolute top-2 right-2 w-1.5 h-1.5 signal-blink"
          style={{ background: 'var(--color-red)' }}
        />
      )}
    </motion.div>
  )
}

/* ── Today's Focus — queue display ── */
function TodayFocusWidget({ tasks, getScore, onTaskClick }: {
  tasks: ReturnType<typeof useVisibleTasks>
  getScore: (id: number) => number
  onTaskClick: (id: number) => void
}) {
  return (
    <div className="p-4" style={{ background: 'var(--color-surface)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-mono font-bold tracking-[0.2em]" style={{ color: 'var(--color-accent)' }}>
          // PRIORITY QUEUE
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
          {tasks.length}
        </span>
      </div>
      <div className="space-y-0">
        {tasks.length === 0 && (
          <p className="text-[11px] font-mono py-8 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
            NO_ITEMS_DUE
          </p>
        )}
        {tasks.map((t, i) => {
          const score = getScore(t.id)
          const member = TEAM.find(m => m.id === t.assignee)
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-2.5 cursor-pointer border-b transition-colors hover:bg-[var(--color-surface-2)]"
              style={{ borderColor: 'var(--color-border)' }}
              onClick={() => onTaskClick(t.id)}
            >
              <span className="text-[9px] font-mono w-4 shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <ScoreBadge score={score} />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-mono block truncate">{t.name}</span>
              </div>
              <span className="text-[10px] font-mono shrink-0" style={{ color: member?.color || 'var(--color-text-tertiary)' }}>
                {member?.name?.split(' ')[0] || '—'}
              </span>
              {t.endDate && (
                <span className="text-[9px] font-mono shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                  {formatDate(t.endDate)}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Team Activity — status display ── */
function TeamActivityWidget({ teamStats }: {
  teamStats: { id: string; name: string; color: string; total: number; inProgress: number }[]
}) {
  const maxTasks = Math.max(...teamStats.map(m => m.total), 1)

  return (
    <div className="p-4" style={{ background: 'var(--color-surface)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-mono font-bold tracking-[0.2em]" style={{ color: 'var(--color-accent)' }}>
          // OPERATORS
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
      </div>
      <div className="space-y-3">
        {teamStats.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-2 h-2 shrink-0"
                style={{ background: m.color }}
              />
              <span className="text-[12px] font-mono font-medium flex-1">{m.name}</span>
              {m.inProgress > 0 && (
                <span className="w-1.5 h-1.5 signal-blink" style={{ background: 'var(--color-green)' }} />
              )}
              <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                {m.total}
              </span>
            </div>
            {/* Progress — raw bar */}
            <div className="h-1" style={{ background: 'var(--color-surface-3)' }}>
              <motion.div
                className="h-full"
                style={{ background: m.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(m.total / maxTasks) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

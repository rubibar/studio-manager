import { useMemo, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Plus, Kanban as KanbanIcon, Eye, Bank } from '@phosphor-icons/react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useUIStore, type ViewName } from '@/stores/uiStore'
import { useMagnetic } from '@/hooks/useMagnetic'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { SpotlightCard } from '@/components/shared/SpotlightCard'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { StaggeredList, StaggeredItem } from '@/components/shared/StaggeredList'
import { TEAM } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'

export function Dashboard() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const openModal = useUIStore(s => s.openModal)
  const setView = useUIStore(s => s.setView)

  const active = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks])
  const done = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks])
  const overdue = useMemo(() => active.filter(t => t.endDate && new Date(t.endDate) < new Date()), [active])
  const inReview = useMemo(() => tasks.filter(t => t.status === 'review'), [tasks])

  const urgentTasks = useMemo(() =>
    [...active].sort((a, b) => getScore(b.id) - getScore(a.id)).slice(0, 5),
    [active, getScore]
  )

  const todayTasks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return active
      .filter(t => {
        if (!t.endDate) return false
        const d = new Date(t.endDate)
        return d <= tomorrow
      })
      .sort((a, b) => getScore(b.id) - getScore(a.id))
      .slice(0, 8)
  }, [active, getScore])

  const spotlightTask = urgentTasks[0]
  const spotlightScore = spotlightTask ? getScore(spotlightTask.id) : 0

  const teamStats = useMemo(() =>
    TEAM.map(m => {
      const memberTasks = active.filter(t => t.assignee === m.id)
      const inProgress = memberTasks.filter(t => t.status === 'in-progress').length
      return {
        ...m,
        total: memberTasks.length,
        inProgress,
        hot: memberTasks.filter(t => getScore(t.id) >= 70).length,
      }
    }),
    [active, getScore]
  )

  return (
    <StaggeredList className="space-y-5">
      {/* Row 1: Spotlight + Quick Actions */}
      <StaggeredItem>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <SpotlightWidget
              task={spotlightTask}
              score={spotlightScore}
              onClick={() => spotlightTask && openSlideOver(spotlightTask.id)}
            />
          </div>
          <QuickActionsWidget
            onNewTask={() => openModal({ type: 'addTask' })}
            onNavigate={setView}
          />
        </div>
      </StaggeredItem>

      {/* Row 2: Live Stats Strip */}
      <StaggeredItem>
        <div className="flex items-center gap-0 divide-x divide-[var(--color-border)]">
          <StatItem label="Active" value={active.length} delay={0} />
          <StatItem label="Completed" value={done.length} delay={100} />
          <StatItem label="Overdue" value={overdue.length} delay={200} />
          <StatItem label="In Review" value={inReview.length} delay={300} />
        </div>
      </StaggeredItem>

      {/* Row 3: Today's Focus + Team Pulse */}
      <StaggeredItem>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <TodayFocusWidget tasks={todayTasks} getScore={getScore} onTaskClick={openSlideOver} />
          </div>
          <TeamPulseWidget teamStats={teamStats} />
        </div>
      </StaggeredItem>

      {/* Row 4: Urgent Queue (full width on this row) */}
      <StaggeredItem>
        <UrgentQueueWidget tasks={urgentTasks} getScore={getScore} onTaskClick={openSlideOver} />
      </StaggeredItem>
    </StaggeredList>
  )
}

/* ── Spotlight Widget ── */
function SpotlightWidget({ task, score, onClick }: {
  task: typeof undefined | ReturnType<typeof useVisibleTasks>[0]
  score: number
  onClick: () => void
}) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-150, 150], [4, -4])
  const rotateY = useTransform(mouseX, [-150, 150], [-4, 4])

  if (!task) {
    return (
      <div className="rounded-[var(--radius-bento)] bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center">
        <p className="text-[var(--color-text-tertiary)] text-[13px]">No active tasks</p>
      </div>
    )
  }

  const member = TEAM.find(m => m.id === task.assignee)

  return (
    <motion.div
      className="relative rounded-[var(--radius-bento)] p-6 cursor-pointer overflow-hidden"
      style={{
        background: '#111111',
        backgroundImage: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(230,59,46,0.12), transparent)',
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left - rect.width / 2)
        mouseY.set(e.clientY - rect.top - rect.height / 2)
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] uppercase tracking-widest text-[#71717a] font-mono font-bold">
              Spotlight
            </span>
            <TypeBadge type={task.type} />
          </div>
          <h3 className="text-[#E8E4DD] text-[22px] font-serif italic leading-tight mb-3 truncate">
            {task.name}
          </h3>
          <div className="flex items-center gap-3 text-[12px] text-[#71717a]">
            {member && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: member.color }} />
                {member.name}
              </span>
            )}
            {task.endDate && <span>{formatDate(task.endDate)}</span>}
          </div>
        </div>
        <ScoreBadge score={score} size="md" />
      </div>
    </motion.div>
  )
}

/* ── Quick Actions Widget ── */
function QuickActionsWidget({ onNewTask, onNavigate }: {
  onNewTask: () => void
  onNavigate: (view: ViewName) => void
}) {
  const btn1Ref = useRef<HTMLButtonElement>(null)
  const { x: x1, y: y1 } = useMagnetic(btn1Ref, 0.2)

  const actions = [
    { icon: Plus, label: 'New Task', onClick: onNewTask, accent: true, ref: btn1Ref, mx: x1, my: y1 },
    { icon: KanbanIcon, label: 'Kanban', onClick: () => onNavigate('kanban') },
    { icon: Eye, label: 'Review', onClick: () => onNavigate('reports') },
    { icon: Bank, label: 'Bank', onClick: () => onNavigate('bank') },
  ]

  return (
    <div className="rounded-[var(--radius-bento)] bg-[var(--color-surface)] border border-[var(--color-border)] p-5 flex flex-col gap-2.5">
      <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-mono font-bold mb-1">
        Quick Actions
      </span>
      {actions.map((a, i) => {
        const Icon = a.icon
        if (a.accent) {
          return (
            <motion.button
              key={i}
              ref={a.ref}
              style={{ x: a.mx, y: a.my }}
              onClick={a.onClick}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-[var(--radius-bento-sm)] bg-[var(--color-accent)] text-white text-[13px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Icon size={16} weight="bold" />
              {a.label}
            </motion.button>
          )
        }
        return (
          <button
            key={i}
            onClick={a.onClick}
            className="tactile flex items-center gap-2.5 px-4 py-2.5 rounded-[var(--radius-bento-sm)] bg-[var(--color-surface-2)] text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Icon size={16} />
            {a.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Stat Item (no card — just number + label in a strip) ── */
function StatItem({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div className="px-6 py-3 first:pr-6 first:pl-0 last:pl-6">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-mono mb-0.5">
        {label}
      </div>
      <AnimatedNumber
        value={value}
        delay={delay}
        className="text-[24px] font-bold font-serif"
      />
    </div>
  )
}

/* ── Today's Focus Widget ── */
function TodayFocusWidget({ tasks, getScore, onTaskClick }: {
  tasks: ReturnType<typeof useVisibleTasks>
  getScore: (id: number) => number
  onTaskClick: (id: number) => void
}) {
  return (
    <div className="rounded-[var(--radius-bento)] bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
      <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-mono font-bold mb-3 block">
        Today's Focus
      </span>
      <div className="space-y-1">
        {tasks.length === 0 && (
          <p className="text-[13px] text-[var(--color-text-tertiary)] py-4 text-center">
            Nothing due today
          </p>
        )}
        {tasks.map(t => {
          const score = getScore(t.id)
          return (
            <SpotlightCard
              key={t.id}
              onClick={() => onTaskClick(t.id)}
              className="flex items-center gap-3 p-3 cursor-pointer bg-[var(--color-surface)]"
            >
              <ScoreBadge score={score} />
              <span className="text-[13px] font-medium flex-1 truncate">{t.name}</span>
              {t.endDate && (
                <span className="text-[11px] text-[var(--color-text-tertiary)] shrink-0">
                  {formatDate(t.endDate)}
                </span>
              )}
            </SpotlightCard>
          )
        })}
      </div>
    </div>
  )
}

/* ── Team Pulse Widget ── */
function TeamPulseWidget({ teamStats }: {
  teamStats: { id: string; name: string; color: string; total: number; inProgress: number; hot: number }[]
}) {
  const maxTasks = Math.max(...teamStats.map(m => m.total), 1)

  return (
    <div className="rounded-[var(--radius-bento)] bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
      <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-mono font-bold mb-3 block">
        Team Pulse
      </span>
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
                  <span className="w-2 h-2 rounded-full breathe" style={{ background: m.color }} />
                )}
                <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] mr-auto">
                  {m.total}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
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

/* ── Urgent Queue Widget ── */
function UrgentQueueWidget({ tasks, getScore, onTaskClick }: {
  tasks: ReturnType<typeof useVisibleTasks>
  getScore: (id: number) => number
  onTaskClick: (id: number) => void
}) {
  return (
    <div className="rounded-[var(--radius-bento)] bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
      <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-mono font-bold mb-3 block">
        Urgent Queue
      </span>
      <div className="space-y-1">
        {tasks.length === 0 && (
          <p className="text-[13px] text-[var(--color-text-tertiary)] py-4 text-center">
            No urgent tasks
          </p>
        )}
        {tasks.map(t => {
          const score = getScore(t.id)
          const member = TEAM.find(m => m.id === t.assignee)
          const borderColor = score >= 70 ? 'var(--color-red)' : score >= 40 ? 'var(--color-yellow)' : 'var(--color-border)'
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 p-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors border-r-2"
              style={{ borderRightColor: borderColor }}
              onClick={() => onTaskClick(t.id)}
            >
              <ScoreBadge score={score} />
              <span className="text-[13px] font-medium flex-1 truncate">{t.name}</span>
              {member && (
                <span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: member.color }} />
                  {member.name}
                </span>
              )}
              {t.endDate && (
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
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

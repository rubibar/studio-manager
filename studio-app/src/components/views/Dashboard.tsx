import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useUIStore } from '@/stores/uiStore'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { TEAM } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'

export function Dashboard() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const openModal = useUIStore(s => s.openModal)

  const active = tasks.filter(t => t.status !== 'done')
  const done = tasks.filter(t => t.status === 'done')
  const overdue = active.filter(t => t.endDate && new Date(t.endDate) < new Date())
  const inReview = tasks.filter(t => t.status === 'review')
  const hot = active.filter(t => getScore(t.id) >= 70)

  // Sort by score descending for the urgent list
  const urgentTasks = [...active]
    .sort((a, b) => getScore(b.id) - getScore(a.id))
    .slice(0, 6)

  // Spotlight — top scored task
  const spotlightTask = urgentTasks[0]
  const spotlightScore = spotlightTask ? getScore(spotlightTask.id) : 0

  // Per-team stats
  const teamStats = TEAM.map(m => {
    const memberTasks = active.filter(t => t.assignee === m.id)
    return {
      ...m,
      total: memberTasks.length,
      hot: memberTasks.filter(t => getScore(t.id) >= 70).length,
    }
  })

  return (
    <div className="space-y-6">
      {/* Spotlight */}
      {spotlightTask && spotlightScore >= 70 && (
        <div
          className="relative rounded-[var(--radius-lg)] p-5 cursor-pointer overflow-hidden"
          style={{
            background: '#18181b',
            backgroundImage: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(5,150,105,0.1), transparent)',
          }}
          onClick={() => openModal({ type: 'editTask', taskId: spotlightTask.id })}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-bold">
                  Spotlight
                </span>
                <TypeBadge type={spotlightTask.type} />
              </div>
              <h3 className="text-white text-[17px] font-bold mb-1">
                {spotlightTask.name}
              </h3>
              <div className="flex items-center gap-3 text-[12px] text-[#a1a1aa]">
                <span>{TEAM.find(m => m.id === spotlightTask.assignee)?.name}</span>
                {spotlightTask.endDate && (
                  <span>{formatDate(spotlightTask.endDate)}</span>
                )}
              </div>
            </div>
            <ScoreBadge score={spotlightScore} size="md" />
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="סה&quot;כ" value={tasks.length} color="var(--color-accent)" />
        <KPICard label="הושלמו" value={done.length} color="var(--color-green)" />
        <KPICard label="באיחור" value={overdue.length} color="var(--color-red)" />
        <KPICard label="ביקורת" value={inReview.length} color="var(--color-purple)" />
      </div>

      {/* Team workload quick view */}
      <div className="grid grid-cols-3 gap-3">
        {teamStats.map(m => (
          <div key={m.id} className="bg-[var(--color-surface-2)] rounded-[var(--radius-default)] p-3 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
              <span className="text-[13px] font-bold">{m.name}</span>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-secondary)]">
              <span>{m.total} פעילות</span>
              {m.hot > 0 && (
                <span className="text-[var(--color-red)]">{m.hot} hot</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Urgent tasks by score */}
      <div>
        <h2 className="text-[14px] font-bold mb-3">משימות דחופות</h2>
        <div className="space-y-1.5">
          {urgentTasks.map(t => {
            const score = getScore(t.id)
            const member = TEAM.find(m => m.id === t.assignee)
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 p-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors border border-transparent hover:border-[var(--color-border)]"
                onClick={() => openModal({ type: 'editTask', taskId: t.id })}
              >
                <ScoreBadge score={score} />
                <span className="text-[13px] font-medium flex-1 truncate">{t.name}</span>
                <StatusBadge status={t.status} />
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  {member?.name}
                </span>
                {t.endDate && (
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    {formatDate(t.endDate)}
                  </span>
                )}
              </div>
            )
          })}
          {urgentTasks.length === 0 && (
            <p className="text-[13px] text-[var(--color-text-tertiary)] py-4 text-center">
              אין משימות פעילות
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-default)] p-4 border border-[var(--color-border)]">
      <div className="text-[11px] text-[var(--color-text-tertiary)] mb-1">{label}</div>
      <div className="text-[22px] font-bold font-mono" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

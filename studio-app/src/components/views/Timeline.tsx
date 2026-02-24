import { useState, useMemo } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { TEAM, CATEGORIES } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { EmptyState } from '@/components/shared/EmptyState'

export function Timeline() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const currentTeamId = useAuthStore(s => s.teamMemberId)
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const [person, setPerson] = useState(currentTeamId)

  const today = useMemo(() => new Date(), [])

  const personTasks = useMemo(() => {
    return tasks
      .filter(t => t.assignee === person && t.endDate)
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
  }, [tasks, person])

  // Group by month
  const grouped = useMemo(() => {
    const groups: { month: string; tasks: typeof personTasks }[] = []
    let lastMonth = ''
    personTasks.forEach(t => {
      const monthStr = format(new Date(t.endDate!), 'MMMM yyyy', { locale: he })
      if (monthStr !== lastMonth) {
        lastMonth = monthStr
        groups.push({ month: monthStr, tasks: [] })
      }
      groups[groups.length - 1].tasks.push(t)
    })
    return groups
  }, [personTasks])

  const member = TEAM.find(m => m.id === person)

  return (
    <div className="space-y-5">
      {/* Person selector */}
      <div className="flex items-center gap-2">
        {TEAM.map(m => (
          <button
            key={m.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-[12px] font-medium transition-colors ${
              person === m.id
                ? 'text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
            }`}
            style={person === m.id ? { background: m.color } : undefined}
            onClick={() => setPerson(m.id)}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{
              background: person === m.id ? 'rgba(255,255,255,0.2)' : m.color,
              color: 'white',
            }}>
              {m.name[0]}
            </div>
            {m.name}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {personTasks.length === 0 ? (
        <EmptyState title="No tasks" description={`No tasks for ${member?.name || 'team member'}`} />
      ) : (
        <div className="relative pr-6">
          {/* Vertical line */}
          <div className="absolute right-3 top-0 bottom-0 w-px bg-[var(--color-border)]" />

          {grouped.map(group => (
            <div key={group.month}>
              {/* Month header */}
              <div className="relative mb-3 mt-6 first:mt-0">
                <div className="absolute right-[-3px] w-[7px] h-[7px] rounded-full bg-[var(--color-accent)] top-1/2 -translate-y-1/2" />
                <div className="text-[13px] font-bold text-[var(--color-accent)] mr-4">
                  {group.month}
                </div>
              </div>

              {/* Tasks */}
              {group.tasks.map(t => {
                const cat = CATEGORIES.find(c => c.id === t.category)
                const score = getScore(t.id)
                const isOverdue = t.endDate && new Date(t.endDate) < today && t.status !== 'done'
                const subtaskPct = t.subtasks?.length
                  ? Math.round((t.subtasks.filter(s => s.done).length / t.subtasks.length) * 100)
                  : null
                const statusColor: Record<string, string> = {
                  'todo': 'var(--color-text-tertiary)',
                  'in-progress': 'var(--color-blue)',
                  'review': 'var(--color-purple)',
                  'done': 'var(--color-accent)',
                }

                return (
                  <div
                    key={t.id}
                    className="relative mr-4 mb-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 cursor-pointer hover:border-[var(--color-accent)] transition-colors"
                    style={isOverdue ? { borderColor: 'var(--color-red)' } : undefined}
                    onClick={() => openSlideOver(t.id)}
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute right-[-21px] w-[9px] h-[9px] rounded-full top-5"
                      style={{ background: statusColor[t.status] || 'var(--color-border)' }}
                    />

                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ScoreBadge score={score} />
                        <span className="text-[13px] font-medium">{t.name}</span>
                      </div>
                      <span className={`text-[10px] whitespace-nowrap ${isOverdue ? 'text-[var(--color-red)]' : 'text-[var(--color-text-tertiary)]'}`}>
                        {formatDate(t.startDate)} - {formatDate(t.endDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {cat && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: cat.color, background: `${cat.color}15` }}>
                          {cat.emoji} {cat.name}
                        </span>
                      )}
                      <StatusBadge status={t.status} />
                      <TypeBadge type={t.type} />
                      {subtaskPct !== null && (
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">{subtaskPct}% subtasks</span>
                      )}
                      {t.comments?.length > 0 && (
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">{t.comments.length} comments</span>
                      )}
                      {t.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-tertiary)]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {t.description && (
                      <div className="text-[11px] text-[var(--color-text-tertiary)] mt-2 truncate">
                        {t.description}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

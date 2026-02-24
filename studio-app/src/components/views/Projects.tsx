import { useState, useMemo } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useUIStore } from '@/stores/uiStore'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { TEAM, PROJECT_STATUS_MAP } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { Plus } from '@phosphor-icons/react'
import type { Task } from '@/types/task'

type FilterStatus = 'all' | 'proposal' | 'active' | 'completed' | 'on-hold'

export function Projects() {
  const projects = useProjectStore(s => s.projects)
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const openModal = useUIStore(s => s.openModal)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [detailId, setDetailId] = useState<number | null>(null)

  const today = useMemo(() => new Date(), [])

  const filtered = filterStatus === 'all'
    ? projects
    : projects.filter(p => p.status === filterStatus)

  function getProjectTasks(pid: number): Task[] {
    return tasks.filter(t => t.project === String(pid))
  }

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'הכל' },
    { key: 'active', label: 'פעילים' },
    { key: 'on-hold', label: 'בהמתנה' },
    { key: 'completed', label: 'הושלמו' },
    { key: 'proposal', label: 'הצעות' },
  ]

  // Stats
  const activeCount = projects.filter(p => p.status === 'active').length
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0)

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[rgba(5,150,105,0.08)] text-[var(--color-accent)]">
          {projects.length} פרויקטים
        </span>
        <span className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[rgba(5,150,105,0.08)] text-[var(--color-accent)]">
          {activeCount} פעילים
        </span>
        {totalBudget > 0 && (
          <span className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[rgba(124,58,237,0.08)] text-[var(--color-purple)]">
            &#8362;{totalBudget.toLocaleString()} תקציב
          </span>
        )}
        <button
          className="mr-auto px-3 py-1.5 rounded-[8px] text-[12px] font-medium bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity flex items-center gap-1"
          onClick={() => openModal({ type: 'addProject' })}
        >
          <Plus size={14} />
          פרויקט חדש
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1">
        {filters.map(f => (
          <button
            key={f.key}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${
              filterStatus === f.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
            }`}
            onClick={() => setFilterStatus(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          title="אין פרויקטים"
          description="לחץ על 'פרויקט חדש' כדי להתחיל"
          action={
            <button
              className="px-4 py-2 rounded-[8px] text-[12px] font-medium bg-[var(--color-accent)] text-white"
              onClick={() => openModal({ type: 'addProject' })}
            >
              פרויקט חדש
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(p => {
            const pTasks = getProjectTasks(p.id)
            const done = pTasks.filter(t => t.status === 'done').length
            const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0
            const overdue = p.deadline && new Date(p.deadline) < today && p.status !== 'completed'
            const st = PROJECT_STATUS_MAP[p.status] || { label: p.status, color: '#a1a1aa' }

            return (
              <div
                key={p.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 cursor-pointer hover:border-[var(--color-accent)] transition-colors"
                style={{ borderRight: `4px solid ${p.color}` }}
                onClick={() => setDetailId(detailId === p.id ? null : p.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[14px] font-bold">{p.emoji} {p.name}</div>
                    {p.client && (
                      <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{p.client}</div>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ color: st.color, background: `${st.color}15` }}
                  >
                    {st.label}
                  </span>
                </div>

                {/* Progress */}
                <div className="flex justify-between text-[11px] text-[var(--color-text-tertiary)] mb-1">
                  <span>{done}/{pTasks.length} משימות</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden mb-3">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-tertiary)]">
                  {p.deadline && (
                    <span className={overdue ? 'text-[var(--color-red)]' : ''}>
                      {formatDate(p.deadline)}
                    </span>
                  )}
                  {p.budget ? <span>&#8362;{p.budget.toLocaleString()}</span> : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail panel */}
      {detailId && (() => {
        const p = projects.find(x => x.id === detailId)
        if (!p) return null
        const pTasks = getProjectTasks(p.id)

        return (
          <div
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5"
            style={{ borderRight: `4px solid ${p.color}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold">{p.emoji} {p.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-[8px] text-[11px] font-medium bg-[var(--color-accent)] text-white"
                  onClick={(e) => { e.stopPropagation(); openModal({ type: 'editProject', projectId: p.id }) }}
                >
                  עריכה
                </button>
              </div>
            </div>

            {p.description && (
              <p className="text-[13px] text-[var(--color-text-tertiary)] mb-3">{p.description}</p>
            )}

            <div className="flex gap-4 text-[12px] text-[var(--color-text-tertiary)] mb-4 flex-wrap">
              {p.startDate && <span>התחלה: {formatDate(p.startDate)}</span>}
              {p.deadline && <span>דד-ליין: {formatDate(p.deadline)}</span>}
              {p.budget ? <span>&#8362;{p.budget.toLocaleString()}</span> : null}
            </div>

            <h4 className="text-[13px] font-bold mb-2">משימות ({pTasks.length})</h4>
            {pTasks.length === 0 ? (
              <div className="text-center py-4 text-[12px] text-[var(--color-text-tertiary)]">אין משימות משויכות</div>
            ) : (
              <div className="space-y-1.5">
                {pTasks.sort((a, b) => getScore(b.id) - getScore(a.id)).map(t => {
                  const member = TEAM.find(m => m.id === t.assignee)
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-2 rounded-[8px] hover:bg-[var(--color-surface-2)] cursor-pointer text-[12px] transition-colors"
                      onClick={() => openModal({ type: 'editTask', taskId: t.id })}
                    >
                      <ScoreBadge score={getScore(t.id)} />
                      <span className="flex-1 truncate">{t.name}</span>
                      {member && (
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">{member.name}</span>
                      )}
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">{formatDate(t.endDate)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}

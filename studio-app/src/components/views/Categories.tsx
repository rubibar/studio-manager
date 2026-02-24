import { useState } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { CATEGORIES, TEAM } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { CaretDown, CaretLeft } from '@phosphor-icons/react'
import type { TaskStatus } from '@/types/task'

export function Categories() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const updateStatus = useTaskStore(s => s.updateStatus)
  const openModal = useUIStore(s => s.openModal)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  function toggleCat(catId: string) {
    setCollapsed(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  return (
    <div className="space-y-4">
      {CATEGORIES.map(cat => {
        const catTasks = tasks.filter(t => t.category === cat.id)
        const done = catTasks.filter(t => t.status === 'done').length
        const pct = catTasks.length ? Math.round((done / catTasks.length) * 100) : 0
        const isCollapsed = collapsed[cat.id]

        // Group by subcategory
        const groups: Record<string, typeof catTasks> = {}
        catTasks.forEach(t => {
          const key = t.subcategory || 'General'
          if (!groups[key]) groups[key] = []
          groups[key].push(t)
        })

        return (
          <div key={cat.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] overflow-hidden">
            {/* Category header */}
            <button
              className="w-full flex items-center gap-3 p-4 hover:bg-[var(--color-surface-2)] transition-colors text-start"
              style={{ borderRight: `4px solid ${cat.color}` }}
              onClick={() => toggleCat(cat.id)}
            >
              <span className="text-[18px]">{cat.emoji}</span>
              <span className="text-[14px] font-bold flex-1">{cat.name}</span>

              {/* Progress bar */}
              <div className="w-24 h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cat.color }} />
              </div>
              <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono w-8 text-center">{pct}%</span>
              <span className="text-[11px] text-[var(--color-text-tertiary)]">{catTasks.length} tasks</span>

              {isCollapsed ? <CaretLeft size={14} className="text-[var(--color-text-tertiary)]" /> : <CaretDown size={14} className="text-[var(--color-text-tertiary)]" />}
            </button>

            {/* Tasks */}
            {!isCollapsed && (
              <div>
                {Object.entries(groups).map(([sub, subTasks]) => (
                  <div key={sub}>
                    <div className="px-4 py-2 bg-[var(--color-surface-2)] text-[11px] font-bold text-[var(--color-text-tertiary)] border-t border-[var(--color-border)]">
                      {sub}
                    </div>
                    {subTasks
                      .sort((a, b) => getScore(b.id) - getScore(a.id))
                      .map(t => {
                        const member = TEAM.find(m => m.id === t.assignee)
                        return (
                          <div
                            key={t.id}
                            className="flex items-center gap-3 px-4 py-2.5 border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors text-[13px]"
                            onClick={() => openModal({ type: 'editTask', taskId: t.id })}
                          >
                            <ScoreBadge score={getScore(t.id)} />
                            <span className="flex-1 truncate">{t.name}</span>
                            {member ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: member.color }} />
                                <span className="text-[11px] text-[var(--color-text-tertiary)]">{member.name}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[var(--color-text-tertiary)]">Bank</span>
                            )}
                            <select
                              className="bg-transparent border-none text-[11px] cursor-pointer outline-none text-[var(--color-text-secondary)]"
                              value={t.status}
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                e.stopPropagation()
                                updateStatus(t.id, e.target.value as TaskStatus)
                              }}
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Done</option>
                            </select>
                            <span className="text-[11px] text-[var(--color-text-tertiary)] min-w-[70px] text-start">
                              {formatDate(t.endDate)}
                            </span>
                          </div>
                        )
                      })}
                  </div>
                ))}
                {catTasks.length === 0 && (
                  <div className="px-4 py-6 text-center text-[12px] text-[var(--color-text-tertiary)]">
                    No tasks in this category
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

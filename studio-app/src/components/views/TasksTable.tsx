import { useFilteredTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import { FilterBar } from '@/components/shared/FilterBar'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { TEAM } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { ArrowUp, ArrowDown, Trash } from '@phosphor-icons/react'
import type { TaskStatus } from '@/types/task'

export function TasksTable() {
  const tasks = useFilteredTasks()
  const { getScore } = useScoring()
  const sort = useUIStore(s => s.sort)
  const setSort = useUIStore(s => s.setSort)
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const updateStatus = useTaskStore(s => s.updateStatus)
  const deleteTask = useTaskStore(s => s.deleteTask)

  function toggleSort(field: string) {
    if (sort.field === field) {
      setSort({ field, asc: !sort.asc })
    } else {
      setSort({ field, asc: field === 'name' })
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sort.field !== field) return null
    return sort.asc
      ? <ArrowUp size={12} className="inline ml-1" />
      : <ArrowDown size={12} className="inline ml-1" />
  }

  return (
    <div>
      <FilterBar />

      <div className="overflow-x-auto rounded-[var(--radius-default)] border border-[var(--color-border)]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] text-[11px] uppercase tracking-wider">
              <th className="text-right px-3 py-2.5 cursor-pointer hover:text-[var(--color-text-primary)]" onClick={() => toggleSort('score')}>
                Score <SortIcon field="score" />
              </th>
              <th className="text-right px-3 py-2.5 cursor-pointer hover:text-[var(--color-text-primary)]" onClick={() => toggleSort('name')}>
                Task <SortIcon field="name" />
              </th>
              <th className="text-right px-3 py-2.5">Type</th>
              <th className="text-right px-3 py-2.5 cursor-pointer hover:text-[var(--color-text-primary)]" onClick={() => toggleSort('status')}>
                Status <SortIcon field="status" />
              </th>
              <th className="text-right px-3 py-2.5 cursor-pointer hover:text-[var(--color-text-primary)]" onClick={() => toggleSort('assignee')}>
                Assignee <SortIcon field="assignee" />
              </th>
              <th className="text-right px-3 py-2.5 cursor-pointer hover:text-[var(--color-text-primary)]" onClick={() => toggleSort('deadline')}>
                Deadline <SortIcon field="deadline" />
              </th>
              <th className="px-3 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => {
              const score = getScore(t.id)
              const member = TEAM.find(m => m.id === t.assignee)
              const isOverdue = t.endDate && new Date(t.endDate) < new Date() && t.status !== 'done'

              return (
                <tr
                  key={t.id}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors"
                  style={{ borderRight: `3px solid ${score >= 70 ? 'var(--color-red)' : score >= 40 ? 'var(--color-yellow)' : 'transparent'}` }}
                  onClick={() => openSlideOver(t.id)}
                >
                  <td className="px-3 py-2.5">
                    <ScoreBadge score={score} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-[240px]">
                        {t.name}
                      </span>
                      {t.emergency && (
                        <span className="text-[9px] bg-[var(--color-red)] text-white px-1 rounded">SOS</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <TypeBadge type={t.type} />
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={t.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(t.id, e.target.value as TaskStatus)}
                      className="text-[11px] bg-transparent border border-[var(--color-border)] rounded px-1.5 py-0.5 outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: member?.color }} />
                      <span className="text-[12px]">{member?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[12px] ${isOverdue ? 'text-[var(--color-red)] font-medium' : 'text-[var(--color-text-tertiary)]'}`}>
                      {formatDate(t.endDate)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        if (confirm('Delete this task?')) deleteTask(t.id)
                      }}
                      className="p-1 rounded hover:bg-[rgba(220,38,38,0.1)] text-[var(--color-text-tertiary)] hover:text-[var(--color-red)] transition-colors"
                    >
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[var(--color-text-tertiary)]">
                  No tasks to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">
        {tasks.length} tasks
      </div>
    </div>
  )
}

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFilteredTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import { FilterBar } from '@/components/shared/FilterBar'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { TEAM } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { ArrowUp, ArrowDown, Trash, CheckSquare, Square, MinusSquare, ArrowsClockwise } from '@phosphor-icons/react'
import type { TaskStatus } from '@/types/task'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

export function TasksTable() {
  const tasks = useFilteredTasks()
  const { getScore } = useScoring()
  const sort = useUIStore(s => s.sort)
  const setSort = useUIStore(s => s.setSort)
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const updateStatus = useTaskStore(s => s.updateStatus)
  const deleteTask = useTaskStore(s => s.deleteTask)

  const [selected, setSelected] = useState<Set<number>>(new Set())

  const allSelected = tasks.length > 0 && selected.size === tasks.length
  const someSelected = selected.size > 0 && selected.size < tasks.length

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(tasks.map(t => t.id)))
    }
  }, [allSelected, tasks])

  const toggleOne = useCallback((id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const batchChangeStatus = useCallback((status: TaskStatus) => {
    selected.forEach(id => updateStatus(id, status))
    setSelected(new Set())
  }, [selected, updateStatus])

  const batchDelete = useCallback(() => {
    if (!confirm(`Delete ${selected.size} task${selected.size > 1 ? 's' : ''}?`)) return
    selected.forEach(id => deleteTask(id))
    setSelected(new Set())
  }, [selected, deleteTask])

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

      {/* Batch action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-2 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-default)] bg-[var(--color-accent)]/8 border border-[var(--color-accent)]/20">
              <span className="text-[12px] font-semibold" style={{ color: 'var(--color-accent)' }}>
                {selected.size} selected
              </span>

              <div className="h-4 w-px bg-[var(--color-border)]" />

              {/* Status change dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowsClockwise size={14} color="var(--color-text-secondary)" />
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) batchChangeStatus(e.target.value as TaskStatus)
                  }}
                  className="text-[12px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1 outline-none cursor-pointer"
                >
                  <option value="" disabled>Change status...</option>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="h-4 w-px bg-[var(--color-border)]" />

              {/* Delete */}
              <button
                onClick={batchDelete}
                className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-red)]/10 transition-colors"
                style={{ color: 'var(--color-red)' }}
              >
                <Trash size={14} />
                Delete
              </button>

              <div className="flex-1" />

              <button
                onClick={() => setSelected(new Set())}
                className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto glass-card">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] text-[11px] uppercase tracking-wider">
              <th className="px-3 py-2.5 w-10">
                <button onClick={toggleAll} className="flex items-center justify-center">
                  {allSelected
                    ? <CheckSquare size={16} weight="fill" color="var(--color-accent)" />
                    : someSelected
                      ? <MinusSquare size={16} weight="fill" color="var(--color-accent)" />
                      : <Square size={16} color="var(--color-text-tertiary)" />
                  }
                </button>
              </th>
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
              const isSelected = selected.has(t.id)

              return (
                <tr
                  key={t.id}
                  className={`border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[var(--color-accent)]/5' : ''
                  }`}
                  style={{ borderRight: `3px solid ${score >= 70 ? 'var(--color-red)' : score >= 40 ? 'var(--color-yellow)' : 'transparent'}` }}
                  onClick={() => openSlideOver(t.id)}
                >
                  <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleOne(t.id)} className="flex items-center justify-center">
                      {isSelected
                        ? <CheckSquare size={16} weight="fill" color="var(--color-accent)" />
                        : <Square size={16} color="var(--color-text-tertiary)" />
                      }
                    </button>
                  </td>
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
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
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
                <td colSpan={8} className="text-center py-12 text-[var(--color-text-tertiary)]">
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

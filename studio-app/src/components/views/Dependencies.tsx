import { useState, useMemo } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'
import { useVisibleTasks } from '@/hooks/useFilters'
import { TEAM } from '@/lib/constants'
import { EmptyState } from '@/components/shared/EmptyState'
import { ArrowRight, X, Plus, Warning } from '@phosphor-icons/react'
import type { Task } from '@/types/task'

export function Dependencies() {
  const tasks = useVisibleTasks()
  const allTasks = useTaskStore(s => s.tasks)
  const updateTask = useTaskStore(s => s.updateTask)
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')

  // Build dependency map from task.dependencies
  const deps = useMemo(() => {
    const result: { from: number; to: number }[] = []
    allTasks.forEach(t => {
      if (t.dependencies && t.dependencies.length > 0) {
        t.dependencies.forEach(depId => {
          result.push({ from: depId, to: t.id })
        })
      }
    })
    return result
  }, [allTasks])

  function getBlockingTasks(taskId: number): Task[] {
    return deps
      .filter(d => d.to === taskId)
      .map(d => allTasks.find(t => t.id === d.from))
      .filter(Boolean) as Task[]
  }

  function isBlocked(taskId: number): boolean {
    return getBlockingTasks(taskId).some(b => b.status !== 'done')
  }

  function addDep() {
    const fId = parseInt(fromId)
    const tId = parseInt(toId)
    if (!fId || !tId || fId === tId) return
    if (deps.find(d => d.from === fId && d.to === tId)) return

    const toTask = allTasks.find(t => t.id === tId)
    if (!toTask) return

    const existingDeps = toTask.dependencies || []
    if (!existingDeps.includes(fId)) {
      updateTask(tId, { dependencies: [...existingDeps, fId] })
    }
    setFromId('')
    setToId('')
  }

  function removeDep(from: number, to: number) {
    const toTask = allTasks.find(t => t.id === to)
    if (!toTask) return
    updateTask(to, {
      dependencies: (toTask.dependencies || []).filter(d => d !== from),
    })
  }

  const blockedTasks = allTasks.filter(t => t.status !== 'done' && isBlocked(t.id))

  return (
    <div className="space-y-5">
      {/* Add dependency */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4">
        <h3 className="text-[14px] font-bold mb-3">Add Dependency</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="flex-1 min-w-[200px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[8px] p-2 text-[12px]"
            value={fromId}
            onChange={e => setFromId(e.target.value)}
          >
            <option value="">Blocking task...</option>
            {tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <ArrowRight size={16} className="text-[var(--color-text-tertiary)] mx-1" />

          <select
            className="flex-1 min-w-[200px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[8px] p-2 text-[12px]"
            value={toId}
            onChange={e => setToId(e.target.value)}
          >
            <option value="">Blocked task...</option>
            {tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <button
            className="px-4 py-2 rounded-[8px] bg-[var(--color-accent)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
            onClick={addDep}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dependency list */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4">
          <h3 className="text-[14px] font-bold mb-3">Dependencies ({deps.length})</h3>
          {deps.length === 0 ? (
            <EmptyState title="No dependencies" description="Add dependencies between tasks" />
          ) : (
            <div className="space-y-2">
              {deps.map((d, i) => {
                const fromTask = allTasks.find(t => t.id === d.from)
                const toTask = allTasks.find(t => t.id === d.to)
                if (!fromTask || !toTask) return null
                const fromDone = fromTask.status === 'done'
                const toIsBlocked = isBlocked(toTask.id)

                return (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <div
                      className={`flex-1 px-3 py-2 rounded-[8px] cursor-pointer truncate ${
                        fromDone ? 'bg-[rgba(5,150,105,0.06)] text-[var(--color-accent)]' : 'bg-[var(--color-surface-2)]'
                      }`}
                      onClick={() => openSlideOver(fromTask.id)}
                    >
                      {fromDone ? 'v' : '~'} {fromTask.name}
                    </div>

                    <ArrowRight size={12} className="text-[var(--color-text-tertiary)] shrink-0" />

                    <div
                      className={`flex-1 px-3 py-2 rounded-[8px] cursor-pointer truncate ${
                        toIsBlocked ? 'bg-[rgba(220,38,38,0.06)] text-[var(--color-red)]' : 'bg-[var(--color-surface-2)]'
                      }`}
                      onClick={() => openSlideOver(toTask.id)}
                    >
                      {toIsBlocked ? '!' : ''} {toTask.name}
                    </div>

                    <button
                      className="p-1 text-[var(--color-red)] hover:bg-[rgba(220,38,38,0.1)] rounded transition-colors shrink-0"
                      onClick={() => removeDep(d.from, d.to)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Blocked tasks */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4">
          <h3 className="text-[14px] font-bold mb-3 flex items-center gap-2">
            <Warning size={16} className="text-[var(--color-red)]" />
            Blocked Tasks ({blockedTasks.length})
          </h3>
          {blockedTasks.length === 0 ? (
            <div className="text-center py-8 text-[13px] text-[var(--color-accent)]">
              No blocked tasks
            </div>
          ) : (
            <div className="space-y-2">
              {blockedTasks.map(t => {
                const blockers = getBlockingTasks(t.id).filter(b => b.status !== 'done')
                const member = TEAM.find(m => m.id === t.assignee)
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-[8px] border border-[rgba(220,38,38,0.15)]"
                    style={{ background: 'rgba(220,38,38,0.03)' }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[13px] font-medium cursor-pointer hover:underline"
                        onClick={() => openSlideOver(t.id)}
                      >
                        {t.name}
                      </span>
                      {member && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] mr-auto" style={{ background: member.color }}>
                          {member.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-tertiary)]">
                      Blocked by: {blockers.map(b => b.name).join(', ')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { SpotlightCard } from '@/components/shared/SpotlightCard'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { TEAM, CATEGORIES } from '@/lib/constants'
import { UserPlus, MagnifyingGlass } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

export function Bank() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const updateTask = useTaskStore(s => s.updateTask)
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const [search, setSearch] = useState('')
  const [assignFormId, setAssignFormId] = useState<number | null>(null)
  const [assignPerson, setAssignPerson] = useState('')
  const [assignStart, setAssignStart] = useState('')
  const [assignEnd, setAssignEnd] = useState('')

  const bankTasks = useMemo(() => {
    return tasks
      .filter(t => !t.assignee || !t.startDate || !t.endDate)
      .filter(t => !search || t.name.includes(search) || t.description?.includes(search))
      .sort((a, b) => getScore(b.id) - getScore(a.id))
  }, [tasks, search, getScore])

  const assignedCount = tasks.filter(t => t.assignee && t.startDate && t.endDate).length
  const doneCount = tasks.filter(t => t.status === 'done').length

  function handleAssign(taskId: number) {
    if (!assignPerson || !assignStart || !assignEnd) return
    updateTask(taskId, {
      assignee: assignPerson,
      startDate: new Date(assignStart),
      endDate: new Date(assignEnd),
      status: 'todo',
    })
    setAssignFormId(null)
    setAssignPerson('')
    setAssignStart('')
    setAssignEnd('')
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="flex items-center gap-0 divide-x divide-[var(--color-border)] mb-5">
        <div className="px-6 py-3 first:pr-6 first:pl-0">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-mono mb-0.5">In Bank</div>
          <AnimatedNumber value={bankTasks.length} className="text-[24px] font-bold font-serif" />
        </div>
        <div className="px-6 py-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-mono mb-0.5">Assigned</div>
          <AnimatedNumber value={assignedCount} className="text-[24px] font-bold font-serif" />
        </div>
        <div className="px-6 py-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-mono mb-0.5">Completed</div>
          <AnimatedNumber value={doneCount} className="text-[24px] font-bold font-serif" />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
        <input
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[12px] py-2.5 px-10 text-[13px] outline-none focus:border-[var(--color-accent)] transition-colors"
          placeholder="Search bank..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Bank cards */}
      {bankTasks.length === 0 ? (
        <EmptyState title="Bank is empty" description="All tasks have been assigned" />
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {bankTasks.map(t => {
              const cat = CATEGORIES.find(c => c.id === t.category)
              const score = getScore(t.id)
              return (
                <SpotlightCard
                  key={t.id}
                  className="glass-card p-4 hover:border-[var(--color-accent)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => openSlideOver(t.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ScoreBadge score={score} />
                        <span className="text-[13px] font-medium">{t.name}</span>
                        {t.emergency && (
                          <span className="text-[9px] bg-[var(--color-red)] text-white px-1.5 py-0.5 rounded-full">SOS</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {cat && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: cat.color, background: `${cat.color}15` }}>
                            {cat.emoji} {cat.name}
                          </span>
                        )}
                        <TypeBadge type={t.type} />
                        {t.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-tertiary)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[11px] font-medium bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity shrink-0"
                      onClick={() => setAssignFormId(assignFormId === t.id ? null : t.id)}
                    >
                      <UserPlus size={14} />
                      Assign
                    </button>
                  </div>

                  {/* Inline assign form */}
                  <AnimatePresence>
                    {assignFormId === t.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-[var(--color-border)] grid grid-cols-4 gap-2">
                          <select
                            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[8px] p-2 text-[12px]"
                            value={assignPerson}
                            onChange={e => setAssignPerson(e.target.value)}
                          >
                            <option value="">Assignee...</option>
                            {TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                          <input
                            type="date"
                            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[8px] p-2 text-[12px]"
                            value={assignStart}
                            onChange={e => setAssignStart(e.target.value)}
                          />
                          <input
                            type="date"
                            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[8px] p-2 text-[12px]"
                            value={assignEnd}
                            onChange={e => setAssignEnd(e.target.value)}
                          />
                          <button
                            className="bg-[var(--color-accent)] text-white rounded-[8px] text-[12px] font-medium hover:opacity-90 transition-opacity"
                            onClick={() => handleAssign(t.id)}
                          >
                            Confirm
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SpotlightCard>
              )
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}

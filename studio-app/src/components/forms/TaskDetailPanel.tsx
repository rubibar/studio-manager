import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trash, Warning, Check, X, Plus } from '@phosphor-icons/react'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { useScoring } from '@/hooks/useScoring'
import { TEAM, CATEGORIES, EISENHOWER_LABELS, TYPE_LABELS } from '@/lib/constants'
import { derivePriorityFromEisenhower } from '@/lib/scoring'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { toast } from '@/components/shared/Toast'
import type { Task, EisenhowerQuadrant, TaskStatus } from '@/types/task'

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: 'var(--color-text-tertiary)' },
  { value: 'in-progress', label: 'In Progress', color: 'var(--color-blue)' },
  { value: 'review', label: 'Review', color: 'var(--color-purple)' },
  { value: 'done', label: 'Done', color: 'var(--color-green)' },
]

interface TaskDetailPanelProps {
  taskId: number
}

export function TaskDetailPanel({ taskId }: TaskDetailPanelProps) {
  const task = useTaskStore(s => s.getTask(taskId))
  const updateTask = useTaskStore(s => s.updateTask)
  const deleteTask = useTaskStore(s => s.deleteTask)
  const closeSlideOver = useUIStore(s => s.closeSlideOver)
  const projects = useProjectStore(s => s.projects)
  const { getScore } = useScoring()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')

  useEffect(() => {
    if (task) {
      setName(task.name || '')
      setDescription(task.description || '')
    }
    setConfirmDelete(false)
  }, [task])

  const save = useCallback((patch: Partial<Task>) => {
    if (!task) return
    updateTask(taskId, patch)
  }, [task, taskId, updateTask])

  const saveField = useCallback((field: keyof Task, value: unknown) => {
    save({ [field]: value })
  }, [save])

  if (!task) {
    return <div className="text-[13px] text-[var(--color-text-tertiary)] py-8 text-center">Task not found</div>
  }

  const score = getScore(taskId)
  const selectedCat = CATEGORIES.find(c => c.id === task.category)
  const inputClass = "w-full text-[13px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 outline-none focus:border-[var(--color-accent)] transition-colors"
  const labelClass = "text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider font-mono mb-1 block"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-5"
    >
      {/* Header: name + score + emergency */}
      <div>
        <div className="flex items-start gap-3 mb-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => name.trim() && saveField('name', name.trim())}
            className="flex-1 text-[18px] font-bold bg-transparent outline-none border-b border-transparent focus:border-[var(--color-border)] transition-colors tracking-tight"
          />
          <ScoreBadge score={score} size="md" />
        </div>

        {task.emergency && (
          <div className="flex items-center gap-1.5 text-[var(--color-red)] text-[11px] font-medium mb-2">
            <Warning size={14} weight="fill" /> Emergency
          </div>
        )}
      </div>

      {/* Status pills */}
      <div>
        <label className={labelClass}>Status</label>
        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map(opt => (
            <motion.button
              key={opt.value}
              onClick={() => {
                const patch: Partial<Task> = { status: opt.value }
                if (opt.value === 'done' && !task.completedAt) patch.completedAt = new Date()
                if (opt.value !== 'done') patch.completedAt = null
                save(patch)
                toast(`Status → ${opt.label}`, 'success')
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                task.status === opt.value
                  ? 'text-white'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
              }`}
              style={task.status === opt.value ? { backgroundColor: opt.color } : undefined}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={task.type}
            onChange={e => saveField('type', e.target.value)}
            className={inputClass}
          >
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select
            value={task.eisenhower}
            onChange={e => {
              const eis = e.target.value as EisenhowerQuadrant
              save({ eisenhower: eis, priority: derivePriorityFromEisenhower(eis) })
            }}
            className={inputClass}
          >
            {Object.entries(EISENHOWER_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Assignee</label>
          <select
            value={task.assignee}
            onChange={e => saveField('assignee', e.target.value)}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {TEAM.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Reviewer</label>
          <select
            value={task.reviewer || ''}
            onChange={e => saveField('reviewer', e.target.value || null)}
            className={inputClass}
          >
            <option value="">None</option>
            {TEAM.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={task.category}
            onChange={e => save({ category: e.target.value, subcategory: '' })}
            className={inputClass}
          >
            <option value="">None</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Subcategory</label>
          <select
            value={task.subcategory}
            onChange={e => saveField('subcategory', e.target.value)}
            className={inputClass}
            disabled={!selectedCat}
          >
            <option value="">None</option>
            {selectedCat?.subs.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            value={task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : ''}
            onChange={e => saveField('startDate', e.target.value ? new Date(e.target.value) : null)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Deadline</label>
          <input
            type="date"
            value={task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : ''}
            onChange={e => saveField('endDate', e.target.value ? new Date(e.target.value) : null)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Est. Hours</label>
          <input
            type="number"
            value={task.estimatedHours || ''}
            onChange={e => saveField('estimatedHours', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.5"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Project</label>
          <select
            value={task.project || ''}
            onChange={e => saveField('project', e.target.value || null)}
            className={inputClass}
          >
            <option value="">None</option>
            {projects.map(p => (
              <option key={p.id} value={String(p.id)}>{p.emoji} {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={() => saveField('description', description)}
          rows={3}
          className={inputClass + ' resize-none'}
          placeholder="Add description..."
        />
      </div>

      {/* Emergency toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={task.emergency}
          onChange={e => saveField('emergency', e.target.checked)}
          className="accent-[var(--color-red)]"
        />
        <span className="text-[13px] text-[var(--color-red)] font-medium">Emergency</span>
      </label>

      {/* Subtasks */}
      <div>
        <label className={labelClass}>Subtasks ({task.subtasks?.filter(s => s.done).length || 0}/{task.subtasks?.length || 0})</label>
        <div className="space-y-1">
          {(task.subtasks || []).map(sub => (
            <div key={sub.id} className="flex items-center gap-2 group">
              <button
                onClick={() => {
                  const updated = (task.subtasks || []).map(s =>
                    s.id === sub.id ? { ...s, done: !s.done } : s
                  )
                  saveField('subtasks', updated)
                }}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                  sub.done
                    ? 'bg-[var(--color-green)] border-[var(--color-green)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
              >
                {sub.done && <Check size={10} weight="bold" className="text-white" />}
              </button>
              <span className={`text-[13px] flex-1 ${sub.done ? 'line-through text-[var(--color-text-tertiary)]' : ''}`}>
                {sub.text}
              </span>
              <button
                onClick={() => {
                  const updated = (task.subtasks || []).filter(s => s.id !== sub.id)
                  saveField('subtasks', updated)
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-red)] transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1">
            <input
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newSubtask.trim()) {
                  const updated = [...(task.subtasks || []), { id: Date.now(), text: newSubtask.trim(), done: false }]
                  saveField('subtasks', updated)
                  setNewSubtask('')
                }
              }}
              placeholder="Add subtask..."
              className="flex-1 text-[12px] bg-transparent outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
            {newSubtask.trim() && (
              <button
                onClick={() => {
                  const updated = [...(task.subtasks || []), { id: Date.now(), text: newSubtask.trim(), done: false }]
                  saveField('subtasks', updated)
                  setNewSubtask('')
                }}
                className="text-[var(--color-accent)]"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div>
          <label className={labelClass}>Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map(tag => (
              <span key={tag} className="text-[11px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full px-2.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="pt-3 border-t border-[var(--color-border)]">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-red)] transition-colors"
          >
            <Trash size={14} />
            Delete Task
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--color-red)]">Delete this task?</span>
            <button
              onClick={() => {
                deleteTask(taskId)
                closeSlideOver()
                toast('Task deleted', 'info')
              }}
              className="text-[12px] px-3 py-1 rounded-[var(--radius-sm)] bg-[var(--color-red)] text-white font-medium"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[12px] px-3 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
import { Modal } from '@/components/shared/Modal'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { TEAM, CATEGORIES, EISENHOWER_LABELS, TYPE_LABELS } from '@/lib/constants'
import { derivePriorityFromEisenhower } from '@/lib/scoring'
import { toast } from '@/components/shared/Toast'
import type { Task, TaskType, EisenhowerQuadrant, TaskStatus } from '@/types/task'

export function TaskForm() {
  const modal = useUIStore(s => s.modal)
  const closeModal = useUIStore(s => s.closeModal)
  const addTask = useTaskStore(s => s.addTask)
  const updateTask = useTaskStore(s => s.updateTask)
  const getTask = useTaskStore(s => s.getTask)
  const projects = useProjectStore(s => s.projects)
  const teamMemberId = useAuthStore(s => s.teamMemberId)

  const isEdit = modal.type === 'editTask'
  const taskId = modal.taskId
  const existingTask = taskId ? getTask(taskId) : undefined

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TaskType>('admin')
  const [eisenhower, setEisenhower] = useState<EisenhowerQuadrant>('neither')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [assignee, setAssignee] = useState(teamMemberId)
  const [reviewer, setReviewer] = useState('')
  const [project, setProject] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [emergency, setEmergency] = useState(false)
  const [status, setStatus] = useState<TaskStatus>('todo')

  useEffect(() => {
    if (isEdit && existingTask) {
      setName(existingTask.name || '')
      setDescription(existingTask.description || '')
      setType(existingTask.type || 'admin')
      setEisenhower(existingTask.eisenhower || 'neither')
      setCategory(existingTask.category || '')
      setSubcategory(existingTask.subcategory || '')
      setAssignee(existingTask.assignee || teamMemberId)
      setReviewer(existingTask.reviewer || '')
      setProject(existingTask.project ? String(existingTask.project) : '')
      setStartDate(existingTask.startDate ? new Date(existingTask.startDate).toISOString().split('T')[0] : '')
      setEndDate(existingTask.endDate ? new Date(existingTask.endDate).toISOString().split('T')[0] : '')
      setEstimatedHours(existingTask.estimatedHours ? String(existingTask.estimatedHours) : '')
      setEmergency(existingTask.emergency || false)
      setStatus(existingTask.status || 'todo')
    } else {
      setName('')
      setDescription('')
      setType('admin')
      setEisenhower('neither')
      setCategory('')
      setSubcategory('')
      setAssignee(teamMemberId)
      setReviewer('')
      setProject('')
      setStartDate('')
      setEndDate('')
      setEstimatedHours('')
      setEmergency(false)
      setStatus('todo')
    }
  }, [isEdit, existingTask, teamMemberId])

  const selectedCat = CATEGORIES.find(c => c.id === category)

  function handleSubmit() {
    if (!name.trim()) {
      toast('יש להזין שם משימה', 'error')
      return
    }

    const taskData: Partial<Task> = {
      name: name.trim(),
      description,
      type,
      eisenhower,
      priority: derivePriorityFromEisenhower(eisenhower),
      category,
      subcategory,
      assignee,
      reviewer: reviewer || null,
      project: project || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      estimatedHours: parseFloat(estimatedHours) || 0,
      emergency,
      status,
    }

    if (isEdit && taskId) {
      updateTask(taskId, taskData)
      toast('משימה עודכנה', 'success')
    } else {
      addTask({
        ...taskData,
        id: 0, // will be replaced
        subtasks: [],
        comments: [],
        tags: [],
        recurring: null,
        gcalEventId: null,
        dependencies: [],
        timeSpent: 0,
        isFrozen: false,
        createdAt: new Date(),
        completedAt: null,
      } as Task)
      toast('משימה נוספה', 'success')
    }
    closeModal()
  }

  const inputClass = "w-full text-[13px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 outline-none focus:border-[var(--color-accent)] transition-colors"
  const labelClass = "text-[12px] font-medium text-[var(--color-text-secondary)] mb-1 block"

  return (
    <Modal
      open={modal.type === 'addTask' || modal.type === 'editTask'}
      onClose={closeModal}
      title={isEdit ? 'עריכת משימה' : 'משימה חדשה'}
      width="580px"
    >
      <div className="flex flex-col gap-3">
        {/* Name */}
        <div>
          <label className={labelClass}>שם המשימה *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="תיאור קצר של המשימה..."
            className={inputClass}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>תיאור</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className={inputClass + ' resize-none'}
          />
        </div>

        {/* Type + Eisenhower */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>סוג</label>
            <select value={type} onChange={e => setType(e.target.value as TaskType)} className={inputClass}>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>עדיפות (אייזנהאואר)</label>
            <select value={eisenhower} onChange={e => setEisenhower(e.target.value as EisenhowerQuadrant)} className={inputClass}>
              {Object.entries(EISENHOWER_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category + Subcategory */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>קטגוריה</label>
            <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory(''); }} className={inputClass}>
              <option value="">בחר קטגוריה</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>תת-קטגוריה</label>
            <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className={inputClass} disabled={!selectedCat}>
              <option value="">בחר תת-קטגוריה</option>
              {selectedCat?.subs.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignee + Reviewer */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>אחראי</label>
            <select value={assignee} onChange={e => setAssignee(e.target.value)} className={inputClass}>
              {TEAM.map(m => (
                <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>מבקר (reviewer)</label>
            <select value={reviewer} onChange={e => setReviewer(e.target.value)} className={inputClass}>
              <option value="">ללא מבקר</option>
              {TEAM.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Project */}
        <div>
          <label className={labelClass}>פרויקט</label>
          <select value={project} onChange={e => setProject(e.target.value)} className={inputClass}>
            <option value="">ללא פרויקט</option>
            {projects.map(p => (
              <option key={p.id} value={String(p.id)}>{p.emoji} {p.name}</option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>תאריך התחלה</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>דד-ליין</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Hours + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>שעות משוערות</label>
            <input type="number" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} min="0" step="0.5" className={inputClass} />
          </div>
          {isEdit && (
            <div>
              <label className={labelClass}>סטטוס</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className={inputClass}>
                <option value="todo">לביצוע</option>
                <option value="in-progress">בתהליך</option>
                <option value="review">ביקורת</option>
                <option value="done">הושלם</option>
              </select>
            </div>
          )}
        </div>

        {/* Emergency */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={emergency}
            onChange={e => setEmergency(e.target.checked)}
            className="accent-[var(--color-red)]"
          />
          <span className="text-[13px] text-[var(--color-red)] font-medium">חירום (Emergency)</span>
        </label>

        {/* Submit */}
        <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-[var(--color-border)]">
          <button
            onClick={closeModal}
            className="text-[13px] px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            className="text-[13px] px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            {isEdit ? 'עדכן' : 'הוסף משימה'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

import { create } from 'zustand'
import { ref, onValue, set as fbSet } from 'firebase/database'
import { db } from '@/firebase'
import type { Task, Comment, Subtask } from '@/types/task'
import { serializeDate, deserializeDate } from '@/lib/formatters'
import { derivePriorityFromEisenhower, migrateEisenhower } from '@/lib/scoring'

function serializeTasks(tasks: Task[]) {
  return tasks.map(t => ({
    ...t,
    startDate: serializeDate(t.startDate as Date | null),
    endDate: serializeDate(t.endDate as Date | null),
    createdAt: serializeDate(t.createdAt as Date | null),
    completedAt: serializeDate(t.completedAt as Date | null),
    comments: (t.comments || []).map(c => ({ ...c, time: serializeDate(c.time as Date | null) })),
  }))
}

function deserializeTasks(data: unknown): Task[] | null {
  if (!data) return null
  const arr = Array.isArray(data) ? data : Object.values(data as Record<string, unknown>)
  return arr.map((t: Record<string, unknown>) => ({
    ...t,
    startDate: deserializeDate(t.startDate as string),
    endDate: deserializeDate(t.endDate as string),
    subtasks: (t.subtasks as Subtask[]) || [],
    tags: (t.tags as string[]) || [],
    project: (t.project as string) || null,
    comments: ((t.comments as Comment[]) || []).map(c => ({
      ...c,
      time: deserializeDate(c.time as string),
    })),
    // Criticality fields with migration
    type: (t.type as string) || 'admin',
    eisenhower: (t.eisenhower as string) || migrateEisenhower((t.priority as string) || 'low'),
    reviewer: (t.reviewer as string) || null,
    emergency: (t.emergency as boolean) || false,
    isFrozen: (t.isFrozen as boolean) || false,
    createdAt: deserializeDate(t.createdAt as string) || deserializeDate(t.startDate as string) || new Date(),
    completedAt: deserializeDate(t.completedAt as string),
    priority: (t.priority as string) || derivePriorityFromEisenhower((t.eisenhower as string) || 'neither'),
  })) as Task[]
}

interface TaskState {
  tasks: Task[]
  nextId: number
  dbReady: boolean
  _lastSaveTime: number
  _saveTimer: ReturnType<typeof setTimeout> | null

  initSync: () => () => void
  addTask: (task: Omit<Task, 'id'>) => Task
  updateTask: (id: number, updates: Partial<Task>) => void
  deleteTask: (id: number) => void
  updateStatus: (id: number, status: Task['status']) => void
  getTask: (id: number) => Task | undefined
  saveTasks: () => void
  saveTasksNow: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  nextId: 1,
  dbReady: false,
  _lastSaveTime: 0,
  _saveTimer: null,

  initSync: () => {
    const tasksRef = ref(db, 'tasks_v2')
    const metaRef = ref(db, 'meta_v2/nextId')

    const unsubTasks = onValue(tasksRef, (snap) => {
      const state = get()
      // Ignore echoes from own writes
      if (Date.now() - state._lastSaveTime < 2000) return

      const data = snap.val()
      if (data) {
        const parsed = deserializeTasks(data)
        if (parsed && parsed.length > 0) {
          const newNextId = parsed.reduce((m, t) => Math.max(m, t.id || 0), 0) + 1
          set({ tasks: parsed, nextId: newNextId, dbReady: true })
          return
        }
      }
      set({ tasks: [], nextId: 1, dbReady: true })
    })

    const unsubMeta = onValue(metaRef, (snap) => {
      const val = snap.val()
      if (val && val > get().nextId) set({ nextId: val })
    })

    return () => {
      unsubTasks()
      unsubMeta()
    }
  },

  addTask: (taskData) => {
    const state = get()
    const task: Task = { ...taskData, id: state.nextId } as Task
    set({ tasks: [...state.tasks, task], nextId: state.nextId + 1 })
    get().saveTasks()
    return task
  },

  updateTask: (id, updates) => {
    set((s) => ({
      tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }))
    get().saveTasks()
  },

  deleteTask: (id) => {
    set((s) => ({
      tasks: s.tasks.filter(t => t.id !== id),
    }))
    get().saveTasks()
  },

  updateStatus: (id, status) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return

    // Review loop: if completing a task with a reviewer, send to review first
    if (status === 'done' && task.reviewer && task.status !== 'review') {
      set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, status: 'review' as const } : t),
      }))
    } else {
      const updates: Partial<Task> = { status }
      if (status === 'done') {
        updates.completedAt = new Date()
      }
      set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
      }))
    }
    get().saveTasks()
  },

  getTask: (id) => get().tasks.find(t => t.id === id),

  saveTasks: () => {
    const state = get()
    if (state._saveTimer) clearTimeout(state._saveTimer)
    const timer = setTimeout(() => get().saveTasksNow(), 400)
    set({ _saveTimer: timer })
  },

  saveTasksNow: () => {
    const state = get()
    if (!state.dbReady) return

    set({ _lastSaveTime: Date.now() })
    const data = state.tasks.length > 0 ? serializeTasks(state.tasks) : null
    fbSet(ref(db, 'tasks_v2'), data).catch(err => {
      console.error('Firebase save failed:', err)
    })
    fbSet(ref(db, 'meta_v2/nextId'), state.nextId)
  },
}))

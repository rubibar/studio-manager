import { create } from 'zustand'
import { ref, onValue, set as fbSet } from 'firebase/database'
import { db } from '@/firebase'
import type { Project } from '@/types/task'
import { serializeDate, deserializeDate } from '@/lib/formatters'

function serializeProjects(projs: Project[]) {
  return projs.map(p => ({
    ...p,
    startDate: serializeDate(p.startDate as Date | null),
    deadline: serializeDate(p.deadline as Date | null),
    createdAt: serializeDate(p.createdAt as Date | null),
  }))
}

function deserializeProjects(data: unknown): Project[] | null {
  if (!data) return null
  const arr = Array.isArray(data) ? data : Object.values(data as Record<string, unknown>)
  return arr.map((p: Record<string, unknown>) => ({
    ...p,
    startDate: deserializeDate(p.startDate as string),
    deadline: deserializeDate(p.deadline as string),
    createdAt: deserializeDate(p.createdAt as string),
  })) as Project[]
}

interface ProjectState {
  projects: Project[]
  nextProjectId: number
  _lastSaveTime: number
  _saveTimer: ReturnType<typeof setTimeout> | null

  initSync: () => () => void
  addProject: (project: Omit<Project, 'id'>) => Project
  updateProject: (id: number, updates: Partial<Project>) => void
  deleteProject: (id: number) => void
  getProject: (id: number) => Project | undefined
  saveProjects: () => void
  saveProjectsNow: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  nextProjectId: 1,
  _lastSaveTime: 0,
  _saveTimer: null,

  initSync: () => {
    const projRef = ref(db, 'projects_v2')
    const metaRef = ref(db, 'meta_v2/nextProjectId')

    const unsubProj = onValue(projRef, (snap) => {
      if (Date.now() - get()._lastSaveTime < 2000) return
      const data = snap.val()
      if (data) {
        const parsed = deserializeProjects(data)
        if (parsed && parsed.length > 0) {
          const nextId = parsed.reduce((m, p) => Math.max(m, p.id || 0), 0) + 1
          set({ projects: parsed, nextProjectId: nextId })
          return
        }
      }
      set({ projects: [], nextProjectId: 1 })
    })

    const unsubMeta = onValue(metaRef, (snap) => {
      const val = snap.val()
      if (val && val > get().nextProjectId) set({ nextProjectId: val })
    })

    return () => {
      unsubProj()
      unsubMeta()
    }
  },

  addProject: (data) => {
    const state = get()
    const project: Project = { ...data, id: state.nextProjectId } as Project
    set({ projects: [...state.projects, project], nextProjectId: state.nextProjectId + 1 })
    get().saveProjects()
    return project
  },

  updateProject: (id, updates) => {
    set((s) => ({
      projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p),
    }))
    get().saveProjects()
  },

  deleteProject: (id) => {
    set((s) => ({
      projects: s.projects.filter(p => p.id !== id),
    }))
    get().saveProjects()
  },

  getProject: (id) => get().projects.find(p => p.id === id),

  saveProjects: () => {
    const state = get()
    if (state._saveTimer) clearTimeout(state._saveTimer)
    const timer = setTimeout(() => get().saveProjectsNow(), 400)
    set({ _saveTimer: timer })
  },

  saveProjectsNow: () => {
    const state = get()
    set({ _lastSaveTime: Date.now() })
    const data = state.projects.length > 0 ? serializeProjects(state.projects) : null
    fbSet(ref(db, 'projects_v2'), data).catch(err => {
      console.error('Projects save failed:', err)
    })
    fbSet(ref(db, 'meta_v2/nextProjectId'), state.nextProjectId)
  },
}))

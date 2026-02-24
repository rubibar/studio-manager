import { create } from 'zustand'
import type { TaskFilters, SortConfig } from '@/types/task'
import { DEFAULT_FILTERS } from '@/types/task'

export type ViewName =
  | 'dashboard' | 'bank' | 'tasks' | 'gantt' | 'calendar'
  | 'categories' | 'workload' | 'weekview' | 'kanban' | 'burndown'
  | 'activitylog' | 'reports' | 'velocity' | 'dependencies'
  | 'timeline' | 'pricing' | 'projects' | 'clients' | 'okr' | 'admin'

export type CalViewMode = 'month' | 'week' | 'day' | 'agenda'

interface ModalState {
  type: 'addTask' | 'editTask' | 'addProject' | 'editProject' | 'confirm' | null
  taskId?: number
  projectId?: number
  data?: Record<string, unknown>
}

interface UIState {
  activeView: ViewName
  sidebarOpen: boolean
  darkMode: boolean
  filters: TaskFilters
  sort: SortConfig
  calendarDate: Date
  calViewMode: CalViewMode
  modal: ModalState
  reviewSidebarOpen: boolean
  searchQuery: string

  setView: (view: ViewName) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
  setFilters: (filters: Partial<TaskFilters>) => void
  resetFilters: () => void
  setSort: (sort: SortConfig) => void
  setCalendarDate: (date: Date) => void
  setCalViewMode: (mode: CalViewMode) => void
  openModal: (modal: ModalState) => void
  closeModal: () => void
  toggleReviewSidebar: () => void
  setSearchQuery: (q: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'dashboard',
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true',
  filters: { ...DEFAULT_FILTERS },
  sort: { field: 'deadline', asc: true },
  calendarDate: new Date(),
  calViewMode: 'month',
  modal: { type: null },
  reviewSidebarOpen: false,
  searchQuery: '',

  setView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode
      localStorage.setItem('darkMode', String(next))
      return { darkMode: next }
    }),
  setFilters: (partial) =>
    set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  setSort: (sort) => set({ sort }),
  setCalendarDate: (date) => set({ calendarDate: date }),
  setCalViewMode: (mode) => set({ calViewMode: mode }),
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: { type: null } }),
  toggleReviewSidebar: () => set((s) => ({ reviewSidebarOpen: !s.reviewSidebarOpen })),
  setSearchQuery: (q) => set({ searchQuery: q }),
}))

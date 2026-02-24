export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
// Legacy alias used in some render paths
export type TaskStatusLegacy = 'todo' | 'progress' | 'review' | 'done'

export type TaskType = 'client' | 'internal' | 'admin'
export type EisenhowerQuadrant = 'urgent-important' | 'important' | 'urgent' | 'neither'
export type Priority = 'high' | 'medium' | 'low'

export interface Subtask {
  id: number
  text: string
  done: boolean
}

export interface Comment {
  id: number
  author: string
  text: string
  time: Date | string | null
}

export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number
  nextDue?: string | null
}

export interface Task {
  id: number
  name: string
  description: string
  status: TaskStatus
  type: TaskType
  eisenhower: EisenhowerQuadrant
  priority: Priority
  category: string
  subcategory: string
  assignee: string
  reviewer: string | null
  project: string | null
  startDate: Date | string | null
  endDate: Date | string | null
  deadline?: Date | string | null
  emergency: boolean
  isFrozen: boolean
  createdAt: Date | string | null
  completedAt: Date | string | null
  timeSpent: number
  estimatedHours: number
  subtasks: Subtask[]
  comments: Comment[]
  tags: string[]
  recurring: RecurringConfig | null
  gcalEventId: string | null
  calendarEventId?: string | null
  dependencies: number[]
  color?: string
  _lastScore?: number
}

export interface Project {
  id: number
  name: string
  emoji: string
  color: string
  status: 'proposal' | 'active' | 'completed' | 'on-hold'
  client: string
  description: string
  startDate: Date | string | null
  deadline: Date | string | null
  createdAt: Date | string | null
  budget?: number
  hourlyRate?: number
}

export interface Notification {
  id: number
  type: 'overdue' | 'deadline' | 'mention' | 'review' | 'status'
  icon: string
  title: string
  desc: string
  taskId: number
  time: Date | string
  read: boolean
}

// Score map type
export type ScoreMap = Record<number, number>

// Filters
export interface TaskFilters {
  category: string
  assignee: string
  status: string
  priority: string
  project: string
  type: string
  search: string
}

export const DEFAULT_FILTERS: TaskFilters = {
  category: 'all',
  assignee: 'all',
  status: 'all',
  priority: 'all',
  project: 'all',
  type: 'all',
  search: '',
}

export interface SortConfig {
  field: string
  asc: boolean
}

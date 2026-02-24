import { useMemo } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useScoring } from './useScoring'
import type { Task } from '@/types/task'

export function useFilteredTasks(): Task[] {
  const tasks = useTaskStore(s => s.tasks)
  const filters = useUIStore(s => s.filters)
  const sort = useUIStore(s => s.sort)
  const searchQuery = useUIStore(s => s.searchQuery)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const teamMemberId = useAuthStore(s => s.teamMemberId)
  const { getScore } = useScoring()

  return useMemo(() => {
    let filtered = [...tasks]

    // Non-admin only see their own tasks
    if (!isAdmin) {
      filtered = filtered.filter(t => t.assignee === teamMemberId)
    }

    // Apply filters
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category)
    }
    if (filters.assignee !== 'all') {
      filtered = filtered.filter(t => t.assignee === filters.assignee)
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status)
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filters.priority)
    }
    if (filters.project !== 'all') {
      filtered = filtered.filter(t => t.project === filters.project)
    }
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      const dir = sort.asc ? 1 : -1
      switch (sort.field) {
        case 'score': return (getScore(b.id) - getScore(a.id)) * dir
        case 'deadline': {
          const aDate = a.endDate ? new Date(a.endDate).getTime() : Infinity
          const bDate = b.endDate ? new Date(b.endDate).getTime() : Infinity
          return (aDate - bDate) * dir
        }
        case 'name': return a.name.localeCompare(b.name, 'he') * dir
        case 'status': return a.status.localeCompare(b.status) * dir
        case 'assignee': return (a.assignee || '').localeCompare(b.assignee || '') * dir
        case 'priority': {
          const prio = { high: 3, medium: 2, low: 1 }
          return ((prio[b.priority] || 0) - (prio[a.priority] || 0)) * dir
        }
        default: return 0
      }
    })

    return filtered
  }, [tasks, filters, sort, searchQuery, isAdmin, teamMemberId, getScore])
}

export function useVisibleTasks(): Task[] {
  const tasks = useTaskStore(s => s.tasks)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const teamMemberId = useAuthStore(s => s.teamMemberId)

  return useMemo(() => {
    if (isAdmin) return tasks
    return tasks.filter(t => t.assignee === teamMemberId)
  }, [tasks, isAdmin, teamMemberId])
}

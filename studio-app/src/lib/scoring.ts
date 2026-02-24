import type { Task, ScoreMap } from '@/types/task'
import { TYPE_WEIGHTS, EISENHOWER_WEIGHTS, WORK_END } from './constants'
import { countWorkingHoursBetween, isWeekendFrozen, isSundayRDHolyTime } from './businessHours'

function getWorkingHoursToDeadline(task: Task, now: Date): number {
  if (!task.endDate) return Infinity
  const deadline = new Date(task.endDate)
  deadline.setHours(WORK_END, 0, 0, 0)
  return countWorkingHoursBetween(now, deadline)
}

export function computeTaskRawScore(
  task: Task,
  now: Date,
  teamCapacity: Record<string, boolean> = {},
): number {
  if (task.isFrozen) return task._lastScore || 0
  if (task.status === 'done') return 0

  const Wbase = TYPE_WEIGHTS[task.type] || 5
  const Wuser = EISENHOWER_WEIGHTS[task.eisenhower] || 5

  let aging = 0
  if (task.status === 'todo' && task.createdAt) {
    aging = Math.floor(countWorkingHoursBetween(new Date(task.createdAt), now) / 24) * 2
  }

  let U = 1.0
  if (task.endDate && !isWeekendFrozen(now)) {
    const hrsLeft = getWorkingHoursToDeadline(task, now)
    if (hrsLeft < 8) U = 2.5
    else if (hrsLeft < 16) U = 2.0
    else if (hrsLeft < 40) U = 1.5
  }

  let rawScore = (Wbase + Wuser + aging) * U

  if (task.status === 'review') rawScore += 50
  if (task.emergency) rawScore += 100
  if (isSundayRDHolyTime(now) && task.type === 'internal') rawScore += 100

  // Capacity: de-prioritize low-weight tasks for overloaded users
  if (teamCapacity[task.assignee] && Wbase <= 5 && Wuser <= 15) {
    rawScore *= 0.6
  }

  return rawScore
}

export function computeAllScores(
  tasks: Task[],
  now?: Date,
  teamCapacity: Record<string, boolean> = {},
): ScoreMap {
  const n = now || new Date()
  const scored = tasks
    .filter(t => t.status !== 'done')
    .map(t => ({ id: t.id, raw: computeTaskRawScore(t, n, teamCapacity) }))
  const maxRS = scored.reduce((mx, s) => Math.max(mx, s.raw), 1)
  const scoreMap: ScoreMap = {}
  scored.forEach(s => {
    scoreMap[s.id] = Math.min(100, Math.round((s.raw / maxRS) * 100))
  })
  tasks.filter(t => t.status === 'done').forEach(t => {
    scoreMap[t.id] = 0
  })
  return scoreMap
}

export function getScoreHeatClass(score: number): string {
  if (score >= 70) return 'score-hot'
  if (score >= 40) return 'score-warm'
  return 'score-cold'
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'var(--color-red)'
  if (score >= 40) return 'var(--color-yellow)'
  return 'var(--color-text-tertiary)'
}

export function getScoreBg(score: number): string {
  if (score >= 70) return 'rgba(230, 59, 46, 0.08)'
  if (score >= 40) return 'rgba(196, 132, 29, 0.08)'
  return 'rgba(138, 132, 123, 0.08)'
}

export function derivePriorityFromEisenhower(eis: string): 'high' | 'medium' | 'low' {
  if (eis === 'urgent-important') return 'high'
  if (eis === 'important' || eis === 'urgent') return 'medium'
  return 'low'
}

export function migrateEisenhower(oldPriority: string): string {
  const map: Record<string, string> = { high: 'urgent-important', medium: 'important', low: 'neither' }
  return map[oldPriority] || 'neither'
}

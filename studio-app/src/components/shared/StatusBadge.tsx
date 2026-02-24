import type { TaskStatus } from '@/types/task'

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  'todo': { label: 'To Do', color: 'var(--color-text-secondary)', bg: 'rgba(138,132,123,0.1)' },
  'in-progress': { label: 'In Progress', color: 'var(--color-blue)', bg: 'rgba(43,93,170,0.08)' },
  'review': { label: 'Review', color: 'var(--color-purple)', bg: 'rgba(107,79,160,0.08)' },
  'done': { label: 'Done', color: 'var(--color-green)', bg: 'rgba(58,125,92,0.08)' },
}

interface StatusBadgeProps {
  status: TaskStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['todo']
  return (
    <span
      className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  )
}

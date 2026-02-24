import type { TaskStatus } from '@/types/task'

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  'todo': { label: 'To Do', color: 'var(--color-text-secondary)', bg: 'rgba(174,174,178,0.12)' },
  'in-progress': { label: 'In Progress', color: 'var(--color-blue)', bg: 'rgba(0,122,255,0.10)' },
  'review': { label: 'Review', color: 'var(--color-purple)', bg: 'rgba(175,82,222,0.10)' },
  'done': { label: 'Done', color: 'var(--color-green)', bg: 'rgba(52,199,89,0.10)' },
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

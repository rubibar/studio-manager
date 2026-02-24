import type { TaskStatus } from '@/types/task'

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  'todo': { label: 'לביצוע', color: 'var(--color-text-secondary)', bg: 'rgba(161,161,170,0.1)' },
  'in-progress': { label: 'בתהליך', color: 'var(--color-blue)', bg: 'rgba(37,99,235,0.08)' },
  'review': { label: 'ביקורת', color: 'var(--color-purple)', bg: 'rgba(124,58,237,0.08)' },
  'done': { label: 'הושלם', color: 'var(--color-accent)', bg: 'rgba(5,150,105,0.08)' },
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

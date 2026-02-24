import type { TaskType } from '@/types/task'
import { TYPE_LABELS } from '@/lib/constants'

const TYPE_COLORS: Record<TaskType, { color: string; bg: string }> = {
  client: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  internal: { color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  admin: { color: '#a1a1aa', bg: 'rgba(161,161,170,0.08)' },
}

interface TypeBadgeProps {
  type: TaskType
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const config = TYPE_COLORS[type] || TYPE_COLORS.admin
  return (
    <span
      className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full"
      style={{ color: config.color, background: config.bg }}
    >
      {TYPE_LABELS[type] || type}
    </span>
  )
}

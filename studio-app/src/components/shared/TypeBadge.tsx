import type { TaskType } from '@/types/task'
import { TYPE_LABELS } from '@/lib/constants'

const TYPE_COLORS: Record<TaskType, { color: string; bg: string }> = {
  client: { color: '#007AFF', bg: 'rgba(0,122,255,0.10)' },
  internal: { color: '#FF9500', bg: 'rgba(255,149,0,0.10)' },
  admin: { color: '#8E8E93', bg: 'rgba(142,142,147,0.10)' },
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

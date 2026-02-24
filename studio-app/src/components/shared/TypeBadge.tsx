import type { TaskType } from '@/types/task'
import { TYPE_LABELS } from '@/lib/constants'

const TYPE_COLORS: Record<TaskType, { color: string; bg: string }> = {
  client: { color: '#2B5DAA', bg: 'rgba(43,93,170,0.08)' },
  internal: { color: '#C4841D', bg: 'rgba(196,132,29,0.08)' },
  admin: { color: '#8A847B', bg: 'rgba(138,132,123,0.08)' },
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

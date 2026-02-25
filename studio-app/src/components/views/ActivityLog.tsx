import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVisibleTasks } from '@/hooks/useFilters'
import { TEAM, CATEGORIES } from '@/lib/constants'
import { formatDate, formatRelative } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Funnel, PlusCircle, Play, Eye, CheckCircle, ArrowsClockwise,
} from '@phosphor-icons/react'

type ActivityIcon = 'create' | 'in-progress' | 'review' | 'done' | 'change'

interface ActivityEntry {
  type: 'create' | 'status' | 'assign' | 'edit'
  icon: ActivityIcon
  text: string
  time: Date
  taskName: string
  memberName: string
}

type FilterType = 'all' | 'create' | 'status' | 'assign'

export function ActivityLog() {
  const tasks = useVisibleTasks()
  const [filter, setFilter] = useState<FilterType>('all')

  // Generate activity log from task data
  const activities = useMemo(() => {
    const log: ActivityEntry[] = []

    tasks.forEach(t => {
      const member = TEAM.find(m => m.id === t.assignee)
      const cat = CATEGORIES.find(c => c.id === t.category)
      const memberName = member?.name || ''

      // Creation activity
      if (t.createdAt) {
        log.push({
          type: 'create',
          icon: 'create',
          text: `${memberName} created "${t.name}" in ${cat?.emoji || ''} ${cat?.name || ''}`,
          time: new Date(t.createdAt),
          taskName: t.name,
          memberName,
        })
      }

      // Status change
      if (t.status !== 'todo' && t.startDate) {
        const statusLabels: Record<string, string> = {
          'in-progress': 'In Progress',
          'review': 'Review',
          'done': 'Done',
        }
        const statusIcons: Record<string, ActivityIcon> = {
          'in-progress': 'in-progress',
          'review': 'review',
          'done': 'done',
        }
        const d = new Date(t.startDate)
        d.setDate(d.getDate() + 2)
        log.push({
          type: 'status',
          icon: statusIcons[t.status] || 'change',
          text: `${memberName} changed to ${statusLabels[t.status] || t.status}: "${t.name}"`,
          time: d,
          taskName: t.name,
          memberName,
        })
      }

      // Completion
      if (t.status === 'done' && t.completedAt) {
        log.push({
          type: 'status',
          icon: 'done',
          text: `${memberName} completed: "${t.name}"`,
          time: new Date(t.completedAt),
          taskName: t.name,
          memberName,
        })
      }
    })

    log.sort((a, b) => b.time.getTime() - a.time.getTime())
    return log.slice(0, 100)
  }, [tasks])

  const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter)

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'create', label: 'Created' },
    { key: 'status', label: 'Status' },
  ]

  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; items: ActivityEntry[] }[] = []
    let currentDate = ''
    filtered.forEach(a => {
      const dateStr = formatDate(a.time)
      if (dateStr !== currentDate) {
        currentDate = dateStr
        groups.push({ date: dateStr, items: [] })
      }
      groups[groups.length - 1].items.push(a)
    })
    return groups
  }, [filtered])

  const ICON_MAP: Record<ActivityIcon, { Icon: React.ElementType; bg: string; color: string }> = {
    'create':      { Icon: PlusCircle,        bg: 'rgba(52,199,89,0.12)',  color: 'var(--color-green)' },
    'in-progress': { Icon: Play,              bg: 'rgba(0,122,255,0.12)',  color: 'var(--color-blue)' },
    'review':      { Icon: Eye,               bg: 'rgba(175,82,222,0.12)', color: 'var(--color-purple)' },
    'done':        { Icon: CheckCircle,       bg: 'rgba(52,199,89,0.12)',  color: 'var(--color-green)' },
    'change':      { Icon: ArrowsClockwise,   bg: 'rgba(161,161,170,0.1)', color: 'var(--color-text-tertiary)' },
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Funnel size={14} className="text-[var(--color-text-tertiary)]" />
        {filters.map(f => (
          <motion.button
            key={f.key}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${
              filter === f.key
                ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-glow-accent)]'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
            }`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* Log entries */}
      <AnimatePresence mode="wait">
        {grouped.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <EmptyState title="No activity" description="No activity of the selected type" />
          </motion.div>
        ) : (
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="glass-card overflow-hidden"
          >
            {grouped.map(group => (
              <div key={group.date}>
                <div className="px-4 py-2 bg-[var(--color-surface-2)]/60 backdrop-blur-sm text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider border-b border-[var(--color-border)]">
                  {group.date}
                </div>
                {group.items.map((a, i) => {
                  const { Icon, bg, color } = ICON_MAP[a.icon] || ICON_MAP['change']
                  return (
                    <motion.div
                      key={`${group.date}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, type: 'spring', damping: 25, stiffness: 300 }}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)] last:border-b-0 text-[12px] hover:bg-[var(--color-surface-2)]/30 transition-colors"
                    >
                      <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono w-10 shrink-0">
                        {a.time.getHours().toString().padStart(2, '0')}:{a.time.getMinutes().toString().padStart(2, '0')}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: bg, color }}
                      >
                        <Icon size={14} weight="fill" />
                      </div>
                      <span className="text-[var(--color-text-secondary)] flex-1">{a.text}</span>
                      <span className="text-[10px] text-[var(--color-text-tertiary)]">{formatRelative(a.time)}</span>
                    </motion.div>
                  )
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

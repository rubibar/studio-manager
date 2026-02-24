import { useMemo, useState } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { TEAM, CATEGORIES } from '@/lib/constants'
import { formatDate, formatRelative } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { Funnel } from '@phosphor-icons/react'

interface ActivityEntry {
  type: 'create' | 'status' | 'assign' | 'edit'
  icon: string
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
          icon: '+',
          text: `${memberName} יצר/ה "${t.name}" ב${cat?.emoji || ''} ${cat?.name || ''}`,
          time: new Date(t.createdAt),
          taskName: t.name,
          memberName,
        })
      }

      // Status change
      if (t.status !== 'todo' && t.startDate) {
        const statusLabels: Record<string, string> = {
          'in-progress': 'בתהליך',
          'review': 'ביקורת',
          'done': 'הושלם',
        }
        const statusIcons: Record<string, string> = {
          'in-progress': '~',
          'review': '?',
          'done': 'v',
        }
        const d = new Date(t.startDate)
        d.setDate(d.getDate() + 2)
        log.push({
          type: 'status',
          icon: statusIcons[t.status] || '~',
          text: `${memberName} שינה/תה ל${statusLabels[t.status] || t.status}: "${t.name}"`,
          time: d,
          taskName: t.name,
          memberName,
        })
      }

      // Completion
      if (t.status === 'done' && t.completedAt) {
        log.push({
          type: 'status',
          icon: 'v',
          text: `${memberName} השלים/ה: "${t.name}"`,
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
    { key: 'all', label: 'הכל' },
    { key: 'create', label: 'יצירה' },
    { key: 'status', label: 'סטטוס' },
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

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Funnel size={14} className="text-[var(--color-text-tertiary)]" />
        {filters.map(f => (
          <button
            key={f.key}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${
              filter === f.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
            }`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Log entries */}
      {grouped.length === 0 ? (
        <EmptyState title="אין פעילות" description="אין פעילות מהסוג שנבחר" />
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] overflow-hidden">
          {grouped.map(group => (
            <div key={group.date}>
              <div className="px-4 py-2 bg-[var(--color-surface-2)] text-[11px] font-bold text-[var(--color-text-tertiary)] border-b border-[var(--color-border)]">
                {group.date}
              </div>
              {group.items.map((a, i) => (
                <div
                  key={`${group.date}-${i}`}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)] last:border-b-0 text-[12px]"
                >
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono w-10 shrink-0">
                    {a.time.getHours().toString().padStart(2, '0')}:{a.time.getMinutes().toString().padStart(2, '0')}
                  </span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0"
                    style={{
                      background: a.type === 'create' ? 'rgba(5,150,105,0.1)' : a.type === 'status' ? 'rgba(37,99,235,0.1)' : 'rgba(161,161,170,0.1)',
                      color: a.type === 'create' ? 'var(--color-accent)' : a.type === 'status' ? 'var(--color-blue)' : 'var(--color-text-tertiary)',
                    }}
                  >
                    {a.icon}
                  </div>
                  <span className="text-[var(--color-text-secondary)] flex-1">{a.text}</span>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">{formatRelative(a.time)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

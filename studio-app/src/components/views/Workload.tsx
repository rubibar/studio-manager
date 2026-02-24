import { useMemo } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useSettingsStore } from '@/stores/settingsStore'
import { TEAM } from '@/lib/constants'
import {
  startOfWeek, addWeeks, endOfWeek, isWithinInterval,
} from 'date-fns'

export function Workload() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const isAtCapacity = useSettingsStore(s => s.isAtCapacity)
  const today = useMemo(() => new Date(), [])

  const teamStats = useMemo(() => {
    return TEAM.map(m => {
      const mt = tasks.filter(t => t.assignee === m.id)
      const active = mt.filter(t => t.status !== 'done')
      const done = mt.filter(t => t.status === 'done').length
      const inProgress = mt.filter(t => t.status === 'in-progress').length
      const todo = mt.filter(t => t.status === 'todo').length
      const review = mt.filter(t => t.status === 'review').length
      const overdue = mt.filter(t => t.endDate && new Date(t.endDate) < today && t.status !== 'done').length
      const pct = mt.length ? Math.round((done / mt.length) * 100) : 0
      const totalMinutes = mt.reduce((s, t) => s + (t.timeSpent || 0), 0)
      const hot = active.filter(t => getScore(t.id) >= 70).length

      return { ...m, total: mt.length, done, inProgress, todo, review, overdue, pct, totalMinutes, hot, atCapacity: isAtCapacity(m.id) }
    })
  }, [tasks, today, getScore, isAtCapacity])

  // Heatmap: 13 weeks
  const heatmapWeeks = useMemo(() => {
    const weekStart = startOfWeek(today, { weekStartsOn: 0 })
    const weeks: { start: Date; end: Date }[] = []
    for (let w = 0; w < 13; w++) {
      const ws = addWeeks(weekStart, w)
      const we = endOfWeek(ws, { weekStartsOn: 0 })
      weeks.push({ start: ws, end: we })
    }
    return weeks
  }, [today])

  return (
    <div className="space-y-6">
      {/* Member cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teamStats.map(m => (
          <div
            key={m.id}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[15px] font-bold" style={{ background: m.color }}>
                {m.name[0]}
              </div>
              <div>
                <div className="text-[14px] font-bold">{m.name}</div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">{m.role} &middot; {m.total} tasks</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] mb-2 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${m.pct}%`, background: m.color }} />
            </div>
            <div className="text-[11px] text-[var(--color-text-tertiary)] mb-4">{m.pct}% completed</div>

            {/* Status bars */}
            <div className="space-y-2">
              {[
                { label: 'To Do', value: m.todo, color: 'var(--color-text-tertiary)' },
                { label: 'In Progress', value: m.inProgress, color: 'var(--color-blue)' },
                { label: 'Review', value: m.review, color: 'var(--color-purple)' },
                { label: 'Done', value: m.done, color: 'var(--color-accent)' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2 text-[11px]">
                  <span className="w-14 text-[var(--color-text-tertiary)]">{row.label}</span>
                  <div className="flex-1 h-1 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${m.total ? (row.value / m.total) * 100 : 0}%`,
                        background: row.color,
                      }}
                    />
                  </div>
                  <span className="font-mono w-5 text-start">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {m.overdue > 0 && (
              <div className="mt-3 px-3 py-2 rounded-[8px] text-[11px] font-medium" style={{ background: 'rgba(220,38,38,0.06)', color: 'var(--color-red)' }}>
                {m.overdue} overdue tasks
              </div>
            )}
            {m.atCapacity && (
              <div className="mt-2 px-3 py-2 rounded-[8px] text-[11px] font-medium" style={{ background: 'rgba(217,119,6,0.06)', color: 'var(--color-yellow)' }}>
                At capacity
              </div>
            )}
            {m.hot > 0 && (
              <div className="mt-2 px-3 py-2 rounded-[8px] text-[11px] font-medium" style={{ background: 'rgba(220,38,38,0.04)', color: 'var(--color-red)' }}>
                {m.hot} hot tasks
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <h3 className="text-[14px] font-bold mb-4">Heatmap - 13 weeks</h3>

        {/* Week labels */}
        <div className="flex gap-[2px] mb-1.5 pr-[70px]">
          {heatmapWeeks.map((w, i) => (
            <div key={i} className="flex-1 text-center text-[9px] text-[var(--color-text-tertiary)]">
              {w.start.getDate()}/{w.start.getMonth() + 1}
            </div>
          ))}
        </div>

        {/* Per-member rows */}
        {TEAM.map(m => (
          <div key={m.id} className="flex items-center gap-[2px] mb-[2px]">
            <div className="w-[70px] text-[11px] text-[var(--color-text-tertiary)] text-start shrink-0">{m.name}</div>
            {heatmapWeeks.map((w, i) => {
              const cnt = tasks.filter(t =>
                t.assignee === m.id &&
                t.status !== 'done' &&
                t.startDate && t.endDate &&
                isWithinInterval(w.start, {
                  start: new Date(new Date(t.startDate).setHours(0, 0, 0, 0)),
                  end: new Date(new Date(t.endDate).setHours(23, 59, 59, 999)),
                }) ||
                (t.assignee === m.id && t.status !== 'done' && t.startDate && t.endDate &&
                  new Date(t.startDate) <= w.end && new Date(t.endDate) >= w.start)
              ).length
              const intensity = Math.min(cnt / 5, 1)
              const bg = cnt === 0
                ? 'var(--color-surface-2)'
                : `rgba(${parseInt(m.color.slice(1, 3), 16)},${parseInt(m.color.slice(3, 5), 16)},${parseInt(m.color.slice(5, 7), 16)},${0.15 + intensity * 0.65})`
              return (
                <div
                  key={i}
                  className="flex-1 h-6 rounded-[3px] flex items-center justify-center text-[9px]"
                  style={{ background: bg }}
                  title={`${m.name}: ${cnt} tasks`}
                >
                  {cnt > 0 ? cnt : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

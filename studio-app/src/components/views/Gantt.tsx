import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useTaskStore } from '@/stores/taskStore'
import { useScoring } from '@/hooks/useScoring'
import { TEAM, CATEGORIES } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { ScoreBadge } from '@/components/shared/ScoreBadge'

const GANTT_DAYS = 91 // 13 weeks

type FilterVal = 'all' | string

interface DragState {
  taskId: number
  mode: 'move' | 'resize-start' | 'resize-end'
  startX: number
  origRight: number
  origWidth: number
  timelineWidth: number
}

export function Gantt() {
  const allTasks = useVisibleTasks()
  const updateTask = useTaskStore(s => s.updateTask)
  const { getScore } = useScoring()

  const [filter, setFilter] = useState<FilterVal>('all')
  const dragRef = useRef<DragState | null>(null)
  const barRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const today = useMemo(() => new Date(), [])

  // Gantt start = previous Sunday
  const ganttStart = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  }, [today])

  // Build array of day info
  const days = useMemo(() => {
    const arr: { date: Date; dow: number; isWeekend: boolean; isToday: boolean; dayNum: number }[] = []
    for (let i = 0; i < GANTT_DAYS; i++) {
      const date = new Date(ganttStart)
      date.setDate(date.getDate() + i)
      const dow = date.getDay()
      arr.push({
        date,
        dow,
        isWeekend: dow === 5 || dow === 6,
        isToday: date.toDateString() === today.toDateString(),
        dayNum: date.getDate(),
      })
    }
    return arr
  }, [ganttStart, today])

  // Build week groups for header
  const weeks = useMemo(() => {
    const result: { label: string; span: number }[] = []
    let count = 0
    let weekStart: Date | null = null
    for (let i = 0; i < GANTT_DAYS; i++) {
      if (i % 7 === 0) {
        if (weekStart !== null) {
          result.push({ label: formatDate(weekStart, 'dd/MM'), span: count })
        }
        weekStart = days[i].date
        count = 0
      }
      count++
    }
    if (weekStart !== null) {
      result.push({ label: formatDate(weekStart, 'dd/MM'), span: count })
    }
    return result
  }, [days])

  // Filter tasks: only those with dates, not in bank
  const tasks = useMemo(() => {
    let list = allTasks.filter(t => t.startDate && t.endDate && t.assignee)
    if (filter !== 'all') {
      list = list.filter(t => t.assignee === filter)
    }
    return list
  }, [allTasks, filter])

  // Group tasks by category
  const grouped = useMemo(() => {
    return CATEGORIES
      .map(cat => ({
        cat,
        tasks: tasks.filter(t => t.category === cat.id).sort((a, b) => getScore(b.id) - getScore(a.id)),
      }))
      .filter(g => g.tasks.length > 0)
  }, [tasks, getScore])

  // Calculate bar position for a task
  const getBarPos = useCallback(
    (startDate: Date | string | null, endDate: Date | string | null) => {
      if (!startDate || !endDate) return null
      const sd = new Date(startDate)
      const ed = new Date(endDate)
      const ds = Math.floor((sd.getTime() - ganttStart.getTime()) / 86400000)
      const de = Math.floor((ed.getTime() - ganttStart.getTime()) / 86400000) + 1
      const bs = Math.max(0, ds)
      const be = Math.min(GANTT_DAYS, de)
      if (be <= bs) return null
      return {
        right: (bs / GANTT_DAYS) * 100,
        width: ((be - bs) / GANTT_DAYS) * 100,
      }
    },
    [ganttStart],
  )

  // Status-based bar color
  const getBarColor = useCallback((status: string, catColor: string) => {
    switch (status) {
      case 'todo': return catColor + 'aa'
      case 'in-progress': return catColor
      case 'review': return '#fdcb6e'
      case 'done': return '#00b894'
      default: return catColor
    }
  }, [])

  // Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, taskId: number, mode: DragState['mode']) => {
      e.preventDefault()
      e.stopPropagation()
      const bar = barRefs.current[taskId]
      if (!bar) return
      const timeline = bar.parentElement
      if (!timeline) return

      dragRef.current = {
        taskId,
        mode,
        startX: e.clientX,
        origRight: parseFloat(bar.style.right),
        origWidth: parseFloat(bar.style.width),
        timelineWidth: timeline.getBoundingClientRect().width,
      }
      bar.style.opacity = '0.85'
      bar.style.zIndex = '20'
    },
    [],
  )

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const drag = dragRef.current
      if (!drag) return
      const bar = barRefs.current[drag.taskId]
      if (!bar) return

      const dx = drag.startX - e.clientX // RTL: reversed
      const pct = (dx / drag.timelineWidth) * 100

      if (drag.mode === 'move') {
        const newRight = Math.max(0, Math.min(100 - drag.origWidth, drag.origRight + pct))
        bar.style.right = newRight + '%'
      } else if (drag.mode === 'resize-end') {
        const newWidth = drag.origWidth - pct
        if (newWidth > 1) bar.style.width = newWidth + '%'
      } else if (drag.mode === 'resize-start') {
        const newWidth = drag.origWidth + pct
        const newRight = drag.origRight - pct
        if (newWidth > 1 && newRight >= 0) {
          bar.style.width = newWidth + '%'
          bar.style.right = newRight + '%'
        }
      }
    }

    function handleMouseUp() {
      const drag = dragRef.current
      if (!drag) return
      const bar = barRefs.current[drag.taskId]
      if (bar) {
        bar.style.opacity = ''
        bar.style.zIndex = ''
      }

      // Calculate new dates from bar position
      const rightPct = bar ? parseFloat(bar.style.right) : drag.origRight
      const widthPct = bar ? parseFloat(bar.style.width) : drag.origWidth

      const startDay = Math.round((rightPct / 100) * GANTT_DAYS)
      const duration = Math.round((widthPct / 100) * GANTT_DAYS)

      if (duration > 0) {
        const newStart = new Date(ganttStart)
        newStart.setDate(newStart.getDate() + startDay)
        const newEnd = new Date(newStart)
        newEnd.setDate(newEnd.getDate() + duration - 1)

        updateTask(drag.taskId, {
          startDate: newStart.toISOString(),
          endDate: newEnd.toISOString(),
        })
      }

      dragRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [ganttStart, updateTask])

  const filters: { key: FilterVal; label: string }[] = [
    { key: 'all', label: 'All' },
    ...TEAM.map(m => ({ key: m.id, label: m.name })),
  ]

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex items-center gap-1">
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
        <span className="mr-auto text-[11px] text-[var(--color-text-tertiary)]">
          {tasks.length} tasks &middot; {GANTT_DAYS} days
        </span>
      </div>

      {/* Gantt chart */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] overflow-hidden">
        {/* Header */}
        <div className="flex border-b border-[var(--color-border)]">
          {/* Label column */}
          <div className="w-[180px] min-w-[180px] px-3 py-2 text-[11px] font-bold text-[var(--color-text-tertiary)] flex items-end border-l border-[var(--color-border)]">
            Task
          </div>
          {/* Timeline headers */}
          <div className="flex-1 overflow-x-auto">
            {/* Week row */}
            <div className="flex">
              {weeks.map((w, i) => (
                <div
                  key={i}
                  className="text-[10px] text-[var(--color-text-tertiary)] text-center py-1 border-b border-[var(--color-border)]"
                  style={{ flex: w.span, minWidth: w.span * 38 }}
                >
                  {w.label}
                </div>
              ))}
            </div>
            {/* Day row */}
            <div className="flex">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`w-[38px] min-w-[38px] text-center text-[9px] py-1 border-l border-[var(--color-border)] ${
                    d.isWeekend ? 'bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]' : ''
                  } ${d.isToday ? 'bg-[rgba(5,150,105,0.1)] text-[var(--color-accent)] font-bold' : 'text-[var(--color-text-tertiary)]'}`}
                >
                  {d.dayNum}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
          {grouped.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-[var(--color-text-tertiary)]">
              No tasks with dates for Gantt view
            </div>
          ) : (
            grouped.map(({ cat, tasks: catTasks }) => (
              <div key={cat.id}>
                {/* Category header row */}
                <div className="flex border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <div className="w-[180px] min-w-[180px] px-3 py-2 border-l border-[var(--color-border)]">
                    <span className="text-[12px] font-semibold" style={{ color: cat.color }}>
                      {cat.emoji} {cat.name} ({catTasks.length})
                    </span>
                  </div>
                  <div className="flex-1 flex relative">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        className={`w-[38px] min-w-[38px] h-full border-l border-[var(--color-border)] ${
                          d.isWeekend ? 'bg-[rgba(161,161,170,0.04)]' : ''
                        } ${d.isToday ? 'bg-[rgba(5,150,105,0.06)]' : ''}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Task rows */}
                {catTasks.map(t => {
                  const member = TEAM.find(m => m.id === t.assignee)
                  const barPos = getBarPos(t.startDate, t.endDate)

                  return (
                    <div key={t.id} className="flex border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors group">
                      {/* Label */}
                      <div className="w-[180px] min-w-[180px] px-3 py-2 border-l border-[var(--color-border)] flex items-center gap-2 overflow-hidden">
                        {member && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                            style={{ background: member.color }}
                          >
                            {member.name[0]}
                          </div>
                        )}
                        <span className="text-[11px] truncate" title={t.name}>
                          {t.name}
                        </span>
                        <div className="mr-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ScoreBadge score={getScore(t.id)} />
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex-1 flex relative" style={{ minHeight: 32 }}>
                        {/* Day cells (background grid) */}
                        {days.map((d, i) => (
                          <div
                            key={i}
                            className={`w-[38px] min-w-[38px] h-full border-l border-[var(--color-border)] ${
                              d.isWeekend ? 'bg-[rgba(161,161,170,0.04)]' : ''
                            } ${d.isToday ? 'bg-[rgba(5,150,105,0.06)]' : ''}`}
                          />
                        ))}

                        {/* Bar */}
                        {barPos && (
                          <div
                            ref={el => { barRefs.current[t.id] = el }}
                            className="absolute top-1 bottom-1 rounded-[4px] cursor-grab active:cursor-grabbing flex items-center overflow-hidden select-none"
                            style={{
                              right: `${barPos.right}%`,
                              width: `${barPos.width}%`,
                              background: getBarColor(t.status, cat.color),
                            }}
                            onMouseDown={e => handleMouseDown(e, t.id, 'move')}
                          >
                            {/* Resize handle: right side (start date in RTL) */}
                            <div
                              className="absolute right-0 top-0 bottom-0 w-[6px] cursor-ew-resize hover:bg-[rgba(255,255,255,0.3)]"
                              onMouseDown={e => handleMouseDown(e, t.id, 'resize-start')}
                            />
                            {/* Label */}
                            <span className="text-[9px] text-white font-medium px-1.5 truncate pointer-events-none">
                              {barPos.width > 6 ? t.name.substring(0, 25) : ''}
                            </span>
                            {/* Resize handle: left side (end date in RTL) */}
                            <div
                              className="absolute left-0 top-0 bottom-0 w-[6px] cursor-ew-resize hover:bg-[rgba(255,255,255,0.3)]"
                              onMouseDown={e => handleMouseDown(e, t.id, 'resize-end')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-tertiary)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-[2px] bg-[#059669aa]" />
          <span>To Do</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-[2px] bg-[#059669]" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-[2px] bg-[#fdcb6e]" />
          <span>Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-[2px] bg-[#00b894]" />
          <span>Done</span>
        </div>
        <span className="mr-auto">Drag bar to change dates</span>
      </div>
    </div>
  )
}

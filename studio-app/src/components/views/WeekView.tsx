import { useState, useMemo } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useUIStore } from '@/stores/uiStore'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { TEAM, CATEGORIES } from '@/lib/constants'
import { startOfWeek, addDays, addWeeks, format, isSameDay, isWithinInterval } from 'date-fns'
import { he } from 'date-fns/locale'
import { CaretRight, CaretLeft, House } from '@phosphor-icons/react'

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי']

export function WeekView() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const openModal = useUIStore(s => s.openModal)
  const [weekOffset, setWeekOffset] = useState(0)

  const today = useMemo(() => new Date(), [])

  const { days, weekLabel } = useMemo(() => {
    const base = addWeeks(today, weekOffset)
    const sun = startOfWeek(base, { weekStartsOn: 0 })
    const d = Array.from({ length: 5 }, (_, i) => addDays(sun, i))
    const endD = d[4]
    const label = `${format(sun, 'd/M')} - ${format(endD, 'd/M')}`
    return { days: d, weekLabel: label }
  }, [today, weekOffset])

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors"
            onClick={() => setWeekOffset(o => o + 1)}
          >
            <CaretRight size={16} />
          </button>
          <button
            className="px-3 py-1 rounded-[8px] text-[12px] font-medium hover:bg-[var(--color-surface-2)] transition-colors"
            onClick={() => setWeekOffset(0)}
          >
            <House size={14} />
          </button>
          <button
            className="p-1.5 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors"
            onClick={() => setWeekOffset(o => o - 1)}
          >
            <CaretLeft size={16} />
          </button>
        </div>
        <h2 className="text-[14px] font-bold">{weekLabel}</h2>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="grid gap-2" style={{ gridTemplateColumns: '100px repeat(5, 1fr)' }}>
            <div />
            {days.map((d, i) => {
              const isToday = isSameDay(d, today)
              return (
                <div
                  key={i}
                  className="text-center py-2 rounded-[8px]"
                  style={{ background: isToday ? 'rgba(5,150,105,0.08)' : 'transparent' }}
                >
                  <div className="text-[13px] font-bold">{DAY_NAMES[i]}</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">{format(d, 'd/M')}</div>
                </div>
              )
            })}
          </div>

          {/* Team rows */}
          {TEAM.map(m => (
            <div key={m.id} className="grid gap-2 mt-1" style={{ gridTemplateColumns: '100px repeat(5, 1fr)' }}>
              {/* Member label */}
              <div className="flex items-center gap-2 py-2 pr-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: m.color }}>
                  {m.name[0]}
                </div>
                <span className="text-[12px] font-medium truncate">{m.name}</span>
              </div>

              {/* Day cells */}
              {days.map((d, i) => {
                const dayStart = new Date(d)
                dayStart.setHours(0, 0, 0, 0)
                const dayEnd = new Date(d)
                dayEnd.setHours(23, 59, 59, 999)

                const dayTasks = tasks.filter(t =>
                  t.assignee === m.id &&
                  t.startDate && t.endDate &&
                  new Date(t.startDate) <= dayEnd &&
                  new Date(t.endDate) >= dayStart &&
                  t.status !== 'done'
                ).sort((a, b) => getScore(b.id) - getScore(a.id))

                const isToday = isSameDay(d, today)

                return (
                  <div
                    key={i}
                    className="min-h-[80px] rounded-[8px] p-1.5 border border-[var(--color-border)]"
                    style={{ background: isToday ? 'rgba(5,150,105,0.03)' : 'var(--color-surface-2)' }}
                  >
                    {dayTasks.map(t => {
                      const cat = CATEGORIES.find(c => c.id === t.category)
                      const score = getScore(t.id)
                      return (
                        <div
                          key={t.id}
                          className="p-1.5 rounded-[6px] mb-1 cursor-pointer hover:bg-[var(--color-surface-3)] transition-colors"
                          style={{ borderRight: `2px solid ${cat?.color || 'var(--color-border)'}` }}
                          onClick={() => openModal({ type: 'editTask', taskId: t.id })}
                        >
                          <div className="flex items-center gap-1">
                            <ScoreBadge score={score} />
                            <span className="text-[10px] font-medium truncate flex-1">
                              {cat?.emoji} {t.name}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {dayTasks.length === 0 && (
                      <div className="text-[10px] text-[var(--color-text-tertiary)] text-center py-3 opacity-40">
                        &mdash;
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

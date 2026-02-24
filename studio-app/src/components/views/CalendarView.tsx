import { useMemo, useState, useCallback } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useTaskStore } from '@/stores/taskStore'
import { useUIStore, type CalViewMode } from '@/stores/uiStore'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CATEGORIES, TEAM } from '@/lib/constants'
import {
  startOfMonth, startOfWeek, endOfWeek, addDays, addMonths, addWeeks,
  subMonths, isSameDay, isSameMonth, format, getDay, getDaysInMonth,
  addYears, subYears,
} from 'date-fns'
import { he } from 'date-fns/locale'
import { CaretRight, CaretLeft, House } from '@phosphor-icons/react'
import type { Task } from '@/types/task'

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const DAY_NAMES_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

export function CalendarView() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const updateTask = useTaskStore(s => s.updateTask)
  const openModal = useUIStore(s => s.openModal)
  const calendarDate = useUIStore(s => s.calendarDate)
  const setCalendarDate = useUIStore(s => s.setCalendarDate)
  const calViewMode = useUIStore(s => s.calViewMode)
  const setCalViewMode = useUIStore(s => s.setCalViewMode)
  const [dragTaskId, setDragTaskId] = useState<number | null>(null)

  const today = useMemo(() => new Date(), [])

  const getTasksForDate = useCallback((date: Date): Task[] => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    return tasks.filter(t =>
      t.startDate && t.endDate &&
      new Date(t.startDate) <= dayEnd &&
      new Date(t.endDate) >= dayStart
    )
  }, [tasks])

  function calNav(dir: number) {
    if (dir === 0) { setCalendarDate(new Date(today)); return }
    switch (calViewMode) {
      case 'day': setCalendarDate(addDays(calendarDate, dir)); break
      case 'week': setCalendarDate(addWeeks(calendarDate, dir)); break
      case 'month': setCalendarDate(dir > 0 ? addMonths(calendarDate, 1) : subMonths(calendarDate, 1)); break
      case 'agenda': setCalendarDate(dir > 0 ? addYears(calendarDate, 1) : subYears(calendarDate, 1)); break
    }
  }

  function handleDrop(date: Date, taskId: number) {
    const task = tasks.find(t => t.id === taskId)
    if (!task || !task.startDate || !task.endDate) return
    const duration = Math.round((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / 86400000)
    const newEnd = addDays(date, duration)
    updateTask(taskId, { startDate: date, endDate: newEnd })
    setDragTaskId(null)
  }

  // Title
  let title = ''
  switch (calViewMode) {
    case 'month':
      title = `${MONTH_NAMES[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`
      break
    case 'week': {
      const ws = startOfWeek(calendarDate, { weekStartsOn: 0 })
      const we = endOfWeek(calendarDate, { weekStartsOn: 0 })
      title = `${format(ws, 'd/M')} - ${format(we, 'd/M')}`
      break
    }
    case 'day':
      title = format(calendarDate, 'EEEE, d MMMM yyyy', { locale: he })
      break
    case 'agenda':
      title = String(calendarDate.getFullYear())
      break
  }

  const viewModes: { key: CalViewMode; label: string }[] = [
    { key: 'month', label: 'Month' },
    { key: 'week', label: 'Week' },
    { key: 'day', label: 'Day' },
    { key: 'agenda', label: 'Year' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors" onClick={() => calNav(1)}>
            <CaretRight size={16} />
          </button>
          <button className="p-1.5 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors" onClick={() => calNav(0)}>
            <House size={14} />
          </button>
          <button className="p-1.5 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors" onClick={() => calNav(-1)}>
            <CaretLeft size={16} />
          </button>
        </div>

        <h2 className="text-[14px] font-bold">{title}</h2>

        <div className="flex items-center gap-1">
          {viewModes.map(v => (
            <button
              key={v.key}
              className={`px-3 py-1.5 rounded-[8px] text-[11px] font-medium transition-colors ${
                calViewMode === v.key
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
              }`}
              onClick={() => setCalViewMode(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      {calViewMode === 'month' && <MonthView calendarDate={calendarDate} today={today} getTasksForDate={getTasksForDate} getScore={getScore} openModal={openModal} dragTaskId={dragTaskId} setDragTaskId={setDragTaskId} handleDrop={handleDrop} />}
      {calViewMode === 'week' && <WeekViewCal calendarDate={calendarDate} today={today} getTasksForDate={getTasksForDate} getScore={getScore} openModal={openModal} dragTaskId={dragTaskId} setDragTaskId={setDragTaskId} handleDrop={handleDrop} />}
      {calViewMode === 'day' && <DayView calendarDate={calendarDate} today={today} getTasksForDate={getTasksForDate} getScore={getScore} openModal={openModal} />}
      {calViewMode === 'agenda' && <YearView calendarDate={calendarDate} today={today} getTasksForDate={getTasksForDate} setCalendarDate={setCalendarDate} setCalViewMode={setCalViewMode} />}
    </div>
  )
}

/* ---- Month View ---- */
interface ViewProps {
  calendarDate: Date
  today: Date
  getTasksForDate: (date: Date) => Task[]
  getScore: (id: number) => number
  openModal: (m: { type: 'editTask'; taskId: number }) => void
  dragTaskId: number | null
  setDragTaskId: (id: number | null) => void
  handleDrop: (date: Date, taskId: number) => void
}

function MonthView({ calendarDate, today, getTasksForDate, getScore: _getScore, openModal, dragTaskId, setDragTaskId, handleDrop }: ViewProps) {
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const firstDay = startOfMonth(calendarDate)
  const pad = getDay(firstDay)
  const daysInMonth = getDaysInMonth(calendarDate)

  // Padding before
  const prevMonth = subMonths(calendarDate, 1)
  const prevDays = getDaysInMonth(prevMonth)
  const prefixDays = Array.from({ length: pad }, (_, i) => new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevDays - pad + i + 1))

  // Month days
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))

  // Suffix
  const total = pad + daysInMonth
  const rem = total % 7 === 0 ? 0 : 7 - (total % 7)
  const suffixDays = Array.from({ length: rem }, (_, i) => new Date(year, month + 1, i + 1))

  const allDays = [...prefixDays, ...monthDays, ...suffixDays]

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px mb-px">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-[var(--color-text-tertiary)] py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-px bg-[var(--color-border)]">
        {allDays.map((d, i) => {
          const isCurrentMonth = isSameMonth(d, calendarDate)
          const isToday = isSameDay(d, today)
          const dayTasks = getTasksForDate(d)

          return (
            <div
              key={i}
              className={`min-h-[90px] p-1.5 ${isCurrentMonth ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-surface-2)]'}`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragTaskId) handleDrop(d, dragTaskId) }}
            >
              <div className={`text-[11px] mb-1 ${isToday ? 'w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold' : isCurrentMonth ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)] opacity-40'}`}>
                {d.getDate()}
              </div>
              {dayTasks.slice(0, 3).map(t => {
                const cat = CATEGORIES.find(c => c.id === t.category)
                return (
                  <div
                    key={t.id}
                    className="text-[9px] px-1 py-0.5 rounded mb-0.5 cursor-pointer truncate"
                    style={{ background: `${cat?.color || '#a1a1aa'}20`, color: cat?.color || '#a1a1aa' }}
                    draggable
                    onDragStart={() => setDragTaskId(t.id)}
                    onClick={() => openModal({ type: 'editTask', taskId: t.id })}
                  >
                    {t.name}
                  </div>
                )
              })}
              {dayTasks.length > 3 && (
                <div className="text-[8px] text-[var(--color-text-tertiary)] px-1">+{dayTasks.length - 3}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---- Week View ---- */
function WeekViewCal({ calendarDate, today, getTasksForDate, getScore, openModal, dragTaskId, setDragTaskId, handleDrop }: ViewProps) {
  const sun = startOfWeek(calendarDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(sun, i))

  return (
    <div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const isToday = isSameDay(d, today)
          const dayTasks = getTasksForDate(d)

          return (
            <div key={i} className="min-h-[300px]">
              <div className={`text-center py-2 mb-2 rounded-[8px] ${isToday ? 'bg-[rgba(5,150,105,0.08)]' : ''}`}>
                <div className="text-[12px] font-bold">{DAY_NAMES[i]}</div>
                <div className="text-[13px] font-bold mt-0.5">{d.getDate()}</div>
              </div>
              <div
                className="space-y-1.5 p-1.5 rounded-[8px] bg-[var(--color-surface-2)] min-h-[250px]"
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (dragTaskId) handleDrop(d, dragTaskId) }}
              >
                {dayTasks.map(t => {
                  const cat = CATEGORIES.find(c => c.id === t.category)
                  const sc = getScore(t.id)
                  return (
                    <div
                      key={t.id}
                      className="p-2 rounded-[6px] cursor-pointer text-[11px] hover:bg-[var(--color-surface-3)] transition-colors"
                      style={{ borderRight: `3px solid ${cat?.color || 'var(--color-border)'}` }}
                      draggable
                      onDragStart={() => setDragTaskId(t.id)}
                      onClick={() => openModal({ type: 'editTask', taskId: t.id })}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <ScoreBadge score={sc} />
                        <span className="font-medium truncate">{t.name}</span>
                      </div>
                      <div className="text-[9px] text-[var(--color-text-tertiary)]">
                        {cat?.emoji} {(['todo', 'in-progress', 'review', 'done'] as const).includes(t.status) ? ({'todo':'To Do','in-progress':'In Progress','review':'Review','done':'Done'} as Record<string, string>)[t.status] : t.status}
                      </div>
                    </div>
                  )
                })}
                {dayTasks.length === 0 && (
                  <div className="text-[10px] text-[var(--color-text-tertiary)] text-center py-6 opacity-40">&mdash;</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---- Day View ---- */
function DayView({ calendarDate, today: _today, getTasksForDate, getScore, openModal }: Omit<ViewProps, 'dragTaskId' | 'setDragTaskId' | 'handleDrop'>) {
  const dayTasks = getTasksForDate(calendarDate)

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold">
          {format(calendarDate, 'EEEE, d MMMM yyyy', { locale: he })}
        </h3>
        <span className="text-[12px] text-[var(--color-text-tertiary)]">{dayTasks.length} tasks</span>
      </div>

      {dayTasks.length === 0 ? (
        <div className="text-center py-10 text-[13px] text-[var(--color-text-tertiary)]">No tasks for this day</div>
      ) : (
        <div className="space-y-2">
          {dayTasks.map(t => {
            const cat = CATEGORIES.find(c => c.id === t.category)
            const member = TEAM.find(m => m.id === t.assignee)
            const sc = getScore(t.id)

            return (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-[8px] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer transition-colors"
                onClick={() => openModal({ type: 'editTask', taskId: t.id })}
              >
                <ScoreBadge score={sc} />
                <div className="flex-1">
                  <div className="text-[13px] font-medium mb-0.5">{t.name}</div>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                    {cat && <span>{cat.emoji} {cat.name}</span>}
                    {member && <span>{member.name}</span>}
                  </div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---- Year View ---- */
function YearView({ calendarDate, today, getTasksForDate, setCalendarDate, setCalViewMode }: {
  calendarDate: Date
  today: Date
  getTasksForDate: (date: Date) => Task[]
  setCalendarDate: (d: Date) => void
  setCalViewMode: (m: CalViewMode) => void
}) {
  const year = calendarDate.getFullYear()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, month) => {
        const first = new Date(year, month, 1)
        const pad = getDay(first)
        const dim = getDaysInMonth(first)

        return (
          <div key={month} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-3">
            <div
              className="text-[13px] font-bold mb-2 cursor-pointer hover:text-[var(--color-accent)] transition-colors"
              onClick={() => { setCalendarDate(new Date(year, month, 1)); setCalViewMode('month') }}
            >
              {MONTH_NAMES[month]}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAY_NAMES_SHORT.map(d => (
                <div key={d} className="text-center text-[8px] text-[var(--color-text-tertiary)] font-bold">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: pad }, (_, i) => <div key={`p${i}`} className="h-5" />)}
              {Array.from({ length: dim }, (_, i) => {
                const d = new Date(year, month, i + 1)
                const isToday = isSameDay(d, today)
                const dayTasks = getTasksForDate(d)
                const hasTasks = dayTasks.length > 0
                const dotColor = hasTasks ? (CATEGORIES.find(c => c.id === dayTasks[0].category)?.color || '#059669') : ''

                return (
                  <div
                    key={i}
                    className={`h-5 flex flex-col items-center justify-center text-[8px] rounded-[2px] cursor-pointer relative ${isToday ? 'bg-[var(--color-accent)] text-white font-bold' : hasTasks ? 'font-bold' : 'text-[var(--color-text-tertiary)]'}`}
                    onClick={() => { setCalendarDate(d); setCalViewMode('day') }}
                  >
                    {i + 1}
                    {hasTasks && !isToday && (
                      <div className="absolute bottom-0 w-1 h-1 rounded-full" style={{ background: dotColor }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

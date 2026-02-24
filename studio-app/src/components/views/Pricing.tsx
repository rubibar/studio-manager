import { useState, useMemo } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { useUIStore } from '@/stores/uiStore'
import { TEAM, CATEGORIES } from '@/lib/constants'
import { formatCurrency } from '@/lib/formatters'

export function Pricing() {
  const tasks = useVisibleTasks()
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const [rate, setRate] = useState(250)

  const { teamRows, catRows, topTasks, totalHrs, totalCost } = useMemo(() => {
    let tHrs = 0
    let tCost = 0

    const tRows = TEAM.map(m => {
      const mt = tasks.filter(t => t.assignee === m.id)
      const hrs = mt.reduce((s, t) => s + (t.timeSpent || 0), 0) / 60
      const cost = hrs * rate
      tHrs += hrs
      tCost += cost
      const avgPerTask = mt.length ? (hrs / mt.length) : 0
      return { ...m, hrs, cost, taskCount: mt.length, avgPerTask }
    })

    const cRows = CATEGORIES.map(c => {
      const ct = tasks.filter(t => t.category === c.id)
      const hrs = ct.reduce((s, t) => s + (t.timeSpent || 0), 0) / 60
      return { ...c, hrs, cost: hrs * rate }
    }).filter(c => c.hrs > 0)

    const top = [...tasks]
      .filter(t => (t.timeSpent || 0) > 0)
      .sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0))
      .slice(0, 10)

    return { teamRows: tRows, catRows: cRows, topTasks: top, totalHrs: tHrs, totalCost: tCost }
  }, [tasks, rate])

  return (
    <div className="space-y-5">
      {/* Rate input */}
      <div className="flex items-center gap-3">
        <label className="text-[12px] text-[var(--color-text-secondary)]">Hourly rate:</label>
        <div className="relative">
          <input
            type="number"
            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[8px] py-2 px-3 text-[13px] font-mono w-24"
            value={rate}
            onChange={e => setRate(Number(e.target.value) || 0)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--color-text-tertiary)]">&#8362;</span>
        </div>
      </div>

      {/* Team breakdown */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <h3 className="text-[14px] font-bold mb-4">Hours & Pricing Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[var(--color-text-tertiary)] text-[11px]">
                <th className="text-start py-2 font-medium">Team Member</th>
                <th className="text-start py-2 font-medium">Hours</th>
                <th className="text-start py-2 font-medium">Rate</th>
                <th className="text-start py-2 font-medium">Cost</th>
                <th className="text-start py-2 font-medium">Tasks</th>
                <th className="text-start py-2 font-medium">Avg/Task</th>
              </tr>
            </thead>
            <tbody>
              {teamRows.map(m => (
                <tr key={m.id} className="border-t border-[var(--color-border)]">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: m.color }}>
                        {m.name[0]}
                      </div>
                      {m.name}
                    </div>
                  </td>
                  <td className="py-2.5 font-mono">{m.hrs.toFixed(1)}h</td>
                  <td className="py-2.5 font-mono">{formatCurrency(rate)}</td>
                  <td className="py-2.5 font-mono font-bold">{formatCurrency(m.cost)}</td>
                  <td className="py-2.5 font-mono">{m.taskCount}</td>
                  <td className="py-2.5 font-mono">{m.avgPerTask.toFixed(1)}h</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[var(--color-border)] font-bold">
                <td className="py-2.5">Total</td>
                <td className="py-2.5 font-mono">{totalHrs.toFixed(1)}h</td>
                <td className="py-2.5 font-mono">{formatCurrency(rate)}</td>
                <td className="py-2.5 font-mono">{formatCurrency(totalCost)}</td>
                <td className="py-2.5 font-mono">{tasks.length}</td>
                <td className="py-2.5 font-mono">{tasks.length ? (totalHrs / tasks.length).toFixed(1) : '0'}h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category breakdown */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
          <h3 className="text-[14px] font-bold mb-4">By Category</h3>
          {catRows.length === 0 ? (
            <div className="text-center py-6 text-[12px] text-[var(--color-text-tertiary)]">No hours logged</div>
          ) : (
            <div className="space-y-3">
              {catRows.map(c => (
                <div key={c.id} className="flex items-center justify-between text-[12px]">
                  <span>{c.emoji} {c.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[var(--color-text-tertiary)]">{c.hrs.toFixed(1)}h</span>
                    <span className="font-mono font-bold">{formatCurrency(c.cost)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top time-consuming tasks */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
          <h3 className="text-[14px] font-bold mb-4">Most Time-Consuming Tasks</h3>
          {topTasks.length === 0 ? (
            <div className="text-center py-6 text-[12px] text-[var(--color-text-tertiary)]">No hours logged yet</div>
          ) : (
            <div className="space-y-2">
              {topTasks.map(t => {
                const hrs = (t.timeSpent || 0) / 60
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-[12px] py-1.5 border-b border-[var(--color-border)] last:border-b-0 cursor-pointer hover:bg-[var(--color-surface-2)] px-2 rounded-[6px] transition-colors"
                    onClick={() => openSlideOver(t.id)}
                  >
                    <span className="truncate flex-1">{t.name}</span>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-[var(--color-text-tertiary)]">{hrs.toFixed(1)}h</span>
                      <span className="font-mono font-bold">{formatCurrency(hrs * rate)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { subDays, addDays, isBefore, isAfter, format } from 'date-fns'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

type BurndownRange = 'month' | 'quarter' | 'half'

export function Burndown() {
  const tasks = useVisibleTasks()
  const [range, setRange] = useState<BurndownRange>('month')
  const today = useMemo(() => new Date(), [])

  const { data, stats } = useMemo(() => {
    const days = range === 'month' ? 30 : range === 'quarter' ? 90 : 180
    const startD = subDays(today, days)
    const totalTasks = tasks.length
    const remaining = totalTasks - tasks.filter(t => t.status === 'done').length

    const points = []
    for (let i = 0; i <= days; i++) {
      const d = addDays(startD, i)
      const doneByDate = tasks.filter(t =>
        t.status === 'done' && t.endDate && !isAfter(new Date(t.endDate), d)
      ).length
      const ideal = totalTasks - Math.round((totalTasks / days) * i)
      points.push({
        day: i,
        date: format(d, 'd/M'),
        actual: totalTasks - doneByDate,
        ideal: Math.max(0, ideal),
      })
    }

    const doneThisPeriod = tasks.filter(t =>
      t.status === 'done' && t.endDate &&
      !isBefore(new Date(t.endDate), startD) &&
      !isAfter(new Date(t.endDate), today)
    ).length
    const avgPerDay = days > 0 ? (doneThisPeriod / days) : 0
    const daysToFinish = avgPerDay > 0 ? Math.ceil(remaining / avgPerDay) : null

    return {
      data: points,
      stats: { totalTasks, doneThisPeriod, avgPerDay: avgPerDay.toFixed(1), daysToFinish, remaining },
    }
  }, [tasks, range, today])

  const ranges: { key: BurndownRange; label: string }[] = [
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'half', label: 'Half Year' },
  ]

  return (
    <div className="space-y-5">
      {/* Range selector */}
      <div className="flex items-center gap-1">
        {ranges.map(r => (
          <button
            key={r.key}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${
              range === r.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
            }`}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Tasks" value={stats.totalTasks} color="var(--color-text-primary)" />
        <StatCard label="Completed" value={stats.doneThisPeriod} color="var(--color-accent)" />
        <StatCard label="Avg / Day" value={stats.avgPerDay} color="var(--color-blue)" />
        <StatCard label="Days to Finish" value={stats.daysToFinish ?? '---'} color="var(--color-yellow)" />
      </div>

      {/* Chart */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(161,161,170,0.1)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} />
            <Tooltip
              contentStyle={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="ideal" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="6 4" dot={false} name="Ideal" />
            <Area type="monotone" dataKey="actual" stroke="#059669" strokeWidth={2} fill="url(#burnGrad)" name="Actual" />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 text-[11px] text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-[var(--color-accent)] rounded" /> Actual
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-[var(--color-text-tertiary)] rounded" style={{ opacity: 0.5 }} /> Ideal
          </span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-[var(--color-surface-2)] rounded-[12px] p-4 border border-[var(--color-border)] text-center">
      <div className="text-[11px] text-[var(--color-text-tertiary)] mb-1">{label}</div>
      <div className="text-[22px] font-bold font-mono" style={{ color }}>{value}</div>
    </div>
  )
}

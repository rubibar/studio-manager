import { useMemo } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { TEAM } from '@/lib/constants'
import { subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function Velocity() {
  const tasks = useVisibleTasks()
  const today = useMemo(() => new Date(), [])

  const { weeks, avgVel, lastWeek, trend, weeksToFinish } = useMemo(() => {
    const w: { label: string; done: number; start: Date; end: Date }[] = []
    for (let i = 11; i >= 0; i--) {
      const wEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 0 })
      const wStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 0 })
      const done = tasks.filter(t =>
        t.status === 'done' && t.endDate &&
        isWithinInterval(new Date(t.endDate), { start: wStart, end: wEnd })
      ).length
      w.push({
        label: `${wStart.getDate()}/${wStart.getMonth() + 1}`,
        done,
        start: wStart,
        end: wEnd,
      })
    }

    const avg = w.length ? w.reduce((s, x) => s + x.done, 0) / w.length : 0
    const last = w[w.length - 1]?.done || 0
    const prev = w[w.length - 2]?.done || 0
    const totalDone = tasks.filter(t => t.status === 'done').length
    const remaining = tasks.length - totalDone
    const wtf = avg > 0 ? Math.ceil(remaining / avg) : null

    return { weeks: w, avgVel: avg.toFixed(1), lastWeek: last, prevWeek: prev, trend: last - prev, weeksToFinish: wtf }
  }, [tasks, today])

  // Per-team velocity
  const teamVelocity = useMemo(() => {
    return TEAM.map(m => {
      const mWeeks = weeks.map(w =>
        tasks.filter(t =>
          t.assignee === m.id && t.status === 'done' && t.endDate &&
          isWithinInterval(new Date(t.endDate), { start: w.start, end: w.end })
        ).length
      )
      const mAvg = mWeeks.length ? (mWeeks.reduce((s, v) => s + v, 0) / mWeeks.length).toFixed(1) : '0'
      const mMax = Math.max(...mWeeks, 1)
      return { ...m, weeks: mWeeks, avg: mAvg, max: mMax }
    })
  }, [tasks, weeks])

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Weekly Avg" value={avgVel} color="var(--color-text-primary)" />
        <StatCard label="Last Week" value={lastWeek} color="var(--color-accent)" />
        <StatCard
          label="Trend"
          value={`${trend >= 0 ? '+' : ''}${trend}`}
          color={trend >= 0 ? 'var(--color-accent)' : 'var(--color-red)'}
        />
        <StatCard label="Weeks Left" value={weeksToFinish ?? '---'} color="var(--color-yellow)" />
      </div>

      {/* Chart */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <h3 className="text-[14px] font-bold mb-4">Weekly Velocity (12 weeks)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeks} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(161,161,170,0.1)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
            <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            />
            <Bar
              dataKey="done"
              name="Completed"
              radius={[4, 4, 0, 0]}
              fill="#059669"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Team velocity */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <h3 className="text-[14px] font-bold mb-4">Team Velocity</h3>
        <div className="space-y-5">
          {teamVelocity.map(m => (
            <div key={m.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: m.color }}>
                  {m.name[0]}
                </div>
                <span className="text-[13px] font-medium">{m.name}</span>
                <span className="text-[11px] text-[var(--color-text-tertiary)]">Avg: {m.avg} / week</span>
              </div>
              <div className="flex items-end gap-[3px] h-10">
                {m.weeks.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[3px]"
                    style={{
                      background: m.color,
                      opacity: 0.3 + (v / m.max) * 0.7,
                      height: `${Math.max((v / m.max) * 100, 5)}%`,
                    }}
                    title={`Week ${i + 1}: ${v} tasks`}
                  />
                ))}
              </div>
            </div>
          ))}
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

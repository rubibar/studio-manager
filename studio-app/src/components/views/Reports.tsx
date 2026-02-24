import { useState, useMemo } from 'react'
import { useVisibleTasks } from '@/hooks/useFilters'
import { TEAM, CATEGORIES, TYPE_LABELS } from '@/lib/constants'
import { subDays, subMonths, isAfter, isBefore } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

type ReportPeriod = 'week' | 'month' | 'all'

export function Reports() {
  const tasks = useVisibleTasks()
  const [period, setPeriod] = useState<ReportPeriod>('month')
  const today = useMemo(() => new Date(), [])

  const periodTasks = useMemo(() => {
    if (period === 'all') return tasks
    const start = period === 'week' ? subDays(today, 7) : subMonths(today, 1)
    return tasks.filter(t =>
      t.startDate && t.endDate &&
      !isAfter(new Date(t.startDate), today) &&
      !isBefore(new Date(t.endDate), start)
    )
  }, [tasks, period, today])

  const donePeriod = periodTasks.filter(t => t.status === 'done').length
  const totalP = periodTasks.length
  const pctDone = totalP ? Math.round((donePeriod / totalP) * 100) : 0
  const overdue = periodTasks.filter(t => t.endDate && new Date(t.endDate) < today && t.status !== 'done').length
  const totalHours = periodTasks.reduce((s, t) => s + (t.timeSpent || 0), 0) / 60

  // Team data
  const teamData = TEAM.map(m => {
    const mt = periodTasks.filter(t => t.assignee === m.id)
    const md = mt.filter(t => t.status === 'done').length
    return { name: m.name, total: mt.length, done: md, color: m.color }
  })

  // Category data
  const catData = CATEGORIES
    .map(c => {
      const ct = periodTasks.filter(t => t.category === c.id)
      return { name: c.name, emoji: c.emoji, total: ct.length, done: ct.filter(t => t.status === 'done').length, color: c.color }
    })
    .filter(c => c.total > 0)

  // Type distribution for pie chart
  const typeData = [
    { name: TYPE_LABELS.client, value: periodTasks.filter(t => t.type === 'client').length, color: '#2563eb' },
    { name: TYPE_LABELS.internal, value: periodTasks.filter(t => t.type === 'internal').length, color: '#d97706' },
    { name: TYPE_LABELS.admin, value: periodTasks.filter(t => t.type === 'admin').length, color: '#a1a1aa' },
  ].filter(d => d.value > 0)

  // Priority breakdown
  const priorities = [
    { label: 'High', tasks: periodTasks.filter(t => t.priority === 'high'), color: 'var(--color-red)' },
    { label: 'Medium', tasks: periodTasks.filter(t => t.priority === 'medium'), color: 'var(--color-yellow)' },
    { label: 'Low', tasks: periodTasks.filter(t => t.priority === 'low'), color: 'var(--color-accent)' },
  ]

  const periodLabels: Record<ReportPeriod, string> = { week: 'Weekly', month: 'Monthly', all: 'Overall' }
  const periods: { key: ReportPeriod; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'all', label: 'All' },
  ]

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex items-center gap-1">
        {periods.map(p => (
          <button
            key={p.key}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${
              period === p.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'
            }`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-5">
        <h3 className="text-[14px] font-bold mb-4">{periodLabels[period]} Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total" value={totalP} color="var(--color-text-primary)" />
          <StatCard label="Completed" value={donePeriod} color="var(--color-accent)" />
          <StatCard label="% Done" value={`${pctDone}%`} color="var(--color-blue)" />
          <StatCard label="Overdue" value={overdue} color="var(--color-red)" />
          <StatCard label="Hours" value={totalHours.toFixed(1)} color="var(--color-purple)" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team performance */}
        <div className="glass-card p-5">
          <h3 className="text-[14px] font-bold mb-4">Team Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={teamData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} width={50} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="done" fill="#059669" name="Completed" radius={[0, 4, 4, 0]} />
              <Bar dataKey="total" fill="rgba(161,161,170,0.2)" name="Total" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Type distribution */}
        <div className="glass-card p-5">
          <h3 className="text-[14px] font-bold mb-4">Distribution by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2 text-[11px]">
            {typeData.map(d => (
              <span key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-[14px] font-bold mb-4">By Category</h3>
          <div className="space-y-3">
            {catData.map(c => {
              const pct = c.total ? Math.round((c.done / c.total) * 100) : 0
              return (
                <div key={c.name}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span>{c.emoji} {c.name}</span>
                    <span className="text-[var(--color-text-tertiary)]">{c.done}/{c.total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-[14px] font-bold mb-4">By Priority</h3>
          <div className="space-y-4">
            {priorities.map(p => {
              const pDone = p.tasks.filter(t => t.status === 'done').length
              const pct = p.tasks.length ? Math.round((pDone / p.tasks.length) * 100) : 0
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span>{p.label}</span>
                    <span className="text-[var(--color-text-tertiary)]">{pDone}/{p.tasks.length}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Overdue tasks */}
      {overdue > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-[14px] font-bold mb-3">Overdue Tasks</h3>
          <div className="space-y-2">
            {periodTasks
              .filter(t => t.endDate && new Date(t.endDate) < today && t.status !== 'done')
              .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
              .slice(0, 8)
              .map(t => {
                const member = TEAM.find(m => m.id === t.assignee)
                const daysLate = Math.ceil((today.getTime() - new Date(t.endDate!).getTime()) / 86400000)
                return (
                  <div key={t.id} className="flex items-center justify-between text-[12px] py-2 border-b border-[var(--color-border)] last:border-b-0">
                    <div className="flex items-center gap-2">
                      {member && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: member.color }}>
                          {member.name[0]}
                        </div>
                      )}
                      <span>{t.name}</span>
                    </div>
                    <span className="text-[var(--color-red)] text-[11px]">{daysLate} days</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[11px] text-[var(--color-text-tertiary)] mb-1">{label}</div>
      <div className="text-[22px] font-bold font-mono" style={{ color }}>{value}</div>
    </div>
  )
}

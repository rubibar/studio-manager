import { useMemo } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useVisibleTasks } from '@/hooks/useFilters'
import { PROJECT_STATUS_MAP } from '@/lib/constants'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { Buildings } from '@phosphor-icons/react'

export function Clients() {
  const projects = useProjectStore(s => s.projects)
  const tasks = useVisibleTasks()

  // Group projects by client
  const clientGroups = useMemo(() => {
    const map: Record<string, {
      name: string
      projects: typeof projects
      totalBudget: number
      totalTasks: number
      doneTasks: number
    }> = {}

    projects.forEach(p => {
      const clientName = p.client || 'No Client'
      if (!map[clientName]) {
        map[clientName] = { name: clientName, projects: [], totalBudget: 0, totalTasks: 0, doneTasks: 0 }
      }
      map[clientName].projects.push(p)
      map[clientName].totalBudget += (p.budget || 0)

      const pTasks = tasks.filter(t => t.project === String(p.id))
      map[clientName].totalTasks += pTasks.length
      map[clientName].doneTasks += pTasks.filter(t => t.status === 'done').length
    })

    return Object.values(map).sort((a, b) => b.projects.length - a.projects.length)
  }, [projects, tasks])

  // Summary stats
  const totalClients = clientGroups.filter(g => g.name !== 'No Client').length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0)

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Clients" value={totalClients} color="var(--color-text-primary)" />
        <StatCard label="Active Projects" value={activeProjects} color="var(--color-accent)" />
        <StatCard label="Proposals" value={projects.filter(p => p.status === 'proposal').length} color="var(--color-yellow)" />
        <StatCard label="Total Budget" value={formatCurrency(totalBudget)} color="var(--color-purple)" />
      </div>

      {/* Client cards */}
      {clientGroups.length === 0 ? (
        <EmptyState title="No clients" description="Create projects with a client name to see them here" />
      ) : (
        <div className="space-y-4">
          {clientGroups.map(group => {
            const pct = group.totalTasks ? Math.round((group.doneTasks / group.totalTasks) * 100) : 0
            return (
              <div key={group.name} className="glass-card overflow-hidden">
                {/* Client header */}
                <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--color-surface-3)] flex items-center justify-center">
                    <Buildings size={18} className="text-[var(--color-text-tertiary)]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-bold">{group.name}</div>
                    <div className="text-[11px] text-[var(--color-text-tertiary)]">
                      {group.projects.length} projects &middot; {group.totalTasks} tasks &middot; {pct}% completed
                    </div>
                  </div>
                  {group.totalBudget > 0 && (
                    <span className="text-[13px] font-bold font-mono text-[var(--color-accent)]">
                      {formatCurrency(group.totalBudget)}
                    </span>
                  )}
                </div>

                {/* Projects */}
                <div className="divide-y divide-[var(--color-border)]">
                  {group.projects.map(p => {
                    const pTasks = tasks.filter(t => t.project === String(p.id))
                    const pDone = pTasks.filter(t => t.status === 'done').length
                    const pPct = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0
                    const st = PROJECT_STATUS_MAP[p.status] || { label: p.status, color: '#a1a1aa' }

                    return (
                      <div key={p.id} className="px-4 py-3 hover:bg-[var(--color-surface-2)] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px]">{p.emoji}</span>
                            <span className="text-[13px] font-medium">{p.name}</span>
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ color: st.color, background: `${st.color}15` }}
                            >
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-tertiary)]">
                            {p.deadline && <span>{formatDate(p.deadline)}</span>}
                            {p.budget ? <span className="font-mono">{formatCurrency(p.budget)}</span> : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pPct}%`, background: p.color }} />
                          </div>
                          <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{pDone}/{pTasks.length}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="text-[11px] text-[var(--color-text-tertiary)] mb-1">{label}</div>
      <div className="text-[20px] font-bold font-mono" style={{ color }}>{value}</div>
    </div>
  )
}

import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTaskStore } from '@/stores/taskStore'
import { useScoring } from '@/hooks/useScoring'
import { TEAM, ADMIN_EMAILS, EMAIL_TO_TEAM } from '@/lib/constants'
import { EmptyState } from '@/components/shared/EmptyState'
import { Shield, Calendar, Users, ChartBar, Lock } from '@phosphor-icons/react'

export function Admin() {
  const isAdmin = useAuthStore(s => s.isAdmin)
  const thursdayMode = useSettingsStore(s => s.thursdayMeetingMode)
  const toggleThursdayMeeting = useSettingsStore(s => s.toggleThursdayMeeting)
  const isAtCapacity = useSettingsStore(s => s.isAtCapacity)
  const toggleCapacity = useSettingsStore(s => s.toggleCapacity)
  const tasks = useTaskStore(s => s.tasks)
  const { getScore } = useScoring()

  if (!isAdmin) {
    return <EmptyState title="Access Denied" description="Only admins can access this page" />
  }

  // Score distribution
  const scoreBuckets = [
    { label: '0-20', min: 0, max: 20 },
    { label: '21-40', min: 21, max: 40 },
    { label: '41-60', min: 41, max: 60 },
    { label: '61-80', min: 61, max: 80 },
    { label: '81-100', min: 81, max: 100 },
  ]

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const maxBucket = Math.max(
    ...scoreBuckets.map(b => activeTasks.filter(t => {
      const s = getScore(t.id)
      return s >= b.min && s <= b.max
    }).length),
    1
  )

  return (
    <div className="space-y-5">
      {/* Thursday meeting mode */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={18} className="text-[var(--color-purple)]" />
          <h3 className="text-[14px] font-bold">Thursday Meeting Mode</h3>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-[var(--color-surface-2)] rounded-[8px]">
          <div>
            <div className="text-[13px] font-medium">Freeze criticality scores</div>
            <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
              Scores will not change during the meeting discussion
            </div>
          </div>
          <button
            className={`relative w-12 h-6 rounded-full transition-colors ${thursdayMode ? 'bg-[var(--color-purple)]' : 'bg-[var(--color-surface-3)]'}`}
            onClick={() => toggleThursdayMeeting(!thursdayMode)}
          >
            <div
              className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all"
              style={{ [thursdayMode ? 'left' : 'right']: '3px' }}
            />
          </button>
        </div>

        {thursdayMode && (
          <div className="mt-2 px-4 py-2 rounded-[8px] text-[12px] font-medium" style={{ background: 'rgba(124,58,237,0.06)', color: 'var(--color-purple)' }}>
            Meeting mode active - scores frozen
          </div>
        )}
      </div>

      {/* Team capacity */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <div className="flex items-center gap-3 mb-4">
          <Users size={18} className="text-[var(--color-blue)]" />
          <h3 className="text-[14px] font-bold">Capacity Management</h3>
        </div>

        <div className="space-y-2">
          {TEAM.map(m => {
            const memberTasks = tasks.filter(t => t.assignee === m.id && t.status !== 'done').length
            const atCap = isAtCapacity(m.id)

            return (
              <div key={m.id} className="flex items-center justify-between py-3 px-4 bg-[var(--color-surface-2)] rounded-[8px]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold" style={{ background: m.color }}>
                    {m.name[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">{m.name}</div>
                    <div className="text-[11px] text-[var(--color-text-tertiary)]">{m.role} &middot; {memberTasks} active tasks</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {atCap && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(217,119,6,0.08)] text-[var(--color-yellow)]">
                      At capacity
                    </span>
                  )}
                  <button
                    className={`relative w-12 h-6 rounded-full transition-colors ${atCap ? 'bg-[var(--color-yellow)]' : 'bg-[var(--color-surface-3)]'}`}
                    onClick={() => toggleCapacity(m.id)}
                  >
                    <div
                      className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all"
                      style={{ [atCap ? 'left' : 'right']: '3px' }}
                    />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* User management */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={18} className="text-[var(--color-accent)]" />
          <h3 className="text-[14px] font-bold">Users & Permissions</h3>
        </div>

        <div className="space-y-2">
          {TEAM.map(m => {
            const email = Object.keys(EMAIL_TO_TEAM).find(e => EMAIL_TO_TEAM[e] === m.id)
            const isAdm = email ? ADMIN_EMAILS.includes(email as typeof ADMIN_EMAILS[number]) : false
            const taskCount = tasks.filter(t => t.assignee === m.id).length

            return (
              <div key={m.id} className="flex items-center justify-between py-3 px-4 bg-[var(--color-surface-2)] rounded-[8px]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold" style={{ background: m.color }}>
                    {m.name[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">
                      {m.name}
                      <span className="text-[11px] text-[var(--color-text-tertiary)] mr-2">({m.role})</span>
                    </div>
                    <div className="text-[11px] text-[var(--color-text-tertiary)]">{email} &middot; {taskCount} tasks</div>
                  </div>
                </div>
                {isAdm ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(5,150,105,0.08)] text-[var(--color-accent)]">
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">User</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Score distribution */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <div className="flex items-center gap-3 mb-4">
          <ChartBar size={18} className="text-[var(--color-red)]" />
          <h3 className="text-[14px] font-bold">Criticality Score Distribution</h3>
        </div>

        <div className="flex items-end gap-3 h-32">
          {scoreBuckets.map(b => {
            const count = activeTasks.filter(t => {
              const s = getScore(t.id)
              return s >= b.min && s <= b.max
            }).length
            const pct = (count / maxBucket) * 100
            const color = b.min >= 61 ? 'var(--color-red)' : b.min >= 41 ? 'var(--color-yellow)' : 'var(--color-text-tertiary)'

            return (
              <div key={b.label} className="flex-1 flex flex-col items-center">
                <span className="text-[10px] font-mono mb-1" style={{ color }}>{count}</span>
                <div className="w-full rounded-t-[4px]" style={{ height: `${Math.max(pct, 4)}%`, background: color, opacity: 0.7 }} />
                <span className="text-[9px] text-[var(--color-text-tertiary)] mt-1">{b.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* GCal section */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={18} className="text-[var(--color-blue)]" />
          <h3 className="text-[14px] font-bold">Google Calendar Sync</h3>
        </div>
        <p className="text-[12px] text-[var(--color-text-tertiary)]">
          Google Calendar sync runs automatically when connected. Manage connections from the interface.
        </p>
        {TEAM.map(m => {
          const count = tasks.filter(t => t.assignee === m.id && t.startDate && t.endDate && t.status !== 'done').length
          return (
            <div key={m.id} className="flex items-center justify-between py-2 mt-2 text-[12px]">
              <span>{m.name} ({count} open tasks)</span>
              <span className="text-[11px] text-[var(--color-text-tertiary)]">Manual sync available from calendar</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

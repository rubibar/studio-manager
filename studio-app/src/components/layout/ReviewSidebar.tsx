import { X } from '@phosphor-icons/react'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import { useScoring } from '@/hooks/useScoring'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { TEAM } from '@/lib/constants'

export function ReviewSidebar() {
  const open = useUIStore(s => s.reviewSidebarOpen)
  const toggleReviewSidebar = useUIStore(s => s.toggleReviewSidebar)
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const tasks = useTaskStore(s => s.tasks)
  const updateStatus = useTaskStore(s => s.updateStatus)
  const { getScore } = useScoring()

  const reviewTasks = tasks
    .filter(t => t.status === 'review')
    .sort((a, b) => getScore(b.id) - getScore(a.id))

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={toggleReviewSidebar}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 glass-panel border-r border-[var(--glass-border)]
          z-50 transition-transform duration-300 overflow-y-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
          <h2 className="font-bold text-sm">
            Review Queue ({reviewTasks.length})
          </h2>
          <button
            onClick={toggleReviewSidebar}
            className="p-1 rounded hover:bg-[var(--color-surface-3)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3 flex flex-col gap-2">
          {reviewTasks.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-tertiary)] text-sm">
              No tasks in review
            </div>
          ) : (
            reviewTasks.map(t => {
              const member = TEAM.find(m => m.id === t.assignee)
              const reviewer = TEAM.find(m => m.id === t.reviewer)
              const score = getScore(t.id)

              return (
                <div
                  key={t.id}
                  className="p-3 rounded-[var(--radius-default)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
                  onClick={() => {
                    openSlideOver(t.id)
                    toggleReviewSidebar()
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-[13px] leading-tight">
                      {t.name}
                    </span>
                    <ScoreBadge score={score} />
                  </div>
                  <div className="flex gap-3 text-[11px] text-[var(--color-text-secondary)]">
                    <span>{member?.name || '—'}</span>
                    <span>{reviewer?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStatus(t.id, 'done')
                      }}
                      className="text-[11px] bg-[var(--color-accent)] text-white px-2.5 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStatus(t.id, 'in-progress')
                      }}
                      className="text-[11px] border border-[var(--color-border)] px-2.5 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-3)] transition-colors"
                    >
                      Return
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

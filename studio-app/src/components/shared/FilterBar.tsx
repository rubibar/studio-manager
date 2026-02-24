import { Funnel, X } from '@phosphor-icons/react'
import { useUIStore } from '@/stores/uiStore'
import { TEAM, CATEGORIES } from '@/lib/constants'
import { useProjectStore } from '@/stores/projectStore'

export function FilterBar() {
  const filters = useUIStore(s => s.filters)
  const setFilters = useUIStore(s => s.setFilters)
  const resetFilters = useUIStore(s => s.resetFilters)
  const projects = useProjectStore(s => s.projects)

  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => key !== 'search' && val !== 'all'
  )

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Funnel size={16} className="text-[var(--color-text-tertiary)]" />

      {/* Status */}
      <select
        value={filters.status}
        onChange={e => setFilters({ status: e.target.value })}
        className="text-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1 outline-none"
      >
        <option value="all">כל הסטטוסים</option>
        <option value="todo">לביצוע</option>
        <option value="in-progress">בתהליך</option>
        <option value="review">ביקורת</option>
        <option value="done">הושלם</option>
      </select>

      {/* Assignee */}
      <select
        value={filters.assignee}
        onChange={e => setFilters({ assignee: e.target.value })}
        className="text-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1 outline-none"
      >
        <option value="all">כל הצוות</option>
        {TEAM.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      {/* Category */}
      <select
        value={filters.category}
        onChange={e => setFilters({ category: e.target.value })}
        className="text-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1 outline-none"
      >
        <option value="all">כל הקטגוריות</option>
        {CATEGORIES.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Type */}
      <select
        value={filters.type}
        onChange={e => setFilters({ type: e.target.value })}
        className="text-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1 outline-none"
      >
        <option value="all">כל הסוגים</option>
        <option value="client">לקוח</option>
        <option value="internal">פנימי/R&D</option>
        <option value="admin">אדמין</option>
      </select>

      {/* Project */}
      <select
        value={filters.project}
        onChange={e => setFilters({ project: e.target.value })}
        className="text-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1 outline-none"
      >
        <option value="all">כל הפרויקטים</option>
        {projects.map(p => (
          <option key={p.id} value={String(p.id)}>{p.emoji} {p.name}</option>
        ))}
      </select>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-[11px] text-[var(--color-red)] hover:underline"
        >
          <X size={12} />
          נקה פילטרים
        </button>
      )}
    </div>
  )
}

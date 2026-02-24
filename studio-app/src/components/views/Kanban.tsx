import { useVisibleTasks } from '@/hooks/useFilters'
import { useScoring } from '@/hooks/useScoring'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { TEAM } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { Task, TaskStatus } from '@/types/task'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'לביצוע', color: 'var(--color-text-tertiary)' },
  { id: 'in-progress', label: 'בתהליך', color: 'var(--color-blue)' },
  { id: 'review', label: 'ביקורת', color: 'var(--color-purple)' },
  { id: 'done', label: 'הושלם', color: 'var(--color-accent)' },
]

function KanbanCard({ task, score, onClick }: { task: Task; score: number; onClick: () => void }) {
  const member = TEAM.find(m => m.id === task.assignee)
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: String(task.id), data: { task } })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-default)] p-3 cursor-grab active:cursor-grabbing hover:border-[var(--color-accent)] transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[13px] font-medium leading-tight flex-1 ml-2">
          {task.name}
        </span>
        <ScoreBadge score={score} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <TypeBadge type={task.type} />
        {member && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: member.color }} />
            <span className="text-[10px] text-[var(--color-text-tertiary)]">{member.name}</span>
          </div>
        )}
        {task.endDate && (
          <span className="text-[10px] text-[var(--color-text-tertiary)]">
            {formatDate(task.endDate)}
          </span>
        )}
        {task.emergency && (
          <span className="text-[9px] bg-[var(--color-red)] text-white px-1 rounded">SOS</span>
        )}
      </div>
    </div>
  )
}

export function Kanban() {
  const tasks = useVisibleTasks()
  const { getScore } = useScoring()
  const updateStatus = useTaskStore(s => s.updateStatus)
  const openModal = useUIStore(s => s.openModal)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const taskId = Number(active.id)

    // Determine target column
    let targetStatus: TaskStatus | null = null
    // Check if dropped on a column
    if (COLUMNS.some(c => c.id === over.id)) {
      targetStatus = over.id as TaskStatus
    } else {
      // Dropped on another card — find which column it's in
      const overTask = tasks.find(t => String(t.id) === String(over.id))
      if (overTask) targetStatus = overTask.status
    }

    if (targetStatus) {
      updateStatus(taskId, targetStatus)
    }
  }

  const activeTask = activeId ? tasks.find(t => String(t.id) === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 160px)' }}>
        {COLUMNS.map(col => {
          const colTasks = tasks
            .filter(t => t.status === col.id)
            .sort((a, b) => getScore(b.id) - getScore(a.id))

          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-72 bg-[var(--color-surface-2)] rounded-[var(--radius-lg)] p-3"
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-[13px] font-bold">{col.label}</span>
                <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <SortableContext
                items={colTasks.map(t => String(t.id))}
                strategy={verticalListSortingStrategy}
                id={col.id}
              >
                <div className="flex flex-col gap-2 min-h-[100px]">
                  {colTasks.map(t => (
                    <KanbanCard
                      key={t.id}
                      task={t}
                      score={getScore(t.id)}
                      onClick={() => openModal({ type: 'editTask', taskId: t.id })}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent)] rounded-[var(--radius-default)] p-3 shadow-lg opacity-90 w-72">
            <span className="text-[13px] font-medium">{activeTask.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

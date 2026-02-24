import { motion } from 'framer-motion'

interface SkeletonProps {
  variant?: 'dashboard' | 'table' | 'kanban' | 'default'
}

export function SkeletonLoader({ variant = 'default' }: SkeletonProps) {
  if (variant === 'dashboard') return <DashboardSkeleton />
  if (variant === 'table') return <TableSkeleton />
  if (variant === 'kanban') return <KanbanSkeleton />
  return <DefaultSkeleton />
}

function DefaultSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-2">
      <div className="skeleton h-10 w-48" />
      <div className="skeleton h-64 w-full rounded-[var(--radius-bento)]" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-24 rounded-[var(--radius-bento-sm)]" />
        ))}
      </div>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 skeleton h-44 rounded-[var(--radius-bento)]" />
        <div className="skeleton h-44 rounded-[var(--radius-bento)]" />
      </div>
      <div className="flex gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton h-16 w-32 rounded-[var(--radius-bento-sm)]" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 skeleton h-56 rounded-[var(--radius-bento)]" />
        <div className="skeleton h-56 rounded-[var(--radius-bento)]" />
      </div>
    </motion.div>
  )
}

function TableSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 p-2">
      <div className="skeleton h-10 w-full rounded-[var(--radius-bento-sm)]" />
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="skeleton h-12 w-full rounded-[var(--radius-sm)]" />
      ))}
    </motion.div>
  )
}

function KanbanSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 p-2">
      {[1, 2, 3, 4].map(col => (
        <div key={col} className="flex-1 space-y-3">
          <div className="skeleton h-8 w-24 rounded-[var(--radius-bento-sm)]" />
          {[1, 2, 3].map(card => (
            <div key={card} className="skeleton h-28 w-full rounded-[var(--radius-bento-sm)]" />
          ))}
        </div>
      ))}
    </motion.div>
  )
}

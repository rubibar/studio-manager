interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center mb-4">
        <div className="w-6 h-6 rounded-full bg-[var(--color-border)]" />
      </div>
      <h3 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-[var(--color-text-tertiary)] max-w-xs mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}

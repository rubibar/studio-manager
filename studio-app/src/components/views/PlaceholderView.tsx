import { EmptyState } from '@/components/shared/EmptyState'

interface PlaceholderViewProps {
  name: string
}

export function PlaceholderView({ name }: PlaceholderViewProps) {
  return (
    <EmptyState
      title={name}
      description="This view will be available soon"
    />
  )
}

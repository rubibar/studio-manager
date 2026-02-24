import { getScoreColor, getScoreBg } from '@/lib/scoring'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md'
}

export function ScoreBadge({ score, size = 'sm' }: ScoreBadgeProps) {
  const color = getScoreColor(score)
  const bg = getScoreBg(score)

  return (
    <span
      className={`
        inline-flex items-center justify-center font-mono font-bold rounded-full
        ${size === 'sm' ? 'text-[10px] px-1.5 py-0.5 min-w-[28px]' : 'text-[12px] px-2 py-1 min-w-[32px]'}
      `}
      style={{ color, background: bg }}
    >
      {score}
    </span>
  )
}

import { useNumberScramble } from '@/hooks/useNumberScramble'

interface AnimatedNumberProps {
  value: number
  className?: string
  style?: React.CSSProperties
  delay?: number
}

export function AnimatedNumber({ value, className = '', style, delay = 0 }: AnimatedNumberProps) {
  const display = useNumberScramble(value, { delay })
  return <span className={`num-scramble ${className}`} style={style}>{display}</span>
}

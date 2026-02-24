import { useNumberScramble } from '@/hooks/useNumberScramble'

interface AnimatedNumberProps {
  value: number
  className?: string
  delay?: number
}

export function AnimatedNumber({ value, className = '', delay = 0 }: AnimatedNumberProps) {
  const display = useNumberScramble(value, { delay })
  return <span className={`num-scramble ${className}`}>{display}</span>
}

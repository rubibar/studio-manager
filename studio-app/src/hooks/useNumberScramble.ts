import { useState, useEffect, useRef } from 'react'

export function useNumberScramble(target: number, options?: {
  duration?: number
  delay?: number
}) {
  const { duration = 600, delay = 0 } = options || {}
  const [display, setDisplay] = useState(target)
  const prevTarget = useRef(target)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const from = prevTarget.current
    const to = target
    prevTarget.current = target

    if (from === to) return

    let startTime: number | null = null
    const timeout = setTimeout(() => {
      const animate = (now: number) => {
        if (!startTime) startTime = now
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - (1 - progress) * (1 - progress)

        if (progress < 1) {
          const scrambleEnd = duration * 0.6
          if (elapsed < scrambleEnd) {
            const range = Math.abs(to - from) || 10
            setDisplay(Math.round(from + (Math.random() * range * Math.sign(to - from))))
          } else {
            setDisplay(Math.round(from + (to - from) * eased))
          }
          rafRef.current = requestAnimationFrame(animate)
        } else {
          setDisplay(to)
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay])

  return display
}

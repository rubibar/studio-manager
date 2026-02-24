import { useCallback, useRef, useEffect } from 'react'
import { useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'

interface UseTiltOptions {
  maxTilt?: number
  perspective?: number
  disabled?: boolean
}

/**
 * Performance-oriented 3D tilt using rAF + direct DOM style.
 * Best for many cards on screen (Kanban, lists).
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(
  options: UseTiltOptions = {}
) {
  const { maxTilt = 6, perspective = 1200, disabled = false } = options
  const ref = useRef<T>(null)
  const rafId = useRef<number>(0)

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    const el = ref.current
    if (!el) return

    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const normalizedX = (x - centerX) / centerX
      const normalizedY = (y - centerY) / centerY

      const tiltY = normalizedX * maxTilt
      const tiltX = -normalizedY * maxTilt

      el.style.transform =
        `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(0)`
    })
  }, [disabled, maxTilt, perspective])

  const onMouseLeave = useCallback(() => {
    if (disabled) return
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(rafId.current)
    el.style.transform =
      `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0)`
  }, [disabled, perspective])

  useEffect(() => {
    return () => cancelAnimationFrame(rafId.current)
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}

/**
 * Spring-physics 3D tilt using Framer Motion.
 * Best for hero/spotlight cards where smooth spring matters.
 */
export function useTiltSpring<T extends HTMLElement = HTMLDivElement>(
  options: UseTiltOptions = {}
) {
  const { maxTilt = 8, perspective = 1000, disabled = false } = options
  const ref = useRef<T>(null)

  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springX = useSpring(tiltX, { stiffness: 200, damping: 20 })
  const springY = useSpring(tiltY, { stiffness: 200, damping: 20 })

  const transform = useMotionTemplate`perspective(${perspective}px) rotateX(${springX}deg) rotateY(${springY}deg) translateZ(0)`

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const normalizedX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const normalizedY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    tiltY.set(normalizedX * maxTilt)
    tiltX.set(-normalizedY * maxTilt)
  }, [disabled, maxTilt, tiltX, tiltY])

  const onMouseLeave = useCallback(() => {
    tiltX.set(0)
    tiltY.set(0)
  }, [tiltX, tiltY])

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style: { transform },
  }
}

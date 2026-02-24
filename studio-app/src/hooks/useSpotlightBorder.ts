import { useCallback, useRef } from 'react'

export function useSpotlightBorder<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`)
  }, [])

  return { ref, onMouseMove }
}

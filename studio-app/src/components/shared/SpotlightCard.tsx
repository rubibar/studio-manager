import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useSpotlightBorder } from '@/hooks/useSpotlightBorder'
import { useTilt } from '@/hooks/useTilt'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  tilt?: boolean
  maxTilt?: number
}

export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ children, className = '', onClick, tilt = true, maxTilt = 4 }, forwardedRef) => {
    const { ref: spotlightRef, onMouseMove: onSpotlightMove } = useSpotlightBorder()
    const { ref: tiltRef, onMouseMove: onTiltMove, onMouseLeave: onTiltLeave } = useTilt({
      maxTilt,
      disabled: !tilt,
    })

    const handleMouseMove = (e: React.MouseEvent) => {
      onSpotlightMove(e)
      onTiltMove(e)
    }

    return (
      <motion.div
        ref={(node) => {
          ;(spotlightRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          ;(tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={onTiltLeave}
        onClick={onClick}
        className={`spotlight-border rounded-[var(--radius-bento-sm)] ${className}`}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    )
  }
)

SpotlightCard.displayName = 'SpotlightCard'

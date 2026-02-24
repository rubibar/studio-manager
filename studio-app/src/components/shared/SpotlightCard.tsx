import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useSpotlightBorder } from '@/hooks/useSpotlightBorder'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ children, className = '', onClick }, forwardedRef) => {
    const { ref: spotlightRef, onMouseMove } = useSpotlightBorder()

    return (
      <motion.div
        ref={(node) => {
          (spotlightRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        onMouseMove={onMouseMove}
        onClick={onClick}
        className={`spotlight-border rounded-[var(--radius-bento-sm)] ${className}`}
        whileHover={{ y: -2 }}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    )
  }
)

SpotlightCard.displayName = 'SpotlightCard'

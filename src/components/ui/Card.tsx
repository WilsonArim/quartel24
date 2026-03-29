import { cn } from '@/lib/utils'
import { HTMLAttributes, ReactNode } from 'react'

type CardVariant = 'default' | 'glass' | 'gradient' | 'accent'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
  variant?: CardVariant
  glow?: boolean
  animate?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-quartel-800 border border-quartel-700 hover:border-quartel-600 hover:shadow-lg hover:shadow-black/30 transition-all duration-200',
  glass: 'glass border border-white/5',
  gradient: 'bg-gradient-to-br from-quartel-800 to-quartel-900 border border-quartel-700/50',
  accent: 'bg-gradient-to-br from-accent/10 to-quartel-800 border border-accent/20',
}

function Card({ className, header, variant = 'default', glow, animate, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        variantStyles[variant],
        glow && 'glow-accent',
        animate && 'animate-fade-in-up',
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-quartel-700/50">
          {header}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

export { Card }

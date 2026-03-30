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
  default: 'dark:bg-quartel-800 bg-white dark:border-quartel-700 border-gray-200 hover:dark:border-quartel-600 hover:border-gray-300 shadow-[var(--shadow-card)] transition-all duration-200',
  glass: 'glass border border-white/5',
  gradient: 'dark:bg-gradient-to-br dark:from-quartel-800 dark:to-quartel-900 bg-white dark:border-quartel-700 border-gray-200/80 shadow-[var(--shadow-card)]',
  accent: 'bg-gradient-to-br from-accent/10 to-quartel-800 border border-accent/20',
}

function Card({ className, header, variant = 'default', glow, animate, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border',
        variantStyles[variant],
        glow && 'glow-accent',
        animate && 'animate-fade-in-up',
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b dark:border-quartel-700/50 border-gray-200/80">
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

import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

type BadgeColor = 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple' | 'gray'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor
  size?: BadgeSize
}

const colors: Record<BadgeColor, string> = {
  green: 'dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25 bg-green-100 text-green-700 border-green-200',
  yellow: 'dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/25 bg-yellow-100 text-yellow-700 border-yellow-200',
  orange: 'dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30 bg-orange-100 text-orange-700 border-orange-200',
  red: 'dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/25 bg-red-100 text-red-700 border-red-200',
  blue: 'dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25 bg-blue-100 text-blue-700 border-blue-200',
  purple: 'dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/25 bg-purple-100 text-purple-700 border-purple-200',
  gray: 'dark:bg-quartel-700/50 dark:text-quartel-300 dark:border-quartel-600/30 bg-gray-100 text-gray-600 border-gray-200',
}

const sizes: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

function Badge({ className, color = 'gray', size = 'md', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        colors[color],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }

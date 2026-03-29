'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md',
  secondary: 'bg-quartel-700/80 hover:bg-quartel-600 text-quartel-100 border border-quartel-600 hover:border-quartel-500 hover:-translate-y-0.5',
  outline: 'bg-transparent border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent hover:-translate-y-0.5',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20',
  ghost: 'bg-transparent hover:bg-quartel-800 text-quartel-200 hover:text-white',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-quartel-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
          'cursor-pointer transition-all duration-150',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

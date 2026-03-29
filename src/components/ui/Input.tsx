import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-quartel-200">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-quartel-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border bg-quartel-900/80 text-white placeholder:text-quartel-500',
              'hover:border-quartel-600',
              'focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-150',
              'py-2 px-3 text-sm',
              icon && 'pl-9',
              error
                ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500'
                : 'border-quartel-700',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }

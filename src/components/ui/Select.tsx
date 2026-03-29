import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium dark:text-quartel-200 text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-xl border dark:bg-quartel-900/80 bg-white dark:text-white text-gray-900',
            'dark:hover:border-quartel-600 hover:border-gray-400',
            'focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-150',
            'py-2 px-3 text-sm cursor-pointer',
            error
              ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500'
              : 'dark:border-quartel-700 border-gray-300',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }

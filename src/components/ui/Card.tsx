import { cn } from '@/lib/utils'
import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
}

function Card({ className, header, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-quartel-800 border border-quartel-700 rounded-xl',
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-quartel-700">
          {header}
        </div>
      )}
      <div className={header ? 'p-5' : 'p-5'}>
        {children}
      </div>
    </div>
  )
}

export { Card }

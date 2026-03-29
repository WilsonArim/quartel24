'use client'

import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import { CheckCircle, XCircle, Info } from 'lucide-react'

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const toastStyles = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
}

const iconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border',
              'glass shadow-2xl shadow-black/50',
              'pointer-events-auto cursor-pointer',
              'animate-slide-in-right',
              toastStyles[toast.type]
            )}
            onClick={() => removeToast(toast.id)}
          >
            <Icon className={cn('h-4 w-4 shrink-0', iconColors[toast.type])} />
            <span className="text-sm font-medium text-white">{toast.message}</span>
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  // Fechar com Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquear scroll do body
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 dark:bg-black/80 bg-black/40 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl',
          'dark:bg-gradient-to-b dark:from-quartel-800 dark:to-quartel-900 bg-white',
          'dark:border-quartel-700/60 border-gray-200',
          'shadow-[var(--shadow-modal)]',
          'max-h-[90vh] flex flex-col',
          'animate-scale-in',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-quartel-700/50 border-gray-200 shrink-0">
            <h2 className="text-base font-bold dark:text-white text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="dark:text-quartel-500 dark:hover:text-white dark:hover:bg-quartel-700 text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t dark:border-quartel-700/50 border-gray-200 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export { Modal }

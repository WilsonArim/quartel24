'use client'

import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return true
    return document.documentElement.classList.contains('dark')
  })

  function toggle() {
    const html = document.documentElement
    const nowDark = html.classList.contains('dark')
    const newTheme = nowDark ? 'light' : 'dark'

    // Aplicar no DOM imediatamente — as CSS variables e os dark: variants mudam ao instante
    if (nowDark) {
      html.classList.remove('dark')
    } else {
      html.classList.add('dark')
    }

    // Persistir em cookie (para o servidor ler na próxima visita) e localStorage
    document.cookie = `quartel-theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`
    localStorage.setItem('quartel-theme', newTheme)
    setIsDark(!nowDark)
    // Sem router.refresh() — o DOM muda imediatamente via classe .dark no <html>
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo escuro'}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer',
        'dark:text-quartel-400 dark:hover:text-white text-gray-500 hover:text-gray-900',
        'dark:hover:bg-quartel-700/60 hover:bg-black/10',
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}

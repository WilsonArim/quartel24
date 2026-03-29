'use client'

import { formatDateLong } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/membros': 'Membros',
  '/membros/novo': 'Novo Membro',
  '/pagamentos': 'Pagamentos',
  '/planos': 'Planos de Subscrição',
}

function getPageTitle(pathname: string): string {
  if (/^\/membros\/[^/]+$/.test(pathname) && pathname !== '/membros/novo') {
    return 'Perfil do Membro'
  }
  return pageTitles[pathname] ?? 'Quartel.24'
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const today = formatDateLong(new Date().toISOString().split('T')[0])

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b dark:border-quartel-800/60 border-gray-200/80 dark:bg-quartel-950/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      {/* Esquerda: menu mobile + título */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={onMenuClick}
            className="dark:text-quartel-400 dark:hover:text-white text-gray-500 hover:text-gray-900 p-1.5 rounded-lg dark:hover:bg-quartel-800 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div>
          <h1 className="text-sm font-semibold dark:text-white text-gray-900 leading-none">{title}</h1>
          <p className="hidden lg:block text-[11px] dark:text-quartel-500 text-gray-400 mt-0.5">Quartel.24</p>
        </div>
      </div>

      {/* Direita: data + indicador ao vivo + toggle */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs dark:text-quartel-500 text-gray-400">Ao vivo</span>
        </div>
        <span className="text-sm dark:text-quartel-400 text-gray-500 capitalize">{today}</span>
        <div className="w-px h-4 dark:bg-quartel-800 bg-gray-200" />
        <ThemeToggle />
      </div>
    </header>
  )
}

'use client'

import { formatDateLong } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

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
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-quartel-800/60 bg-quartel-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Esquerda: breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-quartel-400 hover:text-white p-1.5 rounded-lg hover:bg-quartel-800 cursor-pointer transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-white leading-none">{title}</h1>
          <p className="hidden lg:block text-[11px] text-quartel-500 mt-0.5">Quartel.24</p>
        </div>
      </div>

      {/* Direita: data + indicador ao vivo */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-quartel-500">Ao vivo</span>
        </div>
        <span className="text-sm text-quartel-400 capitalize">{today}</span>
      </div>
    </header>
  )
}

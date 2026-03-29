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
  // Perfil de membro: /membros/[id]
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
    <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-quartel-800 bg-quartel-950">
      {/* Mobile: hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-quartel-400 hover:text-white p-1 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-white">{title}</h1>
      </div>

      {/* Desktop: data atual */}
      <span className="hidden lg:block text-sm text-quartel-500 capitalize">{today}</span>
    </header>
  )
}

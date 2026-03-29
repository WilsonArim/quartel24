'use client'

import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { MobileDrawer } from './MobileDrawer'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const PUBLIC_ROUTES = ['/login']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = PUBLIC_ROUTES.includes(pathname)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Fechar drawer ao navegar (adjusting state during render — padrão React 19)
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setDrawerOpen(false)
  }

  if (isPublic) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-quartel-950">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Nav mobile bottom */}
      <MobileNav />

      {/* Drawer mobile/tablet */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}

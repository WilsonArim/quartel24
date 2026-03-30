'use client'

import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, CreditCard, ClipboardList, LogOut, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/membros', label: 'Membros', icon: Users },
  { href: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { href: '/planos', label: 'Planos', icon: ClipboardList },
]

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-40 bg-black/60 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 z-50 h-full w-72 dark:bg-quartel-900 bg-white border-r dark:border-quartel-800 border-gray-200 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header do drawer */}
        <div className="flex items-center justify-between px-4 py-4 border-b dark:border-quartel-800 border-gray-200">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <Image src="/quartel24.jpg" alt="Quartel.24" width={36} height={36} className="rounded-lg object-cover" />
            <span className="text-base font-black tracking-widest dark:text-white text-gray-900 uppercase">
              Quartel<span className="text-accent">.24</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="dark:text-quartel-400 text-gray-500 dark:hover:text-white hover:text-gray-900 p-1 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'dark:bg-quartel-700 bg-gray-100 dark:text-white text-gray-900 border-l-2 border-accent pl-[10px]'
                    : 'dark:text-quartel-400 text-gray-500 dark:hover:bg-quartel-800 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sair */}
        <div className="px-3 py-4 border-t dark:border-quartel-800 border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium dark:text-quartel-400 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}

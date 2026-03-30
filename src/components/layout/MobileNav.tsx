'use client'

import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, CreditCard, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/membros', label: 'Membros', icon: Users },
  { href: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { href: '/planos', label: 'Planos', icon: ClipboardList },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 dark:bg-quartel-900 bg-white border-t dark:border-quartel-800 border-gray-200">
      <div className="flex items-center justify-around py-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium',
                isActive ? 'text-accent' : 'dark:text-quartel-500 text-gray-400 dark:hover:text-quartel-300 hover:text-gray-600'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

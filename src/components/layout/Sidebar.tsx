'use client'

import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, CreditCard, ClipboardList, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/membros', label: 'Membros', icon: Users },
  { href: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { href: '/planos', label: 'Planos', icon: ClipboardList },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-quartel-900 border-r border-quartel-800">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-quartel-800">
        <Link href="/" className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/quartel24.jpg" alt="Quartel.24" width={96} height={96} className="rounded-xl object-cover" />
          <div className="text-center">
            <span className="text-lg font-black tracking-widest text-white uppercase leading-none">
              Quartel<span className="text-accent">.24</span>
            </span>
            <p className="text-xs text-quartel-500 tracking-wide uppercase">Sistema de Gestão</p>
          </div>
        </Link>
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
                  ? 'bg-quartel-700 text-white border-l-2 border-accent pl-[10px]'
                  : 'text-quartel-400 hover:bg-quartel-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sair */}
      <div className="px-3 py-4 border-t border-quartel-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-quartel-400 hover:bg-quartel-800 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}

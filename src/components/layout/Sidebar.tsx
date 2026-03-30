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
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 dark:bg-quartel-900 bg-white border-r dark:border-quartel-800/50 border-gray-200">
      {/* Logo */}
      <div className="px-4 py-6 border-b dark:border-quartel-800/50 border-gray-200">
        <Link href="/" className="flex flex-col items-center gap-3 group">
          <div className="relative">
            <Image
              src="/quartel24.jpg"
              alt="Quartel.24"
              width={80}
              height={80}
              className="rounded-2xl object-cover ring-2 dark:ring-quartel-700 ring-gray-200 group-hover:ring-accent/50 transition-all duration-300"
            />
            {/* Glow no hover */}
            <div className="absolute inset-0 rounded-2xl bg-accent/0 group-hover:bg-accent/5 transition-all duration-300" />
          </div>
          <div className="text-center">
            <p className="text-xl font-black tracking-[0.2em] dark:text-white text-gray-900 uppercase leading-none">
              QUARTEL<span className="text-gradient-accent">.24</span>
            </p>
            <p className="text-[10px] dark:text-quartel-500 text-gray-400 tracking-[0.25em] uppercase mt-1">
              Sistema de Gestão
            </p>
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
                'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'dark:bg-quartel-700 bg-gray-100 dark:text-white text-gray-900 nav-active-indicator dark:shadow-lg dark:shadow-black/20 shadow-sm'
                  : 'dark:text-quartel-400 text-gray-500 dark:hover:bg-quartel-800/80 hover:bg-gray-100 dark:hover:text-quartel-100 hover:text-gray-900 hover:translate-x-0.5'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-none', isActive ? 'text-accent drop-shadow-[0_0_6px_rgba(230,57,70,0.6)]' : '')} />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Sair */}
      <div className="px-3 py-4 border-t dark:border-quartel-800/50 border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium dark:text-quartel-400 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Quartel.24 — Sistema de Gestão',
  description: 'Gestão de membros, subscrições e pagamentos do Quartel.24',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Ler tema do cookie no servidor — sem flash, sem script client-side
  const cookieStore = await cookies()
  const theme = cookieStore.get('quartel-theme')?.value
  const isDark = theme !== 'light'

  return (
    <html lang="pt" className={isDark ? 'dark' : ''} suppressHydrationWarning>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

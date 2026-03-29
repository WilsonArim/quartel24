import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Quartel.24 — Sistema de Gestão',
  description: 'Gestão de membros, subscrições e pagamentos do Quartel.24',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-quartel-950 text-white antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Quartel.24 — Sistema de Gestão',
  description: 'Gestão de membros, subscrições e pagamentos do Quartel.24',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark" suppressHydrationWarning>
      <head>
        {/* Script anti-flash: aplica o tema guardado antes do primeiro paint */}
        <Script
          id="theme-anti-flash"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('quartel-theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos. Tenta novamente.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen dark:bg-quartel-950 bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background: gradientes decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#06070c_100%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent/4 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[200px] bg-blue-500/4 rounded-full blur-[60px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in-up">
        {/* Logo com glow */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <Image
              src="/quartel24.jpg"
              alt="Quartel.24"
              width={80}
              height={80}
              className="rounded-2xl mx-auto ring-2 ring-quartel-700 shadow-2xl shadow-black/50"
            />
          </div>
          <h1 className="text-4xl font-black tracking-[0.2em] text-white uppercase mb-2">
            QUARTEL<span className="text-gradient-accent">.24</span>
          </h1>
          <p className="text-quartel-500 text-xs tracking-[0.3em] uppercase">
            Sistema de Gestão
          </p>
        </div>

        {/* Form card com glass */}
        <div className="glass rounded-2xl p-6 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="gestora@quartel24.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={loading}
            >
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-quartel-600 mt-8">
          Quartel.24 · Gestão Interna
        </p>
      </div>
    </div>
  )
}

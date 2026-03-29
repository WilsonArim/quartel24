'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getSubscriptionStatusLabel, getModalityLabel, getModalityColor, formatDate
} from '@/lib/utils'
import { Users, Search, Plus, Phone } from 'lucide-react'
import Link from 'next/link'
import type { MemberWithSubscription } from '@/lib/types'

const statusOptions = [
  { value: 'todos', label: 'Todos os estados' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
  { value: 'expirado', label: 'Subscrição expirada' },
]

export default function MembrosContent({ initialMembers }: { initialMembers: MemberWithSubscription[] }) {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filtro') ?? 'todos')

  // Filtro client-side sobre dados do servidor
  const filtered = initialMembers.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      m.first_name.toLowerCase().includes(q) ||
      m.last_name.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.nif?.includes(q)

    const sub = m.subscription
    const subStatus = sub ? getSubscriptionStatusLabel(sub.end_date) : null
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativo' && m.is_active) ||
      (statusFilter === 'inativo' && !m.is_active) ||
      (statusFilter === 'expirado' && sub?.status === 'expired') ||
      (statusFilter === 'a-expirar' && subStatus?.color === 'yellow') ||
      (statusFilter === 'subscricao-ativa' && sub?.status === 'active')

    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">{initialMembers.length} membros</h2>
        <Link href="/membros/novo">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Novo Membro
          </Button>
        </Link>
      </div>

      {/* Pesquisa + filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Pesquisar por nome, NIF, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="sm:w-52">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Nenhum membro encontrado"
          description={search ? 'Tenta uma pesquisa diferente.' : 'Adiciona o primeiro membro.'}
          action={
            !search ? (
              <Link href="/membros/novo">
                <Button size="sm"><Plus className="h-4 w-4" />Novo Membro</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden md:block bg-quartel-800 border border-quartel-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-quartel-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Plano</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Modalidades</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Expira em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-quartel-800">
                {filtered.map((member) => {
                  const sub = member.subscription
                  const status = sub ? getSubscriptionStatusLabel(sub.end_date) : null
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-quartel-700/30 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/membros/${member.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-quartel-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                          </div>
                          <span className="font-medium text-white">
                            {member.first_name} {member.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-quartel-300">{member.phone ?? '—'}</td>
                      <td className="px-4 py-3 text-quartel-300">{sub?.plan?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {sub?.plan?.modalities?.map((m) => (
                            <Badge
                              key={m}
                              color={m === 'ginasio' ? 'blue' : m === 'bjj' ? 'purple' : 'red'}
                              size="sm"
                            >
                              {getModalityLabel(m)}
                            </Badge>
                          )) ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {status ? (
                          <Badge color={status.color} size="sm">{status.label}</Badge>
                        ) : (
                          <Badge color="gray" size="sm">Sem subscrição</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-quartel-300">
                        {sub ? formatDate(sub.end_date) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((member) => {
              const sub = member.subscription
              const status = sub ? getSubscriptionStatusLabel(sub.end_date) : null
              return (
                <Link
                  key={member.id}
                  href={`/membros/${member.id}`}
                  className="flex items-center gap-3 p-4 bg-quartel-800 border border-quartel-700 rounded-xl hover:bg-quartel-700/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-quartel-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{member.first_name} {member.last_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {member.phone && (
                        <span className="text-xs text-quartel-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />{member.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {status ? (
                      <Badge color={status.color} size="sm">{status.label}</Badge>
                    ) : (
                      <Badge color="gray" size="sm">Sem plano</Badge>
                    )}
                    {sub?.plan?.modalities?.map((m) => (
                      <span
                        key={m}
                        className={`ml-1 inline-block h-2 w-2 rounded-full ${getModalityColor(m)}`}
                      />
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

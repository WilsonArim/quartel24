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
import { Users, Search, Plus, Phone, AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'
import type { MemberWithSubscription } from '@/lib/types'

const statusOptions = [
  { value: 'todos', label: 'Todos os estados' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
  { value: 'expirado', label: 'Subscrição expirada' },
]

export default function MembrosContent({ initialMembers, hasPlans }: { initialMembers: MemberWithSubscription[]; hasPlans: boolean }) {
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

      {/* Contagem e chip de filtro activo */}
      {(statusFilter !== 'todos' || search) && (
        <div className="flex items-center gap-2 text-sm text-quartel-400">
          <span>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => { setSearch(''); setStatusFilter('todos') }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-quartel-700 text-quartel-300 hover:bg-quartel-600 text-xs cursor-pointer"
          >
            Limpar filtros <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        search || statusFilter !== 'todos' ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="Nenhum membro encontrado"
            description="Tenta uma pesquisa diferente."
          />
        ) : initialMembers.length === 0 && !hasPlans ? (
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12 text-yellow-400" />}
            title="Começa pelos planos"
            description="Antes de registar membros, cria os planos de subscrição disponíveis."
            action={
              <Link href="/planos">
                <Button size="sm">Ir para Planos</Button>
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="Nenhum membro registado"
            description="Regista o primeiro membro do Quartel.24."
            action={
              <Link href="/membros/novo">
                <Button size="sm"><Plus className="h-4 w-4" />Registar membro</Button>
              </Link>
            }
          />
        )
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden md:block dark:bg-quartel-800 bg-white dark:border-quartel-700 border-gray-200 rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
            <table className="w-full text-sm">
              <thead className="border-b border-quartel-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold dark:text-quartel-400 text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold dark:text-quartel-400 text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold dark:text-quartel-400 text-gray-500 uppercase tracking-wider">Plano</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold dark:text-quartel-400 text-gray-500 uppercase tracking-wider">Modalidades</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold dark:text-quartel-400 text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold dark:text-quartel-400 text-gray-500 uppercase tracking-wider">Expira em</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-quartel-800 divide-gray-100">
                {filtered.map((member) => {
                  const sub = member.subscription
                  const status = sub ? getSubscriptionStatusLabel(sub.end_date) : null
                  return (
                    <tr
                      key={member.id}
                      className="group relative hover:bg-quartel-800/60 hover:shadow-md transition-all duration-150 cursor-pointer"
                      onClick={() => window.location.href = `/membros/${member.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-quartel-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                          </div>
                          <span className="font-medium dark:text-white text-gray-900">
                            {member.first_name} {member.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 dark:text-quartel-300 text-gray-500">
                        {member.phone ? (
                          <a href={`tel:${member.phone}`} className="text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
                            {member.phone}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 dark:text-quartel-300 text-gray-500">{sub?.plan?.name ?? '—'}</td>
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
                      <td className="px-4 py-3 dark:text-quartel-300 text-gray-500">
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
              const borderColor =
                status?.color === 'green' ? 'border-l-green-500/50' :
                status?.color === 'yellow' ? 'border-l-yellow-500/50' :
                status?.color === 'red' ? 'border-l-red-500/50' :
                'border-l-quartel-700'
              return (
                <Link
                  key={member.id}
                  href={`/membros/${member.id}`}
                  className={`flex items-center gap-3 border-l-2 rounded-xl bg-quartel-800/60 p-4 hover:bg-quartel-700/60 transition-all ${borderColor}`}
                >
                  <div className="w-10 h-10 rounded-full bg-quartel-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{member.first_name} {member.last_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {member.phone && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${member.phone}` }}
                          className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Phone className="h-3 w-3" />{member.phone}
                        </button>
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

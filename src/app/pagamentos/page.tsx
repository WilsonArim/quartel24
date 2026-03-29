import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate, getPaymentMethodLabel } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { CreditCard } from 'lucide-react'
import Link from 'next/link'

export default async function PagamentosPage() {
  const supabase = await createClient()

  // Pagamentos com join a membros e planos
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      member:members!member_id(id, first_name, last_name),
      subscription:subscriptions!subscription_id(
        plan:subscription_plans(name)
      )
    `)
    .order('payment_date', { ascending: false })
    .limit(200)

  // Total do mês atual
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthPayments = (payments ?? []).filter((p) => p.payment_date >= firstOfMonth)
  const monthTotal = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  const methodColors: Record<string, 'blue' | 'green' | 'purple' | 'yellow' | 'gray'> = {
    cash: 'green',
    multibanco: 'blue',
    transferencia: 'purple',
    mbway: 'yellow',
    outro: 'gray',
  }

  return (
    <div className="space-y-5">
      {/* Resumo do mês */}
      <div className="bg-quartel-800 border border-quartel-700 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-quartel-400">Receita do mês atual</p>
            <p className="text-3xl font-bold text-white mt-0.5">{formatCurrency(monthTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-quartel-400">{monthPayments.length} pagamentos</p>
          </div>
        </div>
      </div>

      {/* Tabela de pagamentos */}
      <div className="bg-quartel-800 border border-quartel-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-quartel-700">
          <h2 className="text-sm font-semibold text-white">Todos os Pagamentos</h2>
        </div>

        {!payments || payments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-12 w-12" />}
            title="Nenhum pagamento registado"
            description="Os pagamentos são registados no perfil de cada membro."
            action={
              <Link href="/membros">
                <Button size="sm">Ver membros</Button>
              </Link>
            }
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-quartel-700">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Data</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Membro</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Valor</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Método</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Plano</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-quartel-400 uppercase tracking-wider">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-quartel-800">
                  {payments.map((p) => {
                    const member = p.member as { id: string; first_name: string; last_name: string } | null
                    const planName = (p.subscription as { plan?: { name?: string } } | null)?.plan?.name
                    return (
                      <tr key={p.id} className="hover:bg-quartel-700/30 transition-colors">
                        <td className="px-5 py-3 text-quartel-300">{formatDate(p.payment_date)}</td>
                        <td className="px-5 py-3">
                          {member ? (
                            <Link href={`/membros/${member.id}`} className="text-white hover:text-accent font-medium transition-colors">
                              {member.first_name} {member.last_name}
                            </Link>
                          ) : '—'}
                        </td>
                        <td className="px-5 py-3 font-semibold text-white">{formatCurrency(Number(p.amount))}</td>
                        <td className="px-5 py-3">
                          <Badge color={methodColors[p.payment_method] ?? 'gray'} size="sm">
                            {getPaymentMethodLabel(p.payment_method)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-quartel-400">{planName ?? '—'}</td>
                        <td className="px-5 py-3 text-quartel-500">{p.notes ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-quartel-700">
              {payments.map((p) => {
                const member = p.member as { id: string; first_name: string; last_name: string } | null
                return (
                  <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member ? (
                          <Link href={`/membros/${member.id}`} className="hover:text-accent">
                            {member.first_name} {member.last_name}
                          </Link>
                        ) : '—'}
                      </p>
                      <p className="text-xs text-quartel-400 mt-0.5">{formatDate(p.payment_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{formatCurrency(Number(p.amount))}</p>
                      <Badge color={methodColors[p.payment_method] ?? 'gray'} size="sm">
                        {getPaymentMethodLabel(p.payment_method)}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

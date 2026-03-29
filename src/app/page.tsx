import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate, getModalityLabel, getModalityColor } from '@/lib/utils'
import {
  Users, CheckCircle, AlertTriangle, XCircle, TrendingUp, CreditCard, Bell
} from 'lucide-react'
import Link from 'next/link'
import type { DashboardStats, ExpiringSubscription } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Expirar subscrições vencidas + buscar stats em paralelo
  const [, statsResult, expiringResult] = await Promise.all([
    supabase.rpc('expire_subscriptions'),
    supabase.rpc('get_dashboard_stats'),
    supabase.rpc('get_expiring_subscriptions'),
  ])

  const stats: DashboardStats = statsResult.data ?? {
    total_members: 0,
    active_subscriptions: 0,
    expiring_soon: 0,
    expired: 0,
    revenue_this_month: 0,
    payments_today: 0,
  }

  const expiring: ExpiringSubscription[] = expiringResult.data ?? []

  const metricCards = [
    {
      label: 'Membros Ativos',
      value: stats.total_members,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      href: '/membros?filtro=ativo',
    },
    {
      label: 'Subscrições Ativas',
      value: stats.active_subscriptions,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      href: '/membros?filtro=subscricao-ativa',
    },
    {
      label: 'A Expirar (7 dias)',
      value: stats.expiring_soon,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      href: '/membros?filtro=a-expirar',
    },
    {
      label: 'Expiradas',
      value: stats.expired,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      href: '/membros?filtro=expirado',
    },
    {
      label: 'Receita do Mês',
      value: formatCurrency(stats.revenue_this_month),
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-accent/10',
      href: '/pagamentos',
    },
    {
      label: 'Pagamentos Hoje',
      value: stats.payments_today,
      icon: CreditCard,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      href: '/pagamentos',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cards de métricas — clicáveis */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="group">
            <Card className="hover:border-quartel-600 hover:bg-quartel-700/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-quartel-400 leading-tight">{label}</p>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Subscrições a expirar */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-yellow-400" />
            <h2 className="text-sm font-semibold text-white">
              Subscrições a Expirar nos Próximos 7 Dias
            </h2>
            {expiring.length > 0 && (
              <Badge color="yellow" size="sm">{expiring.length}</Badge>
            )}
          </div>
        }
      >
        {expiring.length === 0 ? (
          <EmptyState
            icon={<CheckCircle className="h-10 w-10" />}
            title="Nenhuma subscrição a expirar nos próximos 7 dias"
            className="py-8"
          />
        ) : (
          <div className="space-y-2">
            {expiring.map((item) => (
              <Link
                key={item.subscription_id}
                href={`/membros/${item.member_id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-quartel-900 hover:bg-quartel-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-quartel-700 flex items-center justify-center text-xs font-bold text-white">
                    {item.first_name.charAt(0)}{item.last_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {item.first_name} {item.last_name}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap mt-0.5">
                      <span className="text-xs text-quartel-400">{item.plan_name}</span>
                      {item.modalities?.map((m) => (
                        <span
                          key={m}
                          className={`inline-block h-1.5 w-1.5 rounded-full ${getModalityColor(m)}`}
                          title={getModalityLabel(m)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-quartel-400">Expira em</p>
                  <p className="text-sm font-medium text-white">{formatDate(item.end_date)}</p>
                  <Badge
                    color={item.days_remaining === 0 ? 'red' : 'yellow'}
                    size="sm"
                  >
                    {item.days_remaining === 0 ? 'hoje' : `${item.days_remaining}d`}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

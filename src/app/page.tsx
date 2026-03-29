import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate, getModalityLabel, getModalityColor } from '@/lib/utils'
import {
  Users, CheckCircle, AlertTriangle, XCircle, TrendingUp, CreditCard, Bell, ArrowUpRight, Cake
} from 'lucide-react'
import Link from 'next/link'
import type { DashboardStats, ExpiringSubscription, AgeTransitionAlert } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [, statsResult, expiringResult, ageAlertsResult] = await Promise.all([
    supabase.rpc('expire_subscriptions'),
    supabase.rpc('get_dashboard_stats'),
    supabase.rpc('get_expiring_subscriptions'),
    supabase.rpc('get_age_transition_alerts'),
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
  const ageAlerts: AgeTransitionAlert[] = ageAlertsResult.data ?? []

  const metricCards = [
    {
      label: 'Membros Ativos',
      value: stats.total_members,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      gradient: 'from-blue-500/20 to-transparent',
      ring: 'hover:ring-1 hover:ring-blue-500/20',
      topBorder: 'border-t-2 border-t-blue-500/70',
      href: '/membros?filtro=ativo',
    },
    {
      label: 'Subscrições Ativas',
      value: stats.active_subscriptions,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      gradient: 'from-green-500/20 to-transparent',
      ring: 'hover:ring-1 hover:ring-green-500/20',
      topBorder: 'border-t-2 border-t-green-500/70',
      href: '/membros?filtro=subscricao-ativa',
    },
    {
      label: 'A Expirar (7 dias)',
      value: stats.expiring_soon,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      gradient: 'from-yellow-500/20 to-transparent',
      ring: 'hover:ring-1 hover:ring-yellow-500/20',
      topBorder: 'border-t-2 border-t-yellow-500/70',
      href: '/membros?filtro=a-expirar',
    },
    {
      label: 'Expiradas',
      value: stats.expired,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      gradient: 'from-red-500/20 to-transparent',
      ring: 'hover:ring-1 hover:ring-red-500/20',
      topBorder: 'border-t-2 border-t-red-500/70',
      href: '/membros?filtro=expirado',
    },
    {
      label: 'Receita do Mês',
      value: formatCurrency(stats.revenue_this_month),
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-accent/20',
      gradient: 'from-accent/20 to-transparent',
      ring: 'hover:ring-1 hover:ring-accent/20',
      topBorder: 'border-t-2 border-t-accent/70',
      href: '/pagamentos',
    },
    {
      label: 'Pagamentos Hoje',
      value: stats.payments_today,
      icon: CreditCard,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      gradient: 'from-purple-500/20 to-transparent',
      ring: 'hover:ring-1 hover:ring-purple-500/20',
      topBorder: 'border-t-2 border-t-purple-500/70',
      href: '/pagamentos',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cards de métricas com gradientes e stagger */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map(({ label, value, icon: Icon, color, bg, gradient, ring, href, topBorder }, i) => (
          <Link key={label} href={href} className={`group animate-fade-in-up stagger-${i + 1}`}>
            <Card
              variant="gradient"
              className={`bg-gradient-to-br ${gradient} ${topBorder} border-quartel-700/50 hover:border-quartel-600 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 cursor-pointer ${ring}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${bg} ring-1 ring-white/10`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-quartel-500">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-4xl font-black dark:text-white text-gray-900 tracking-tight tabular-nums leading-none">{value}</p>
                <p className="text-xs dark:text-quartel-400 text-gray-500 mt-1.5 font-medium">{label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Subscrições a expirar */}
      <Card
        variant="default"
        glow={expiring.some(i => i.days_remaining === 0)}
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/10">
                <Bell className="h-4 w-4 text-yellow-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">
                Subscrições a Expirar
              </h2>
            </div>
            {expiring.length > 0 && (
              <Badge color="yellow" size="sm">{expiring.length} alerta{expiring.length !== 1 ? 's' : ''}</Badge>
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
            {expiring.map((item) => {
              const urgencyBg =
                item.days_remaining === 0
                  ? 'dark:bg-red-500/15 bg-red-50 border dark:border-red-500/20 border-red-200'
                  : item.days_remaining <= 3
                  ? 'dark:bg-orange-500/10 bg-orange-50 border dark:border-orange-500/20 border-orange-200'
                  : 'dark:bg-yellow-500/10 bg-yellow-50'
              const badgeColor: 'red' | 'orange' | 'yellow' =
                item.days_remaining === 0 ? 'red' : item.days_remaining <= 3 ? 'orange' : 'yellow'

              return (
                <Link
                  key={item.subscription_id}
                  href={`/membros/${item.member_id}`}
                  className={`flex items-center justify-between p-3 rounded-xl hover:bg-quartel-700 transition-all ${urgencyBg}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-quartel-700 flex items-center justify-center text-xs font-bold text-white">
                      {item.first_name.charAt(0)}{item.last_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium dark:text-white text-gray-900 truncate">
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
                      {item.phone && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${item.phone}` }}
                          className="text-xs text-accent hover:underline mt-0.5 inline-block cursor-pointer"
                        >
                          {item.phone}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-quartel-400">Expira em</p>
                    <p className="text-sm font-medium text-white">{formatDate(item.end_date)}</p>
                    <Badge color={badgeColor} size="sm">
                      {item.days_remaining === 0 ? 'hoje' : `${item.days_remaining}d`}
                    </Badge>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Card>

      {/* Alertas de transição de idade — 18 anos */}
      {ageAlerts.length > 0 && (
        <Card
          variant="default"
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10">
                  <Cake className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold dark:text-white text-gray-900">
                    Transições de Idade
                  </h2>
                  <p className="text-xs dark:text-quartel-500 text-gray-400 mt-0.5">
                    Membros que atingiram 18 anos com plano de criança activo
                  </p>
                </div>
              </div>
              <Badge color="orange" size="sm">
                {ageAlerts.length} {ageAlerts.length === 1 ? 'membro' : 'membros'}
              </Badge>
            </div>
          }
        >
          <div className="space-y-2">
            {ageAlerts.map((alert) => {
              const isTurning18 = alert.turns_18_this_month
              const urgencyBg = isTurning18
                ? 'dark:bg-orange-500/10 bg-orange-50 border dark:border-orange-500/20 border-orange-200'
                : 'dark:bg-red-500/12 bg-red-50 border dark:border-red-500/20 border-red-200'

              // Data do 18.º aniversário
              const dob = new Date(alert.date_of_birth)
              const birthday18 = new Date(dob)
              birthday18.setFullYear(dob.getFullYear() + 18)
              const birthday18Str = birthday18.toLocaleDateString('pt-PT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })

              return (
                <Link
                  key={alert.member_id}
                  href={`/membros/${alert.member_id}`}
                  className={`flex items-center justify-between p-3 rounded-xl hover:opacity-90 transition-all ${urgencyBg}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isTurning18 ? 'bg-orange-500/60' : 'bg-red-500/60'}`}>
                      {alert.first_name.charAt(0)}{alert.last_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold dark:text-white text-gray-900 truncate">
                        {alert.first_name} {alert.last_name}
                      </p>
                      <p className="text-xs dark:text-quartel-400 text-gray-500 truncate">
                        Plano actual: <span className="font-medium">{alert.plan_name}</span>
                      </p>
                      <p className="text-xs dark:text-quartel-500 text-gray-400 mt-0.5">
                        {isTurning18
                          ? `Faz 18 anos a ${birthday18Str}`
                          : `Completou ${alert.age_years} anos — por actualizar`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-1">
                    <Badge color={isTurning18 ? 'orange' : 'red'} size="sm">
                      {isTurning18 ? '18 anos este mês' : `${alert.age_years} anos`}
                    </Badge>
                    <span className="text-xs dark:text-quartel-500 text-gray-400">
                      Ver perfil →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

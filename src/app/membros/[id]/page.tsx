import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MembroPerfilClient from './MembroPerfilClient'
import type { Subscription, SubscriptionPlan, Payment } from '@/lib/types'

type SubscriptionWithPlan = Subscription & { plan: SubscriptionPlan }

export default async function MembroPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [memberRes, subRes, expiredRes, paymentsRes, plansRes] = await Promise.all([
    supabase.from('members').select('*').eq('id', id).single(),
    supabase.from('subscriptions').select('*, plan:subscription_plans(*)').eq('member_id', id).eq('status', 'active').maybeSingle(),
    supabase.from('subscriptions').select('*, plan:subscription_plans(*)').eq('member_id', id).eq('status', 'expired').order('end_date', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('payments').select('*').eq('member_id', id).order('payment_date', { ascending: false }),
    supabase.from('subscription_plans').select('*').eq('is_active', true).order('name'),
  ])

  if (memberRes.error || !memberRes.data) {
    notFound()
  }

  return (
    <MembroPerfilClient
      id={id}
      initialMember={memberRes.data}
      initialSubscription={subRes.data as SubscriptionWithPlan | null}
      initialExpiredSub={expiredRes.data as SubscriptionWithPlan | null}
      initialPayments={(paymentsRes.data ?? []) as Payment[]}
      initialPlans={(plansRes.data ?? []) as SubscriptionPlan[]}
    />
  )
}

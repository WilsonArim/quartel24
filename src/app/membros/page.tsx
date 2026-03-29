import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import MembrosContent from './MembrosContent'
import type { MemberWithSubscription } from '@/lib/types'

export default async function MembrosPage() {
  const supabase = await createClient()

  const [membersRes, plansCount] = await Promise.all([
    supabase
      .from('members')
      .select(`
        *,
        subscription:subscriptions!member_id(
          *,
          plan:subscription_plans(*)
        )
      `)
      .order('first_name'),
    supabase.from('subscription_plans').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // Normalizar: pegar apenas a subscrição mais recente de cada membro
  const members: MemberWithSubscription[] = (membersRes.data ?? []).map((m) => ({
    ...m,
    subscription: Array.isArray(m.subscription) && m.subscription.length > 0
      ? m.subscription[0]
      : null,
  })) as MemberWithSubscription[]

  const hasPlans = (plansCount.count ?? 0) > 0

  return (
    <Suspense fallback={<div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}>
      <MembrosContent initialMembers={members} hasPlans={hasPlans} />
    </Suspense>
  )
}

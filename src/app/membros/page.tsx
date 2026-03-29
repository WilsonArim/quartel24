import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import MembrosContent from './MembrosContent'
import type { MemberWithSubscription } from '@/lib/types'

export default async function MembrosPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('members')
    .select(`
      *,
      subscription:subscriptions!member_id(
        *,
        plan:subscription_plans(*)
      )
    `)
    .order('first_name')

  // Normalizar: pegar apenas a subscrição mais recente de cada membro
  const members: MemberWithSubscription[] = (data ?? []).map((m) => ({
    ...m,
    subscription: Array.isArray(m.subscription) && m.subscription.length > 0
      ? m.subscription[0]
      : null,
  })) as MemberWithSubscription[]

  return (
    <Suspense fallback={<div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}>
      <MembrosContent initialMembers={members} />
    </Suspense>
  )
}

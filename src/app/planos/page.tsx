import { createClient } from '@/lib/supabase/server'
import PlanosContent from './PlanosContent'
import type { SubscriptionPlan } from '@/lib/types'

export default async function PlanosPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('age_category')
    .order('plan_type')
    .order('name')

  const plans: SubscriptionPlan[] = data ?? []

  return <PlanosContent initialPlans={plans} />
}

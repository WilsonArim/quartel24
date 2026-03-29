// Tipos para a base de dados — mapeados diretamente ao schema SQL

export type Member = {
  id: string
  member_number: number | null
  enrollment_date: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  gender: 'M' | 'F' | null
  address: string | null
  city: string | null
  postal_code: string | null
  nif: string | null
  cc_number: string | null
  has_insurance: boolean
  medical_conditions: string | null
  allergies: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  guardian_name: string | null
  guardian_address: string | null
  guardian_city: string | null
  guardian_postal_code: string | null
  guardian_cc: string | null
  guardian_nif: string | null
  guardian_date_of_birth: string | null
  guardian_phone: string | null
  guardian_email: string | null
  photo_url: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Modality = 'ginasio' | 'bjj' | 'mma'

export type SubscriptionPlan = {
  id: string
  name: string
  description: string | null
  modalities: Modality[]
  age_category: 'adulto' | 'criança' | 'todos'
  plan_type: 'individual' | 'pack'
  duration_months: number
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'paused'

export type Subscription = {
  id: string
  member_id: string
  plan_id: string
  start_date: string
  end_date: string
  status: SubscriptionStatus
  auto_renew: boolean
  created_at: string
  updated_at: string
}

export type PaymentMethod = 'cash' | 'multibanco' | 'transferencia' | 'mbway' | 'outro'

export type Payment = {
  id: string
  member_id: string
  subscription_id: string | null
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  notes: string | null
  created_at: string
}

// Tipos compostos (joins)
export type MemberWithSubscription = Member & {
  subscription: (Subscription & { plan: SubscriptionPlan }) | null
}

export type PaymentWithDetails = Payment & {
  member: Pick<Member, 'id' | 'first_name' | 'last_name'>
  plan_name?: string
}

export type DashboardStats = {
  total_members: number
  active_subscriptions: number
  expiring_soon: number
  expired: number
  revenue_this_month: number
  payments_today: number
}

export type ExpiringSubscription = {
  subscription_id: string
  member_id: string
  first_name: string
  last_name: string
  phone: string | null
  plan_name: string
  modalities: Modality[]
  end_date: string
  days_remaining: number
}

export type AgeTransitionAlert = {
  member_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  age_years: number
  turns_18_this_month: boolean
  plan_name: string
  subscription_id: string
  subscription_end_date: string
}

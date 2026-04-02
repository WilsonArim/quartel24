'use client'

import { useState } from 'react'
import { useToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getSubscriptionStatusLabel, getModalityLabel,
  formatDate, formatDateLong, formatCurrency, calculateEndDate, calculateCurrentEndDate,
  getPaymentMethodLabel, getInitials
} from '@/lib/utils'
import { ArrowLeft, Edit, Plus, CreditCard, Phone, Mail, MapPin, FileText, Heart, Trash2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import type { Member, SubscriptionPlan, Subscription, Payment } from '@/lib/types'

const genderOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
]

const paymentMethodOptions = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'multibanco', label: 'Multibanco' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'mbway', label: 'MBWay' },
  { value: 'outro', label: 'Outro' },
]

type SubscriptionWithPlan = Subscription & { plan: SubscriptionPlan }

type Props = {
  id: string
  initialMember: Member
  initialSubscription: SubscriptionWithPlan | null
  initialExpiredSub: SubscriptionWithPlan | null
  initialPayments: Payment[]
  initialPlans: SubscriptionPlan[]
}

export default function MembroPerfilClient({
  id,
  initialMember,
  initialSubscription,
  initialExpiredSub,
  initialPayments,
  initialPlans,
}: Props) {
  const router = useRouter()
  const { showToast } = useToast()

  const [member, setMember] = useState<Member>(initialMember)
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(initialSubscription)
  const [expiredSub, setExpiredSub] = useState<SubscriptionWithPlan | null>(initialExpiredSub)
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans)

  // Modais
  const [editOpen, setEditOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  // Formulário editar membro
  const [editForm, setEditForm] = useState<Partial<Member>>(initialMember)
  const [editLoading, setEditLoading] = useState(false)

  // Formulário nova subscrição
  const [subForm, setSubForm] = useState({ plan_id: '', start_date: new Date().toISOString().split('T')[0] })
  const [subLoading, setSubLoading] = useState(false)

  // Formulário registo de pagamento
  const [payForm, setPayForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash', notes: '', renewSub: false, renewStartDate: new Date().toISOString().split('T')[0] })
  const [payLoading, setPayLoading] = useState(false)

  // Eliminação de pagamento
  const [deletePayId, setDeletePayId] = useState<string | null>(null)
  const [deletePayLoading, setDeletePayLoading] = useState(false)

  // Refetch — chamado apenas de event handlers, nunca de effects
  async function fetchData() {
    const supabase = createClient()

    const [memberRes, subRes, expiredRes, paymentsRes, plansRes] = await Promise.all([
      supabase.from('members').select('*').eq('id', id).single(),
      supabase.from('subscriptions').select('*, plan:subscription_plans(*)').eq('member_id', id).eq('status', 'active').maybeSingle(),
      supabase.from('subscriptions').select('*, plan:subscription_plans(*)').eq('member_id', id).eq('status', 'expired').order('end_date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('payments').select('*').eq('member_id', id).order('payment_date', { ascending: false }),
      supabase.from('subscription_plans').select('*').eq('is_active', true).order('name'),
    ])

    if (memberRes.error) { router.push('/membros'); return }

    setMember(memberRes.data)
    setSubscription(subRes.data as SubscriptionWithPlan | null)
    setExpiredSub(expiredRes.data as SubscriptionWithPlan | null)
    setPayments(paymentsRes.data ?? [])
    setPlans(plansRes.data ?? [])
    setEditForm(memberRes.data)
  }

  function openPayModal() {
    const plan = subscription?.plan ?? expiredSub?.plan
    const autoRenew = !subscription && !!expiredSub
    setPayForm({
      amount: plan?.price ? String(plan.price) : '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      notes: '',
      renewSub: autoRenew,
      renewStartDate: new Date().toISOString().split('T')[0],
    })
    setPayOpen(true)
  }

  async function handleEditSubmit() {
    if (!editForm.first_name?.trim() || !editForm.last_name?.trim()) return
    setEditLoading(true)
    const supabase = createClient()
    await supabase.from('members').update(editForm).eq('id', id)
    await fetchData()
    setEditOpen(false)
    setEditLoading(false)
    showToast('Dados do membro actualizados')
  }

  async function handleSubSubmit() {
    if (!subForm.plan_id || !subForm.start_date) return
    setSubLoading(true)
    const supabase = createClient()
    const plan = plans.find((p) => p.id === subForm.plan_id)
    if (!plan) { setSubLoading(false); return }

    const end_date = calculateCurrentEndDate(subForm.start_date, plan.duration_months)

    // Cancelar subscrição ativa anterior
    if (subscription) {
      await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', subscription.id)
    }

    await supabase.from('subscriptions').insert({
      member_id: id,
      plan_id: subForm.plan_id,
      start_date: subForm.start_date,
      end_date,
      status: 'active',
    })

    await fetchData()
    setSubOpen(false)
    setSubLoading(false)
    showToast('Subscrição atribuída com sucesso')
  }

  async function handlePaySubmit() {
    if (!payForm.amount || !payForm.payment_date) return
    setPayLoading(true)
    const supabase = createClient()

    let activeSubId = subscription?.id ?? null

    // Se marcou renovar, criar nova subscrição ativa
    if (payForm.renewSub && expiredSub) {
      const plan = expiredSub.plan
      const end_date = calculateEndDate(payForm.renewStartDate, plan.duration_months)

      const { data: newSub } = await supabase.from('subscriptions').insert({
        member_id: id,
        plan_id: expiredSub.plan_id,
        start_date: payForm.renewStartDate,
        end_date,
        status: 'active',
      }).select('id').single()

      activeSubId = newSub?.id ?? null
    }

    const { error } = await supabase.from('payments').insert({
      member_id: id,
      subscription_id: activeSubId,
      amount: parseFloat(payForm.amount),
      payment_date: payForm.payment_date,
      payment_method: payForm.payment_method,
      notes: payForm.notes || null,
    })

    if (error) {
      showToast('Erro ao registar pagamento', 'error')
      setPayLoading(false)
      return
    }

    await fetchData()
    setPayOpen(false)
    setPayLoading(false)
    showToast('Pagamento registado com sucesso')
  }

  async function handleDeletePayment() {
    if (!deletePayId) return
    setDeletePayLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('payments').delete().eq('id', deletePayId)
    if (error) {
      showToast('Erro ao eliminar pagamento', 'error')
    } else {
      await fetchData()
      showToast('Pagamento eliminado')
    }
    setDeletePayId(null)
    setDeletePayLoading(false)
  }

  const subStatus = subscription ? getSubscriptionStatusLabel(subscription.end_date) : null

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Voltar */}
      <Link href="/membros" className="inline-flex items-center gap-2 text-sm text-quartel-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar aos membros
      </Link>

      {/* Hero do perfil */}
      <div className="relative overflow-hidden rounded-2xl dark:bg-gradient-to-br dark:from-quartel-800 dark:via-quartel-800 dark:to-quartel-900 bg-white dark:border-quartel-700/50 border-gray-200 shadow-[var(--shadow-card)] p-6">
        {/* Background decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-quartel-700/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar grande */}
          <div className="w-16 h-16 rounded-2xl dark:bg-gradient-to-br dark:from-quartel-600 dark:to-quartel-700 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-2xl font-black dark:text-white text-gray-700 dark:ring-quartel-600 ring-gray-300 ring-2 shrink-0">
            {getInitials(member.first_name, member.last_name)}
          </div>

          {/* Nome + estado */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black dark:text-white text-gray-900 tracking-tight">
              {member.first_name} {member.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge color={member.is_active ? 'green' : 'gray'} size="sm">
                {member.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
              {subStatus && (
                <Badge color={subStatus.color} size="sm">{subStatus.label}</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-quartel-400">
              {member.phone && (
                <a href={`tel:${member.phone}`} className="flex items-center gap-1 text-accent hover:underline">
                  <Phone className="h-3 w-3" />{member.phone}
                </a>
              )}
              {member.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{member.email}</span>}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="h-3.5 w-3.5" /> Editar
            </Button>
            <Button size="sm" onClick={() => setSubOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Subscrição
            </Button>
            <Button variant="secondary" size="sm" onClick={openPayModal}>
              <CreditCard className="h-3.5 w-3.5" /> Pagamento
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dados pessoais */}
        <div className="dark:bg-quartel-800 bg-white dark:border-quartel-700 border-gray-200 rounded-xl p-5 space-y-3 shadow-[var(--shadow-card)]">
          <h3 className="text-xs font-semibold text-quartel-400 uppercase tracking-wide flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />Dados Pessoais
          </h3>
          <InfoRow label="Data de nascimento" value={member.date_of_birth ? formatDateLong(member.date_of_birth) : null} />
          <InfoRow label="Género" value={member.gender} />
          <InfoRow label="NIF" value={member.nif} />
          <InfoRow label="Cartão de Cidadão" value={member.cc_number} />
          {(member.address || member.city) && (
            <InfoRow label="Morada" value={[member.address, member.city, member.postal_code].filter(Boolean).join(', ')} icon={<MapPin className="h-3 w-3" />} />
          )}
        </div>

        {/* Saúde */}
        <div className="dark:bg-quartel-800 bg-white dark:border-quartel-700 border-gray-200 rounded-xl p-5 space-y-3 shadow-[var(--shadow-card)]">
          <h3 className="text-xs font-semibold text-quartel-400 uppercase tracking-wide flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5" />Saúde & Emergência
          </h3>
          <InfoRow label="Condições médicas" value={member.medical_conditions} />
          <InfoRow label="Alergias" value={member.allergies} />
          <InfoRow label="Emergência" value={member.emergency_contact_name} />
          <InfoRow label="Telefone emergência" value={member.emergency_contact_phone} />
          {member.notes && <InfoRow label="Notas" value={member.notes} />}
        </div>
      </div>

      {/* Subscrição atual */}
      <div className="dark:bg-quartel-800 bg-white dark:border-quartel-700 border-gray-200 rounded-xl p-5 shadow-[var(--shadow-card)]">
        <h3 className="text-xs font-semibold text-quartel-400 uppercase tracking-wide mb-4">Subscrição Atual</h3>
        {subscription ? (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-semibold text-white">{subscription.plan.name}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {subscription.plan.modalities.map((m) => (
                  <Badge key={m} color={m === 'ginasio' ? 'blue' : m === 'bjj' ? 'purple' : 'red'} size="sm">
                    {getModalityLabel(m)}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-quartel-400 mt-1">
                {formatDate(subscription.start_date)} → {formatDate(subscription.end_date)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">{formatCurrency(subscription.plan.price)}</p>
              {subStatus && <Badge color={subStatus.color} size="md">{subStatus.label}</Badge>}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Sem subscrição ativa"
            description="Atribui um plano ao membro."
            action={<Button size="sm" onClick={() => setSubOpen(true)}><Plus className="h-4 w-4" />Atribuir Plano</Button>}
            className="py-6"
          />
        )}
      </div>

      {/* Histórico de pagamentos */}
      <div className="dark:bg-quartel-800 bg-white dark:border-quartel-700 border-gray-200 rounded-xl p-5 shadow-[var(--shadow-card)]">
        <h3 className="text-xs font-semibold text-quartel-400 uppercase tracking-wide mb-4">Histórico de Pagamentos</h3>
        {payments.length === 0 ? (
          <EmptyState title="Sem pagamentos registados" className="py-6" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-quartel-700">
              <tr>
                <th className="pb-2 text-left text-xs text-quartel-500">Data</th>
                <th className="pb-2 text-left text-xs text-quartel-500">Valor</th>
                <th className="pb-2 text-left text-xs text-quartel-500">Método</th>
                <th className="pb-2 text-left text-xs text-quartel-500 hidden sm:table-cell">Notas</th>
                <th className="pb-2 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-quartel-800">
              {payments.map((p) => (
                <tr key={p.id} className="group">
                  <td className="py-2.5 text-quartel-300">{formatDate(p.payment_date)}</td>
                  <td className="py-2.5 font-medium text-white">{formatCurrency(p.amount)}</td>
                  <td className="py-2.5 text-quartel-300">{getPaymentMethodLabel(p.payment_method)}</td>
                  <td className="py-2.5 text-quartel-500 hidden sm:table-cell">{p.notes ?? '—'}</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => setDeletePayId(p.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-quartel-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                      title="Eliminar pagamento"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Editar Membro */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar Membro"
        className="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSubmit} loading={editLoading}>Guardar</Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Ficha */}
          <div>
            <p className="text-xs font-semibold text-quartel-400 uppercase tracking-wide mb-3">Ficha de Inscrição</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nº Sócio / Inscrição" type="number" value={editForm.member_number != null ? String(editForm.member_number) : ''} onChange={(e) => setEditForm((p) => ({ ...p, member_number: e.target.value ? parseInt(e.target.value) : null }))} placeholder="13" />
              <Input label="Data de Inscrição" type="date" value={editForm.enrollment_date ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, enrollment_date: e.target.value || null }))} />
            </div>
          </div>

          {/* Seguro */}
          <div
            className={`flex items-start gap-4 p-3 rounded-xl border cursor-pointer transition-colors ${editForm.has_insurance ? 'bg-green-500/10 border-green-500/40' : 'dark:bg-quartel-900 bg-gray-50 dark:border-quartel-700 border-gray-200'}`}
            onClick={() => setEditForm((p) => ({ ...p, has_insurance: !p.has_insurance }))}
          >
            <div className={`mt-0.5 w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${editForm.has_insurance ? 'bg-green-500 border-green-500' : 'dark:border-quartel-500 border-gray-300'}`}>
              {editForm.has_insurance && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`h-4 w-4 ${editForm.has_insurance ? 'text-green-400' : 'text-quartel-400'}`} />
                <span className={`text-sm font-semibold ${editForm.has_insurance ? 'text-green-300' : 'dark:text-quartel-200 text-gray-700'}`}>Seguro Desportivo Anual</span>
              </div>
              <p className="text-xs text-quartel-400 mt-0.5">Membro possui seguro desportivo anual válido</p>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div>
            <p className="text-xs font-semibold text-quartel-400 uppercase tracking-wide mb-3">Dados Pessoais</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome *" value={editForm.first_name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))} />
              <Input label="Apelido *" value={editForm.last_name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))} />
              <Input label="Email" type="email" value={editForm.email ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
              <Input label="Telemóvel" value={editForm.phone ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
              <Input label="Data de Nascimento" type="date" value={editForm.date_of_birth ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, date_of_birth: e.target.value || null }))} />
              <Select label="Género" options={genderOptions} placeholder="Selecionar..." value={editForm.gender ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, gender: (e.target.value as 'M' | 'F') || null }))} />
            </div>
          </div>

          {/* Morada */}
          <div>
            <p className="text-xs font-semibold text-quartel-400 uppercase tracking-wide mb-3">Morada</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input label="Morada" value={editForm.address ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value || null }))} placeholder="Rua, número..." />
              </div>
              <Input label="Cód. Postal" value={editForm.postal_code ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, postal_code: e.target.value || null }))} placeholder="0000-000" />
              <Input label="Localidade" value={editForm.city ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value || null }))} placeholder="Lisboa" />
            </div>
          </div>

          {/* Documentos */}
          <div>
            <p className="text-xs font-semibold text-quartel-400 uppercase tracking-wide mb-3">Documentos</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="B.I. / Cartão de Cidadão" value={editForm.cc_number ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, cc_number: e.target.value || null }))} />
              <Input label="NIF" value={editForm.nif ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, nif: e.target.value || null }))} />
            </div>
          </div>

          {/* Saúde & Emergência */}
          <div>
            <p className="text-xs font-semibold text-quartel-400 uppercase tracking-wide mb-3">Saúde & Emergência</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium dark:text-quartel-200 text-gray-700 mb-1.5">Condições médicas</label>
                <textarea value={editForm.medical_conditions ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, medical_conditions: e.target.value || null }))} rows={2} className="w-full rounded-lg border dark:border-quartel-700 border-gray-300 dark:bg-quartel-900 bg-white dark:text-white text-gray-900 placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-quartel-200 text-gray-700 mb-1.5">Alergias</label>
                <textarea value={editForm.allergies ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, allergies: e.target.value || null }))} rows={2} className="w-full rounded-lg border dark:border-quartel-700 border-gray-300 dark:bg-quartel-900 bg-white dark:text-white text-gray-900 placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Contacto de Emergência" value={editForm.emergency_contact_name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, emergency_contact_name: e.target.value || null }))} />
                <Input label="Telefone Emergência" value={editForm.emergency_contact_phone ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, emergency_contact_phone: e.target.value || null }))} />
              </div>
            </div>
          </div>

          {/* Responsável */}
          <div>
            <p className="text-xs font-semibold text-quartel-400 uppercase tracking-wide mb-1">Responsável</p>
            <p className="text-xs text-quartel-500 mb-3">Preencher apenas se o membro for menor de idade</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input label="Nome do Responsável" value={editForm.guardian_name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, guardian_name: e.target.value || null }))} />
              </div>
              <div className="col-span-2">
                <Input label="Morada" value={editForm.guardian_address ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, guardian_address: e.target.value || null }))} />
              </div>
              <Input label="Cód. Postal" value={editForm.guardian_postal_code ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, guardian_postal_code: e.target.value || null }))} />
              <Input label="Localidade" value={editForm.guardian_city ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, guardian_city: e.target.value || null }))} />
              <Input label="B.I. / C.C." value={editForm.guardian_cc ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, guardian_cc: e.target.value || null }))} />
              <Input label="NIF" value={editForm.guardian_nif ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, guardian_nif: e.target.value || null }))} />
              <Input label="Data de Nascimento" type="date" value={editForm.guardian_date_of_birth ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, guardian_date_of_birth: e.target.value || null }))} />
              <Input label="Telemóvel" value={editForm.guardian_phone ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, guardian_phone: e.target.value || null }))} />
              <div className="col-span-2">
                <Input label="Email" type="email" value={editForm.guardian_email ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, guardian_email: e.target.value || null }))} />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-quartel-400 uppercase tracking-wide mb-3">Notas</label>
            <textarea value={editForm.notes ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value || null }))} rows={3} placeholder="Observações internas..." className="w-full rounded-lg border dark:border-quartel-700 border-gray-300 dark:bg-quartel-900 bg-white dark:text-white text-gray-900 placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none" />
          </div>
        </div>
      </Modal>

      {/* Modal: Nova Subscrição */}
      <Modal
        open={subOpen}
        onClose={() => setSubOpen(false)}
        title="Nova Subscrição"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSubOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubSubmit} loading={subLoading} disabled={!subForm.plan_id}>Confirmar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Plano"
            placeholder="Selecionar plano..."
            value={subForm.plan_id}
            onChange={(e) => setSubForm((p) => ({ ...p, plan_id: e.target.value }))}
            options={plans.map((p) => ({
              value: p.id,
              label: `${p.name} — ${formatCurrency(p.price)} / ${p.duration_months} mês${p.duration_months > 1 ? 'es' : ''}`,
            }))}
          />
          <Input
            label="Data de início"
            type="date"
            value={subForm.start_date}
            onChange={(e) => setSubForm((p) => ({ ...p, start_date: e.target.value }))}
          />
          {subForm.plan_id && subForm.start_date && (() => {
            const dur = plans.find((p) => p.id === subForm.plan_id)?.duration_months ?? 1
            const simpleEnd = calculateEndDate(subForm.start_date, dur)
            const currentEnd = calculateCurrentEndDate(subForm.start_date, dur)
            const isRetroactive = simpleEnd !== currentEnd
            return (
              <div className={`rounded-lg p-3 space-y-1 ${isRetroactive ? 'bg-amber-500/10 border border-amber-500/25' : 'bg-quartel-900'}`}>
                <p className="text-sm text-quartel-400">
                  Válida até: <span className="text-white font-semibold">{formatDate(currentEnd)}</span>
                </p>
                {isRetroactive && (
                  <p className="text-xs text-amber-400/90">
                    Data retroactiva — a subscrição foi avançada automaticamente para o ciclo atual.
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      </Modal>

      {/* Modal: Confirmar eliminação de pagamento */}
      <Modal
        open={!!deletePayId}
        onClose={() => setDeletePayId(null)}
        title="Eliminar Pagamento"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeletePayId(null)} autoFocus>Cancelar</Button>
            <Button variant="secondary" onClick={handleDeletePayment} loading={deletePayLoading}
              className="!bg-red-500/15 !text-red-400 !border-red-500/30 hover:!bg-red-500/25">
              Eliminar
            </Button>
          </div>
        }
      >
        <p className="text-sm dark:text-quartel-300 text-gray-600">
          Tens a certeza que queres eliminar este pagamento? Esta acção não pode ser revertida.
        </p>
      </Modal>

      {/* Modal: Registar Pagamento */}
      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Registar Pagamento"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPayOpen(false)}>Cancelar</Button>
            <Button onClick={handlePaySubmit} loading={payLoading} disabled={!payForm.amount}>Guardar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Toggle renovar subscrição — aparece quando há subscrição expirada */}
          {expiredSub && !subscription && (
            <div
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${payForm.renewSub ? 'bg-green-500/10 border-green-500/40' : 'bg-quartel-900 border-quartel-700'}`}
              onClick={() => setPayForm((p) => ({ ...p, renewSub: !p.renewSub }))}
            >
              <div>
                <p className="text-sm font-medium text-white">Renovar subscrição</p>
                <p className="text-xs text-quartel-400">{expiredSub.plan.name} — {formatCurrency(expiredSub.plan.price)}</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${payForm.renewSub ? 'bg-green-500' : 'bg-quartel-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${payForm.renewSub ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </div>
          )}

          {/* Data de início da renovação */}
          {payForm.renewSub && expiredSub && (
            <div className="space-y-2">
              <Input
                label="Início da nova subscrição"
                type="date"
                value={payForm.renewStartDate}
                onChange={(e) => setPayForm((p) => ({ ...p, renewStartDate: e.target.value }))}
              />
              <p className="text-xs text-quartel-400">
                Fim: <span className="text-white">{formatDate(calculateEndDate(payForm.renewStartDate, expiredSub.plan.duration_months))}</span>
              </p>
            </div>
          )}

          <Input
            label="Valor (€)"
            type="number"
            step="0.01"
            min="0"
            value={payForm.amount}
            onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))}
            placeholder="0.00"
          />
          <Input
            label="Data do pagamento"
            type="date"
            value={payForm.payment_date}
            onChange={(e) => setPayForm((p) => ({ ...p, payment_date: e.target.value }))}
          />
          <Select
            label="Método de pagamento"
            options={paymentMethodOptions}
            value={payForm.payment_method}
            onChange={(e) => setPayForm((p) => ({ ...p, payment_method: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-quartel-200 mb-1.5">Notas (opcional)</label>
            <textarea
              value={payForm.notes}
              onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              placeholder="Ex: referência MB, mês de março..."
              className="w-full rounded-lg border border-quartel-700 bg-quartel-900 text-white placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

function InfoRow({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-quartel-500 mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-quartel-500">{label}</p>
        <p className="text-sm text-quartel-200">{value}</p>
      </div>
    </div>
  )
}

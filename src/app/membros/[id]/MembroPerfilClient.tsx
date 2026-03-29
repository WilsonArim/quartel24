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
  formatDate, formatDateLong, formatCurrency, calculateEndDate,
  getPaymentMethodLabel, getInitials
} from '@/lib/utils'
import { ArrowLeft, Edit, Plus, CreditCard, Phone, Mail, MapPin, FileText, Heart } from 'lucide-react'
import Link from 'next/link'
import type { Member, SubscriptionPlan, Subscription, Payment } from '@/lib/types'

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

    const end_date = calculateEndDate(subForm.start_date, plan.duration_months)

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

    await supabase.from('payments').insert({
      member_id: id,
      subscription_id: activeSubId,
      amount: parseFloat(payForm.amount),
      payment_date: payForm.payment_date,
      payment_method: payForm.payment_method,
      notes: payForm.notes || null,
    })

    await fetchData()
    setPayOpen(false)
    setPayLoading(false)
    showToast('Pagamento registado com sucesso')
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-quartel-800 via-quartel-800 to-quartel-900 border border-quartel-700/50 p-6">
        {/* Background decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-quartel-700/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar grande */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-quartel-600 to-quartel-700 flex items-center justify-center text-2xl font-black text-white ring-2 ring-quartel-600 shrink-0">
            {getInitials(member.first_name, member.last_name)}
          </div>

          {/* Nome + estado */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white tracking-tight">
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
        <div className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 space-y-3">
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
        <div className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 space-y-3">
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
      <div className="bg-quartel-800 border border-quartel-700 rounded-xl p-5">
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
      <div className="bg-quartel-800 border border-quartel-700 rounded-xl p-5">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-quartel-800">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 text-quartel-300">{formatDate(p.payment_date)}</td>
                  <td className="py-2.5 font-medium text-white">{formatCurrency(p.amount)}</td>
                  <td className="py-2.5 text-quartel-300">{getPaymentMethodLabel(p.payment_method)}</td>
                  <td className="py-2.5 text-quartel-500 hidden sm:table-cell">{p.notes ?? '—'}</td>
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
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSubmit} loading={editLoading}>Guardar</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nome *" value={editForm.first_name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))} />
            <Input label="Apelido *" value={editForm.last_name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))} />
          </div>
          <Input label="Email" type="email" value={editForm.email ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
          <Input label="Telefone" value={editForm.phone ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
          <Input label="NIF" value={editForm.nif ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, nif: e.target.value }))} />
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
          {subForm.plan_id && subForm.start_date && (
            <p className="text-sm text-quartel-400">
              Data de fim: <span className="text-white font-medium">
                {formatDate(calculateEndDate(subForm.start_date, plans.find((p) => p.id === subForm.plan_id)?.duration_months ?? 1))}
              </span>
            </p>
          )}
        </div>
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

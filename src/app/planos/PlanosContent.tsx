'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, getModalityLabel, getAgeCategoryLabel } from '@/lib/utils'
import { Plus, Edit, ClipboardList } from 'lucide-react'
import type { SubscriptionPlan, Modality } from '@/lib/types'

const ageCategoryOptions = [
  { value: 'adulto', label: 'Adulto' },
  { value: 'criança', label: 'Criança' },
  { value: 'todos', label: 'Todos' },
]

const MODALITIES: Modality[] = ['ginasio', 'bjj', 'mma']

type PlanForm = {
  name: string
  description: string
  modalities: Modality[]
  age_category: string
  duration_months: string
  price: string
}

const emptyForm: PlanForm = {
  name: '',
  description: '',
  modalities: [],
  age_category: 'adulto',
  duration_months: '1',
  price: '',
}

export default function PlanosContent({ initialPlans }: { initialPlans: SubscriptionPlan[] }) {
  const [plans, setPlans] = useState(initialPlans)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [form, setForm] = useState<PlanForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function fetchPlans() {
    const supabase = createClient()
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('age_category')
      .order('plan_type')
      .order('name')
    setPlans(data ?? [])
  }

  function openNew() {
    setEditingPlan(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(plan: SubscriptionPlan) {
    setEditingPlan(plan)
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      modalities: plan.modalities,
      age_category: plan.age_category,
      duration_months: String(plan.duration_months),
      price: String(plan.price),
    })
    setErrors({})
    setModalOpen(true)
  }

  function toggleModality(m: Modality) {
    setForm((prev) => ({
      ...prev,
      modalities: prev.modalities.includes(m)
        ? prev.modalities.filter((x) => x !== m)
        : [...prev.modalities, m],
    }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'O nome é obrigatório'
    if (form.modalities.length === 0) errs.modalities = 'Seleciona pelo menos uma modalidade'
    if (!form.price || isNaN(Number(form.price))) errs.price = 'Preço inválido'
    if (!form.duration_months || isNaN(Number(form.duration_months))) errs.duration_months = 'Duração inválida'
    return errs
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    const supabase = createClient()

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      modalities: form.modalities,
      age_category: form.age_category,
      plan_type: form.modalities.length > 1 ? 'pack' : 'individual',
      duration_months: parseInt(form.duration_months),
      price: parseFloat(form.price),
    }

    if (editingPlan) {
      await supabase.from('subscription_plans').update(payload).eq('id', editingPlan.id)
    } else {
      await supabase.from('subscription_plans').insert(payload)
    }

    await fetchPlans()
    setModalOpen(false)
    setSaving(false)
  }

  async function toggleActive(plan: SubscriptionPlan) {
    const supabase = createClient()
    await supabase.from('subscription_plans').update({ is_active: !plan.is_active }).eq('id', plan.id)
    await fetchPlans()
  }

  const activePlans = plans.filter((p) => p.is_active)
  const inactivePlans = plans.filter((p) => !p.is_active)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-quartel-400">{activePlans.length} planos ativos</p>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="Nenhum plano criado"
          action={<Button size="sm" onClick={openNew}><Plus className="h-4 w-4" />Criar Plano</Button>}
        />
      ) : (
        <>
          {/* Planos ativos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onEdit={openEdit} onToggle={toggleActive} />
            ))}
          </div>

          {/* Planos inativos */}
          {inactivePlans.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-quartel-500 uppercase tracking-wide mb-3">Planos Inativos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {inactivePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onEdit={openEdit} onToggle={toggleActive} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal criar/editar plano */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? 'Editar Plano' : 'Novo Plano'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {editingPlan ? 'Guardar Alterações' : 'Criar Plano'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome do plano"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={errors.name}
            placeholder="Ex: BJJ Mensal"
          />

          <div>
            <label className="block text-sm font-medium text-quartel-200 mb-1.5">Descrição (opcional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Breve descrição do plano..."
              className="w-full rounded-lg border border-quartel-700 bg-quartel-900 text-white placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
          </div>

          {/* Modalidades */}
          <div>
            <label className="block text-sm font-medium text-quartel-200 mb-2">Modalidades</label>
            <div className="flex gap-2">
              {MODALITIES.map((m) => {
                const active = form.modalities.includes(m)
                const colors: Record<Modality, string> = {
                  ginasio: active ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'border-quartel-700 text-quartel-500',
                  bjj: active ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'border-quartel-700 text-quartel-500',
                  mma: active ? 'bg-red-500/20 border-red-500 text-red-300' : 'border-quartel-700 text-quartel-500',
                }
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleModality(m)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${colors[m]}`}
                  >
                    {getModalityLabel(m)}
                  </button>
                )
              })}
            </div>
            {errors.modalities && <p className="text-xs text-red-400 mt-1">{errors.modalities}</p>}
            {form.modalities.length > 1 && (
              <p className="text-xs text-quartel-500 mt-1">Pack ({form.modalities.length} modalidades)</p>
            )}
          </div>

          <Select
            label="Categoria"
            options={ageCategoryOptions}
            value={form.age_category}
            onChange={(e) => setForm((p) => ({ ...p, age_category: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duração (meses)"
              type="number"
              min="1"
              value={form.duration_months}
              onChange={(e) => setForm((p) => ({ ...p, duration_months: e.target.value }))}
              error={errors.duration_months}
            />
            <Input
              label="Preço (€)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              error={errors.price}
              placeholder="0.00"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

function PlanCard({
  plan,
  onEdit,
  onToggle,
}: {
  plan: SubscriptionPlan
  onEdit: (p: SubscriptionPlan) => void
  onToggle: (p: SubscriptionPlan) => void
}) {
  return (
    <div className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-white leading-tight">{plan.name}</p>
        <Badge color={plan.is_active ? 'green' : 'gray'} size="sm">
          {plan.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {/* Modalidades */}
      <div className="flex gap-1 flex-wrap">
        {plan.modalities.map((m) => (
          <Badge
            key={m}
            color={m === 'ginasio' ? 'blue' : m === 'bjj' ? 'purple' : 'red'}
            size="sm"
          >
            {getModalityLabel(m)}
          </Badge>
        ))}
        <Badge color="gray" size="sm">{getAgeCategoryLabel(plan.age_category)}</Badge>
        <Badge color="gray" size="sm">{plan.plan_type === 'pack' ? 'Pack' : 'Individual'}</Badge>
      </div>

      {/* Preço e duração */}
      <div className="flex items-end justify-between mt-auto">
        <div>
          <p className="text-2xl font-bold text-white">{formatCurrency(plan.price)}</p>
          <p className="text-xs text-quartel-500">{plan.duration_months} mês{plan.duration_months > 1 ? 'es' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(plan)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={plan.is_active ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => onToggle(plan)}
          >
            {plan.is_active ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

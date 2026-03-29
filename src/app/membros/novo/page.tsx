'use client'

import { useState, FormEvent } from 'react'
import { useToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { ArrowLeft, ShieldCheck, Check, User, MapPin, FileText, StickyNote, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const genderOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
]

const STEPS = [
  { id: 1, label: 'Dados Pessoais' },
  { id: 2, label: 'Morada' },
  { id: 3, label: 'Documentos & Saúde' },
  { id: 4, label: 'Notas' },
]

export default function NovoMembroPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasInsurance, setHasInsurance] = useState(false)

  const [form, setForm] = useState({
    member_number: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    postal_code: '',
    nif: '',
    cc_number: '',
    medical_conditions: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    guardian_name: '',
    guardian_address: '',
    guardian_city: '',
    guardian_postal_code: '',
    guardian_cc: '',
    guardian_nif: '',
    guardian_date_of_birth: '',
    guardian_phone: '',
    guardian_email: '',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // Progresso: step 1 obrigatório (nome + apelido), steps 2-4 sempre completos (opcionais)
  function getCompletedSteps(): number {
    if (!form.first_name.trim() || !form.last_name.trim()) return 0
    return 4
  }

  const completedSteps = getCompletedSteps()

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!form.first_name.trim()) newErrors.first_name = 'O nome é obrigatório'
    if (!form.last_name.trim()) newErrors.last_name = 'O apelido é obrigatório'
    if (!hasInsurance) newErrors.insurance = 'O seguro anual é obrigatório para guardar o membro'
    return newErrors
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const payload: Record<string, unknown> = {
      has_insurance: true,
      enrollment_date: form.enrollment_date || null,
    }

    if (form.member_number.trim()) {
      payload.member_number = parseInt(form.member_number.trim(), 10)
    }

    const stringFields = [
      'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'gender',
      'address', 'city', 'postal_code', 'nif', 'cc_number',
      'medical_conditions', 'allergies', 'emergency_contact_name', 'emergency_contact_phone',
      'guardian_name', 'guardian_address', 'guardian_city', 'guardian_postal_code',
      'guardian_cc', 'guardian_nif', 'guardian_date_of_birth', 'guardian_phone', 'guardian_email',
      'notes',
    ] as const
    for (const field of stringFields) {
      payload[field] = form[field].trim() || null
    }

    const { data, error } = await supabase
      .from('members')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      showToast('Erro ao guardar o membro. Tenta novamente.', 'error')
      setLoading(false)
      return
    }

    showToast('Membro registado com sucesso')
    router.push(`/membros/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Voltar */}
      <Link href="/membros" className="inline-flex items-center gap-2 text-sm text-quartel-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar aos membros
      </Link>

      {/* Barra de progresso — 4 passos */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isComplete = step.id <= completedSteps
          const isCurrent = step.id === completedSteps + 1 || (completedSteps === 4 && step.id === 4)
          return (
            <div key={step.id} className="flex-1 flex items-center gap-1">
              <div className="flex items-center gap-2 flex-1">
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isComplete ? 'bg-green-500 text-white' : isCurrent ? 'bg-accent text-white' : 'bg-quartel-700 text-quartel-400'
                }`}>
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : step.id}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${
                  isComplete ? 'text-green-400' : isCurrent ? 'text-white' : 'text-quartel-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full ${isComplete ? 'bg-green-500/50' : 'bg-quartel-700'}`} />
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Secção: Ficha */}
        <section className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-quartel-300 uppercase tracking-wide">Ficha de Inscrição</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nº Sócio / Inscrição"
              type="number"
              value={form.member_number}
              onChange={(e) => set('member_number', e.target.value)}
              placeholder="13"
            />
            <Input
              label="Data de Inscrição"
              type="date"
              value={form.enrollment_date}
              onChange={(e) => set('enrollment_date', e.target.value)}
            />
          </div>
        </section>

        {/* Secção: Seguro */}
        <section className={`border rounded-xl p-5 transition-colors ${
          hasInsurance
            ? 'bg-green-500/10 border-green-500/40'
            : errors.insurance
            ? 'bg-red-500/10 border-red-500/40'
            : 'bg-quartel-800 border-quartel-700'
        }`}>
          <label className="flex items-start gap-4 cursor-pointer select-none">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                className="sr-only"
                checked={hasInsurance}
                onChange={(e) => {
                  setHasInsurance(e.target.checked)
                  if (e.target.checked) setErrors((prev) => ({ ...prev, insurance: '' }))
                }}
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                hasInsurance ? 'bg-green-500 border-green-500' : 'border-quartel-500 bg-quartel-900'
              }`}>
                {hasInsurance && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`h-4 w-4 ${hasInsurance ? 'text-green-400' : 'text-quartel-400'}`} />
                <span className={`text-sm font-semibold ${hasInsurance ? 'text-green-300' : 'text-quartel-200'}`}>
                  Seguro Desportivo Anual *
                </span>
              </div>
              <p className="text-xs text-quartel-400 mt-0.5">
                Confirmo que o membro possui seguro desportivo anual válido. Obrigatório para inscrição.
              </p>
            </div>
          </label>
          {errors.insurance && (
            <p className="text-xs text-red-400 mt-2 ml-9">{errors.insurance}</p>
          )}
        </section>

        {/* Step 1 — Dados Pessoais (aberta por defeito) */}
        <FormSection title="Dados Pessoais" icon={<User className="h-4 w-4" />} defaultOpen={true}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome *" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} error={errors.first_name} placeholder="Raphael" />
            <Input label="Apelido *" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} error={errors.last_name} placeholder="Santana" />
            <div>
              <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="raphael@email.pt" />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div>
              <Input label="Telemóvel" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="939 192 209" />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div>
              <Input label="Data de Nascimento" type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div>
              <Select label="Género" options={genderOptions} placeholder="Selecionar..." value={form.gender} onChange={(e) => set('gender', e.target.value)} />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
          </div>
        </FormSection>

        {/* Step 2 — Morada */}
        <FormSection title="Morada" icon={<MapPin className="h-4 w-4" />} badge="Todos os campos opcionais">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Morada" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua José do Patrocínio, B/C B" />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div>
              <Input label="Cód. Postal" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder="1950-060" />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div>
              <Input label="Localidade" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Moscavide" />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
          </div>
        </FormSection>

        {/* Step 3 — Documentos & Saúde */}
        <FormSection title="Documentos & Saúde" icon={<FileText className="h-4 w-4" />} badge="NIF, CC, emergência, responsável">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input label="B.I. / Cartão de Cidadão" value={form.cc_number} onChange={(e) => set('cc_number', e.target.value)} placeholder="7V56V42D6" />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div>
              <Input label="NIF" value={form.nif} onChange={(e) => set('nif', e.target.value)} placeholder="267799322" />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-quartel-200 mb-1.5">Condições médicas</label>
              <textarea
                value={form.medical_conditions}
                onChange={(e) => set('medical_conditions', e.target.value)}
                placeholder="Ex: Hipertensão, diabetes..."
                rows={3}
                className="w-full rounded-lg border border-quartel-700 bg-quartel-900 text-white placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-quartel-200 mb-1.5">Alergias</label>
              <textarea
                value={form.allergies}
                onChange={(e) => set('allergies', e.target.value)}
                placeholder="Ex: Penicilina, látex..."
                rows={2}
                className="w-full rounded-lg border border-quartel-700 bg-quartel-900 text-white placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div>
              <Input label="Contacto de Emergência" value={form.emergency_contact_name} onChange={(e) => set('emergency_contact_name', e.target.value)} placeholder="Nome da pessoa" />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
            <div>
              <Input label="Telefone de Emergência" type="tel" value={form.emergency_contact_phone} onChange={(e) => set('emergency_contact_phone', e.target.value)} placeholder="939 192 209" />
              <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
            </div>
          </div>

          {/* Sub-secção: Responsável (menores) */}
          <div className="mt-6 pt-4 border-t border-quartel-700 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-quartel-400 uppercase tracking-wide">Responsável</h3>
              <p className="text-xs text-quartel-500 mt-0.5">Preencher apenas se o membro for menor de idade</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Nome do Responsável" value={form.guardian_name} onChange={(e) => set('guardian_name', e.target.value)} placeholder="Nome completo" />
                <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
              </div>
              <div className="sm:col-span-2">
                <Input label="Morada" value={form.guardian_address} onChange={(e) => set('guardian_address', e.target.value)} placeholder="Rua, número..." />
                <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
              </div>
              <div>
                <Input label="Cód. Postal" value={form.guardian_postal_code} onChange={(e) => set('guardian_postal_code', e.target.value)} placeholder="0000-000" />
                <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
              </div>
              <div>
                <Input label="Localidade" value={form.guardian_city} onChange={(e) => set('guardian_city', e.target.value)} placeholder="Lisboa" />
                <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
              </div>
              <div>
                <Input label="B.I. / C.C." value={form.guardian_cc} onChange={(e) => set('guardian_cc', e.target.value)} placeholder="Nº Documento" />
                <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
              </div>
              <div>
                <Input label="NIF" value={form.guardian_nif} onChange={(e) => set('guardian_nif', e.target.value)} placeholder="123456789" />
                <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
              </div>
              <div>
                <Input label="Data de Nascimento" type="date" value={form.guardian_date_of_birth} onChange={(e) => set('guardian_date_of_birth', e.target.value)} />
                <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
              </div>
              <div>
                <Input label="Telemóvel" type="tel" value={form.guardian_phone} onChange={(e) => set('guardian_phone', e.target.value)} placeholder="912 345 678" />
                <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
              </div>
              <div className="sm:col-span-2">
                <Input label="Email" type="email" value={form.guardian_email} onChange={(e) => set('guardian_email', e.target.value)} placeholder="responsavel@email.pt" />
                <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Step 4 — Notas */}
        <FormSection title="Notas" icon={<StickyNote className="h-4 w-4" />} badge="Observações internas">
          <div>
            <label className="block text-sm font-medium text-quartel-200 mb-1.5">Notas internas</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Observações sobre o membro..."
              rows={3}
              className="w-full rounded-lg border border-quartel-700 bg-quartel-900 text-white placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
            <p className="text-xs text-quartel-500 mt-1">(opcional)</p>
          </div>
        </FormSection>

        {errors.submit && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {errors.submit}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 justify-end pb-4">
          <Link href="/membros">
            <Button variant="ghost" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={loading}>Guardar Membro</Button>
        </div>
      </form>
    </div>
  )
}

// Secção colapsável do formulário
function FormSection({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn(
      'rounded-2xl border transition-all duration-200',
      open
        ? 'bg-quartel-800/60 border-quartel-700/60'
        : 'bg-quartel-900/40 border-quartel-800/40 hover:border-quartel-700/40'
    )}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg transition-colors',
            open ? 'bg-accent/15 text-accent' : 'bg-quartel-700/50 text-quartel-400'
          )}>
            {icon}
          </div>
          <div>
            <p className={cn('text-sm font-semibold', open ? 'text-white' : 'text-quartel-300')}>
              {title}
            </p>
            {badge && !open && (
              <p className="text-xs text-quartel-500 mt-0.5">{badge}</p>
            )}
          </div>
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 text-quartel-500 transition-transform duration-200',
          open ? 'rotate-180 text-quartel-300' : ''
        )} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

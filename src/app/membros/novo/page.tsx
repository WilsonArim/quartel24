'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const genderOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
]

export default function NovoMembroPage() {
  const router = useRouter()
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

    // Numeric fields
    if (form.member_number.trim()) {
      payload.member_number = parseInt(form.member_number.trim(), 10)
    }

    // String fields — empty string becomes null
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
      setErrors({ submit: 'Erro ao guardar o membro. Tenta novamente.' })
      setLoading(false)
      return
    }

    router.push(`/membros/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Voltar */}
      <Link href="/membros" className="inline-flex items-center gap-2 text-sm text-quartel-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar aos membros
      </Link>

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

        {/* Secção: Dados Pessoais */}
        <section className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-quartel-300 uppercase tracking-wide">Dados Pessoais do Titular</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome *" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} error={errors.first_name} placeholder="Raphael" />
            <Input label="Apelido *" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} error={errors.last_name} placeholder="Santana" />
            <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="raphael@email.pt" />
            <Input label="Telemóvel" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="939 192 209" />
            <Input label="Data de Nascimento" type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
            <Select label="Género" options={genderOptions} placeholder="Selecionar..." value={form.gender} onChange={(e) => set('gender', e.target.value)} />
          </div>
        </section>

        {/* Secção: Morada */}
        <section className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-quartel-300 uppercase tracking-wide">Morada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Morada" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua José do Patrocínio, B/C B" />
            </div>
            <Input label="Cód. Postal" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder="1950-060" />
            <Input label="Localidade" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Moscavide" />
          </div>
        </section>

        {/* Secção: Documentos */}
        <section className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-quartel-300 uppercase tracking-wide">Documentos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="B.I. / Cartão de Cidadão" value={form.cc_number} onChange={(e) => set('cc_number', e.target.value)} placeholder="7V56V42D6" />
            <Input label="NIF" value={form.nif} onChange={(e) => set('nif', e.target.value)} placeholder="267799322" />
          </div>
        </section>

        {/* Secção: Saúde & Emergência */}
        <section className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-quartel-300 uppercase tracking-wide">Saúde & Emergência</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-quartel-200 mb-1.5">Condições médicas</label>
              <textarea
                value={form.medical_conditions}
                onChange={(e) => set('medical_conditions', e.target.value)}
                placeholder="Ex: Hipertensão, diabetes..."
                rows={3}
                className="w-full rounded-lg border border-quartel-700 bg-quartel-900 text-white placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
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
            </div>
            <Input label="Contacto de Emergência" value={form.emergency_contact_name} onChange={(e) => set('emergency_contact_name', e.target.value)} placeholder="Nome da pessoa" />
            <Input label="Telefone de Emergência" type="tel" value={form.emergency_contact_phone} onChange={(e) => set('emergency_contact_phone', e.target.value)} placeholder="939 192 209 (vem8) Cristina" />
          </div>
        </section>

        {/* Secção: Responsável (menores) */}
        <section className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-quartel-300 uppercase tracking-wide">Responsável</h2>
            <p className="text-xs text-quartel-500 mt-0.5">Preencher apenas se o membro for menor de idade</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Nome do Responsável" value={form.guardian_name} onChange={(e) => set('guardian_name', e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="sm:col-span-2">
              <Input label="Morada" value={form.guardian_address} onChange={(e) => set('guardian_address', e.target.value)} placeholder="Rua, número..." />
            </div>
            <Input label="Cód. Postal" value={form.guardian_postal_code} onChange={(e) => set('guardian_postal_code', e.target.value)} placeholder="0000-000" />
            <Input label="Localidade" value={form.guardian_city} onChange={(e) => set('guardian_city', e.target.value)} placeholder="Lisboa" />
            <Input label="B.I. / C.C." value={form.guardian_cc} onChange={(e) => set('guardian_cc', e.target.value)} placeholder="Nº Documento" />
            <Input label="NIF" value={form.guardian_nif} onChange={(e) => set('guardian_nif', e.target.value)} placeholder="123456789" />
            <Input label="Data de Nascimento" type="date" value={form.guardian_date_of_birth} onChange={(e) => set('guardian_date_of_birth', e.target.value)} />
            <Input label="Telemóvel" type="tel" value={form.guardian_phone} onChange={(e) => set('guardian_phone', e.target.value)} placeholder="912 345 678" />
            <div className="sm:col-span-2">
              <Input label="Email" type="email" value={form.guardian_email} onChange={(e) => set('guardian_email', e.target.value)} placeholder="responsavel@email.pt" />
            </div>
          </div>
        </section>

        {/* Secção: Notas */}
        <section className="bg-quartel-800 border border-quartel-700 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-quartel-300 uppercase tracking-wide">Notas</h2>
          <label className="block text-sm font-medium text-quartel-200 mb-1.5">Notas internas</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Observações sobre o membro..."
            rows={3}
            className="w-full rounded-lg border border-quartel-700 bg-quartel-900 text-white placeholder:text-quartel-500 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          />
        </section>

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

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, addMonths, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata valor em euros (PT)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

// Formata data: 29/03/2026
export function formatDate(date: string): string {
  return format(parseISO(date), 'dd/MM/yyyy')
}

// Formata data longa: 29 de março de 2026
export function formatDateLong(date: string): string {
  return format(parseISO(date), "d 'de' MMMM 'de' yyyy", { locale: pt })
}

// Determina estado de subscrição com base na data de fim
export function getSubscriptionStatusLabel(endDate: string): {
  label: string
  color: 'green' | 'yellow' | 'red'
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = parseISO(endDate)
  const days = differenceInDays(end, today)

  if (days < 0) return { label: 'Expirada', color: 'red' }
  if (days <= 7) return { label: 'A expirar', color: 'yellow' }
  return { label: 'Ativa', color: 'green' }
}

// Iniciais do nome
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Calcula data de fim com base na duração em meses
export function calculateEndDate(startDate: string, durationMonths: number): string {
  const start = parseISO(startDate)
  const end = addMonths(start, durationMonths)
  // Subtrair 1 dia (ex: subscrição de 1 mês a partir de 01/04 termina em 30/04)
  end.setDate(end.getDate() - 1)
  return format(end, 'yyyy-MM-dd')
}

// Label da modalidade
export function getModalityLabel(modality: string): string {
  const labels: Record<string, string> = {
    ginasio: 'Ginásio',
    bjj: 'BJJ',
    mma: 'MMA',
  }
  return labels[modality] ?? modality
}

// Cor Tailwind da modalidade
export function getModalityColor(modality: string): string {
  const colors: Record<string, string> = {
    ginasio: 'bg-blue-500',
    bjj: 'bg-purple-500',
    mma: 'bg-red-500',
  }
  return colors[modality] ?? 'bg-gray-500'
}

// Label do método de pagamento
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Dinheiro',
    multibanco: 'Multibanco',
    transferencia: 'Transferência',
    mbway: 'MBWay',
    outro: 'Outro',
  }
  return labels[method] ?? method
}

// Label da categoria de idade
export function getAgeCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    adulto: 'Adulto',
    'criança': 'Criança',
    todos: 'Todos',
  }
  return labels[category] ?? category
}

# PROMPT #1 — Fundações do Projeto Quartel.24

Vais construir uma aplicação web de gestão para o ginásio **Quartel.24** (Ginásio, BJJ, MMA).

Lê primeiro os docs em `docs/PRD.md`, `docs/adr/ADR-001-stack-tecnologica.md` e `supabase-schema.sql` para entenderes o contexto completo.

---

## CONTEXTO

- **Produto:** App de gestão de membros, subscrições e pagamentos para o ginásio Quartel.24
- **Modalidades:** Ginásio, BJJ (Brazilian Jiu-Jitsu), MMA
- **Planos:** Individuais e Packs (combinados), categorias Criança e Adulto
- **Utilizadora:** Gestora de RH/subscrições, não técnica, precisa de UI ultra-simples e responsiva
- **Idioma da UI:** Português (PT-PT), zero inglês na interface
- **Stack:** Next.js 15 + React 19 + TypeScript strict + Tailwind CSS + Supabase (@supabase/ssr) + Lucide React + date-fns
- **Deploy:** Vercel + Supabase Cloud

---

## TAREFA

Criar o projeto Next.js completo com TODA a estrutura. Isto inclui:
1. Fundações (types, supabase client, utils, middleware)
2. Componentes UI base reutilizáveis
3. Layout (sidebar, header, mobile nav)
4. TODAS as páginas (login, dashboard, membros, pagamentos, planos)

---

## ESTRUTURA DE FICHEIROS A CRIAR

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx                    → Root layout (importa sidebar/header)
│   ├── page.tsx                      → Dashboard
│   ├── login/
│   │   └── page.tsx                  → Página de login
│   ├── membros/
│   │   ├── page.tsx                  → Lista de membros
│   │   ├── novo/
│   │   │   └── page.tsx              → Formulário novo membro
│   │   └── [id]/
│   │       └── page.tsx              → Perfil do membro
│   ├── pagamentos/
│   │   └── page.tsx                  → Histórico de pagamentos
│   └── planos/
│       └── page.tsx                  → Gestão de planos
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               → Sidebar de navegação (desktop)
│   │   ├── Header.tsx                → Header com titulo da página + mobile menu
│   │   └── MobileNav.tsx             → Navegação bottom bar (mobile)
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       ├── EmptyState.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 → Browser client
│   │   ├── server.ts                 → Server client (cookies)
│   │   └── middleware.ts             → updateSession helper
│   ├── types.ts                      → Todos os tipos TypeScript
│   └── utils.ts                      → Funções utilitárias
└── middleware.ts                      → Auth middleware (protege rotas)
```

---

## ESPECIFICAÇÕES DETALHADAS

### 1. `src/lib/types.ts`

```typescript
// Tipos para a base de dados (mapear diretamente ao schema SQL)

export type Member = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  gender: 'M' | 'F' | 'Outro' | null
  address: string | null
  city: string | null
  postal_code: string | null
  nif: string | null
  cc_number: string | null
  medical_conditions: string | null
  allergies: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
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
```

### 2. `src/lib/supabase/client.ts`
Usar `createBrowserClient` de `@supabase/ssr` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 3. `src/lib/supabase/server.ts`
Usar `createServerClient` de `@supabase/ssr` com cookies do Next.js (`cookies()` de `next/headers`).

### 4. `src/lib/supabase/middleware.ts`
Função `updateSession(request)` que cria um server client com cookies do request/response para refresh de tokens.

### 5. `src/middleware.ts`
- Usar `updateSession`
- Proteger todas as rotas exceto `/login`
- Redirecionar para `/login` se não autenticado
- Redirecionar para `/` se autenticado e na rota `/login`
- Config: `matcher` que exclui `_next/static`, `_next/image`, `favicon.ico`

### 6. `src/lib/utils.ts`
```typescript
// Instalar: npm install clsx tailwind-merge

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, addMonths } from 'date-fns'
import { pt } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatCurrency(amount: number): string
// Formato: 35,00 € (formato PT)

export function formatDate(date: string): string
// Formato: 29/03/2026

export function formatDateLong(date: string): string
// Formato: 29 de março de 2026

export function getSubscriptionStatusLabel(endDate: string): { label: string; color: 'green' | 'yellow' | 'red' }
// active (>7 dias) → { label: 'Ativa', color: 'green' }
// expiring (≤7 dias) → { label: 'A expirar', color: 'yellow' }
// expired (<today) → { label: 'Expirada', color: 'red' }

export function getInitials(firstName: string, lastName: string): string
// "João" + "Silva" → "JS"

export function calculateEndDate(startDate: string, durationMonths: number): string
// Usa addMonths do date-fns

export function getModalityLabel(modality: string): string
// 'ginasio' → 'Ginásio', 'bjj' → 'BJJ', 'mma' → 'MMA'

export function getModalityColor(modality: string): string
// 'ginasio' → 'bg-blue-500', 'bjj' → 'bg-purple-500', 'mma' → 'bg-red-500'

export function getPaymentMethodLabel(method: string): string
// 'cash' → 'Dinheiro', 'multibanco' → 'Multibanco', 'transferencia' → 'Transferência', 'mbway' → 'MBWay', 'outro' → 'Outro'

export function getAgeCategoryLabel(category: string): string
// 'adulto' → 'Adulto', 'criança' → 'Criança', 'todos' → 'Todos'
```

### 7. Tema Tailwind (`tailwind.config.ts`)
Adicionar cores custom:
```
colors: {
  quartel: {
    50: '#f0f1f5',
    100: '#d9dbe5',
    200: '#b3b7cb',
    300: '#8d93b1',
    400: '#676f97',
    500: '#414b7d',
    600: '#343c64',
    700: '#272d4b',
    800: '#1a1e32',
    900: '#0d0f19',
    950: '#06070c',
  },
  accent: {
    DEFAULT: '#e63946',
    light: '#ff6b6b',
    dark: '#c1121f',
  },
}
```

### 8. `src/app/globals.css`
Reset limpo com Tailwind directives. Body com `bg-quartel-950 text-white` como default. Scrollbar estilizada. Transições suaves.

### 9. Componentes UI (`src/components/ui/`)

Todos os componentes devem:
- Aceitar `className` via prop e usar `cn()` para merge
- Ser tipados com TypeScript (sem `any`)
- Ter variantes via props (ex: Button tem `variant`, `size`)
- Usar `'use client'` apenas se tiverem estado/interatividade

**Button:** variantes `primary` (accent), `secondary` (quartel-600), `danger` (red), `ghost` (transparente). Sizes: `sm`, `md`, `lg`. Estado `loading` com spinner.

**Input:** Label integrado, mensagem de erro, ícone opcional. Border `quartel-700`, focus `accent`.

**Select:** Mesmo estilo que Input. Opções com label/value.

**Card:** Container com `bg-quartel-800 border-quartel-700 rounded-xl`. Variante com header.

**Badge:** Para estados e modalidades. Cores: green, yellow, red, blue, purple. Sizes: `sm`, `md`.

**Modal:** Overlay escuro, centrado, responsivo. Header, body, footer. Fechar com X e click fora.

**Table:** Responsiva (scroll horizontal em mobile). Header cinza, rows com hover. Empty state integrado.

**EmptyState:** Ícone + mensagem + botão de ação opcional.

**LoadingSpinner:** Spinner animado com tamanho configurável.

### 10. Layout (`src/components/layout/`)

**Sidebar.tsx:**
- Fixa à esquerda, `w-64`, `bg-quartel-900`
- Logo "QUARTEL.24" no topo com tipografia bold/militar
- Links de navegação com ícones Lucide: Dashboard (LayoutDashboard), Membros (Users), Pagamentos (CreditCard), Planos (ClipboardList)
- Link ativo com `bg-quartel-700` e borda accent à esquerda
- Botão "Sair" no fundo
- Escondida em mobile (`hidden lg:flex`)

**Header.tsx:**
- Mostra em mobile e desktop
- Título da página atual (dinâmico via pathname)
- Botão hamburger em mobile que abre o MobileNav
- Em desktop: mostra data atual

**MobileNav.tsx:**
- Bottom bar fixa em mobile (`lg:hidden`)
- 4 ícones: Dashboard, Membros, Pagamentos, Planos
- Ícone ativo com cor accent

**Root Layout (`src/app/layout.tsx`):**
- Importa Sidebar + Header + MobileNav
- Layout: sidebar fixa + conteúdo com padding
- Busca sessão do Supabase server-side
- Se não autenticado e rota não é /login, não mostra layout (middleware trata redirect)
- Mobile: conteúdo full-width com bottom nav
- Desktop: sidebar + conteúdo à direita

### 11. Página de Login (`src/app/login/page.tsx`)

- Centrada na tela, sem sidebar/header
- Logo "QUARTEL.24" grande
- Subtítulo: "Sistema de Gestão"
- Campos: Email, Password
- Botão "Entrar" com loading state
- Mensagem de erro em caso de falha
- Usa `supabase.auth.signInWithPassword()`
- Redirect para `/` após sucesso
- Design escuro, clean, impactante

### 12. Dashboard (`src/app/page.tsx`)

- **6 cards de métricas** em grid (2 colunas mobile, 3 desktop):
  - Membros Ativos (ícone Users, cor blue)
  - Subscrições Ativas (ícone CheckCircle, cor green)
  - A Expirar em 7 dias (ícone AlertTriangle, cor yellow)
  - Expiradas (ícone XCircle, cor red)
  - Receita do Mês (ícone TrendingUp, cor accent) — formatCurrency
  - Pagamentos Hoje (ícone CreditCard, cor purple)

- **Lista "Subscrições a Expirar"** abaixo dos cards:
  - Tabela com: Nome, Plano, Modalidades (badges coloridos), Expira em, Dias restantes
  - Cada linha clicável → vai para o perfil do membro
  - Se vazia: EmptyState "Nenhuma subscrição a expirar nos próximos 7 dias"

- Dados via Supabase RPC: `get_dashboard_stats()` e `get_expiring_subscriptions()`
- Chamar `expire_subscriptions()` no carregamento

### 13. Lista de Membros (`src/app/membros/page.tsx`)

- **Header** com título "Membros" e botão "Novo Membro" (link para `/membros/novo`)
- **Barra de pesquisa** — filtra por nome, apelido, NIF, email, telefone (client-side search com debounce)
- **Filtros** — dropdown por estado: Todos, Ativos, Inativos, Subscrição Expirada
- **Tabela/Cards** de membros:
  - Desktop: tabela com colunas Nome, Telefone, Plano Atual, Modalidades, Estado, Expira em
  - Mobile: cards com info resumida
  - Cada membro clicável → vai para `/membros/[id]`
  - Modalidades mostradas como badges coloridos (azul ginásio, roxo BJJ, vermelho MMA)
  - Estado da subscrição com Badge (verde/amarelo/vermelho)
  - Se sem membros: EmptyState
- **Query Supabase:** `members` com join a `subscriptions` (status = 'active') e `subscription_plans`

### 14. Novo Membro (`src/app/membros/novo/page.tsx`)

- **Formulário** organizado em secções com títulos visuais:
  1. **Dados Pessoais** — first_name*, last_name*, email, phone, date_of_birth (date picker), gender (select M/F/Outro)
  2. **Morada** — address, city, postal_code
  3. **Documentos** — nif, cc_number
  4. **Saúde** — medical_conditions (textarea), allergies (textarea), emergency_contact_name, emergency_contact_phone
  5. **Notas** — notes (textarea)
- `*` = obrigatório (apenas nome e apelido)
- Botões: "Cancelar" (volta para lista) e "Guardar Membro" (submit)
- Validação client-side com mensagens em português
- Após sucesso: redirect para o perfil do novo membro com toast de sucesso
- Insert no Supabase: tabela `members`

### 15. Perfil do Membro (`src/app/membros/[id]/page.tsx`)

- **Header** com iniciais/foto, nome completo, badge de estado (ativo/inativo)
- **Botões de ação:** "Editar", "Nova Subscrição", "Registar Pagamento"
- **Secção Dados Pessoais** — Card com todos os dados da ficha (read-only, editável via modal)
- **Secção Subscrição Atual** — Card com:
  - Nome do plano, modalidades (badges), preço
  - Data início → Data fim
  - Estado (badge verde/amarelo/vermelho)
  - Se sem subscrição: botão "Atribuir Plano"
- **Secção Histórico de Pagamentos** — Tabela com:
  - Data, Valor, Método, Notas
  - Se vazio: "Sem pagamentos registados"
- **Modal "Nova Subscrição":**
  - Select de plano (mostra nome + modalidades + preço)
  - Date picker para data de início (default: hoje)
  - Data de fim calculada automaticamente
  - Insert em `subscriptions`
- **Modal "Registar Pagamento":**
  - Valor (pré-preenchido com preço do plano atual)
  - Data (default: hoje)
  - Método de pagamento (select)
  - Notas (textarea opcional)
  - Insert em `payments`
- **Modal "Editar Membro":**
  - Mesmo formulário do registo, pré-preenchido
  - Update em `members`

### 16. Pagamentos (`src/app/pagamentos/page.tsx`)

- **Header** com título "Pagamentos" e resumo: total do mês atual
- **Filtros:** período (este mês, último mês, todos), método de pagamento
- **Tabela** com: Data, Membro (nome clicável → perfil), Valor, Método, Plano, Notas
- Ordenada por data DESC
- Query: `payments` com join a `members` e `subscription_plans`

### 17. Planos (`src/app/planos/page.tsx`)

- **Header** com título "Planos de Subscrição" e botão "Novo Plano"
- **Grid de cards** (um por plano):
  - Nome do plano
  - Badges de modalidades (coloridos)
  - Badge de categoria (Adulto/Criança/Todos)
  - Badge de tipo (Individual/Pack)
  - Preço em destaque
  - Duração (X meses)
  - Estado (ativo/inativo)
  - Botões: Editar, Desativar/Ativar
- **Modal "Novo/Editar Plano":**
  - Nome, descrição
  - Checkboxes de modalidades (Ginásio, BJJ, MMA) — se >1 selecionada, plan_type = 'pack' automaticamente
  - Select de categoria (Adulto, Criança, Todos)
  - Duração (meses)
  - Preço
  - Insert/Update em `subscription_plans`

---

## REGRAS DE CÓDIGO

1. **TypeScript strict** — zero `any`, todos os tipos definidos
2. **`'use client'`** apenas em componentes com estado, eventos, ou hooks de browser
3. **Server Components** por defeito — fetch de dados no servidor
4. **Imports com `@/`** alias
5. **Comentários em português** onde necessário
6. **Sem boilerplate** — código limpo e direto
7. **Instalar dependências em falta:** `npm install clsx tailwind-merge`
8. **Todas as strings da UI em português** (botões, labels, placeholders, mensagens de erro, empty states)
9. **Responsivo** — mobile-first, testar que tudo funciona em ambos
10. **Cores das modalidades consistentes** em toda a app: Ginásio=azul, BJJ=roxo, MMA=vermelho
11. **O `.env.local` já existe** com placeholders — não o sobrescrever

---

## PRIORIDADE DE EXECUÇÃO

1. Instalar dependências (`clsx`, `tailwind-merge`)
2. Ficheiros de lib (types, supabase clients, utils, middleware)
3. Tailwind config + globals.css
4. Componentes UI
5. Layout (sidebar, header, mobile nav)
6. Root layout
7. Login page
8. Dashboard
9. Membros (lista → novo → perfil)
10. Pagamentos
11. Planos
12. Testar build (`npm run build`) e corrigir erros

Ao terminar, corre `npm run build` e corrige TODOS os erros de TypeScript e build.

# PROMPT #5 — Visual Weight & Depth

Lê `node_modules/next/dist/docs/01-app/` antes de começar.

## DIAGNÓSTICO

O PROMPT-04 aplicou a estrutura visual correcta mas os valores ficaram demasiado conservadores. O resultado parece morto por 4 razões específicas:

1. **Números são demasiado pequenos** — `text-2xl` nas métricas. O número É o hero, não o label.
2. **Gradientes invisíveis** — `from-blue-500/8` (8% opacidade) é literalmente imperceptível.
3. **Sem profundidade** — fundo é `bg-quartel-950` puro/flat sem qualquer textura.
4. **Sem âncora visual nos cards** — não há nada que "ancora" cada card à sua categoria de cor.

Este prompt resolve exactamente estes 4 problemas. **Não mudar arquitectura, não mudar funcionalidade** — apenas intensidade visual.

---

## 1. `src/app/globals.css` — Adicionar textura de fundo

Após o bloco `.nav-active-indicator::before { ... }`, adicionar:

```css
/* ===================== TEXTURA DE FUNDO ===================== */

/* Dot-grid para main content area */
.bg-dot-grid {
  background-image: radial-gradient(
    circle,
    rgba(39, 45, 75, 0.45) 1px,
    transparent 1px
  );
  background-size: 22px 22px;
}

/* Vignette overlay para dot-grid não ficar pesada nas bordas */
.bg-dot-grid-vignette {
  background-image:
    radial-gradient(ellipse at center, transparent 40%, #06070c 100%),
    radial-gradient(circle, rgba(39, 45, 75, 0.45) 1px, transparent 1px);
  background-size: auto, 22px 22px;
}
```

---

## 2. `src/components/layout/AppShell.tsx` — Aplicar textura

Encontrar o `<main>` que envolve `{children}`. Adicionar as classes `bg-dot-grid` ao `<main>`:

**Antes (algo como):**
```tsx
<main className="lg:pl-64 flex-1 min-h-screen">
  <div className="p-4 lg:p-6">
```

**Depois:**
```tsx
<main className="lg:pl-64 flex-1 min-h-screen bg-dot-grid">
  <div className="p-4 lg:p-6">
```

Se o `<main>` já tiver `bg-quartel-950` ou `bg-quartel-900`, substituir por `bg-quartel-950 bg-dot-grid`.

---

## 3. `src/app/page.tsx` — Cards de métricas com impacto real

### 3a. Números hero

Localizar:
```tsx
<p className="text-2xl font-black text-white tracking-tight">{value}</p>
```

Substituir por:
```tsx
<p className="text-4xl font-black text-white tracking-tight tabular-nums leading-none">{value}</p>
```

### 3b. Gradientes visíveis

No array `metricCards`, aumentar a opacidade de todos os gradientes de `/8` para `/20`:

```tsx
// Membros Ativos
gradient: 'from-blue-500/20 to-transparent',
// Subscrições Ativas
gradient: 'from-green-500/20 to-transparent',
// A Expirar
gradient: 'from-yellow-500/20 to-transparent',
// Expiradas
gradient: 'from-red-500/20 to-transparent',
// Receita do Mês
gradient: 'from-accent/20 to-transparent',
// Pagamentos Hoje
gradient: 'from-purple-500/20 to-transparent',
```

Igualmente, aumentar opacidade dos `bg` dos ícones de `/10` para `/20`:
```tsx
// Antes: bg: 'bg-blue-500/10'
// Depois: bg: 'bg-blue-500/20'
// (aplicar a todos os 6 cards)
```

### 3c. Border top colorida — âncora visual por categoria

No array `metricCards`, adicionar campo `topBorder` a cada entrada:

```tsx
const metricCards = [
  {
    label: 'Membros Ativos',
    // ...
    topBorder: 'border-t-2 border-t-blue-500/70',
  },
  {
    label: 'Subscrições Ativas',
    // ...
    topBorder: 'border-t-2 border-t-green-500/70',
  },
  {
    label: 'A Expirar (7 dias)',
    // ...
    topBorder: 'border-t-2 border-t-yellow-500/70',
  },
  {
    label: 'Expiradas',
    // ...
    topBorder: 'border-t-2 border-t-red-500/70',
  },
  {
    label: 'Receita do Mês',
    // ...
    topBorder: 'border-t-2 border-t-accent/70',
  },
  {
    label: 'Pagamentos Hoje',
    // ...
    topBorder: 'border-t-2 border-t-purple-500/70',
  },
]
```

Actualizar o `map` para incluir `topBorder` na destructuring e nas classes do `<Card>`:

```tsx
{metricCards.map(({ label, value, icon: Icon, color, bg, gradient, ring, href, topBorder }, i) => (
  <Link key={label} href={href} className={`group animate-fade-in-up stagger-${i + 1}`}>
    <Card
      variant="gradient"
      className={`bg-gradient-to-br ${gradient} ${topBorder} border-quartel-700/50 hover:border-quartel-600 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 cursor-pointer ${ring}`}
    >
```

### 3d. Ícones maiores

Localizar dentro do card:
```tsx
<div className={`p-2.5 rounded-xl ${bg} ring-1 ring-white/5`}>
  <Icon className={`h-5 w-5 ${color}`} />
</div>
```

Substituir por:
```tsx
<div className={`p-3 rounded-xl ${bg} ring-1 ring-white/10`}>
  <Icon className={`h-6 w-6 ${color}`} />
</div>
```

---

## 4. `src/app/membros/novo/page.tsx` (ou ficheiro equivalente) — Formulário colapsável

Ler o ficheiro antes de editar para perceber a estrutura actual.

O formulário "Novo Membro" tem várias secções (Dados Pessoais, Contacto, Subscrição, etc.). Implementar accordion colapsável:

- **Secção 1 (Dados Pessoais)** — aberta por defeito
- **Restantes secções** — colapsadas por defeito, expandem ao clicar no header

Criar um componente local `FormSection` dentro do ficheiro (não precisa de ficheiro separado):

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
```

Envolver cada secção do formulário com `<FormSection>`. Exemplo:

```tsx
<FormSection
  title="Dados Pessoais"
  icon={<User className="h-4 w-4" />}
  defaultOpen={true}
>
  {/* campos: nome, data de nascimento, género, NIF */}
</FormSection>

<FormSection
  title="Contacto"
  icon={<Phone className="h-4 w-4" />}
  badge="Email, telefone e morada"
  defaultOpen={false}
>
  {/* campos de contacto */}
</FormSection>

<FormSection
  title="Subscrição Inicial"
  icon={<CreditCard className="h-4 w-4" />}
  badge="Opcional — pode adicionar depois"
  defaultOpen={false}
>
  {/* campos de subscrição */}
</FormSection>
```

Importar os ícones necessários de `lucide-react`.

---

## 5. `src/components/layout/Sidebar.tsx` — Aumentar peso do estado activo

Localizar o link activo:
```tsx
isActive
  ? 'bg-quartel-700/80 text-white nav-active-indicator'
```

Substituir por:
```tsx
isActive
  ? 'bg-quartel-700 text-white nav-active-indicator shadow-lg shadow-black/20'
```

Localizar o ícone activo:
```tsx
<Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-accent' : '')} />
```

Substituir por:
```tsx
<Icon className={cn('h-[18px] w-[18px] shrink-0 transition-none', isActive ? 'text-accent drop-shadow-[0_0_6px_rgba(230,57,70,0.6)]' : '')} />
```

---

## 6. `src/app/globals.css` — Aumentar intensidade do `pulse-glow`

Localizar o keyframe `pulse-glow`:
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0); }
  50% { box-shadow: 0 0 20px 4px rgba(230, 57, 70, 0.3); }
}
```

Substituir por:
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0); opacity: 0.7; }
  50% { box-shadow: 0 0 12px 3px rgba(230, 57, 70, 0.5); opacity: 1; }
}
```

---

## 7. `src/app/membros/MembrosContent.tsx` — Urgência nas expiradas

Localizar a listagem de alertas de expiry (secção "Subscrições a Expirar" no dashboard está em `page.tsx`, mas a lista de membros em `MembrosContent.tsx` também tem estados).

Nos cards/linhas de membros com subscrição expirada ou a expirar, aumentar a intensidade visual:

**Status badges** — verificar se `Badge` tem as cores correctas. No ficheiro, localizar onde é calculado `subStatusColor` ou similar. Se usar `'red'` badge, assegurar que o badge tem background visível.

Localizar o componente `Badge` (`src/components/ui/Badge.tsx`) e ler antes de editar.

Se o badge de "Expirado" tiver opacidade baixa, aumentar:
```tsx
// No Badge.tsx, cor 'red':
// Antes: 'bg-red-500/10 text-red-400 border-red-500/20'
// Depois: 'bg-red-500/15 text-red-300 border-red-500/30'
```

---

## REGRAS

1. **Ler cada ficheiro antes de editar** — `Read` tool obrigatório
2. **Zero `any`** — TypeScript strict
3. **Não instalar libraries** — apenas o que já existe
4. **Não quebrar funcionalidade** — só visual
5. **`npm run build` antes de commitar**
6. **Comentários em português**

## CRITÉRIOS DE CONCLUSÃO

- [ ] Números das métricas no dashboard em `text-4xl font-black tabular-nums`
- [ ] Gradientes dos cards a `from-*/20` (visíveis)
- [ ] Border top colorida em cada metric card
- [ ] Ícones dos cards em `h-6 w-6` com fundo `/20`
- [ ] Textura dot-grid no `<main>` do AppShell
- [ ] Formulário "Novo Membro" com secções colapsáveis (1ª aberta por defeito)
- [ ] Sidebar: estado activo mais forte, ícone com glow
- [ ] `pulse-glow` mais intenso
- [ ] `npm run build` — zero erros
- [ ] `npm run lint` — zero erros
- [ ] 1 commit por área (mínimo 4 commits atómicos)

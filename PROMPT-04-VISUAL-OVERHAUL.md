# PROMPT #4 — Visual Overhaul

Lê `node_modules/next/dist/docs/01-app/` antes de começar. Lê também `SKILLS/design-system/SKILL.md`.

## CONTEXTO

O Quartel.24 é um ginásio de combate — BJJ, MMA, Ginásio. A UI está funcional mas genérica. Precisa de uma transformação visual completa: dark premium, militar-tático, com personalidade de ginásio de elite. Não um dashboard de contabilidade — um cockpit de operações de combate.

**Referências visuais:** Linear.app (dark UI), Vercel Dashboard, UFC Performance Institute, Duolingo (feedback imediato), Stripe Dashboard (métricas de negócio)

**Princípios:**
- Cada pixel deve comunicar: força, precisão, profissionalismo
- Nunca genérico — cada elemento tem personalidade do Quartel.24
- Animações com propósito — entrance, feedback, transição; nunca decorativas sem função
- Dark mode profundo com acentos vermelhos estratégicos
- Hierarquia visual clara: o utilizador sabe sempre o que fazer a seguir

---

## 1. `globals.css` — Sistema de animações e efeitos

Substituir o ficheiro completo com o seguinte sistema:

```css
@import "tailwindcss";

@theme {
  /* Paleta Quartel — escura/militar */
  --color-quartel-50: #f0f1f5;
  --color-quartel-100: #d9dbe5;
  --color-quartel-200: #b3b7cb;
  --color-quartel-300: #8d93b1;
  --color-quartel-400: #676f97;
  --color-quartel-500: #414b7d;
  --color-quartel-600: #343c64;
  --color-quartel-700: #272d4b;
  --color-quartel-800: #1a1e32;
  --color-quartel-900: #0d0f19;
  --color-quartel-950: #06070c;

  /* Accent */
  --color-accent: #e63946;
  --color-accent-light: #ff6b6b;
  --color-accent-dark: #c1121f;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  background-color: #06070c;
  color: #f0f1f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #272d4b; border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: #414b7d; }

/* Transições base — só propriedades seguras */
*, *::before, *::after {
  transition-property: color, background-color, border-color, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
[data-no-transition], [data-no-transition] * { transition: none !important; }

/* ===================== KEYFRAMES ===================== */

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0); }
  50% { box-shadow: 0 0 20px 4px rgba(230, 57, 70, 0.3); }
}

@keyframes count-up {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  from { background-position: -200% center; }
  to { background-position: 200% center; }
}

/* ===================== CLASSES DE ANIMAÇÃO ===================== */

.animate-fade-in { animation: fade-in 0.3s ease-out both; }
.animate-fade-in-up { animation: fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-fade-in-down { animation: fade-in-down 0.25s ease-out both; }
.animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-slide-in-left { animation: slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-in { animation: fade-in-up 0.2s ease-out; } /* toast compat */

/* Stagger delays para listas */
.stagger-1 { animation-delay: 0ms; }
.stagger-2 { animation-delay: 60ms; }
.stagger-3 { animation-delay: 120ms; }
.stagger-4 { animation-delay: 180ms; }
.stagger-5 { animation-delay: 240ms; }
.stagger-6 { animation-delay: 300ms; }

/* ===================== EFEITOS ===================== */

/* Glass morphism */
.glass {
  background: rgba(26, 30, 50, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(39, 45, 75, 0.8);
}

/* Glow vermelho */
.glow-accent {
  box-shadow: 0 0 20px rgba(230, 57, 70, 0.25), 0 0 60px rgba(230, 57, 70, 0.08);
}

.glow-accent-sm {
  box-shadow: 0 0 10px rgba(230, 57, 70, 0.2);
}

/* Gradiente de texto */
.text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #b3b7cb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-accent {
  background: linear-gradient(135deg, #ff6b6b 0%, #e63946 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Shimmer skeleton */
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(39, 45, 75, 0.4) 25%,
    rgba(65, 75, 125, 0.3) 50%,
    rgba(39, 45, 75, 0.4) 75%
  );
  background-size: 200% auto;
  animation: shimmer 1.5s linear infinite;
  border-radius: 6px;
}

/* Linha de destaque accent na sidebar */
.nav-active-indicator {
  position: relative;
}
.nav-active-indicator::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: #e63946;
  border-radius: 0 3px 3px 0;
  box-shadow: 0 0 8px rgba(230, 57, 70, 0.5);
}
```

---

## 2. `components/ui/Card.tsx` — Variantes premium

```tsx
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
  variant?: 'default' | 'glass' | 'gradient' | 'accent'
  glow?: boolean
  animate?: boolean
}
```

Variantes:
- `default` — actual (`bg-quartel-800 border-quartel-700`) mas com `hover:border-quartel-600 hover:shadow-lg hover:shadow-black/30` e `transition-all duration-200`
- `glass` — `glass` class (backdrop-blur) + `border border-white/5`
- `gradient` — `bg-gradient-to-br from-quartel-800 to-quartel-900 border border-quartel-700/50`
- `accent` — `bg-gradient-to-br from-accent/10 to-quartel-800 border border-accent/20`

Prop `glow` adiciona `glow-accent`.
Prop `animate` adiciona `animate-fade-in-up`.

---

## 3. `components/ui/Button.tsx` — Efeitos de hover e active

Melhorar variante `primary`:
```
bg-accent hover:bg-accent-dark
shadow-lg shadow-accent/20
hover:shadow-accent/40 hover:shadow-xl
hover:-translate-y-0.5
active:translate-y-0 active:shadow-md
```

Variante `secondary`:
```
bg-quartel-700/80 hover:bg-quartel-600
border border-quartel-600 hover:border-quartel-500
hover:-translate-y-0.5
```

Adicionar variante `outline`:
```
bg-transparent border border-accent/50 text-accent
hover:bg-accent/10 hover:border-accent
hover:-translate-y-0.5
```

---

## 4. `components/layout/Sidebar.tsx` — Redesign completo

Substituir com:

**Logo area:**
```tsx
<div className="px-4 py-6 border-b border-quartel-800/50">
  <Link href="/" className="flex flex-col items-center gap-3 group">
    <div className="relative">
      <Image
        src="/quartel24.jpg"
        alt="Quartel.24"
        width={80}
        height={80}
        className="rounded-2xl object-cover ring-2 ring-quartel-700 group-hover:ring-accent/50 transition-all duration-300"
      />
      {/* Glow no hover */}
      <div className="absolute inset-0 rounded-2xl bg-accent/0 group-hover:bg-accent/5 transition-all duration-300" />
    </div>
    <div className="text-center">
      <p className="text-xl font-black tracking-[0.2em] text-white uppercase leading-none">
        QUARTEL<span className="text-gradient-accent">.24</span>
      </p>
      <p className="text-[10px] text-quartel-500 tracking-[0.25em] uppercase mt-1">
        Sistema de Gestão
      </p>
    </div>
  </Link>
</div>
```

**Nav links:**
```tsx
<Link
  key={href}
  href={href}
  className={cn(
    'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-quartel-700/80 text-white nav-active-indicator'
      : 'text-quartel-400 hover:bg-quartel-800/80 hover:text-quartel-100 hover:translate-x-0.5'
  )}
>
  <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-accent' : '')} />
  {label}
  {isActive && (
    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
  )}
</Link>
```

**Botão Sair** — mesmo estilo ghost com ícone e hover vermelho:
```tsx
className="... hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
```

---

## 5. `components/layout/Header.tsx` — Redesign

```tsx
<header className="h-16 flex items-center justify-between px-4 lg:px-6
  border-b border-quartel-800/60 bg-quartel-950/80
  backdrop-blur-md sticky top-0 z-30">

  {/* Esquerda: breadcrumb */}
  <div className="flex items-center gap-3">
    <button onClick={onMenuClick} className="lg:hidden ...">
      <Menu className="h-5 w-5" />
    </button>
    <div>
      <h1 className="text-sm font-semibold text-white leading-none">{title}</h1>
      {/* Breadcrumb subtil apenas no desktop */}
      <p className="hidden lg:block text-[11px] text-quartel-500 mt-0.5">Quartel.24</p>
    </div>
  </div>

  {/* Direita: data + indicador ao vivo */}
  <div className="hidden lg:flex items-center gap-4">
    {/* Indicador "ao vivo" */}
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      <span className="text-xs text-quartel-500">Ao vivo</span>
    </div>
    <span className="text-sm text-quartel-400 capitalize">{today}</span>
  </div>
</header>
```

---

## 6. `app/page.tsx` (Dashboard) — Hero redesign

### Cards de métricas — gradientes por categoria

Cada card de métrica deve ter um gradiente subtil de fundo específico por categoria:

```tsx
// Mapeamento de cores por card (acrescentar ao array metricCards):
// gradient: classe CSS do gradiente
const metricCards = [
  {
    ...,
    gradient: 'from-blue-500/8 to-transparent',
    ring: 'hover:ring-1 hover:ring-blue-500/20',
  },
  // green, yellow, red, accent (vermelho), purple
]
```

Estrutura de cada card:
```tsx
<Link href={href} className="group animate-fade-in-up stagger-{n}">
  <Card
    variant="gradient"
    className={cn(
      `bg-gradient-to-br ${gradient} border-quartel-700/50`,
      `hover:border-quartel-600 hover:shadow-xl hover:shadow-black/40`,
      `hover:-translate-y-1 cursor-pointer`,
      ring
    )}
  >
    <div className="flex items-start justify-between">
      {/* Ícone com fundo colorido */}
      <div className={`p-2.5 rounded-xl ${bg} ring-1 ring-white/5`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      {/* Seta no hover */}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-quartel-500">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </div>
    <div className="mt-4">
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-xs text-quartel-400 mt-0.5 font-medium">{label}</p>
    </div>
  </Card>
</Link>
```

Importar `ArrowUpRight` de `lucide-react`.

### Secção de alertas — cabeçalho com mais impacto

```tsx
<Card
  variant="default"
  glow={expiring.some(i => i.days_remaining === 0)}  // glow se há expiração hoje
  header={
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-yellow-500/10">
          <Bell className="h-4 w-4 text-yellow-400" />
        </div>
        <h2 className="text-sm font-semibold text-white">
          Subscrições a Expirar
        </h2>
      </div>
      {expiring.length > 0 && (
        <Badge color="yellow" size="sm">{expiring.length} alerta{expiring.length !== 1 ? 's' : ''}</Badge>
      )}
    </div>
  }
>
```

---

## 7. `components/ui/Modal.tsx` — Animação de entrada

Adicionar `animate-scale-in` ao container do modal e melhorar o backdrop:

```tsx
{/* Backdrop com animação */}
<div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose} />

{/* Modal com scale-in */}
<div className={cn(
  'relative z-10 w-full max-w-lg rounded-2xl',
  'bg-gradient-to-b from-quartel-800 to-quartel-900',
  'border border-quartel-700/60',
  'shadow-2xl shadow-black/60',
  'max-h-[90vh] flex flex-col',
  'animate-scale-in',
  className
)}>
```

Melhorar o header do modal:
```tsx
<div className="flex items-center justify-between px-6 py-4 border-b border-quartel-700/50 shrink-0">
  <h2 className="text-base font-bold text-white">{title}</h2>
  <button
    onClick={onClose}
    className="text-quartel-500 hover:text-white p-1.5 rounded-lg hover:bg-quartel-700 transition-colors cursor-pointer"
  >
    <X className="h-4 w-4" />
  </button>
</div>
```

---

## 8. `components/ui/Toast.tsx` — Visual premium

Substituir o container de toasts por:

```tsx
// Toast individual com ícone por tipo
const toastStyles = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
}
const toastIcons = {
  success: CheckCircle2,   // lucide
  error: XCircle,          // lucide
  info: Info,              // lucide
}

// Container: canto inferior direito
<div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
  {toasts.map((toast, i) => (
    <div
      key={toast.id}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border',
        'glass shadow-2xl shadow-black/50',
        'pointer-events-auto cursor-pointer',
        'animate-slide-in-right',
        toastStyles[toast.type]
      )}
      onClick={() => removeToast(toast.id)}
    >
      <Icon className={cn('h-4 w-4 shrink-0', iconColor)} />
      <span className="text-sm font-medium text-white">{toast.message}</span>
    </div>
  ))}
</div>
```

---

## 9. `components/ui/Input.tsx` e `Select.tsx` — Refinamento

Melhorar focus state e hover:

```tsx
// Input base classes:
'bg-quartel-900/80 border border-quartel-700 rounded-xl text-white placeholder-quartel-500'
'hover:border-quartel-600'
'focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10'
'transition-all duration-150'
```

---

## 10. `app/membros/MembrosContent.tsx` — Tabela com hover premium

Para cada linha da tabela de membros:
```tsx
className="group relative hover:bg-quartel-800/60 hover:shadow-md transition-all duration-150 cursor-pointer"
```

Para os cards mobile de cada membro — adicionar borda esquerda colorida pelo estado:
```tsx
const borderColor =
  subStatus?.color === 'green' ? 'border-l-green-500/50' :
  subStatus?.color === 'yellow' ? 'border-l-yellow-500/50' :
  subStatus?.color === 'red' ? 'border-l-red-500/50' :
  'border-l-quartel-700'

className={cn('border-l-2 rounded-xl bg-quartel-800/60 p-4 hover:bg-quartel-700/60 transition-all', borderColor)}
```

---

## 11. `app/membros/[id]/MembroPerfilClient.tsx` — Header do perfil

O header do perfil de membro deve ter mais impacto visual:

```tsx
{/* Hero do perfil */}
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-quartel-800 via-quartel-800 to-quartel-900 border border-quartel-700/50 p-6 mb-6">
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
          {member.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
        {activeSubscription && (
          <Badge color={subStatusColor} size="sm">
            {subStatusLabel}
          </Badge>
        )}
      </div>
    </div>

    {/* Botões de acção */}
    <div className="flex gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="h-3.5 w-3.5" /> Editar
      </Button>
      <Button size="sm" onClick={() => setSubOpen(true)}>
        <Plus className="h-3.5 w-3.5" /> Subscrição
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setPayOpen(true)}>
        <CreditCard className="h-3.5 w-3.5" /> Pagamento
      </Button>
    </div>
  </div>
</div>
```

---

## 12. `app/login/page.tsx` — Página de login premium

Substituir o fundo plano por:

```tsx
<div className="min-h-screen bg-quartel-950 flex items-center justify-center p-4 relative overflow-hidden">

  {/* Background: gradientes decorativos */}
  <div className="absolute inset-0 pointer-events-none">
    {/* Vignette */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#06070c_100%)]" />
    {/* Glow accent no canto */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent/4 rounded-full blur-[80px]" />
    {/* Glow azul subtil */}
    <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[200px] bg-blue-500/4 rounded-full blur-[60px]" />
  </div>

  <div className="relative w-full max-w-sm animate-fade-in-up">
    {/* Logo com glow */}
    <div className="text-center mb-10">
      <div className="inline-block mb-4">
        <Image
          src="/quartel24.jpg"
          alt="Quartel.24"
          width={80}
          height={80}
          className="rounded-2xl mx-auto ring-2 ring-quartel-700 shadow-2xl shadow-black/50"
        />
      </div>
      <h1 className="text-4xl font-black tracking-[0.2em] text-white uppercase mb-2">
        QUARTEL<span className="text-gradient-accent">.24</span>
      </h1>
      <p className="text-quartel-500 text-xs tracking-[0.3em] uppercase">
        Sistema de Gestão
      </p>
    </div>

    {/* Form card com glass */}
    <div className="glass rounded-2xl p-6 shadow-2xl shadow-black/40">
      ...campos...
    </div>
  </div>
</div>
```

---

## 13. Skeleton loaders (novo componente)

Criar `src/components/ui/Skeleton.tsx`:

```tsx
// Componente para estados de loading
// Uso: <Skeleton className="h-10 w-full" /> ou <Skeleton.Card />

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

// Skeleton de card de métrica
Skeleton.MetricCard = function MetricCardSkeleton() {
  return (
    <div className="bg-quartel-800 border border-quartel-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

// Skeleton de linha de tabela
Skeleton.TableRow = function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-quartel-800">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20 ml-auto" />
    </div>
  )
}
```

---

## REGRAS

1. **Zero `any`** — TypeScript strict
2. **Não instalar libraries** — apenas Tailwind, lucide-react, já disponíveis
3. **Manter funcionalidade** — visual overhaul não deve quebrar nada funcional
4. **Comentários em português**
5. **Animações com `both` fill-mode** para evitar flicker no carregamento
6. **Usar `cn()` para todas as classes condicionais**
7. **Testar build antes de commitar** — `npm run build`

## CRITÉRIOS DE CONCLUSÃO

- [ ] `globals.css` com sistema de animações e efeitos completo
- [ ] `Card` com variantes `glass`, `gradient`, `accent`
- [ ] `Button` com efeitos de hover/active e variante `outline`
- [ ] `Sidebar` redesenhada com indicator animado e glow no logo
- [ ] `Header` sticky com backdrop blur e indicador ao vivo
- [ ] Dashboard com cards de gradiente, stagger animation e setas no hover
- [ ] `Modal` com scale-in e fundo gradiente
- [ ] `Toast` com ícones e glass effect
- [ ] `Input`/`Select` com focus ring accent
- [ ] Lista de membros com hover premium e borda de estado
- [ ] Perfil de membro com hero card e botão `outline`
- [ ] Login com background de gradientes e form em glass
- [ ] `Skeleton.tsx` criado para estados de loading
- [ ] `npm run build` — zero erros
- [ ] `npm run lint` — zero erros
- [ ] 1 commit por componente/área (mínimo 6 commits atómicos)

# PROMPT #6 — Light Mode & Theme Toggle

Lê `node_modules/next/dist/docs/01-app/` antes de começar.

## CONTEXTO

O dashboard está demasiado escuro. Adicionar modo claro (light mode) completo com toggle persistente. O dark mode actual mantém-se como estava; o light mode usa fundo cinza-quente claro (#f0f2f5), cards brancos, texto escuro. O accent vermelho (`#e63946`) funciona em ambos os modos.

**Referência visual light mode:** Linear.app, Vercel Dashboard, Stripe Dashboard — fundos acinzentados suaves (não branco puro), cards com sombra subtil.

---

## ESTRATÉGIA TÉCNICA

Tailwind v4 com `dark:` variants. O `<html>` tem a classe `dark` por defeito. O toggle remove/adiciona a classe `dark`. Persistência em `localStorage`. Script inline no `<head>` para evitar flash de tema errado no carregamento.

---

## 1. `src/app/globals.css` — Variáveis de tema e overrides light

Após o bloco `@theme { ... }`, adicionar as variáveis CSS de tema antes de qualquer rule:

```css
/* ===================== VARIÁVEIS DE TEMA ===================== */

/* Dark (padrão) */
:root {
  --bg-base: #06070c;
  --bg-surface: #0d0f19;
  --bg-card: #1a1e32;
  --bg-card-hover: #20253a;
  --bg-elevated: #272d4b;
  --border-subtle: rgba(39, 45, 75, 0.8);
  --border-default: rgba(39, 45, 75, 1);
  --text-primary: #f0f1f5;
  --text-secondary: #8d93b1;
  --text-muted: #414b7d;
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.6);
  --dot-color: rgba(39, 45, 75, 0.45);
}

/* Light mode — activado removendo a classe .dark do <html> */
html:not(.dark) {
  --bg-base: #f0f2f5;
  --bg-surface: #e8eaed;
  --bg-card: #ffffff;
  --bg-card-hover: #f8f9fb;
  --bg-elevated: #f0f2f5;
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-default: rgba(0, 0, 0, 0.1);
  --text-primary: #0d1117;
  --text-secondary: #4b5563;
  --text-muted: #9ca3af;
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.08);
  --shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.2);
  --dot-color: rgba(0, 0, 0, 0.07);
}
```

Actualizar `.bg-dot-grid` para usar a variável:
```css
.bg-dot-grid {
  background-image: radial-gradient(
    circle,
    var(--dot-color) 1px,
    transparent 1px
  );
  background-size: 22px 22px;
}
```

Actualizar `.glass` para ter versão light:
```css
.glass {
  background: rgba(26, 30, 50, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(39, 45, 75, 0.8);
}

html:not(.dark) .glass {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
```

Actualizar o `body`:
```css
body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

---

## 2. `src/app/layout.tsx` — Script anti-flash + classe dark por defeito

Ler o ficheiro antes de editar.

**a)** No elemento `<html>`, adicionar `suppressHydrationWarning` e a classe `dark` como padrão:
```tsx
<html lang="pt" className="dark" suppressHydrationWarning>
```

**b)** Adicionar script inline no `<head>` ANTES de qualquer outro elemento (evita flash):
```tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          try {
            var theme = localStorage.getItem('quartel-theme');
            if (theme === 'light') {
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        })();
      `,
    }}
  />
</head>
```

---

## 3. `src/components/ui/ThemeToggle.tsx` — Novo componente

Criar ficheiro novo:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Ler estado actual do DOM (já foi definido pelo script anti-flash)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const html = document.documentElement
    const nowDark = html.classList.contains('dark')

    if (nowDark) {
      html.classList.remove('dark')
      localStorage.setItem('quartel-theme', 'light')
      setIsDark(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('quartel-theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo escuro'}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer',
        'text-quartel-400 hover:text-white',
        'hover:bg-quartel-700/60 dark:hover:bg-quartel-700/60',
        'hover:bg-black/10',
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}
```

---

## 4. `src/components/layout/Header.tsx` — Adicionar ThemeToggle

Ler o ficheiro antes de editar.

Importar `ThemeToggle` e adicionar ao lado direito do header, junto ao indicador "Ao vivo":

```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Na secção direita do header:
<div className="hidden lg:flex items-center gap-3">
  <div className="flex items-center gap-1.5">
    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
    <span className="text-xs text-quartel-500 dark:text-quartel-500 text-gray-400">Ao vivo</span>
  </div>
  <span className="text-sm text-quartel-400 dark:text-quartel-400 text-gray-500 capitalize">{today}</span>
  <div className="w-px h-4 bg-quartel-800 dark:bg-quartel-800 bg-gray-200" />
  <ThemeToggle />
</div>
```

No mobile, adicionar `ThemeToggle` junto ao botão de menu:
```tsx
<div className="flex items-center gap-2 lg:hidden">
  <ThemeToggle />
  <button onClick={onMenuClick} ...>
    <Menu className="h-5 w-5" />
  </button>
</div>
```

---

## 5. Adaptar componentes principais ao light mode

Para cada componente abaixo, usar o padrão `dark:bg-* bg-*` para suportar ambos os temas.

### `src/components/ui/Card.tsx`

Variante `default`:
```tsx
// Antes:
'bg-quartel-800 border-quartel-700 hover:border-quartel-600 hover:shadow-lg hover:shadow-black/30'

// Depois:
'dark:bg-quartel-800 bg-white dark:border-quartel-700 border-gray-200 hover:dark:border-quartel-600 hover:border-gray-300 shadow-[var(--shadow-card)]'
```

Variante `gradient`:
```tsx
// Antes:
'bg-gradient-to-br from-quartel-800 to-quartel-900 border border-quartel-700/50'

// Depois:
'dark:bg-gradient-to-br dark:from-quartel-800 dark:to-quartel-900 bg-white dark:border-quartel-700/50 border-gray-200/80'
```

Variante `glass`:
```tsx
// mantém-se — o .glass já foi actualizado no globals.css
```

### `src/components/layout/Sidebar.tsx`

O sidebar mantém-se SEMPRE escuro (dark), independentemente do modo. Isto é um padrão comum (Linear, Vercel). Adicionar `dark` à div raiz do sidebar para forçar:

```tsx
// Div raiz do sidebar:
<nav className="dark fixed top-0 left-0 h-full w-52 bg-quartel-950 border-r border-quartel-800/50 flex flex-col z-40">
```

Ao adicionar `dark` como classe estática neste elemento, todos os `dark:` variants dos filhos ficam sempre activos, independentemente do tema global.

### `src/components/layout/Header.tsx`

```tsx
// Antes:
'h-16 flex items-center justify-between px-4 lg:px-6 border-b border-quartel-800/60 bg-quartel-950/80 backdrop-blur-md sticky top-0 z-30'

// Depois:
'h-16 flex items-center justify-between px-4 lg:px-6 border-b dark:border-quartel-800/60 border-gray-200/80 dark:bg-quartel-950/80 bg-white/80 backdrop-blur-md sticky top-0 z-30'
```

O título da página:
```tsx
// h1:
'text-sm font-semibold dark:text-white text-gray-900 leading-none'
// subtítulo breadcrumb:
'text-[11px] dark:text-quartel-500 text-gray-400 mt-0.5'
```

### `src/app/page.tsx` — Dashboard

Cabeçalho de página e texto do estado vazio:
```tsx
// "Nenhuma subscrição a expirar..."
'dark:text-quartel-400 text-gray-500'
```

Card de alertas:
```tsx
'dark:bg-quartel-800 bg-white dark:border-quartel-700/50 border-gray-200'
```

Cada linha de alerta (fundo de urgência):
```tsx
// days_remaining === 0:
'dark:bg-red-500/15 bg-red-50 dark:border-red-500/20 border-red-200'
// <= 3:
'dark:bg-orange-500/10 bg-orange-50 dark:border-orange-500/20 border-orange-200'
// <= 7:
'dark:bg-yellow-500/10 bg-yellow-50 dark:border-yellow-500/20 border-yellow-200'
```

### `src/components/ui/Input.tsx` e `src/components/ui/Select.tsx`

```tsx
// Antes:
'bg-quartel-900/80 border border-quartel-700 text-white placeholder-quartel-500'

// Depois:
'dark:bg-quartel-900/80 bg-white dark:border-quartel-700 border-gray-300 dark:text-white text-gray-900 dark:placeholder-quartel-500 placeholder-gray-400'
'dark:focus:border-accent/60 focus:border-accent/60 dark:focus:ring-accent/10 focus:ring-accent/10'
'dark:hover:border-quartel-600 hover:border-gray-400'
```

### `src/components/ui/Modal.tsx`

```tsx
// Container do modal:
'dark:bg-gradient-to-b dark:from-quartel-800 dark:to-quartel-900 bg-white dark:border-quartel-700/60 border-gray-200 shadow-[var(--shadow-modal)]'

// Header do modal:
'dark:border-quartel-700/50 border-gray-200'

// Título:
'dark:text-white text-gray-900'

// Botão fechar:
'dark:text-quartel-500 dark:hover:text-white dark:hover:bg-quartel-700 text-gray-400 hover:text-gray-900 hover:bg-gray-100'

// Backdrop:
'dark:bg-black/80 bg-black/40 backdrop-blur-md'
```

### `src/app/membros/MembrosContent.tsx`

Tabela — header e linhas:
```tsx
// Cabeçalho da tabela:
'dark:bg-quartel-900/60 bg-gray-50 dark:text-quartel-400 text-gray-500 dark:border-quartel-800 border-gray-200'

// Linha da tabela:
'dark:border-quartel-800/50 border-gray-100 dark:hover:bg-quartel-800/60 hover:bg-gray-50'

// Nome do membro:
'dark:text-white text-gray-900'

// Texto secundário:
'dark:text-quartel-400 text-gray-500'
```

### `src/app/planos/PlanosContent.tsx`

Cards de planos:
```tsx
// Card base:
'dark:bg-quartel-800/60 bg-white dark:border-quartel-700/50 border-gray-200 dark:hover:bg-quartel-700/60 hover:bg-gray-50'

// Nome do plano:
'dark:text-white text-gray-900'

// Preço:
'dark:text-white text-gray-900'

// Duração:
'dark:text-quartel-400 text-gray-500'
```

### `src/app/pagamentos/PagamentosContent.tsx` (se existir)

Padrão idêntico — ler o ficheiro e aplicar `dark:` variants nos mesmos locais.

---

## 6. `src/components/ui/Badge.tsx` — Light mode

Ler o ficheiro. Para cada cor, adicionar variante light:

```tsx
// 'green':
'dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25 bg-green-100 text-green-700 border-green-200'

// 'red':
'dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/25 bg-red-100 text-red-700 border-red-200'

// 'yellow':
'dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/25 bg-yellow-100 text-yellow-700 border-yellow-200'

// 'blue':
'dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25 bg-blue-100 text-blue-700 border-blue-200'

// 'purple':
'dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/25 bg-purple-100 text-purple-700 border-purple-200'

// 'gray':
'dark:bg-quartel-700/50 dark:text-quartel-300 dark:border-quartel-600/30 bg-gray-100 text-gray-600 border-gray-200'
```

---

## 7. `src/app/membros/[id]/MembroPerfilClient.tsx` — Hero card light

```tsx
// Hero card:
'dark:bg-gradient-to-br dark:from-quartel-800 dark:via-quartel-800 dark:to-quartel-900 bg-white dark:border-quartel-700/50 border-gray-200 shadow-[var(--shadow-card)]'

// Avatar:
'dark:bg-gradient-to-br dark:from-quartel-600 dark:to-quartel-700 bg-gradient-to-br from-gray-200 to-gray-300 dark:text-white text-gray-700 dark:ring-quartel-600 ring-gray-300'

// Nome:
'dark:text-white text-gray-900'
```

---

## 8. `src/app/login/page.tsx` — Light mode

```tsx
// Fundo:
'dark:bg-quartel-950 bg-gray-100 min-h-screen ...'

// Form card:
'dark:glass glass rounded-2xl p-6 ...'
// (o .glass já tem versão light no globals.css)

// Labels e texto:
'dark:text-quartel-300 text-gray-700'
```

---

## ORDEM DE EXECUÇÃO

1. `globals.css` — variáveis CSS + `.glass` light + `body` transition
2. `layout.tsx` — script anti-flash + `suppressHydrationWarning`
3. `ThemeToggle.tsx` — novo componente
4. `Header.tsx` — integrar ThemeToggle + dark: variants
5. `Sidebar.tsx` — forçar modo escuro no nav (classe `dark` estática)
6. `Card.tsx` — dark: variants nas variantes
7. `Badge.tsx` — dark: variants por cor
8. `Input.tsx` + `Select.tsx` — dark: variants
9. `Modal.tsx` — dark: variants
10. `MembrosContent.tsx` — dark: variants na tabela
11. `PlanosContent.tsx` — dark: variants nos cards
12. `MembroPerfilClient.tsx` — hero card
13. `page.tsx` (dashboard) — alertas + linhas de urgência
14. `login/page.tsx` — fundo e form
15. `PagamentosContent.tsx` (se existir) — padrão igual

---

## REGRAS

1. **Ler cada ficheiro antes de editar** — `Read` tool obrigatório
2. **Sidebar SEMPRE escuro** — adicionar `dark` como classe estática no nav raiz
3. **Não instalar libraries** — apenas Tailwind, lucide-react
4. **Não quebrar funcionalidade** — zero regressões
5. **`npm run build` antes de commitar**
6. **Comentários em português**
7. **Testar visualmente** — abrir localhost e verificar que o toggle funciona e não há flash

## CRITÉRIOS DE CONCLUSÃO

- [ ] Script anti-flash no `<head>` — sem flash de tema errado no reload
- [ ] `ThemeToggle` no header (desktop e mobile)
- [ ] Toggle persiste entre sessões (localStorage)
- [ ] Sidebar sempre escuro independentemente do tema
- [ ] Dashboard light mode: fundo `bg-[#f0f2f5]`, cards brancos com sombra, dot-grid visível
- [ ] Membros, Pagamentos, Planos — todos legíveis em light mode
- [ ] Modal, Badges, Inputs — dark: variants correctos
- [ ] Login page light mode
- [ ] Accent vermelho (#e63946) funciona em ambos os modos
- [ ] `npm run build` — zero erros
- [ ] `npm run lint` — zero erros
- [ ] Mínimo 5 commits atómicos (theme-infra, sidebar, cards/inputs, pages, final-polish)

# Quartel.24 — Sistema de Gestão

App web de gestão de membros, subscrições e pagamentos para o ginásio **Quartel.24** (Ginásio, BJJ, MMA).

**Stack:** Next.js 16 · React 19 · TypeScript strict · Tailwind CSS v4 · Supabase · Vercel

---

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Editar `.env.local` com as credenciais do projecto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Obter em: [Supabase Dashboard → Settings → API](https://supabase.com/dashboard)

### 3. Aplicar schema da base de dados

No Supabase SQL Editor, executar o conteúdo de `supabase-schema.sql`.

### 4. Correr em desenvolvimento

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | Verificação de ESLint |

---

## Estrutura

```
src/
├── app/                  → Páginas (App Router)
│   ├── page.tsx          → Dashboard
│   ├── login/            → Autenticação
│   ├── membros/          → Lista, novo membro, perfil
│   ├── pagamentos/       → Histórico de pagamentos
│   └── planos/           → Gestão de planos
├── components/
│   ├── layout/           → AppShell, Sidebar, Header, MobileNav
│   └── ui/               → Componentes base (Button, Card, Badge…)
├── lib/
│   ├── supabase/         → Clientes browser/server/middleware
│   ├── types.ts          → Tipos TypeScript
│   └── utils.ts          → Utilitários (formatCurrency, formatDate…)
└── middleware.ts         → Protecção de rotas (Supabase Auth)
```

---

## Deploy

O projecto faz deploy automático no **Vercel** a cada push para `main`.

Configurar as mesmas variáveis de ambiente no painel do Vercel:
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## Docs

- `docs/PRD.md` — Product Requirements Document
- `docs/adr/ADR-001-stack-tecnologica.md` — Decisão de stack
- `supabase-schema.sql` — Schema completo da base de dados
- `SKILLS/ARCHITECTURE.md` — Mapa de skills e arquitectura de agentes
- `SKILLS/SECURITY.md` — Guia de segurança

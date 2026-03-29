# ADR-001: Stack Tecnológica — Next.js + Supabase + Vercel

**Status:** Accepted
**Date:** 2026-03-29
**Decision Makers:** Wilson (Arquiteto)

## Context

O Quartel.24 precisa de uma app web de gestão de membros, subscrições e pagamentos. A utilizadora principal não é técnica. Requisitos chave: cloud-hosted, responsivo, seguro, custo zero ou mínimo, fácil de manter.

Alternativas consideradas: React + Express + PostgreSQL local, Django + HTMX, Laravel, SaaS existente (GymMaster, Mindbody).

## Decision

Usamos Next.js 15 (React 19, App Router, TypeScript) no frontend, Supabase como backend-as-a-service (PostgreSQL + Auth + Storage + RLS), Vercel para deploy, e Tailwind CSS para styling.

## Consequences

### Positive
- Zero custo no free tier (Supabase + Vercel)
- Auth, DB, Storage tudo integrado no Supabase — sem backend custom
- Deploy automático via Git push
- SSR + RSC para performance
- TypeScript end-to-end

### Negative
- Dependência do Supabase como vendor (mitigação: PostgreSQL standard, exportável)
- Free tier tem limites (500MB DB, 1GB storage) — suficiente para este caso
- Curva de aprendizagem se precisar de manutenção futura

### Risks
- Se Supabase mudar pricing: migrar para PostgreSQL self-hosted é viável (schema standard)

## Alternatives Considered

### React + Express + PostgreSQL local
- **Pros:** Controlo total, sem vendor lock-in
- **Cons:** Mais código para manter, sem auth built-in, deploy manual
- **Why rejected:** Complexidade desnecessária para o escopo

### Django + HTMX
- **Pros:** Admin built-in, rápido para CRUD
- **Cons:** Menos flexibilidade no frontend, Wilson e equipa mais familiarizados com React/TS
- **Why rejected:** Stack preference e ecossistema

### SaaS existente (GymMaster, Mindbody)
- **Pros:** Zero desenvolvimento
- **Cons:** Custo mensal elevado (€50-200/mês), sem customização, interface em inglês, não adaptado ao modelo do Quartel.24
- **Why rejected:** Custo, falta de flexibilidade, idioma

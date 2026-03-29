# PRD — Quartel.24 Gym Management System

**Date:** 2026-03-29
**Author:** Wilson (Arquiteto)
**Mode:** Builder
**Status:** In Progress

---

## Executive Summary

O Quartel.24 é um ginásio com três modalidades (Ginásio, BJJ e MMA) que precisa de uma aplicação web para gerir membros, subscrições e pagamentos. A aplicação será usada pela gestora de recursos humanos e subscrições (a prima do Wilson) que não é técnica, pelo que a interface deve ser extremamente simples, responsiva e em português. Deploy na cloud (Supabase + Vercel) para acesso de qualquer dispositivo.

---

## Problem

### Problem Statement

O Quartel.24 gere membros, subscrições e pagamentos de forma manual ou com ferramentas genéricas (Excel, papel). Isto causa: perda de controlo sobre subscrições expiradas, dificuldade em saber quem está em dia, ausência de visão geral do negócio, e risco de perda de dados.

### Evidence

- Ginásios pequenos e médios em Portugal dependem frequentemente de Excel ou software genérico inadaptado
- A gestora não é técnica — precisa de uma solução que elimine complexidade, não que a adicione
- Três modalidades com planos individuais e packs tornam a gestão manual propensa a erros

### Current State

Gestão manual: fichas em papel ou Excel, sem alertas de expiração, sem dashboard, sem histórico centralizado de pagamentos.

---

## Target User

### Persona Primária: Gestora (Prima do Wilson)

- **Nome:** Ana (persona)
- **Papel:** Gestão de RH e subscrições do Quartel.24
- **Contexto:** Não é dona do ginásio. Gere os membros, controla pagamentos, renova subscrições
- **Nível técnico:** Baixo — usa telemóvel e computador para tarefas básicas
- **Necessidades:** Interface simples, sem jargão técnico, acesso de qualquer dispositivo, tudo em português
- **Pain points:** Perder controlo de quem está em dia, não saber quando subscrições expiram, dificuldade em encontrar dados de membros rapidamente

---

## Solution

### Core Concept

Aplicação web responsiva de gestão de ginásio com dashboard em tempo real, gestão completa de membros (ficha de registo de nível elite), subscrições flexíveis por modalidade (individual e packs, criança e adulto), e registo manual de pagamentos.

### MVP Features (P0 — Must-Have)

1. **Dashboard** — Visão geral com métricas chave (membros ativos, subscrições a expirar em 7 dias, receita do mês, pagamentos do dia) e lista de alertas
2. **Gestão de Membros** — Lista com pesquisa e filtros, ficha de registo completa (dados pessoais, NIF, CC, saúde, contacto de emergência, foto), perfil individual
3. **Gestão de Subscrições** — Planos por modalidade (Ginásio, BJJ, MMA) com individuais e packs, categorias criança/adulto, atribuição a membros com datas de início/fim, estado automático (ativa/a expirar/expirada)
4. **Registo Manual de Pagamentos** — Registar pagamento associado a membro e subscrição, métodos (dinheiro, multibanco, transferência, MBWay), histórico por membro e global
5. **Autenticação** — Login com email/password via Supabase Auth, proteção de todas as rotas

### Features P1 (Should-Have — v1.1)

1. Gestão de planos de subscrição (CRUD — criar, editar, desativar planos)
2. Exportar lista de membros e pagamentos para Excel/CSV
3. Filtros avançados na lista de membros (por modalidade, estado da subscrição, idade)

### Features P2 (Nice-to-Have — v2)

1. Horário de aulas (calendário BJJ/MMA)
2. Alertas por email quando subscrição expira
3. Check-in diário dos membros
4. Relatórios e analytics avançados

### Out of Scope (MVP)

- Pagamentos online (Stripe, MBWay automático)
- App mobile nativa
- Multi-ginásio (multi-tenant)
- Gestão de instrutores/staff
- Controlo de acessos físico (torniquetes)
- Faturação/emissão de recibos

---

## User Stories (P0)

### US-01: Ver Dashboard

```
Como gestora,
quero ver um painel com o resumo do ginásio ao abrir a app,
para que saiba imediatamente o estado atual sem procurar.

Critérios de aceitação:
1. Given estou autenticada e acedo à página inicial,
   When a página carrega,
   Then vejo cards com: membros ativos, subscrições ativas, a expirar (≤7 dias), expiradas, receita do mês, pagamentos de hoje.

2. Given existem subscrições a expirar nos próximos 7 dias,
   When vejo o dashboard,
   Then vejo uma lista com o nome do membro, plano, e data de expiração, ordenada por urgência.

3. Given clico num membro na lista de alertas,
   When a página carrega,
   Then sou redirecionada para o perfil desse membro.
```

### US-02: Registar Novo Membro

```
Como gestora,
quero preencher uma ficha de registo completa para um novo membro,
para que todos os dados fiquem centralizados e acessíveis.

Critérios de aceitação:
1. Given estou na página de membros e clico "Novo Membro",
   When o formulário abre,
   Then vejo secções organizadas: Dados Pessoais, Morada, Documentos, Saúde, Notas.

2. Given preencho os campos obrigatórios (nome, apelido) e submeto,
   When o registo é guardado com sucesso,
   Then sou redirecionada para o perfil do novo membro com mensagem de sucesso.

3. Given tento submeter sem os campos obrigatórios,
   When clico em guardar,
   Then vejo mensagens de erro claras nos campos em falta (em português).
```

### US-03: Pesquisar e Filtrar Membros

```
Como gestora,
quero pesquisar membros por nome, NIF ou telefone,
para que encontre qualquer membro em segundos.

Critérios de aceitação:
1. Given estou na lista de membros,
   When escrevo no campo de pesquisa,
   Then a lista filtra em tempo real por nome, apelido, NIF, email ou telefone.

2. Given quero filtrar por estado,
   When seleciono um filtro (ativo, inativo, subscrição expirada),
   Then a lista mostra apenas os membros que correspondem.
```

### US-04: Atribuir Subscrição a Membro

```
Como gestora,
quero atribuir um plano de subscrição a um membro,
para que o sistema controle automaticamente as datas e o estado.

Critérios de aceitação:
1. Given estou no perfil de um membro e clico "Nova Subscrição",
   When o formulário abre,
   Then vejo a lista de planos disponíveis com nome, modalidades, preço e duração.

2. Given seleciono um plano e uma data de início,
   When confirmo,
   Then a subscrição é criada com data de fim calculada automaticamente e estado "ativa".

3. Given a data de fim de uma subscrição passou,
   When acedo ao perfil do membro ou ao dashboard,
   Then o estado aparece como "expirada" com destaque visual (vermelho).
```

### US-05: Registar Pagamento

```
Como gestora,
quero registar um pagamento de um membro,
para que saiba quem está em dia e tenha histórico financeiro.

Critérios de aceitação:
1. Given estou no perfil de um membro e clico "Registar Pagamento",
   When o formulário abre,
   Then vejo campos para: valor (pré-preenchido com o preço do plano), data, método de pagamento, e notas.

2. Given submeto o pagamento,
   When é guardado com sucesso,
   Then aparece no histórico do membro e nos totais do dashboard.
```

### US-06: Login Seguro

```
Como gestora,
quero fazer login com email e password,
para que os dados dos membros estejam protegidos.

Critérios de aceitação:
1. Given não estou autenticada e acedo a qualquer página,
   When a página carrega,
   Then sou redirecionada para a página de login.

2. Given introduzo credenciais corretas,
   When clico em "Entrar",
   Then sou redirecionada para o Dashboard.

3. Given introduzo credenciais incorretas,
   When clico em "Entrar",
   Then vejo uma mensagem de erro clara (em português).
```

---

## Success Metrics

| Goal | Metric | Target | Baseline | Timeline |
|------|--------|--------|----------|----------|
| Adoção | Gestora usa a app diariamente | ≥5 dias/semana | 0 (não existe) | 2 semanas pós-launch |
| Eficiência | Tempo para encontrar dados de membro | <10 segundos | ~2-5 minutos (Excel/papel) | Imediato |
| Controlo | Subscrições expiradas identificadas | 100% automático | Manual, falha frequente | Imediato |
| Dados | Membros registados na app | 100% dos membros ativos | 0 | 1 mês pós-launch |

---

## Technical Approach

### Stack

| Camada | Tecnologia | Justificação |
|--------|-----------|--------------|
| Frontend | Next.js 15 + React 19 + TypeScript | SSR, performance, type-safety |
| Styling | Tailwind CSS | Utility-first, responsivo por defeito, fácil de manter |
| Backend/DB | Supabase (PostgreSQL hosted) | Auth, DB, Storage, RLS — tudo-em-um, free tier generoso |
| Auth | Supabase Auth | Email/password, integrado com RLS |
| Deploy | Vercel | Deploy automático, CDN global, free tier |
| Icons | Lucide React | Leve, consistente, MIT license |
| Dates | date-fns | Leve, tree-shakable, boa i18n PT |

### Database Schema (Alto Nível)

**subscription_plans** — Planos disponíveis
- name, description, modalities[] (ginasio/bjj/mma), age_category (adulto/criança/todos), plan_type (individual/pack), duration_months, price, is_active

**members** — Ficha completa de membros
- Dados pessoais, morada, documentos (NIF, CC), saúde, foto, notas, is_active

**subscriptions** — Subscrição ativa de cada membro
- member_id, plan_id, start_date, end_date, status (active/expired/cancelled/paused)

**payments** — Histórico de pagamentos
- member_id, subscription_id, amount, payment_date, payment_method, notes

### Key Architecture Decisions

- **ADR-001:** Stack Next.js + Supabase + Vercel (ver docs/adr/)
- **ADR-002:** Modalidades como array no plano (não tabela separada) — simplicidade sobre flexibilidade
- **ADR-003:** Auth obrigatória com Supabase Auth + RLS

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Gestora não se adapta à UI | Alto | Médio | UI ultra-simples, teste com utilizadora real, iteração rápida |
| Supabase free tier insuficiente | Baixo | Baixo | 500MB DB, 1GB storage — mais que suficiente para ginásio pequeno |
| Dados sensíveis (NIF, CC, saúde) expostos | Alto | Baixo | RLS ativo, auth obrigatória, HTTPS via Vercel |
| Perda de dados | Alto | Baixo | Supabase backups automáticos no plano free |

---

## Design Guidelines

### Princípios UI/UX

1. **Português nativo** — Todo o texto em PT-PT, zero inglês na interface
2. **Mobile-first** — A gestora pode usar no telemóvel no balcão do ginásio
3. **Ações óbvias** — Botões grandes, texto claro, zero ambiguidade
4. **Feedback imediato** — Loading states, mensagens de sucesso/erro sempre visíveis
5. **Navegação mínima** — Sidebar com 5 itens máximo, sem submenus
6. **Cores com significado** — Verde (ativo/pago), Amarelo (a expirar), Vermelho (expirado/em falta)
7. **Tema Quartel** — Paleta escura/militar que remete ao nome, mas clean e moderna

### Navegação

```
Sidebar:
├── Dashboard (ícone: LayoutDashboard)
├── Membros (ícone: Users)
├── Pagamentos (ícone: CreditCard)
├── Planos (ícone: ClipboardList)
└── [Avatar] Sair (ícone: LogOut)
```

### Modalidade Visual

| Modalidade | Cor | Badge |
|-----------|-----|-------|
| Ginásio | Azul (#3B82F6) | 🏋️ Ginásio |
| BJJ | Roxo (#8B5CF6) | 🥋 BJJ |
| MMA | Vermelho (#EF4444) | 🥊 MMA |

---

## Go / No-Go Decision

### Recomendação: GO

### Raciocínio

- Problema é real e atual (gestão manual gera erros e perda de controlo)
- Utilizadora é identificada e acessível (prima do Wilson)
- Stack é gratuita e escalável (Supabase free + Vercel free)
- MVP é construível em 1-2 semanas com qualidade SOTA
- Feedback direto da utilizadora garante iteração rápida

### Próximos Passos

1. Criar projeto Supabase "Quartel.24" e correr o schema SQL
2. Executar prompts sequenciais no Claude Code (fundações → UI → páginas)
3. Deploy no Vercel
4. Sessão de teste com a gestora

---

*Última atualização: 2026-03-29*

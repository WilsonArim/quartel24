# ARCHITECTURE — Mapa de Skills, Fases & Routing

> Referencia completa de todas as skills, organizacao por fases, e matriz de routing.
> **Consolidacao v2** — 49 skills → 17 skills (2026-03-26)

---

## Visao Geral

```
Total de Skills: 17
Fases: 7 (0-6) + Cross-cutting
Skills Fase 0 (sempre ativas): 3 (core-engine + git-ops + secrets-guard)
Skills sob demanda: 14
Professions: extensivel (user-managed)
Workflows: 9 (routing sequences no CLAUDE.md)
State Persistence: .sota/ (reports, baselines, retros, analytics)
```

### Padroes Integrados (gstack-inspired)
- **Boil the Lake** — completude por defeito
- **Sequential Output Chaining** — output de skill A alimenta skill B
- **Fix-First Triage** — AUTO-FIX mecanico, ASK para julgamento
- **One Decision Per Question** — nunca agrupar decisoes
- **Self-Regulating Loops** — WTF-likelihood > 20% = STOP
- **Evidence-Based Verification** — screenshots, line citations, before/after
- **Autonomous Decision Framework** — 6 principios de autonomia
- **Failure Modes Table** — codepath → failure → rescue → test → user visibility
- **AI Slop Detection** — blacklist de patterns genericos em design
- **Atomic Commits** — um commit por mudanca logica, bisectable
- **State Persistence** — .sota/ para reports e trend tracking
- **Platform-Agnostic** — ler tech stack do CLAUDE.md, nunca hardcodar

---

## Mapa Completo de Skills

### FASE 0 — Core (SEMPRE ATIVAS)

| # | Skill | Diretorio | Absorve | Descricao |
|---|-------|-----------|---------|-----------|
| 1 | **Core Engine** | `core-engine/` | concise-planning, systematic-debugging, lint-and-validate, kaizen, verification-before-completion, enforcement-layer | Motor de execucao — planning, debug, validation, completion gate, enforcement, self-regulation |
| 2 | **Git Ops** | `git-ops/` | git-pushing, commit, create-pr, changelog-automation | Pipeline de release — commits atomicos, push, PRs, changelog, versioning |
| 3 | **Secrets Guard** | `secrets-guard/` | SECURITY/secrets-management | Disciplina de segredos — .env, vault, rotacao, leak detection |

### FASE 1 — Ideacao & Planeamento

| # | Skill | Diretorio | Absorve | Descricao |
|---|-------|-----------|---------|-----------|
| 4 | **Ideation** | `ideation/` | brainstorming, product-manager-toolkit, competitive-landscape, prd, architecture-decision-records | Da ideia ao spec — brainstorm, mercado, PRD, RICE, ADRs |

### FASE 2 — Arquitetura & Design de Sistema

| # | Skill | Diretorio | Absorve | Descricao |
|---|-------|-----------|---------|-----------|
| 5 | **Architecture** | `architecture/` | senior-architect, architecture-patterns, database-design, visual-diagrams | Design estrutural — patterns, database, diagramas, failure modes |
| 6 | **Security Design** | `security-design/` | SECURITY/threat-modeling, SECURITY/compliance-privacy | Seguranca design-time — STRIDE, GDPR, attack surface |

### FASE 3 — Backend

| # | Skill | Diretorio | Absorve | Descricao |
|---|-------|-----------|---------|-----------|
| 7 | **API Engineering** | `api-engineering/` | api-patterns, api-security-best-practices, auth-implementation-patterns | APIs unificadas — design, OWASP, auth, LLM trust boundaries |
| 8 | **Backend** | `backend/` | backend-dev-guidelines, senior-fullstack, data-analytics | Server-side — estrutura, patterns, dados, platform-agnostic |

### FASE 4 — Frontend & UI

| # | Skill | Diretorio | Absorve | Descricao |
|---|-------|-----------|---------|-----------|
| 9 | **Frontend** | `frontend/` | frontend-developer, react-best-practices | React 19+, Next.js 15+ — componentes, hooks, performance |
| 10 | **Design System** | `design-system/` | frontend-design, tailwind-patterns, ui-ux-pro-max | Visual completo — tokens, cores, Tailwind, AI slop detection |

### FASE 5 — Qualidade, Testes & Auditoria

| # | Skill | Diretorio | Absorve | Descricao |
|---|-------|-----------|---------|-----------|
| 11 | **Testing** | `testing/` | test-driven-development, e2e-testing-patterns | Piramide completa — TDD, e2e, QA loops, evidence-based |
| 12 | **Code Quality** | `code-quality/` | code-review-checklist, vibe-code-auditor, performance-engineer, security-auditor | Avaliacao holistica — review, scoring, security, performance, fix-first |

### FASE 6 — Deploy & Operacoes

| # | Skill | Diretorio | Absorve | Descricao |
|---|-------|-----------|---------|-----------|
| 13 | **Ship** | `ship/` | deployment-procedures, docker-expert, SECURITY/production-readiness | Merge to prod — Docker, CI/CD, gates, canary, revert |
| 14 | **Security Ops** | `security-ops/` | SECURITY/infrastructure-hardening, SECURITY/devsecops-pipeline, SECURITY/incident-response, SECURITY/supply-chain-security | Seg. operacional — hardening, pipeline, incidentes, supply chain |

### CROSS-CUTTING

| # | Skill | Diretorio | Absorve | Descricao |
|---|-------|-----------|---------|-----------|
| 15 | **Agent Engineering** | `agent-engineering/` | dispatching-parallel-agents, sota-agent-engineering | Agentes AI — arquitectura, dispatch, verificacao, autonomia |
| 16 | **Meta** | `meta/` | sota-autoimprove | Auto-melhoria — eval, ratchet, retro, telemetry |
| 17 | **Professions** | `professions/` | professions | Extensao — skills de dominio especifico |

---

## Mapa de Seguranca

> Ver `SECURITY.md` para o guia completo de defense-in-depth.

### Cobertura por Camada

| Camada | Skill Responsavel | Fase |
|--------|-------------------|------|
| Codigo Seguro | code-quality (security audit integrado) | 5 |
| APIs & Autenticacao | api-engineering (OWASP + auth + LLM trust) | 3 |
| Segredos & Credenciais | **secrets-guard** | **0 (sempre)** |
| Dependencias & Supply Chain | security-ops (supply chain section) | 6 |
| Infraestrutura | security-ops (hardening section) | 6 |
| Conformidade & Privacidade | security-design (compliance section) | 2 |
| Threat Modeling | security-design (STRIDE section) | 2 |
| DevSecOps & CI/CD | security-ops (pipeline section) | 6 |
| Resposta a Incidentes | security-ops (incident section) | 6 |
| Production Readiness | ship (readiness gate) | 6 |

---

## Matriz de Routing

### Keywords → Skills

```
IDEACAO:
  ideia|brainstorm|mvp|conceito|PRD|requisitos|concorrencia|ADR|decisao|spec → ideation

ARQUITETURA:
  arquitetura|sistema|pattern|database|schema|ORM|SQL|diagrama|Mermaid|ASCII → architecture
  ameaca|threat|STRIDE|GDPR|privacidade|PII|compliance|superficie-ataque    → security-design

BACKEND:
  API|REST|GraphQL|tRPC|endpoint|auth|login|JWT|OAuth|rate-limit|CORS       → api-engineering
  backend|servidor|Node|Express|Next.js|server-actions|query|analytics       → backend

FRONTEND:
  frontend|React|componente|hook|server-component|Suspense|Actions          → frontend
  design|UI|layout|cores|tipografia|Tailwind|CSS|tokens|estilo|spacing      → design-system

QUALIDADE:
  teste|TDD|unit|coverage|e2e|Playwright|Cypress|QA                         → testing
  review|PR|qualidade|audit|score|performance|OWASP|CWV|checklist           → code-quality

DEPLOY:
  Docker|container|deploy|producao|rollout|CI/CD|canary|ship                → ship
  hardening|SSH|firewall|TLS|SAST|DAST|SCA|incidente|breach|supply-chain    → security-ops

RELEASE:
  commit|push|PR|pull-request|changelog|versao|release|merge|branch         → git-ops

SEGREDOS (SEMPRE ATIVO):
  segredo|secret|API-key|token|.env|credencial|password|vault               → secrets-guard

AGENTES:
  agente|agent|autonomo|orchestration|MCP|paralelo|dispatch                 → agent-engineering

META:
  autoimprove|auto-melhoria|retro|retrospectiva|telemetry                   → meta

COMPLETION (SEMPRE ATIVO):
  done|completo|pronto|terminado|feito                                      → core-engine
```

### Complexidade → Combinacao de Skills

| Complexidade | Comportamento |
|-------------|---------------|
| Simples (1 ficheiro, 1 tarefa) | 1 skill da fase relevante |
| Media (multiplos ficheiros, 1 feature) | 2-3 skills, possivelmente cross-fase |
| Alta (sistema completo, multiplas features) | 3+ skills, multiplas fases em sequencia |

---

## Fluxo de Ativacao

```
[Pedido do Utilizador]
       │
       ▼
[ENFORCEMENT CHECK]
  "Alguma skill se aplica? 1% chance = MUST invoke"
       │
       ▼
[Fase 0 — SEMPRE ATIVA (3 skills)]
  core-engine    ← planning, debug, validation, enforcement
  git-ops        ← commits, push, PRs, changelog
  secrets-guard  ← disciplina de segredos
       │
       ▼
[Classificar Request]
  Tipo: IDEA | PLAN | BUILD | FIX | TEST | DEPLOY | REFACTOR | REVIEW | ADAPT | SECURE
       │
       ▼
[Identificar Fase(s)]
  Match keywords → Fases 1-6 + Cross-cutting
       │
       ▼
[Selecionar Skills]
  Dentro de cada fase, ativar por relevancia
       │
       ▼
[OUTPUT CHAINING]
  Output de skill A alimenta skill B
       │
       ▼
[SECURITY GATE]                        ← para requests tipo DEPLOY
  Se DEPLOY: ship verifica production readiness
       │
       ▼
[Executar com Skills Ativas]
  Aplicar conhecimento combinado
       │
       ▼
[SELF-REGULATION CHECK]
  WTF-likelihood > 20%? → STOP e reportar
       │
       ▼
[VERIFICATION GATE]
  Antes de declarar "done": evidencia fresca obrigatoria
```

---

## Extensoes

### Professions (`professions/`)
Skills de profissao com formato identico. Exemplos:
- `professions/journalist/SKILL.md`
- `professions/lawyer/SKILL.md`
- `professions/data-scientist/SKILL.md`

### Archive (`_archive/`)
Skills originais (49) preservadas para referencia durante periodo de transicao.

### State Persistence (`.sota/`)
```
.sota/
├── reports/
│   ├── code-quality/     ← Reports de review
│   ├── testing/          ← QA reports
│   ├── security/         ← CSO audit reports
│   └── ship/             ← Deploy reports
├── baselines/            ← Design + performance baselines
├── retros/               ← Retrospective snapshots
└── analytics/            ← Telemetry logs
```

---

## Tabela de Migracao (49 → 17)

| Nova Skill | Absorve |
|-----------|---------|
| core-engine | concise-planning, systematic-debugging, lint-and-validate, kaizen, verification-before-completion, enforcement-layer |
| git-ops | git-pushing, commit, create-pr, changelog-automation |
| secrets-guard | SECURITY/secrets-management |
| ideation | brainstorming, product-manager-toolkit, competitive-landscape, prd, architecture-decision-records |
| architecture | senior-architect, architecture-patterns, database-design, visual-diagrams |
| security-design | SECURITY/threat-modeling, SECURITY/compliance-privacy |
| api-engineering | api-patterns, api-security-best-practices, auth-implementation-patterns |
| backend | backend-dev-guidelines, senior-fullstack, data-analytics |
| frontend | frontend-developer, react-best-practices |
| design-system | frontend-design, tailwind-patterns, ui-ux-pro-max |
| testing | test-driven-development, e2e-testing-patterns |
| code-quality | code-review-checklist, vibe-code-auditor, performance-engineer, security-auditor |
| ship | deployment-procedures, docker-expert, SECURITY/production-readiness |
| security-ops | SECURITY/infrastructure-hardening, SECURITY/devsecops-pipeline, SECURITY/incident-response, SECURITY/supply-chain-security |
| agent-engineering | dispatching-parallel-agents, sota-agent-engineering |
| meta | sota-autoimprove |
| professions | professions |

---

*Atualizar este ficheiro sempre que adicionar/remover skills.*
*Ultima atualizacao: 2026-03-26 (consolidacao v2)*

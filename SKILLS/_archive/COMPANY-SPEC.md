# SOTA COMPANY — Empresa AI Autonoma

> **Status:** SPEC v1 — arquitectura e fluxo completo
> **Data:** 2026-03-26
> **Inspiracao:** [Paperclip AI](https://github.com/paperclipai/paperclip) + SOTA MAX 17 skills
> **Conceito:** Uma empresa 100% AI que recebe um projecto e entrega-o completo — com governance, hierarquia, e auditoria real.

---

## 1. VISAO

```
INPUT:  "Quero construir X"
OUTPUT: Projecto completo, testado, auditado, atacado, pronto para producao.

Intervencao humana: APENAS nos 8 gates pre-PRD + processos manuais (API keys, contas).
Depois disso: a empresa funciona sozinha ate ao fim.
```

### Principio Central

> **"O humano e o Board of Directors. A IA e a empresa inteira."**

O humano define O QUE quer. A empresa decide COMO fazer, faz, testa, ataca, e entrega.

---

## 2. ORGANOGRAMA

```
                    ┌─────────────────┐
                    │   BOARD (Human)  │
                    │   Wilson         │
                    │   Approve/Reject │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │      CEO        │
                    │  (Orchestrator) │
                    │  core-engine    │
                    │  git-ops        │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
   ┌────────▼────────┐ ┌────▼─────┐ ┌────────▼────────┐
   │  VP RESEARCH    │ │ VP BUILD │ │  VP QUALITY     │
   │  (Estrategia)   │ │ (Exec.)  │ │  (Auditoria)    │
   │  ideation       │ │          │ │                 │
   │  architecture   │ │          │ │                 │
   └────────┬────────┘ └────┬─────┘ └────────┬────────┘
            │               │                │
            │    ┌──────────┼──────────┐     │
            │    │          │          │     │
            │  ┌─▼──┐  ┌───▼──┐  ┌────▼┐  ┌▼────────┐
            │  │Back│  │Front │  │ UI  │  │QA Lead  │
            │  │end │  │end   │  │Lead │  │testing  │
            │  │Lead│  │Lead  │  │des. │  │code-qual│
            │  └─┬──┘  └───┬──┘  └────┬┘  └┬────────┘
            │    │         │         │     │
            │  api-eng   frontend  design  │
            │  backend             -system │
            │                              │
   ┌────────▼────────┐            ┌────────▼────────┐
   │  CISO           │            │  RED TEAM       │
   │  (Security)     │            │  (Hacker)       │
   │  secrets-guard  │            │  security-ops   │
   │  security-design│            │  (offensive)    │
   │  security-ops   │            │                 │
   └─────────────────┘            └─────────────────┘
```

---

## 3. ROLES & RESPONSABILIDADES

### 3.1 BOARD (Human — Wilson)

**Autoridade:** Absoluta. Pode pausar, cancelar, redirecionar a qualquer momento.

**Intervencoes obrigatorias (8 gates):**
1. Aprovar objectivo do projecto
2. Aprovar escolha de backend
3. Aprovar escolha de frontend
4. Aprovar escolha de UI framework
5. Aprovar postura de seguranca
6. Aprovar research final (SOTA stack completa)
7. Aprovar plano de execucao (PRD final)
8. Executar processos manuais (criar contas, API keys, etc.)

**Apos gate 8:** Zero intervencao ate ao relatorio final.

---

### 3.2 CEO (Orchestrator)

**Skills SOTA:** `core-engine` + `git-ops`

**Responsabilidades:**
- Recebe o objectivo do Board
- Coordena todos os VPs
- Gere o pipeline de execucao (sequencia e paralelismo)
- Toma decisoes autonomas seguindo os 6 principios de autonomia
- Escala para o Board APENAS nos 8 gates definidos
- Garante que cada VP reporta progresso
- Aplica Boil the Lake (completude por defeito)
- Gere o estado do projecto em `.sota/`

**Comportamento:**
```
LOOP (ate projecto completo):
  1. Avaliar estado actual
  2. Identificar proxima fase
  3. Despachar para VP correcto
  4. Receber output
  5. Validar (completion gate)
  6. Alimentar proxima fase (output chaining)
  7. Se bloqueado → escalar para Board
  8. Se completo → avanca
```

**Regra de ouro:** O CEO nunca escreve codigo. Delega TUDO.

---

### 3.3 VP RESEARCH (Estrategia & Planeamento)

**Skills SOTA:** `ideation` + `architecture`

**Responsabilidades:**
- Pesquisar o estado da arte para cada componente do stack
- Avaliar alternativas com criterios objectivos (performance, DX, comunidade, manutencao)
- Produzir ADRs (Architecture Decision Records) para cada escolha
- Criar o PRD completo
- Desenhar a arquitectura do sistema (diagramas, failure modes, data flow)

**Output para o CEO:**
```
1. Research Report (por componente):
   - Top 3 opcoes com pros/cons
   - Recomendacao fundamentada
   - Benchmark de performance (se aplicavel)
   - Tendencias de mercado e adopcao

2. PRD Completo:
   - Objectivo e scope
   - User stories com acceptance criteria
   - Arquitectura proposta (diagrama)
   - Failure modes table
   - Timeline estimada
   - Dependencias e riscos
```

---

### 3.4 VP BUILD (Execucao)

**Nao tem skills proprias** — delega para os 3 Leads:

#### Backend Lead
**Skills SOTA:** `api-engineering` + `backend`

**Responsabilidades:**
- Implementar o servidor, APIs, base de dados
- Seguir os patterns definidos pelo VP Research
- Escrever codigo TypeScript strict
- Platform-agnostic: seguir stack aprovada pelo Board

**Output:** Codigo backend funcional + API documentada

#### Frontend Lead
**Skills SOTA:** `frontend`

**Responsabilidades:**
- Implementar interfaces React/Next.js
- Integrar com APIs do Backend Lead
- Performance (memoization, server components, Suspense)
- Acessibilidade (WCAG 2.1 AA)

**Output:** Codigo frontend funcional + integrado

#### UI Lead
**Skills SOTA:** `design-system`

**Responsabilidades:**
- Definir design tokens (cores, tipografia, spacing)
- Implementar componentes visuais com Tailwind
- AI Slop detection (rejeitar patterns genericos)
- Design baseline para regression tracking

**Output:** Sistema de design completo + componentes

---

### 3.5 VP QUALITY (Auditoria & Testes)

**Nao tem skills proprias** — delega para QA Lead e Red Team:

#### QA Lead
**Skills SOTA:** `testing` + `code-quality`

**Responsabilidades:**
- Testes unitarios (TDD onde aplicavel)
- Testes e2e (Playwright)
- Code review multi-pass (CRITICAL → INFORMATIONAL)
- Performance audit (Core Web Vitals)
- Quality scoring (1-10 por dimensao)
- Fix-first triage (AUTO-FIX mecanico, ASK para julgamento)

**Output:**
```
1. Test Suite Completa:
   - Unit tests (>80% coverage)
   - Integration tests
   - E2E tests com screenshots
   - Performance benchmarks

2. Quality Report:
   - Score por dimensao
   - Findings com fix-first resolution
   - Adversarial review (por tamanho do diff)
```

#### Red Team (Hacker)
**Skills SOTA:** `security-ops` (modo ofensivo)

**Responsabilidades:**
- Penetration testing automatizado
- Ataques OWASP Top 10
- Brute force em auth endpoints
- SQL injection testing
- XSS testing
- CSRF testing
- Rate limiting validation
- Secret scanning (git history)
- Dependency vulnerability exploitation
- Container escape testing (se Docker)
- Supply chain attack simulation

**Output:**
```
CSO Audit Report (14 fases):
  - Stack detection
  - Attack surface mapping
  - Git history secrets scan
  - Dependency CVE analysis
  - CI/CD pipeline security
  - Infrastructure verification
  - LLM vector testing
  - OWASP Top 10 exploitation
  - STRIDE threat model validation
  - Findings com exploit scenario
  - Remediation plan
  - Trend tracking (fingerprints)
```

---

### 3.6 CISO (Chief Information Security Officer)

**Skills SOTA:** `secrets-guard` + `security-design` + `security-ops`

**Responsabilidades:**
- Consultado em TODAS as fases (design-time e runtime)
- Threat modeling STRIDE antes do build
- GDPR/compliance review
- Attack surface analysis
- Aprovacao de postura de seguranca (gate 5)
- Review final de seguranca pos-build
- Validacao do relatorio do Red Team

**Especial:** O CISO e o unico role que opera em TODAS as fases (como secrets-guard em Phase 0). E consultado pelo CEO antes de cada decisao critica.

---

## 4. OS 8 GATES PRE-PRD

Cada gate segue o padrao **One Decision Per Question**. O CEO apresenta research, recomendacao, e opcoes concretas. O Board (Wilson) decide.

### GATE 1 — Objectivo do Projecto

```
Trigger: Board fornece ideia/projecto
Actor: CEO
Apresenta ao Board:
  - Interpretacao do objectivo
  - Scope proposto (MVP vs Full)
  - Constraints identificadas
  - Timeline estimada (ordem de grandeza)
Board decide: Confirma/ajusta objectivo
Output: PROJECT_OBJECTIVE.md
```

### GATE 2 — Backend Stack

```
Trigger: VP Research conclui research de backend
Actor: VP Research → CEO → Board
Apresenta ao Board:
  - Top 3 opcoes de backend com pros/cons
    (e.g., Next.js Server Actions vs Express vs Hono)
  - Modelo: local (SQLite/PGlite) vs cloud (Supabase/PlanetScale/Neon)
  - ORM: Drizzle vs Prisma vs raw SQL
  - Criterios: performance, DX, comunidade, custo, SOTA-level
  - Recomendacao fundamentada
Board decide: Escolhe stack backend
Output: ADR-001-backend.md
```

### GATE 3 — Frontend Stack

```
Trigger: VP Research conclui research de frontend
Actor: VP Research → CEO → Board
Apresenta ao Board:
  - Top 3 opcoes de frontend framework
    (e.g., Next.js 15 vs Remix vs SvelteKit)
  - Rendering: SSR vs SSG vs ISR vs RSC
  - State management: Server state vs Zustand vs Jotai
  - Recomendacao fundamentada
Board decide: Escolhe stack frontend
Output: ADR-002-frontend.md
```

### GATE 4 — UI Framework & Design System

```
Trigger: VP Research conclui research de UI
Actor: VP Research → CEO → Board
Apresenta ao Board:
  - Top 3 opcoes de UI
    (e.g., shadcn/ui vs Radix vs Ark UI vs custom)
  - Styling: Tailwind v4 vs CSS Modules vs Vanilla Extract
  - Design tokens: sistema proposto
  - Anti-slop: garantias contra design generico
  - Recomendacao fundamentada
Board decide: Escolhe UI stack
Output: ADR-003-ui.md
```

### GATE 5 — Security Posture

```
Trigger: CISO conclui analise de seguranca
Actor: CISO → CEO → Board
Apresenta ao Board:
  - Threat model preliminar (STRIDE)
  - Attack surface esperada
  - Auth strategy (JWT vs sessions vs OAuth providers)
  - Data classification (que dados sao sensíveis)
  - Compliance requirements (GDPR? SOC2? nenhum?)
  - Security budget (ferramentas, tempo)
  - Recomendacao fundamentada
Board decide: Aprova postura de seguranca
Output: ADR-004-security.md
```

### GATE 6 — SOTA Research Report

```
Trigger: VP Research consolida toda a research
Actor: VP Research → CEO → Board
Apresenta ao Board:
  - Stack completa consolidada:
    Backend: [escolha] + [modelo] + [ORM]
    Frontend: [framework] + [rendering] + [state]
    UI: [component lib] + [styling] + [tokens]
    Security: [auth] + [posture] + [compliance]
  - Benchmark: porque esta stack e SOTA a data de hoje
  - Alternativas descartadas (com razoes)
  - Riscos e mitigacoes
  - Estimativa de effort
Board decide: Aprova stack completa
Output: SOTA-STACK-REPORT.md
```

### GATE 7 — Plano Final (PRD)

```
Trigger: VP Research finaliza PRD com input de todos os VPs
Actor: CEO → Board
Apresenta ao Board:
  - PRD completo:
    - User stories com acceptance criteria
    - Arquitectura (diagramas ASCII)
    - Data model
    - API contract (endpoints)
    - Paginas/screens com wireframes
    - Failure modes table
    - Timeline por fase
    - Definition of Done
  - Desvios do objectivo original (se houver)
Board decide: Aprova/ajusta PRD
Output: PRD.md + ARCHITECTURE-DIAGRAM.md
```

### GATE 8 — Processos Manuais

```
Trigger: CEO identifica accoes que so o Board pode fazer
Actor: CEO → Board
Apresenta ao Board:
  - Lista de accoes manuais necessarias:
    [ ] Criar conta em [servico X]
    [ ] Gerar API key para [servico Y]
    [ ] Configurar dominio
    [ ] Criar repo no GitHub
    [ ] Setup de .env com credenciais reais
    [ ] Configurar DNS
    [ ] Setup billing em cloud provider
  - Instrucoes passo-a-passo para cada
  - Template de .env com valores placeholder
Board executa: Faz as accoes e confirma
Output: .env configurado + acessos prontos
```

### Apos Gate 8: MODO AUTONOMO

```
╔══════════════════════════════════════════════════════╗
║  A EMPRESA FUNCIONA SOZINHA A PARTIR DESTE PONTO   ║
║  O Board so e contactado em caso de:               ║
║  - Bloqueio critico irresolvivel                   ║
║  - Mudanca de scope > 20%                          ║
║  - Custo inesperado > 2x estimativa                ║
╚══════════════════════════════════════════════════════╝
```

---

## 5. PIPELINE AUTONOMO (POS-GATES)

### Fase A — Setup (CEO)

```
CEO:
  1. Criar estrutura do projecto (scaffolding)
  2. Configurar git (repo, branches, hooks)
  3. Configurar .env a partir do template
  4. Instalar dependencias base
  5. Configurar linting + TypeScript strict
  6. Criar estructura de directórios
Output: Repo inicializado e pronto para build
Tempo estimado: 5-10 min
```

### Fase B — Foundation (Backend Lead + CISO)

```
Backend Lead:
  1. Setup database schema
  2. Implementar modelos (ORM)
  3. Implementar auth system (conforme gate 5)
  4. Implementar API base (CRUD endpoints)
  5. Implementar middleware (error handling, validation, rate limiting)
  6. Implementar seed data

CISO (em paralelo):
  - Review de seguranca do schema
  - Validar auth implementation
  - Verificar secrets management
  - Input validation audit

Output: Backend funcional com auth + API base
Tempo estimado: 30-60 min
```

### Fase C — Interface (Frontend Lead + UI Lead, em paralelo)

```
UI Lead:
  1. Definir design tokens (cores, fonts, spacing)
  2. Criar componentes base (Button, Input, Card, Layout, etc.)
  3. Criar paginas/layouts estruturais
  4. Implementar responsive design
  5. AI Slop check (rejeitar patterns genericos)

Frontend Lead (apos componentes base prontos):
  1. Implementar routing e paginas
  2. Integrar com API do backend
  3. Implementar state management
  4. Implementar loading/error states
  5. Implementar forms com validacao
  6. Server components onde aplicavel

Output: Frontend funcional e integrado com backend
Tempo estimado: 45-90 min
```

### Fase D — Polish (Todos os Leads)

```
Backend Lead:
  - Edge cases e error handling robusto
  - Optimizacao de queries
  - Caching onde aplicavel

Frontend Lead:
  - Performance (memoization, lazy loading)
  - Acessibilidade (WCAG 2.1 AA)
  - Animacoes/transicoes

UI Lead:
  - Consistencia visual final
  - Dark mode (se no scope)
  - Design baseline snapshot

CISO:
  - Security headers (CSP, HSTS, X-Frame, etc.)
  - Rate limiting final
  - CORS configuration

Output: Projecto polido e pronto para testes
Tempo estimado: 20-40 min
```

### Fase E — Testing (QA Lead)

```
QA Lead:
  1. Escrever unit tests (>80% coverage target)
  2. Escrever integration tests
  3. Escrever e2e tests (Playwright)
     - Happy paths
     - Error paths
     - Edge cases
     - Auth flows
  4. Performance testing (Lighthouse / Core Web Vitals)
  5. Code review multi-pass:
     - Pass 1 CRITICAL: SQL safety, race conditions, auth gaps
     - Pass 2 INFORMATIONAL: code style, naming, structure
  6. Quality scoring (5 dimensoes, 1-10)
  7. Fix-first resolution:
     - AUTO-FIX: formatting, simple bugs, missing validations
     - REPORT: judgment calls (para CEO decidir autonomamente)
  8. Regression suite

Output:
  - Test suite completa (unit + integration + e2e)
  - Quality report (.sota/reports/code-quality/)
  - Coverage report
  - Performance benchmarks (.sota/baselines/benchmark.json)
Tempo estimado: 30-60 min
```

### Fase F — Security Audit (CISO + Red Team)

```
CISO (auditoria defensiva):
  1. OWASP Top 10 checklist
  2. Dependency audit (npm audit, CVE scan)
  3. Secret scanning (git history)
  4. Container security (se Docker)
  5. TLS/SSL verification
  6. Security headers check
  7. Auth flow audit completo

Red Team (ataques ofensivos):
  1. SQL Injection (todos os endpoints)
  2. XSS (reflected, stored, DOM-based)
  3. CSRF attacks
  4. Auth bypass attempts
  5. Brute force (login, password reset)
  6. Rate limiting evasion
  7. IDOR (Insecure Direct Object Reference)
  8. Path traversal
  9. Server-side request forgery (SSRF)
  10. Business logic abuse
  11. API abuse (mass assignment, excessive data exposure)
  12. JWT manipulation (se aplicavel)
  13. Session fixation/hijacking

Output:
  - CSO Audit Report 14 fases (.sota/reports/security/)
  - Penetration Test Report com:
    - Vulnerabilidades encontradas (CRITICAL/HIGH/MEDIUM/LOW)
    - Exploit scenarios (prova de conceito)
    - Remediation steps
    - Re-test results apos fix
  - Security score final
Tempo estimado: 30-45 min
```

### Fase G — Final Assembly (CEO)

```
CEO:
  1. Verificar que todos os outputs estao completos
  2. Correr TODOS os testes uma ultima vez (dry run)
  3. Verificar que TODOS os findings de seguranca foram resolvidos
  4. Gerar changelog e release notes
  5. Criar commit final (signed, convencional)
  6. Gerar relatorio final para o Board:

FINAL REPORT:
  ├── Project Summary
  │   ├── Objectivo (conforme gate 1)
  │   ├── Stack escolhida (conforme gate 6)
  │   └── Desvios do plano (se houver)
  ├── Technical Summary
  │   ├── Arquitectura final
  │   ├── Endpoints implementados
  │   ├── Paginas/features
  │   └── Metricas de codigo (LOC, files, coverage)
  ├── Quality Report
  │   ├── Test results (pass/fail/skip)
  │   ├── Coverage %
  │   ├── Performance scores (LCP, FID, CLS)
  │   └── Quality score (1-10 por dimensao)
  ├── Security Report
  │   ├── CSO audit score
  │   ├── Penetration test results
  │   ├── Vulnerabilidades encontradas vs resolvidas
  │   └── Security posture final
  └── Deployment Instructions
      ├── Como correr localmente
      ├── Como deployar (Docker / Vercel / etc.)
      └── Environment variables necessarias

Output: Projecto entregue ao Board
```

---

## 6. OUTPUT CHAINING (Fluxo de Dados entre Roles)

```
Board (objectivo)
  │
  ▼
CEO → VP Research
  │     │
  │     ├── GATE 1: Objectivo → Board
  │     ├── Research Backend → GATE 2: Board
  │     ├── Research Frontend → GATE 3: Board
  │     ├── Research UI → GATE 4: Board
  │     ├── CISO Security → GATE 5: Board
  │     ├── SOTA Report → GATE 6: Board
  │     ├── PRD → GATE 7: Board
  │     └── Manual Tasks → GATE 8: Board
  │
  ▼ (MODO AUTONOMO)
CEO → Backend Lead
  │     │ Output: Schema + API + Auth
  │     ▼
  │   Frontend Lead ← UI Lead
  │     │ Output: Interfaces integradas
  │     ▼
  │   QA Lead
  │     │ Output: Tests + Quality Report
  │     ▼
  │   CISO + Red Team
  │     │ Output: Security Audit + Pen Test
  │     ▼
  └── CEO (Assembly + Final Report → Board)
```

**Regra:** Cada role recebe o OUTPUT da role anterior como INPUT. Nunca trabalham no vazio.

---

## 7. ESTADO PERSISTENTE

```
.sota/
├── company/
│   ├── objective.md           ← Gate 1 output
│   ├── adr/
│   │   ├── ADR-001-backend.md ← Gate 2
│   │   ├── ADR-002-frontend.md← Gate 3
│   │   ├── ADR-003-ui.md     ← Gate 4
│   │   └── ADR-004-security.md← Gate 5
│   ├── sota-stack-report.md   ← Gate 6
│   ├── prd.md                 ← Gate 7
│   └── manual-tasks.md       ← Gate 8
├── reports/
│   ├── code-quality/          ← QA Lead output
│   ├── testing/               ← Test results + screenshots
│   ├── security/              ← CSO audit + pen test
│   └── ship/                  ← Deploy reports
├── baselines/
│   ├── design-baseline.json   ← UI Lead visual snapshot
│   └── benchmark.json         ← Performance baseline
├── activity-log/              ← Immutable audit trail
│   └── YYYY-MM-DD-HH-MM.json ← Cada accao logada
└── final-report.md            ← CEO assembly output
```

---

## 8. INVOCACAO

### Como Comecar

O utilizador (Board) diz algo como:
```
"Quero construir uma app de [X] que faz [Y] para [Z]"
```

O CEO activa-se e inicia o pipeline a partir do Gate 1.

### Slash Command Proposto

```
/company [descricao do projecto]
```

Alternativa mais explicita:
```
/company-new "App de gestao de tarefas com AI para equipas remotas"
```

### Modo de Execucao

```
Opcao A — Sequencial (recomendado para v1):
  Gates 1-8 executados um a um, interativos
  Build executado sequencialmente: Backend → Frontend → Polish → Test → Security

Opcao B — Paralelo (futuro):
  Gates 1-8 sequenciais (requerem Board)
  Build paralelo: Backend || (UI Lead) → Frontend apos ambos
  Test + Security em paralelo
```

---

## 9. SELF-REGULATION

### Limites Autonomos

| Metrica | Limite | Accao |
|---------|--------|-------|
| WTF-likelihood | > 20% | STOP e reportar ao CEO |
| Fixes por sessao | > 50 | STOP QA loop |
| Tentativas de debug | > 3 strikes | Escalar para CEO |
| Desvio de scope | > 20% | Escalar para Board |
| Tempo por fase | > 2x estimativa | CEO reavalia |

### Principios de Autonomia (6 — do gstack)

1. **Escolher completude sobre atalhos** — Boil the Lake
2. **Corrigir tudo no blast radius** (se < 1 dia de effort)
3. **Escolher a opcao pragmatica** quando equivalentes
4. **Rejeitar duplicacao** — reutilizar funcionalidade existente
5. **Preferir explicito sobre clever** — codigo obvio > abstracoes
6. **Favorecer accao sobre deliberacao** — decidir e avancar

---

## 10. IMPLEMENTACAO TECNICA

### Opcao A — Claude Agents (v1, imediato)

Usar Claude sub-agents para simular a hierarquia:
- CEO = agente principal com contexto de core-engine
- Cada VP/Lead = sub-agente lancado com o SKILL.md relevante injectado
- Board interactions = AskUserQuestion
- Estado = ficheiros em .sota/
- Comunicacao = output chaining via ficheiros

**Vantagem:** Funciona AGORA, sem infraestrutura adicional.
**Limitacao:** Nao ha paralelismo real entre agentes.

### Opcao B — Paperclip (v2, futuro)

Deployar Paperclip como control plane:
- Company = o projecto
- Agents = cada role (CEO, VP Research, Backend Lead, etc.)
- Tasks = issues no Paperclip
- Heartbeats = invocacoes periodicas de cada agente
- Budget = tracking de tokens
- Board = dashboard Paperclip

**Vantagem:** Paralelismo real, governance UI, cost tracking, audit trail.
**Limitacao:** Requer setup de Paperclip + agentes como processos separados.

### Opcao C — Hibrido (v1.5)

Claude agents para logica + Paperclip para tracking:
- Execucao: Claude sub-agents (como v1)
- Tracking: Paperclip API para registar tasks, costs, activity
- Dashboard: Paperclip UI para monitoring
- Governance: Paperclip approvals para os 8 gates

**Vantagem:** Best of both worlds.
**Limitacao:** Complexidade de integracao.

### Recomendacao

**Comecar com Opcao A** (funciona hoje). Migrar para **Opcao C** quando Paperclip estiver maduro. **Opcao B** e o end-game.

---

## 11. MAPA SKILLS → ROLES

| Role | Skills SOTA | Fase |
|------|------------|------|
| CEO | core-engine, git-ops | 0 |
| VP Research | ideation, architecture | 1, 2 |
| CISO | secrets-guard, security-design, security-ops | 0, 2, 6 |
| Backend Lead | api-engineering, backend | 3 |
| Frontend Lead | frontend | 4 |
| UI Lead | design-system | 4 |
| QA Lead | testing, code-quality | 5 |
| Red Team | security-ops (ofensivo) | 6 |
| meta | meta (auto-melhoria pos-projecto) | X |
| professions | professions (dominio do projecto) | X |

**Nota:** Todas as 17 skills estao mapeadas. Nenhuma fica sem dono.

---

## 12. METRICAS DE SUCESSO

### Para o Board avaliar a empresa:

| Metrica | Target | Medido por |
|---------|--------|------------|
| Test coverage | > 80% | QA Lead |
| Quality score | > 7/10 (cada dimensao) | QA Lead |
| Security score | 0 CRITICAL, 0 HIGH | Red Team |
| Performance (LCP) | < 2.5s | QA Lead |
| Performance (FID/INP) | < 200ms | QA Lead |
| Performance (CLS) | < 0.1 | QA Lead |
| OWASP Top 10 | 0 vulnerabilities | CISO |
| Pen test | 0 exploitable findings | Red Team |
| Desvio de scope | < 20% | CEO |
| Desvio de timeline | < 50% | CEO |

---

*Especificacao completa da SOTA Company — empresa AI autonoma.*
*Pronta para implementacao como Opcao A (Claude Agents).*

# SOTA COMPANY — Sessoes, Registos & Claude Max

> **Status:** SPEC v2 — Sessoes com começo/fim, departamento de registos, Claude Max
> **Data:** 2026-03-26
> **Complementa:** COMPANY-SPEC.md (arquitectura) + COMPANY-LLM-ASSIGNMENTS.md (substituido)
> **Motor:** Claude Max (Opus 4 para raciocinio, Sonnet 4 para execucao)

---

## 1. MUDANCA DE PARADIGMA

### De: Agentes Autonomos 24/7 (Ollama Cloud)
### Para: Sessoes de Trabalho com Estado Persistente (Claude Max)

```
ANTES (Ollama):
  Agentes correm sozinhos → heartbeats → schedules → background
  Problema: caro, complexo, precisa de infra

AGORA (Claude Max):
  O Board abre sessao → empresa trabalha → Board fecha sessao
  Tudo registado → proxima sessao retoma EXACTAMENTE onde parou
  Zero schedules. Zero background. Zero infra extra.
```

### Principio Novo

> **"A empresa trabalha quando o Board abre a porta. Quando fecha, tudo fica escrito."**

Nao ha cron jobs. Nao ha heartbeats. Nao ha processos a correr de noite.
A empresa e como um escritorio real: abre de manha, trabalha, fecha ao fim do dia. Os dossiers ficam na secretaria, prontos para amanha.

---

## 2. MODELO DE EXECUCAO: CLAUDE MAX

### Porque Claude Max e nao Ollama

| Criterio | Ollama Pro Cloud | Claude Max |
|----------|-----------------|------------|
| Qualidade de raciocinio | Variavel (4 modelos) | Opus 4 = SOTA absoluto |
| Qualidade de codigo | Qwen3-Coder 85.9% SWE | Sonnet 4 = competitivo ou superior |
| Tool use | Fraco a medio | **Nativo** (Bash, Edit, Read, Write, Agents) |
| Sub-agentes | Manual (API calls) | **Nativo** (Agent tool built-in) |
| State management | Manual (.sota/ files) | **Nativo** (.sota/ + conversation context) |
| Custo | Por token × 4 modelos | Flat rate (Max subscription) |
| Infra necessaria | Ollama server + routing | **Zero** (funciona no Cowork) |
| Coordenacao entre roles | HTTP APIs + Paperclip | **Sub-agents nativos** |

### Distribuicao de Modelos Claude

| Tipo de Trabalho | Modelo | Roles |
|-----------------|--------|-------|
| **Raciocinio profundo** | Opus | CEO, VP Research, CISO |
| **Execucao de codigo** | Sonnet | Backend Lead, Frontend Lead, UI Lead, QA Lead |
| **Ataques/seguranca** | Opus | Red Team (chain-of-thought longo) |
| **Registos** | Sonnet | Registrar (volume alto, formatacao) |

**Regra:** Opus para PENSAR. Sonnet para FAZER. Nunca ao contrario.

---

## 3. NOVO ORGANOGRAMA (com Registrar)

```
                    ┌─────────────────┐
                    │   BOARD (Human)  │
                    │   Wilson         │
                    │   Abre/Fecha    │
                    │   sessoes       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │      CEO        │      ┌──────────────────┐
                    │  (Orchestrator) │◄────►│   REGISTRAR      │
                    │  Claude Opus    │      │   (Taquigrafo)   │
                    │  core-engine    │      │   Claude Sonnet  │
                    │  git-ops        │      │                  │
                    └────────┬────────┘      │  Regista TUDO:   │
                             │               │  - Decisoes      │
            ┌────────────────┼────────┐      │  - Codigo criado │
            │                │        │      │  - Erros         │
   ┌────────▼────┐  ┌───────▼──┐  ┌──▼───┐  │  - Gates         │
   │ VP RESEARCH │  │ VP BUILD │  │ VP   │  │  - Tempo gasto   │
   │ Opus        │  │ (delega) │  │QUALIT│  │  - Estado actual  │
   └─────────────┘  └────┬─────┘  └──┬───┘  │  - Proximos steps│
                    ┌─────┼─────┐    │      └──────────────────┘
                    │     │     │    │
                  Back  Front  UI   QA    CISO    Red Team
                  Lead  Lead  Lead  Lead  (Opus)  (Opus)
                  Sonn  Sonn  Sonn  Sonn
```

---

## 4. O REGISTRAR (Departamento de Registos)

### Conceito

O Registrar e o taquigrafo da empresa. Esta presente em TODAS as accoes e regista tudo num formato estruturado que permite a qualquer sessao futura retomar exactamente onde a anterior parou.

### O que Regista

```
Para CADA accao de qualquer role:

{
  "session_id": "2026-03-26-001",
  "timestamp": "2026-03-26T14:32:15Z",
  "role": "Backend Lead",
  "action": "CREATE_FILE",
  "details": {
    "file": "src/server/routes/auth.ts",
    "description": "Implementar endpoint POST /api/auth/login com JWT",
    "lines_added": 47,
    "dependencies_used": ["jose", "zod"],
    "tests_written": false,
    "tests_pending": "unit test para login com credenciais invalidas"
  },
  "state_before": "API base com CRUD de users, sem auth",
  "state_after": "Auth endpoint funcional, falta middleware de protecao",
  "next_steps": [
    "Implementar middleware authGuard",
    "Proteger rotas privadas",
    "Escrever testes para auth flow"
  ],
  "blockers": [],
  "decisions_made": [
    "Escolhi jose em vez de jsonwebtoken por ser mais leve e ESM-native"
  ]
}
```

### Niveis de Registo

| Nivel | O que | Quando | Formato |
|-------|-------|--------|---------|
| **ACAO** | Cada ficheiro criado/editado | Real-time | JSON entry |
| **DECISAO** | Cada escolha tecnica com razao | Ao decidir | ADR mini-format |
| **GATE** | Cada interaccao com o Board | Nos 8 gates | Gate report |
| **ERRO** | Cada erro encontrado e como foi resolvido | Ao ocorrer | Error + fix entry |
| **SESSAO** | Resumo de inicio e fim de cada sessao | Start/End | Session summary |
| **MILESTONE** | Conclusao de cada fase (A-G) | Ao completar | Phase report |

### Ficheiros do Registrar

```
.sota/
├── sessions/
│   ├── 2026-03-26-001/           ← Sessao 1
│   │   ├── session-open.md       ← Estado ao abrir
│   │   ├── session-close.md      ← Estado ao fechar
│   │   ├── actions.jsonl         ← Log de accoes (JSON Lines)
│   │   ├── decisions.md          ← Decisoes tomadas
│   │   └── errors.md             ← Erros e resolucoes
│   ├── 2026-03-26-002/           ← Sessao 2
│   │   └── ...
│   └── latest-state.md           ← FICHEIRO CRITICO (ver abaixo)
├── company/                       ← (existente)
├── reports/                       ← (existente)
└── ...
```

---

## 5. O FICHEIRO CRITICO: `latest-state.md`

Este e o ficheiro mais importante de toda a empresa. E lido PRIMEIRO em cada sessao nova. Contem o estado EXACTO do projecto neste momento.

### Formato

```markdown
# SOTA Company — Estado Actual

> Ultima atualizacao: 2026-03-26T18:45:00Z
> Sessao anterior: 2026-03-26-001
> Duracacao da sessao anterior: 2h15min

## Projecto
- **Nome:** [nome do projecto]
- **Objectivo:** [conforme gate 1]
- **Stack:** [conforme gate 6]

## Fase Actual
- **Fase:** C (Interface — Frontend + UI)
- **Sub-fase:** Frontend Lead a integrar com API
- **Progresso geral:** 45%

## O que esta FEITO (checkmarks)
- [x] Gate 1: Objectivo aprovado
- [x] Gate 2: Backend stack aprovado (Next.js + Drizzle + Neon)
- [x] Gate 3: Frontend stack aprovado (Next.js 15 + RSC)
- [x] Gate 4: UI stack aprovado (shadcn/ui + Tailwind v4)
- [x] Gate 5: Security posture aprovada (JWT + bcrypt + CSRF)
- [x] Gate 6: SOTA research report aprovado
- [x] Gate 7: PRD aprovado
- [x] Gate 8: Processos manuais completos (.env configurado)
- [x] Fase A: Setup completo (repo, deps, linting)
- [x] Fase B: Backend completo (schema, API, auth)
- [ ] Fase C: Frontend em progresso (60%)
- [ ] Fase D: Polish
- [ ] Fase E: Testing
- [ ] Fase F: Security Audit
- [ ] Fase G: Final Assembly

## O que esta EM PROGRESSO
- Frontend Lead: Implementando pagina de dashboard (src/app/dashboard/page.tsx)
  - Layout pronto
  - Sidebar pronta
  - Falta: widgets de dados, graficos, integracao com API /api/stats
- UI Lead: Componente Chart nao existe ainda em design-system

## O que falta FAZER (proximo na fila)
1. UI Lead: Criar componente Chart (bar + line)
2. Frontend Lead: Integrar Chart no dashboard
3. Frontend Lead: Pagina de settings
4. Frontend Lead: Pagina de perfil
5. Comecar Fase D (polish)

## Ficheiros Criados/Editados (esta sessao)
- src/app/dashboard/page.tsx (NOVO — 89 linhas)
- src/app/dashboard/layout.tsx (NOVO — 34 linhas)
- src/components/ui/sidebar.tsx (NOVO — 67 linhas)
- src/server/routes/stats.ts (NOVO — 45 linhas)

## Decisoes Tecnicas Pendentes
- Nenhuma (todas decididas nos gates)

## Blockers
- Nenhum

## Notas para Proxima Sessao
- Comecar pelo componente Chart (UI Lead)
- Depois integrar no dashboard (Frontend Lead)
- Se Chart + dashboard estiverem prontos, avancar para settings page
```

---

## 6. PROTOCOLOS DE SESSAO

### 6.1 Protocolo de ABERTURA (Start of Day)

Quando o Board (Wilson) inicia uma sessao de trabalho:

```
BOARD: "Bom dia" / "Continua" / "/company-resume"

CEO (automaticamente):
  1. LER .sota/sessions/latest-state.md
  2. LER .sota/sessions/[ultima-sessao]/session-close.md
  3. APRESENTAR ao Board:
     - "Bom dia. Estado do projecto: [fase], [progresso]%"
     - "Na ultima sessao completamos: [resumo]"
     - "Hoje o plano e: [proximos steps do latest-state]"
     - "Estimativa para hoje: [X horas para completar fase Y]"
  4. REGISTRAR: session-open.md com timestamp e estado inicial
  5. COMECAR a trabalhar (sem esperar aprovacao — o Board ja aprovou nos gates)
```

### 6.2 Protocolo de FECHO (End of Day)

Quando o Board quer fechar a sessao:

```
BOARD: "Para por hoje" / "Fim do dia" / "/company-pause"

CEO (automaticamente):
  1. COMPLETAR a accao em curso (nunca parar a meio de um ficheiro)
  2. GUARDAR todo o trabalho (git commit com mensagem descritiva)
  3. PEDIR ao Registrar:
     - Actualizar latest-state.md
     - Escrever session-close.md com:
       * Resumo do que foi feito
       * Estado exacto (que ficheiro estava a editar, que funcao faltava)
       * Lista de proximos steps (ordenada por prioridade)
       * Tempo gasto
       * Decisoes tomadas
       * Erros encontrados e como foram resolvidos
  4. APRESENTAR ao Board:
     - "Sessao encerrada. Progresso: [X]% → [Y]%"
     - "Feito hoje: [lista curta]"
     - "Proximo: [primeiro item da fila]"
     - "Estimativa para conclusao: [N sessoes mais]"
  5. REGISTRAR: session-close.md com timestamp e estado final
```

### 6.3 Protocolo de INTERRUPCAO (Pausa a Meio)

Se o Board precisa de parar antes do fim natural:

```
BOARD: "Pausa" / "Tenho de ir" / "/company-pause"

CEO:
  1. PARAR no proximo ponto seguro (nao a meio de uma funcao)
  2. Git commit do estado actual
  3. Registrar EXACTAMENTE onde parou:
     - "Estava a implementar funcao X no ficheiro Y"
     - "Linhas 45-67 escritas, falta: validacao de input e error handling"
     - "Contexto: esta funcao e chamada por Z e precisa de retornar W"
  4. Actualizar latest-state.md
  5. Confirmar ao Board: "Salvo. Podes retomar a qualquer momento."
```

### 6.4 Protocolo de RETOMADA (apos N dias de pausa)

Se passaram varios dias entre sessoes:

```
CEO:
  1. LER latest-state.md (critico)
  2. VERIFICAR se a stack ainda e SOTA:
     - Se passaram > 7 dias: quick check de dependencias
     - Se passaram > 30 dias: VP Research faz mini-audit de stack
  3. LER session-close.md da ultima sessao
  4. RECONSTRUIR contexto mental:
     - Reler PRD relevante
     - Reler ultimos ficheiros editados
     - Verificar que nada mudou no repo
  5. APRESENTAR estado ao Board
  6. RETOMAR exactamente onde parou
```

---

## 7. FORMATO DO REGISTO DE ACCOES (actions.jsonl)

Cada linha e um JSON independente (JSON Lines format). Permite append sem reescrever o ficheiro inteiro.

```jsonl
{"ts":"2026-03-26T14:00:00Z","role":"CEO","action":"SESSION_OPEN","detail":"Sessao iniciada. Fase B (Foundation)."}
{"ts":"2026-03-26T14:01:15Z","role":"Backend Lead","action":"CREATE_FILE","file":"src/db/schema.ts","lines":52,"detail":"Schema com tabelas users, sessions, projects"}
{"ts":"2026-03-26T14:05:30Z","role":"Backend Lead","action":"CREATE_FILE","file":"src/server/routes/users.ts","lines":78,"detail":"CRUD endpoints para users"}
{"ts":"2026-03-26T14:05:31Z","role":"Backend Lead","action":"DECISION","detail":"Escolhi Drizzle em vez de Prisma: melhor type inference e edge-compatible","adr":"ADR-001"}
{"ts":"2026-03-26T14:12:00Z","role":"CISO","action":"REVIEW","file":"src/server/routes/users.ts","detail":"Validacao de email usa regex insegura. Corrigido para zod email().","severity":"MEDIUM"}
{"ts":"2026-03-26T14:12:01Z","role":"Backend Lead","action":"EDIT_FILE","file":"src/server/routes/users.ts","lines_changed":3,"detail":"Substituido regex por z.string().email()"}
{"ts":"2026-03-26T14:20:00Z","role":"Backend Lead","action":"ERROR","detail":"Drizzle migrate falha: coluna 'role' sem default","resolution":"Adicionado .default('user') ao schema","time_to_fix":"2min"}
{"ts":"2026-03-26T16:15:00Z","role":"CEO","action":"SESSION_CLOSE","detail":"Fase B completa. Backend com auth funcional. Progresso: 25% → 40%."}
```

---

## 8. O QUE MUDA NO COMPANY-SPEC.md

### Mudancas ao Organograma

```diff
+ REGISTRAR (Taquigrafo)
+ - Claude Sonnet
+ - Presente em TODAS as accoes
+ - Regista decisions, actions, errors, state
+ - Actualiza latest-state.md em tempo real
+ - Gera session-open.md e session-close.md
```

### Mudancas ao Pipeline

```diff
- Modo autonomo 24/7
+ Modo sessao: abre → trabalha → fecha → retoma

- Heartbeats e schedules
+ Protocolos de abertura/fecho/pausa/retomada

- .sota/ apenas para reports
+ .sota/sessions/ para estado completo entre sessoes
```

### Mudancas aos LLMs

```diff
- Qwen3.5 (CEO, VP Research)
- Qwen3-Coder-Next (Backend Lead, QA Lead)
- Kimi K2.5 (Frontend Lead, UI Lead)
- DeepSeek R1 (CISO, Red Team)
+ Claude Opus 4 (CEO, VP Research, CISO, Red Team)
+ Claude Sonnet 4 (Backend Lead, Frontend Lead, UI Lead, QA Lead, Registrar)
```

### Nova Tabela de Roles

| Role | Modelo | Tipo | Razao |
|------|--------|------|-------|
| **CEO** | Opus | Raciocinio | Orquestracao, decisoes, planning |
| **VP Research** | Opus | Raciocinio | Analise profunda, PRD, ADRs |
| **CISO** | Opus | Raciocinio | Threat modeling STRIDE, compliance |
| **Red Team** | Opus | Raciocinio | Attack chains, pen-test reasoning |
| **Backend Lead** | Sonnet | Execucao | Codigo backend, APIs, DB |
| **Frontend Lead** | Sonnet | Execucao | React, Next.js, integracao |
| **UI Lead** | Sonnet | Execucao | Design system, Tailwind, componentes |
| **QA Lead** | Sonnet | Execucao | Testes, code review, fixes |
| **Registrar** | Sonnet | Registo | Taquigrafia de TUDO, state management |

---

## 9. REGRAS DO REGISTRAR

### Regra 1: Tudo e Registado
Nenhuma accao existe se nao estiver nos registos. Se nao esta em `actions.jsonl`, nao aconteceu.

### Regra 2: latest-state.md e Sagrado
Este ficheiro e a unica fonte de verdade sobre o estado do projecto. E actualizado:
- No fim de cada fase
- No fim de cada sessao
- Quando um blocker aparece
- Quando uma decisao importante e tomada

### Regra 3: Registar Contexto, nao so Accao
Mau registo: "Criou ficheiro auth.ts"
Bom registo: "Criou ficheiro auth.ts com endpoint POST /api/auth/login usando JWT (jose lib). Aceita email+password, retorna accessToken (15min) + refreshToken (7d). Falta: middleware de protecao, rate limiting, testes."

### Regra 4: Proximos Steps Sempre Actualizados
O campo `next_steps` em latest-state.md e actualizado apos CADA accao importante. Nunca pode estar vazio (a menos que o projecto esteja completo).

### Regra 5: Erros sao Ouro
Cada erro encontrado e registado com: o que falhou, porque falhou, como foi resolvido, e tempo gasto. Isto permite que sessoes futuras evitem os mesmos erros.

### Regra 6: Decisoes Precisam de "Porque"
Cada decisao tecnica e registada com a razao. "Escolhi X" nao e suficiente. "Escolhi X porque Y e Z" e o minimo.

---

## 10. EXEMPLO DE SESSAO COMPLETA

### Sessao 1 (2h — Gates 1-4)

```
14:00 — Board: "Quero construir uma app de gestao de projectos com AI"
14:00 — CEO abre sessao, Registrar cria session-open.md
14:02 — CEO apresenta Gate 1 (objectivo)
14:05 — Board aprova: "App de gestao de projectos com AI para equipas remotas"
14:05 — Registrar: gate-1-approved.md + actions.jsonl entry
14:10 — VP Research inicia research de backend
14:30 — VP Research apresenta Gate 2 (backend: Next.js + Drizzle + Neon)
14:35 — Board aprova
14:35 — Registrar: ADR-001-backend.md + actions.jsonl
14:40 — VP Research inicia research de frontend
14:55 — VP Research apresenta Gate 3 (Next.js 15 + RSC + Zustand)
15:00 — Board aprova
15:00 — Registrar: ADR-002-frontend.md
15:05 — VP Research inicia research de UI
15:20 — VP Research apresenta Gate 4 (shadcn/ui + Tailwind v4)
15:25 — Board aprova
15:25 — Registrar: ADR-003-ui.md
15:25 — Board: "Tenho de ir, continuamos amanha"
15:26 — CEO: protocolo de pausa
15:27 — Registrar actualiza latest-state.md:
         "Gates 1-4 completos. Falta: Gate 5 (security), 6 (SOTA report), 7 (PRD), 8 (manual)"
15:28 — Sessao fechada. Tudo salvo.
```

### Sessao 2 (3h — Gates 5-8 + Setup)

```
10:00 — Board: "Bom dia, continua"
10:00 — CEO le latest-state.md
10:01 — CEO: "Bom dia. Ontem completamos gates 1-4. Hoje: security, SOTA report, PRD, e setup."
10:02 — CISO apresenta Gate 5 (security posture)
...e assim por diante
```

---

## 11. SLASH COMMANDS

| Comando | Accao |
|---------|-------|
| `/company-new [descricao]` | Iniciar novo projecto (Gate 1) |
| `/company-resume` | Retomar projecto existente (le latest-state.md) |
| `/company-pause` | Pausar sessao (protocolo de fecho) |
| `/company-status` | Ver estado actual sem alterar nada |
| `/company-history` | Ver historico de sessoes e decisoes |
| `/company-rewind [sessao]` | Ver estado numa sessao especifica |

---

## 12. VANTAGENS SOBRE OLLAMA

| Aspecto | Ollama Pro Cloud | Claude Max + Sessoes |
|---------|-----------------|---------------------|
| **Custo** | Por token × 4 modelos | Flat rate |
| **Qualidade** | Variavel | Opus (top) + Sonnet (forte) |
| **Coordenacao** | API calls entre modelos | Sub-agents nativos |
| **Estado** | Manual (files) | Manual (files) + conversation memory |
| **Infra** | Ollama server | Zero (Cowork) |
| **Audit trail** | Manual | Registrar automatico |
| **Resumability** | Complexo | latest-state.md + protocolos |
| **Tool use** | Fraco | Nativo (Bash, Edit, Read, Write) |
| **Human-in-the-loop** | API polling | AskUserQuestion nativo |

---

*Addendum ao COMPANY-SPEC.md — sessoes, registos, e migracao para Claude Max.*
*O COMPANY-LLM-ASSIGNMENTS.md fica como referencia historica (analise de modelos Ollama) mas nao e usado na implementacao.*

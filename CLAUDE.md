# Ginásio — Project Instructions

> Projecto governado pelo Estado-Maior (`~/Comando Central/`).
> Regras Tier-1 do Estado-Maior aplicam-se sem excepção.

---

## HERANÇA DO ESTADO-MAIOR (ler no início de cada conversa)

**Identidade e regras globais:**
- `~/Comando Central/me.md` — Quem é Wilson, como pensa, como quer ser tratado
- `~/Comando Central/CLAUDE.md` — Regras Tier-1 (17 regras invioláveis), classificador, router
- `~/Comando Central/SKILLS/SECURITY.md` — Defense-in-depth (12 camadas)
- `~/Comando Central/SKILLS/ARCHITECTURE.md` — Matriz de routing e grafo de skills

**Documentos globais:**
- `~/Comando Central/docs/prd.md` — PRD do Estado-Maior (decisões, roadmap, backlog global)
- `~/Comando Central/docs/spec-template.md` — Template specs SDD
- `~/Comando Central/docs/project-onboarding.md` — Guia onboarding

**Skills (21, herdadas via symlink):**
- `SKILLS/` neste projecto → symlink para `~/Comando Central/SKILLS/`
- Fase 0 sempre activa: core-engine, git-ops, secrets-guard, session-search, estado-maior

---

## DOCUMENTOS DESTE PROJECTO

**PRD do projecto:** `docs/prd.md`
- Decisões específicas (ADRs)
- Roadmap e marcos
- Regra: append-only (nunca apagar linhas)

**Specs SDD:** `docs/specs/`
- Criar spec antes de código
- Regra: sem spec aprovada, sem código

**Harness (GSD-2):** `.gsd/`
- `.gsd/PREFERENCES.md` — config motor de execução
- `.gsd/KNOWLEDGE.md` — semantic ground truth

**Registo de sessões (session-search):** centralizado em `~/.estado-maior/state.db` (SQLite+FTS5)
- Toda decisão, input, tarefa concluída persistida automaticamente
- Busca cross-session via MCP tools: `search_sessions`, `get_bootstrap_context`, `save_session`
- Persistência automática no início (bootstrap) e fim (save) de cada sessão
- Supersede stenographer markdown (ADR-014/015)

---

## PROTOCOLO DE SESSÃO

No **início de cada conversa** sobre este projecto:

```
1. Ler ~/Comando Central/me.md
2. Invocar session-search (`get_bootstrap_context`) para recuperar estado da última sessão
3. Ler docs/prd.md (PRD deste projecto)
4. Ler .gsd/KNOWLEDGE.md (contexto técnico)
5. Consolidar bootstrap + docs no contexto
6. Só depois, responder ao Wilson
```

No **fim da sessão** ou antes de compactação:

```
1. session-search persiste automaticamente (via `save_session`): o que foi feito, decisões, pendentes
2. Actualizar docs/prd.md se houve decisões ou mudanças
3. Actualizar .gsd/KNOWLEDGE.md se o contexto mudou
4. Actualizar ~/Comando Central/docs/prd.md §4 se o estado do projecto mudou
5. OBSIDIAN INGEST GATE (Regra #17 Tier-1): se a sessão produziu artefactos significativos
   (spec, ADR, decisão, feature, bug fix, research), ingerir no vault Obsidian ANTES de fechar.
   Artefacto significativo = qualquer coisa que Wilson precisaria de recordar em sessões futuras.
```

---

## O QUE É ESTE PROJECTO

TODO: Wilson — descrever o projecto ginásio (fitness app, tracking, etc.)

## STACK TÉCNICA

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Next.js
- **Base de dados:** TODO
- **Styling:** TODO

## ESTRUTURA DE FICHEIROS

TODO: Adaptar à estrutura real do projecto

```
ginasio/
├── CLAUDE.md              → Este ficheiro
├── SKILLS/ → ../../SKILLS → Skills do Estado-Maior (symlink)
├── docs/
│   ├── prd.md             → PRD deste projecto (append-only)
│   └── specs/             → Specs SDD
├── .gsd/                  → Harness state
├── src/                   → Código fonte
└── .gitignore
```

## REGRAS ESPECÍFICAS DESTE PROJECTO

TODO: Preencher com regras específicas

## ANTI-PATTERNS (o que NÃO fazer)

TODO: Preencher

## PIPELINE SOTA v3 (Linha de Montagem)

Projecto usa pipeline SOTA v3: RESEARCH → PLAN → BUILD → REVIEW → SHIP.
5 agentes + Orchestrator + Gatekeeper (hooks mecânicos).

Profession files em `.claude/agents/`:
- `researcher.md` → Pesquisa, fontes citadas, research briefs
- `ceo.md` → Estratega (não escreve código, planeia e documenta, lê research briefs)
- `engineer.md` → Executor (segue specs, commits atómicos, NUNCA merge/tag/changelog)
- `auditor.md` → Verificador (BUILD REVIEW, PLAN REVIEW, RED-TEAM, RESEARCH REVIEW)
- `deployer.md` → Merge, tags, changelog, production (só após PASS do Auditor)
- `orchestrator.md` → Coordena pipeline completo, spawna agentes por fase
- `gatekeeper.md` → Documentação regras enforcement mecânico

**Gatekeeper (enforcement mecânico):**
Hooks nativos em `.claude/settings.json` — NÃO é agente LLM.
Bloqueia: force push, --no-verify, secrets em commits/Write/Edit, rm -rf críticos, escrita em .env/.gsd/.
Scripts em `.claude/scripts/`. Ver ADR-031.

**Routing Cowork ↔ Claude Code (Regra #17):**
- Cowork: estratégia, planeamento, documentação, organização, PRD, ADRs, research
- Claude Code: código, commits, git, testes, deploy, fix bugs, refactoring
- Trabalho pertence ao outro lado → não executar, redirecionar em 1 frase

## GIT WORKFLOW

- Branch a partir de `main`
- Naming: `type/short-description` (ex: `feat/user-auth`)
- Commits atómicos — um commit por mudança lógica
- PT-PT para mensagens de commit, EN para código
- Signed commits recomendados

---

*Gerado a partir do template do Estado-Maior v2.0.0. Última actualização: 2026-05-08*
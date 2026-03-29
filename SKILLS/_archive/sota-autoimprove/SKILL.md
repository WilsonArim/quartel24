---
name: SOTA Autoimprove
description: >
  Loop autonomo de auto-melhoria de skills inspirado no autoresearch do Karpathy.
  O agente escolhe uma skill, forma uma hipotese de melhoria, modifica o SKILL.md,
  corre evals, mede pass_rate, e faz ratcheting (keep se melhorou, git reset se piorou).
  Repete indefinidamente ate ser parado. Usa esta skill quando o utilizador pedir para
  melhorar skills automaticamente, otimizar o sistema SOTA, correr um ciclo de auto-melhoria,
  ou qualquer variacao de "melhora as skills sozinho". Tambem se aplica a pedidos como
  "audita a qualidade das skills", "encontra gaps no sistema", ou "otimiza o SOTA".
phase: 0
---

# SOTA Autoimprove

## Proposito

Aplicar o padrao autoresearch de Andrej Karpathy ao sistema SOTA: um loop autonomo que
melhora skills de forma continua, medindo progresso com uma metrica escalar objetiva,
mantendo apenas melhorias e descartando regressoes.

```
┌─────────────────────────────────────────────────────────┐
│              SOTA AUTOIMPROVE LOOP                       │
│                                                          │
│  eval-harness   (IMUTAVEL)  ← metrica: pass_rate        │
│  SKILL.md       (EDITAVEL)  ← agente modifica            │
│  program.md     (DIRECTIVAS) ← humano guia               │
│                                                          │
│  1. Escolher skill (pior score ou proxima na fila)       │
│  2. Ler SKILL.md + evals + historico + results.tsv       │
│  3. Formar hipotese de melhoria                          │
│  4. Modificar SKILL.md                                   │
│  5. Git commit (experiment: descricao)                   │
│  6. Correr evals (subagentes com e sem skill)            │
│  7. Medir pass_rate                                      │
│  8. Melhorou? → KEEP    Piorou? → git reset --hard       │
│  9. Registar em results.tsv                              │
│  10. NUNCA PARAR — repetir ate ser interrompido          │
└─────────────────────────────────────────────────────────┘
```

---

## O Contrato dos 3 Ficheiros (Adaptado de Karpathy)

O autoresearch original funciona com 3 ficheiros. O SOTA-autoimprove adapta este contrato:

### 1. Eval Harness (IMUTAVEL)

Script `scripts/eval-harness.py` que:
- Le os evals de uma skill (`evals/evals.json` dentro do diretorio da skill)
- Executa cada eval prompt usando subagente com a skill ativa
- Avalia assertions contra os outputs
- Calcula **pass_rate** (0.0 a 1.0) — a metrica escalar unica
- Nunca e modificado pelo agente — e a verdade absoluta

O agente nao pode mudar a metrica nem o harness. Isto impede "gaming the metric".

### 2. SKILL.md (EDITAVEL)

O unico ficheiro que o agente pode modificar em cada iteracao. Contem as instrucoes
da skill que esta a ser melhorada. O agente forma uma hipotese, edita o SKILL.md, e
mede o impacto.

### 3. program.md (DIRECTIVAS HUMANAS)

Ficheiro markdown na raiz do workspace autoimprove que o humano pode editar para guiar
o agente. Contem:
- Que skills priorizar
- Que tipos de melhoria tentar
- Restricoes (ex: "nao aumentar o tamanho do SKILL.md acima de 500 linhas")
- Direcoes de pesquisa especificas

O agente le este ficheiro no inicio de cada iteracao. Se o humano o atualizar mid-loop,
o agente adapta-se na proxima iteracao.

---

## Pre-requisitos

Antes de correr o loop, cada skill precisa de ter evals. Se uma skill nao tem evals:

1. Gerar 3-5 test prompts realistas para a skill
2. Definir assertions objetivas e verificaveis para cada prompt
3. Guardar em `<skill-dir>/evals/evals.json`

Formato:
```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "Prompt realista que um utilizador diria",
      "expected_output": "Descricao do resultado esperado",
      "assertions": [
        {
          "name": "nome-descritivo-da-assertion",
          "check": "O output contem X",
          "type": "contains|structure|quality|programmatic"
        }
      ],
      "files": []
    }
  ]
}
```

---

## O Loop Autonomo

### Fase 1: Selecao de Skill

Escolher a proxima skill para melhorar. Criterios de priorizacao:

1. **program.md** — se o humano especificou skills prioritarias, seguir a ordem
2. **Pior pass_rate** — skills com score mais baixo em results.tsv tem mais margem
3. **Mais usada** — skills frequentemente invocadas beneficiam mais de melhorias
4. **Sem evals** — skills que ainda nao tem evals precisam de os receber primeiro

### Fase 2: Leitura de Contexto

Antes de cada iteracao, ler:
- `SKILL.md` da skill alvo
- `evals/evals.json` da skill
- `results.tsv` global (historico de todas as experiencias)
- `program.md` (directivas do humano)
- `git log --oneline -20` (ultimas 20 experiencias)

Isto da ao agente contexto sobre o que ja foi tentado e o que funcionou.

### Fase 3: Hipotese

Formar uma hipotese especifica e testavel:

- **BOA:** "Adicionar exemplos concretos de CTEs na seccao de queries complexas vai
  melhorar o pass_rate porque os evals testam se o output inclui CTEs bem formados"
- **MA:** "Melhorar a skill"

A hipotese deve explicar O QUE mudar, PORQUE vai melhorar, e COMO medir.

### Fase 4: Modificacao

Editar o SKILL.md. Uma mudanca por iteracao — nao mudar multiplas coisas ao mesmo tempo.
Isto permite isolar o impacto de cada alteracao.

Tipos de modificacao a considerar:
- Adicionar exemplos concretos onde faltam
- Clarificar instrucoes ambiguas
- Remover conteudo que nao contribui (a skill deve ser lean)
- Reorganizar para melhor fluxo logico
- Adicionar seccao de anti-padroes
- Melhorar a descricao para melhor triggering
- Explicar o "porque" em vez de so o "o que"

### Fase 5: Commit

```bash
git add SKILLS/<skill-name>/SKILL.md
git commit -m "experiment(<skill-name>): <descricao curta da hipotese>"
```

O commit e feito ANTES de correr os evals. Se os evals falharem, o commit e revertido.
Isto garante que o git log mantem o historico completo de experiencias.

### Fase 6: Execucao de Evals

Correr o eval harness:

```bash
python SKILLS/sota-autoimprove/scripts/eval-harness.py \
  --skill-path SKILLS/<skill-name> \
  --results-file autoimprove-workspace/results.tsv
```

O harness:
1. Le cada eval prompt
2. Lanca subagente com a skill ativa para executar o prompt
3. Avalia assertions contra o output
4. Calcula pass_rate = assertions_passed / total_assertions

### Fase 7: Decisao (Ratcheting)

```
Se pass_rate >= pass_rate_anterior:
    STATUS = "keep"
    → manter o commit
    → atualizar best_pass_rate

Se pass_rate < pass_rate_anterior:
    STATUS = "discard"
    → git reset --hard HEAD~1
    → SKILL.md volta ao estado anterior
```

A regra e implacavel: so progresso para a frente e mantido. Nao ha "quase melhorou"
ou "esta diferente mas nao pior". Melhorou = keep. Nao melhorou = discard.

### Fase 8: Registo

Append ao `results.tsv`:

```
commit          skill               pass_rate   prev_rate   status    hypothesis
a1b2c3d4        data-analytics      0.850       0.800       keep      Added CTE examples
e5f6g7h8        data-analytics      0.780       0.850       discard   Removed SQL section
i9j0k1l2        visual-diagrams     0.900       0.875       keep      Added Mermaid examples
```

### Fase 9: Repetir

NUNCA PARAR. Voltar a Fase 1 e escolher a proxima skill ou iterar na mesma.
O loop so termina quando o humano o interrompe.

---

## Metricas e Observabilidade

### Metrica Principal: pass_rate

```
pass_rate = assertions_passed / total_assertions
```

Escalar, objetiva, sem julgamento humano. Varia de 0.0 (nada passa) a 1.0 (tudo passa).

### Metricas Secundarias (registadas mas nao usadas para ratcheting)

- **tokens_used** — quanto contexto a skill consume (menor = melhor, tudo o resto sendo igual)
- **skill_lines** — comprimento do SKILL.md (monitorizar para evitar bloat)
- **trigger_accuracy** — se a descricao dispara corretamente (testado separadamente)

### Dashboard (results.tsv)

O results.tsv e o "dashboard" do autoimprove. O agente le-o no inicio de cada iteracao
para entender tendencias:
- Que skills estao a melhorar?
- Que tipos de hipotese tendem a funcionar?
- Ha skills estagnadas (multiplos "discard" seguidos)?

---

## Directivas para o program.md

O humano cria `autoimprove-workspace/program.md` com instrucoes como:

```markdown
# SOTA Autoimprove — Directivas

## Prioridades
1. data-analytics — pass_rate esta em 0.60, precisa de subir
2. prd — skill nova, precisa de evals e primeira ronda de melhorias
3. visual-diagrams — focar na qualidade dos exemplos Mermaid

## Restricoes
- Nao aumentar nenhum SKILL.md acima de 500 linhas
- Preferir remover conteudo inutil a adicionar novo
- Explicar o "porque" — nao usar MUST/ALWAYS sem justificacao

## Direccoes a Explorar
- Testar se adicionar anti-padroes melhora a qualidade dos outputs
- Experimentar reorganizar skills por fluxo de trabalho em vez de topico
- Ver se exemplos com erros comuns (e como evita-los) ajudam

## Nao Tocar
- Fase 0 skills (concise-planning, systematic-debugging, etc.) — estao estaveis
- SECURITY/* skills — requerem revisao humana
```

---

## Seguranca do Loop

### O que o agente NAO pode fazer:
- Modificar `eval-harness.py` — a metrica e imutavel
- Modificar `evals.json` — os testes sao imutaveis dentro de uma ronda
- Modificar `CLAUDE.md` ou `ARCHITECTURE.md` — so o humano atualiza a estrutura
- Saltar a fase de eval — toda mudanca e medida
- Manter uma mudanca que piorou o score — ratcheting e automatico

### O que o agente PODE fazer:
- Modificar qualquer `SKILL.md` que esteja na lista de prioridades
- Adicionar/remover/reorganizar conteudo dentro do SKILL.md
- Ler qualquer ficheiro do projeto para contexto
- Lancar subagentes para executar evals
- Registar resultados em results.tsv

---

## Inicializacao

Para iniciar o loop pela primeira vez:

```bash
# 1. Criar workspace
mkdir -p autoimprove-workspace

# 2. Criar program.md com directivas iniciais
# (o humano escreve ou o agente gera um draft para aprovacao)

# 3. Criar results.tsv com header
echo -e "commit\tskill\tpass_rate\tprev_rate\tstatus\thypothesis\ttimestamp" \
  > autoimprove-workspace/results.tsv

# 4. Verificar que skills-alvo tem evals
# Se nao tem, gerar evals primeiro

# 5. Lancar o loop
# O agente comeca a iterar autonomamente
```

---

## Relacao com Outras Skills

- **kaizen** — O autoimprove e kaizen automatizado: melhoria continua por loop
- **enforcement-layer** — Garante que as skills melhoradas continuam a ser invocadas
- **verification-before-completion** — Cada iteracao verifica antes de declarar "keep"
- **dispatching-parallel-agents** — Subagentes executam os evals em paralelo
- **vibe-code-auditor** — Pode ser usado como eval complementar para qualidade geral
- **skill-creator** — Para criar evals quando uma skill nao os tem

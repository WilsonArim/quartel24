---
name: PRD — Product Requirements Document
description: >
  Criar PRDs completos, profissionais e prontos para execucao. Usa esta skill sempre que o utilizador
  pedir um PRD, documento de requisitos, especificacao de produto, feature spec, requirements document,
  ou quando estiver a planear uma feature/produto e precisar de um documento estruturado que faca a ponte
  entre visao de negocio e execucao tecnica. Tambem se aplica quando o utilizador quer revisar, melhorar,
  ou validar um PRD existente. Trigger generoso: se o pedido envolve "requisitos", "especificacao",
  "o que construir", "scope de feature", "documento de produto", ou qualquer variacao — usa esta skill.
phase: 1
---

# PRD — Product Requirements Document

## Proposito

Transformar uma ideia, necessidade de negocio ou pedido vago num documento de requisitos completo, claro e executavel. Um bom PRD elimina ambiguidade, alinha stakeholders e da a engenharia tudo o que precisa para comecar a construir sem adivinhacoes.

A diferenca entre um projeto que corre bem e um que descarrila frequentemente esta na qualidade do PRD. Este documento nao e burocracia — e o contrato entre o "o que queremos" e o "o que vamos construir".

---

## Quando Usar

- Planear uma nova feature ou produto do zero
- O utilizador diz "quero construir X" e precisa de estrutura antes de comecar
- Converter feedback de utilizadores, stakeholders ou dados em requisitos acionaveis
- Revisar ou melhorar um PRD existente que esta incompleto ou vago
- Preparar um documento para alinhar equipa tecnica e produto
- Qualquer momento em que a pergunta "o que exatamente vamos construir?" precisa de resposta clara

---

## Processo de Criacao

### Fase 1 — Descoberta e Contexto

Antes de escrever uma unica linha do PRD, recolher contexto. Fazer estas perguntas ao utilizador (adaptar conforme o que ja foi fornecido):

1. **Qual e o problema?** — Que dor ou necessidade estamos a resolver? Para quem?
2. **Porque agora?** — O que mudou que torna isto urgente ou relevante?
3. **Quem sao os utilizadores?** — Personas principais e secundarias
4. **Que sucesso parece?** — Metricas concretas (nao "melhorar a experiencia", mas "reduzir churn em 15%")
5. **Que restricoes existem?** — Tempo, budget, stack tecnica, regulamentacao, dependencias
6. **Que ja existe?** — Contexto do sistema atual, decisoes ja tomadas, tentativas anteriores
7. **Quem precisa de aprovar?** — Stakeholders e processo de decisao

Nao avances para a escrita sem ter respostas claras pelo menos para as perguntas 1, 3 e 4. Se o utilizador nao souber, ajuda-o a pensar — mas nao inventes respostas.

### Fase 2 — Estruturacao

Usar o template abaixo como base. Adaptar seccoes conforme a complexidade — um PRD para uma feature pequena nao precisa de todas as seccoes; um produto novo precisa de todas e possivelmente mais.

### Fase 3 — Escrita

Escrever com estas qualidades:

- **Especifico** — "O utilizador pode filtrar por data, categoria e status" em vez de "O utilizador pode filtrar"
- **Mensuravel** — Cada goal tem um numero ou criterio de sucesso testavel
- **Desambiguado** — Se dois engenheiros lerem o mesmo requisito e interpretarem de forma diferente, o requisito esta mal escrito
- **Priorizado** — Cada requisito tem uma prioridade clara (P0/P1/P2/P3)
- **Rastreavel** — Cada requisito pode ser ligado a uma user story e a um criterio de aceitacao

### Fase 4 — Validacao

Antes de entregar, correr a checklist de qualidade (ver abaixo). Se algum item falhar, corrigir antes de entregar.

---

## Template PRD

```markdown
# PRD: [Nome do Produto/Feature]

**Autor:** [Nome]
**Data:** [Data de criacao]
**Status:** Draft | Em Revisao | Aprovado | Em Desenvolvimento | Entregue | Depreciado
**Versao:** 1.0
**Stakeholders:** [Lista de nomes e papeis]
**Ultima Atualizacao:** [Data]

---

## 1. Resumo Executivo

[3-5 frases que qualquer pessoa na empresa consiga ler e entender o que se vai construir e porque.
Este e o "elevator pitch" do documento. Se o leitor so ler esta seccao, deve sair com uma compreensao
clara do que, porque e para quem.]

## 2. Problema

### 2.1 Descricao do Problema
[Descrever o problema concreto. Usar linguagem do utilizador, nao jargao interno.]

### 2.2 Evidencia
[Dados que provam que o problema existe e e relevante:]
- Metricas atuais (ex: "40% dos utilizadores abandonam no passo 3 do onboarding")
- Feedback qualitativo (ex: tickets de suporte, entrevistas)
- Impacto no negocio (ex: "estimamos perda de €X/mes por causa disto")

### 2.3 Estado Atual
[Como e que os utilizadores lidam com este problema hoje? Que workarounds usam?]

## 3. Objetivos e Metricas de Sucesso

| Objetivo | Metrica (KPI) | Valor Atual | Meta | Prazo | Metodo de Medicao |
|----------|---------------|-------------|------|-------|-------------------|
| [Obj 1]  | [KPI]         | [Baseline]  | [N]  | [Data]| [Como medir]      |
| [Obj 2]  | [KPI]         | [Baseline]  | [N]  | [Data]| [Como medir]      |

### Metricas de Guarda
[Metricas que NAO devem piorar como efeito colateral desta feature:]
- [Metrica]: nao deve descer abaixo de [valor]

## 4. Utilizadores e Personas

### 4.1 Persona Primaria
- **Nome:** [Nome da persona]
- **Papel:** [Descricao]
- **Necessidade principal:** [O que precisa]
- **Frustracao principal:** [O que doi]
- **Contexto de uso:** [Quando/onde/como usa o produto]

### 4.2 Persona Secundaria (se aplicavel)
[Mesmo formato]

### 4.3 Anti-Personas
[Quem NAO estamos a servir com esta feature e porque — isto evita scope creep]

## 5. User Stories e Requisitos

### 5.1 User Stories

#### P0 — Criticos (sem isto nao se lanca)

**US-001: [Titulo]**
> Como [tipo de utilizador],
> quero [acao],
> para que [beneficio].

Criterios de Aceitacao:
1. Dado [pre-condicao], quando [acao], entao [resultado esperado].
2. Dado [pre-condicao], quando [acao], entao [resultado esperado].

**US-002: [Titulo]**
> ...

#### P1 — Importantes (devem estar neste ciclo se possivel)

**US-003: [Titulo]**
> ...

#### P2 — Desejaveis (proximo ciclo)

**US-004: [Titulo]**
> ...

### 5.2 Requisitos Funcionais

| ID | Requisito | Prioridade | User Story | Notas |
|----|-----------|-----------|------------|-------|
| RF-001 | [Descricao precisa] | P0 | US-001 | [Detalhes adicionais] |
| RF-002 | [Descricao precisa] | P0 | US-001 | |
| RF-003 | [Descricao precisa] | P1 | US-003 | |

### 5.3 Requisitos Nao-Funcionais

| ID | Requisito | Categoria | Meta |
|----|-----------|-----------|------|
| RNF-001 | Tempo de resposta da API | Performance | < 200ms p95 |
| RNF-002 | Disponibilidade | Reliability | 99.9% uptime |
| RNF-003 | [Acessibilidade, Seguranca, Escalabilidade...] | [Cat] | [Meta] |

## 6. Scope

### 6.1 In Scope
- [Item com descricao clara]
- [Item com descricao clara]

### 6.2 Out of Scope
- [Item] — **Razao:** [Porque nao esta incluido]
- [Item] — **Razao:** [Porque nao esta incluido]

### 6.3 Futuro (v2+)
- [Feature deferida] — [Quando e condicao para reconsiderar]

## 7. Design e UX

### 7.1 Wireframes / Mockups
[Links ou descricoes dos fluxos de utilizador. Se nao existem ainda, descrever os fluxos em texto:]

**Fluxo principal:**
1. Utilizador acede a [pagina]
2. Utilizador faz [acao]
3. Sistema responde com [resultado]
4. ...

### 7.2 Principios de Design
[Guias especificas para esta feature — ex: "mobile-first", "maximo 3 cliques para completar a tarefa"]

## 8. Consideracoes Tecnicas

### 8.1 Arquitetura
[Descricao de alto nivel de como isto se integra no sistema existente]

### 8.2 Dependencias
| Dependencia | Tipo | Status | Responsavel | Risco se atrasa |
|-------------|------|--------|-------------|-----------------|
| [API X]     | Externa | Disponivel | [Equipa] | [Impacto] |
| [Feature Y] | Interna | Em dev | [Pessoa] | [Impacto] |

### 8.3 Migracoes e Dados
[Alteracoes a schemas, migracoes necessarias, impacto em dados existentes]

### 8.4 Restricoes Tecnicas
[Limites conhecidos: stack, infraestrutura, integrações de terceiros, regulamentacao]

## 9. Timeline e Milestones

| Milestone | Data | Entregavel | Owner | Criterio de Conclusao |
|-----------|------|------------|-------|----------------------|
| Kick-off | [Data] | PRD aprovado | [PM] | Stakeholders alinhados |
| Design | [Data] | Mockups finais | [Designer] | Aprovacao do PM |
| Dev Sprint 1 | [Data] | [Entregavel] | [Eng Lead] | [Criterio] |
| QA | [Data] | Bugs criticos resolvidos | [QA Lead] | Zero P0 bugs |
| Launch | [Data] | Feature em producao | [Eng Lead] | Metricas baseline capturadas |

## 10. Riscos e Mitigacoes

| ID | Risco | Probabilidade | Impacto | Mitigacao | Owner |
|----|-------|---------------|---------|-----------|-------|
| R-001 | [Descricao] | Alta/Media/Baixa | Alto/Medio/Baixo | [Plano] | [Pessoa] |
| R-002 | [Descricao] | | | [Plano] | |

## 11. Questoes em Aberto

| ID | Questao | Owner | Prazo | Status |
|----|---------|-------|-------|--------|
| Q-001 | [Pergunta que precisa de resposta] | [Pessoa] | [Data] | Aberta/Resolvida |

## 12. Historico de Decisoes

| Data | Decisao | Contexto | Alternativas Consideradas |
|------|---------|----------|--------------------------|
| [Data] | [O que se decidiu] | [Porque] | [O que mais se considerou] |

## 13. Aprovacoes

| Papel | Nome | Status | Data |
|-------|------|--------|------|
| Product Manager | [Nome] | Pendente | |
| Eng Lead | [Nome] | Pendente | |
| Design Lead | [Nome] | Pendente | |
| [Outro] | [Nome] | Pendente | |
```

---

## Checklist de Qualidade do PRD

Correr esta checklist antes de entregar. Cada item que falha e um risco de ambiguidade ou retrabalho.

### Clareza e Completude
- [ ] Resumo executivo e compreensivel por alguem fora da equipa
- [ ] Problema esta suportado por dados ou evidencia concreta, nao suposicoes
- [ ] Todas as user stories seguem o formato "Como/Quero/Para que" com criterios de aceitacao
- [ ] Requisitos sao especificos o suficiente para dois engenheiros chegarem a mesma implementacao
- [ ] Scope tem seccao explicita de "Out of Scope" com justificacoes

### Mensurabilidade
- [ ] Cada objetivo tem uma metrica, baseline, meta e metodo de medicao
- [ ] Metricas de guarda estao definidas (o que nao pode piorar)
- [ ] Timeline tem datas concretas, nao "em breve" ou "Q3"

### Viabilidade
- [ ] Dependencias estao identificadas com status e risco
- [ ] Restricoes tecnicas estao documentadas
- [ ] Timeline inclui buffer para imprevistos (minimo 20-30%)
- [ ] Riscos tem mitigacoes concretas, nao apenas "monitorizar"

### Alinhamento
- [ ] Stakeholders estao listados com papeis claros
- [ ] Questoes em aberto tem owner e prazo
- [ ] Historico de decisoes captura o "porque", nao so o "o que"

---

## Niveis de PRD

Nem todos os PRDs precisam de ser epicos de 20 paginas. Adaptar a profundidade ao contexto:

### PRD Leve (Feature pequena, 1-2 sprints)
Seccoes obrigatorias: 1, 2, 3, 5.1 (so P0), 6, 9
Tempo estimado: 30-60 minutos

### PRD Standard (Feature media, 2-6 sprints)
Seccoes obrigatorias: Todas exceto 12 (Historico de Decisoes)
Tempo estimado: 2-4 horas

### PRD Completo (Produto novo ou feature critica)
Todas as seccoes, possivelmente com anexos adicionais (research, analise competitiva, mockups detalhados)
Tempo estimado: 1-2 dias

Perguntar ao utilizador qual o nivel adequado se nao for obvio pelo contexto.

---

## Anti-Padroes a Evitar

- **PRD como wish-list** — Um PRD nao e uma lista de desejos. Cada requisito deve ter justificacao e prioridade. Se tudo e P0, nada e P0.
- **Requisitos vagos** — "O sistema deve ser rapido" nao e um requisito. "API responde em < 200ms no p95" e um requisito.
- **Ausencia de "Out of Scope"** — Sem limites explicitos, o scope creep e inevitavel. Documentar o que NAO se vai fazer e tao importante como documentar o que se vai fazer.
- **Metricas sem baseline** — "Aumentar conversao em 20%" nao significa nada se nao sabemos o valor atual.
- **PRD escrito depois do desenvolvimento** — O PRD existe para guiar decisoes, nao para documentar o que ja foi construido.
- **Ignorar anti-personas** — Saber para quem NAO estamos a construir evita features que ninguem pediu.

---

## Relacao com Outras Skills

- **brainstorming** — Usar antes do PRD para explorar o espaco do problema e solucao
- **product-manager-toolkit** — Complementar: o toolkit tem RICE e priorizacao; esta skill foca na especificacao detalhada
- **architecture-decision-records** — Para decisoes tecnicas que surgem durante a escrita do PRD
- **senior-architect** — Quando as "Consideracoes Tecnicas" do PRD precisam de profundidade arquitectural
- **competitive-landscape** — Para informar a seccao de "Problema" e "Estado Atual" com contexto de mercado
- **ui-ux-pro-max** — Para detalhar a seccao de "Design e UX"

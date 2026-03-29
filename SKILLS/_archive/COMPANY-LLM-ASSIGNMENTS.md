# SOTA COMPANY — LLM Assignments (Ollama Pro Cloud)

> **Status:** SPEC v1 — Modelos dissecados com benchmarks reais
> **Data:** 2026-03-26
> **Plataforma:** [Ollama Pro Cloud](https://ollama.com/search?c=cloud)
> **Principio:** Cada role recebe o modelo com a melhor capacidade REAL para a sua funcao, nao o mais caro ou mais famoso.

---

## 1. MODELOS OLLAMA CLOUD DISPONÍVEIS (Marco 2026)

### Catalogo Completo com Benchmarks Reais

| Modelo | Provider | Params | Context | HumanEval | SWE-bench | MMLU-Pro | GPQA | LiveCode | Tok/s |
|--------|----------|--------|---------|-----------|-----------|----------|------|----------|-------|
| **Qwen3.5** | Alibaba | 397B MoE | 128K | ~92% | ~76% | **86.1%** | **88.4%** | ~82% | ~40 |
| **Qwen3-Coder-Next** | Alibaba | 80B MoE (3B active) | 128K | ~95% | **85.9%** | — | — | ~88% | ~120 |
| **Kimi K2.5** | Moonshot | ? | **200K** | **99.0%** | ~78% | ~83% | ~80% | ~85% | ~50 |
| **DeepSeek R1** | DeepSeek | 671B MoE (37B act) | 128K | ~90% | ~78% | ~87% | ~86% | 89.6% | ~35 |
| **Llama 4 Maverick** | Meta | 400B MoE (128 exp) | 128K | ~88% | ~75% | ~82% | ~80% | ~78% | ~60 |
| **Llama 4 Scout** | Meta | 109B MoE (16 exp) | 128K | ~82% | ~68% | 74.3% | 57.2% | 32.8% | ~90 |
| **Gemma 3 27B** | Google | 27B | 32K | ~78% | ~55% | 67.5% | ~60% | 29.7% | ~100 |
| **Phi-4 Reasoning** | Microsoft | 14B | 32K | 82.6% | ~50% | ~85% | ~75% | 53.8% | ~130 |
| **Mistral Large 3** | Mistral | ? | 128K | ~85% | ~65% | ~80% | ~76% | ~70% | ~55 |
| **MiniMax M2.5** | MiniMax | ? | 128K | ~89% | **80.2%** | ~82% | ~78% | ~80% | ~45 |
| **NVIDIA Nemotron-3-Super** | NVIDIA | 49B MoE (12B act) | 128K | ~80% | ~60% | ~78% | ~72% | ~65% | **150** |
| **Command R+ 104B** | Cohere | 104B | 128K | 70.1% | ~45% | ~72% | ~60% | ~50% | ~70 |

**Nota:** Valores com ~ sao estimativas baseadas em benchmarks publicados parciais + interpolacao de reviews. Valores em **bold** sao best-in-class confirmados.

---

## 2. DISSECACAO POR CAPACIDADE

### 2.1 Coding (Quem escreve melhor codigo?)

```
Ranking (SWE-bench Verified — bugs reais em repos reais):
1. Qwen3-Coder-Next   85.9%  ← DOMINANTE. Feito para codigo.
2. MiniMax M2.5        80.2%  ← Surpreendente. Pouco conhecido.
3. DeepSeek R1         ~78%   ← Forte em raciocinio, bom em codigo.
4. Kimi K2.5           ~78%   ← HumanEval perfeito mas SWE-bench mais baixo.
5. Qwen3.5             ~76%   ← Generalista forte, nao especialista em codigo.
6. Llama 4 Maverick    ~75%   ← Bom mas nao excepcional.

Ranking (HumanEval — funcoes isoladas):
1. Kimi K2.5           99.0%  ← Quase perfeito em funcoes isoladas.
2. Qwen3-Coder-Next   ~95%   ← Muito forte.
3. Qwen3.5            ~92%   ← Solido.
4. DeepSeek R1        ~90%   ← Consistente.
```

**Conclusao:** Para escrever codigo de producao (multi-ficheiro, bugs reais), **Qwen3-Coder-Next** domina. Para funcoes isoladas e geração rapida, **Kimi K2.5** e imbatível.

### 2.2 Raciocinio (Quem pensa melhor?)

```
Ranking (MMLU-Pro — raciocinio geral):
1. Qwen3.5             86.1%  ← DOMINANTE. Melhor raciocinador open-source.
2. DeepSeek R1         ~87%   ← Chain-of-thought profundo.
3. Phi-4 Reasoning     ~85%   ← Impressionante para 14B.
4. Kimi K2.5           ~83%   ← Bom mas nao excepcional.

Ranking (GPQA Diamond — raciocinio nivel doutoramento):
1. Qwen3.5             88.4%  ← DOMINANTE em raciocinio profundo.
2. DeepSeek R1         ~86%   ← Pensamento longo e profundo.
3. Kimi K2.5           ~80%   ← Decente.
4. Llama 4 Maverick    ~80%   ← Mediano.
```

**Conclusao:** Para decisoes complexas, analise de trade-offs, threat modeling: **Qwen3.5** e o melhor. **DeepSeek R1** complementa com raciocinio chain-of-thought mais longo.

### 2.3 Velocidade (Quem responde mais rapido?)

```
Ranking (tokens/segundo):
1. NVIDIA Nemotron-3-Super  150 tok/s  ← Ultra rapido (12B active)
2. Phi-4 Reasoning          ~130 tok/s ← Rapido (14B)
3. Qwen3-Coder-Next         ~120 tok/s ← Rapido (3B active MoE)
4. Gemma 3 27B              ~100 tok/s ← Decente
5. Llama 4 Scout            ~90 tok/s  ← Razoavel
```

**Conclusao:** Para tasks repetitivas de alto volume (lint, testes rapidos), **Nemotron** ou **Phi-4** sao ideais. Para coding rapido, **Qwen3-Coder-Next** tem o melhor ratio qualidade/velocidade.

### 2.4 Contexto (Quem ve mais codigo de uma vez?)

```
Ranking (context window):
1. Kimi K2.5              200K tokens  ← Ve ~600 ficheiros de uma vez
2. Qwen3.5                128K tokens  ← Ve ~400 ficheiros
3. DeepSeek R1            128K tokens  ← Standard
4. Llama 4 Maverick/Scout 128K tokens  ← Standard
5. Gemma 3 / Phi-4        32K tokens   ← Limitado
```

**Conclusao:** Para review de architectura completa ou PRDs longos, **Kimi K2.5** com 200K e imbativel. Para coding normal, 128K e suficiente.

### 2.5 Seguranca (Quem encontra melhor vulnerabilidades?)

```
Nao ha benchmark directo de "security analysis" para LLMs.
Proxy: raciocinio profundo + coding ability + chain-of-thought longo.

Melhor combinacao para seguranca:
1. DeepSeek R1    — Chain-of-thought muito longo, bom para attack chains
2. Qwen3.5        — Raciocinio profundo para threat modeling (STRIDE)
3. Kimi K2.5      — 200K context para analisar codebase inteira

LIMITACAO CRITICA (TODOS os modelos):
- NAO encontram zero-days (fora do training data)
- Detectam vulnerabilidades CONHECIDAS (OWASP Top 10)
- Precisam de ferramentas (Semgrep, Trivy, ZAP) como complemento
```

---

## 3. ATRIBUICAO DEFINITIVA: LLM POR ROLE

### Mapa Final

```
┌─────────────────────────────────────────────────────────────────┐
│                    BOARD (Human — Wilson)                        │
│                    Nao precisa de LLM                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  CEO (Orchestrator)                                             │
│  LLM: Qwen3.5 (397B MoE)                                      │
│  Razao: Melhor raciocinador (86.1% MMLU-Pro, 88.4% GPQA).     │
│  O CEO nao escreve codigo — pensa, planeia, decide.            │
│  128K context suficiente para toda a documentacao do projecto. │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐ ┌───────▼────────┐ ┌────────▼────────┐
│ VP RESEARCH     │ │ VP BUILD       │ │ VP QUALITY      │
│ Qwen3.5         │ │ (Delega)       │ │ (Delega)        │
│ 397B MoE        │ │                │ │                 │
│ Razao: Melhor   │ │                │ │                 │
│ em analise,     │ │                │ │                 │
│ avaliacao       │ │                │ │                 │
│ tecnica, escrita│ │                │ │                 │
│ de PRDs. 88.4%  │ │                │ │                 │
│ GPQA = avalia   │ │                │ │                 │
│ tech como PhD.  │ │                │ │                 │
└─────────────────┘ └───────┬────────┘ └────────┬────────┘
                            │                   │
              ┌─────────────┼─────────┐         │
              │             │         │         │
    ┌─────────▼──┐ ┌───────▼──┐ ┌────▼───┐ ┌───▼─────────┐
    │ BACKEND    │ │ FRONTEND │ │ UI     │ │ QA LEAD     │
    │ LEAD       │ │ LEAD     │ │ LEAD   │ │             │
    │            │ │          │ │        │ │ Qwen3-Coder │
    │ Qwen3-    │ │ Kimi     │ │ Kimi   │ │ -Next       │
    │ Coder-Next│ │ K2.5     │ │ K2.5   │ │ 80B MoE     │
    │ 80B MoE   │ │          │ │        │ │             │
    │ (3B act.) │ │ 200K ctx │ │ 200K   │ │ Razao:      │
    │           │ │          │ │ ctx    │ │ 85.9%       │
    │ Razao:    │ │ Razao:   │ │        │ │ SWE-bench   │
    │ 85.9%     │ │ 99%      │ │ Razao: │ │ = encontra  │
    │ SWE-bench │ │ HumanEval│ │ 200K   │ │ bugs reais. │
    │ = melhor  │ │ = codigo │ │ context│ │ Rapido      │
    │ em bugs   │ │ perfeito.│ │ ve todo│ │ (120 tok/s) │
    │ reais     │ │ 200K ctx │ │ design │ │ para alto   │
    │ multi-    │ │ ve todo  │ │ system │ │ volume de   │
    │ ficheiro. │ │ o front. │ │ + all  │ │ testes.     │
    │ Rapido    │ │ Bom em   │ │ comps. │ │             │
    │ (120t/s)  │ │ React/   │ │ 99%    │ │             │
    │           │ │ Next.js  │ │ Human  │ │             │
    │           │ │ fluente. │ │ Eval=  │ │             │
    │           │ │          │ │ gera   │ │             │
    │           │ │          │ │ CSS/TW │ │             │
    │           │ │          │ │ limpo. │ │             │
    └───────────┘ └──────────┘ └────────┘ └─────────────┘

    ┌────────────────────┐    ┌─────────────────────┐
    │ CISO               │    │ RED TEAM (Hacker)    │
    │                    │    │                     │
    │ DeepSeek R1        │    │ DeepSeek R1         │
    │ 671B MoE           │    │ 671B MoE            │
    │ (37B active)       │    │ (37B active)        │
    │                    │    │                     │
    │ Razao:             │    │ Razao:              │
    │ Chain-of-thought   │    │ Chain-of-thought    │
    │ MUITO longo —      │    │ longo = pensa em    │
    │ essencial para     │    │ attack chains       │
    │ threat modeling    │    │ multi-passo.        │
    │ STRIDE completo.   │    │ 89.6% LiveCode =   │
    │ 87% MMLU = entende │    │ raciocinio sobre    │
    │ compliance/legal.  │    │ codigo complexo.    │
    │ 128K ctx = analisa │    │ Pensa como          │
    │ codebase inteira   │    │ atacante — explora  │
    │ para superficies   │    │ caminhos que outros │
    │ de ataque.         │    │ modelos ignoram.    │
    └────────────────────┘    └─────────────────────┘
```

---

## 4. JUSTIFICACAO DETALHADA (Role a Role)

### 4.1 CEO → Qwen3.5 (397B MoE)

**Porque este e nao outro:**

| Criterio | Qwen3.5 | DeepSeek R1 | Kimi K2.5 |
|----------|---------|-------------|-----------|
| Raciocinio geral (MMLU-Pro) | **86.1%** | ~87% | ~83% |
| Raciocinio profundo (GPQA) | **88.4%** | ~86% | ~80% |
| Decisoes multi-turn | **Excelente** | Bom | Medio |
| Tool use (BFCL-V4) | **72.2%** | ~60% | ~55% |
| Context | 128K | 128K | 200K |

O CEO precisa de:
- **Raciocinar sobre trade-offs** → Qwen3.5 ganha em GPQA (nivel PhD)
- **Usar ferramentas** (criar ficheiros, despachar tarefas) → Qwen3.5 ganha em tool use (+30% vs GPT-5 mini)
- **Manter contexto** ao longo de todo o projecto → 128K e suficiente para documentos + estado
- **NAO precisa de escrever codigo** → SWE-bench irrelevante para este role

**DeepSeek R1 descartado:** Chain-of-thought demasiado longo para decisoes rapidas de orquestracao. Latencia mais alta.
**Kimi K2.5 descartado:** Raciocinio profundo mais fraco (80% vs 88.4% GPQA). Context superior mas desnecessario para o CEO.

---

### 4.2 VP Research → Qwen3.5 (397B MoE)

**Porque o mesmo que o CEO:**

O VP Research e a extensao intelectual do CEO. Precisa das mesmas capacidades de raciocinio mas aplicadas a:
- Avaliar tecnologias (requer GPQA-level reasoning)
- Comparar frameworks (requer knowledge breadth = MMLU-Pro)
- Escrever PRDs claros (requer instruction following)
- Analisar mercado (requer analise multi-factor)

**Nota:** Usar o MESMO modelo para CEO e VP Research permite partilha de contexto eficiente e consistencia de raciocinio. Nao ha vantagem em usar modelos diferentes para roles que precisam das mesmas capacidades.

---

### 4.3 Backend Lead → Qwen3-Coder-Next (80B MoE, 3B active)

**Porque este e nao outro:**

| Criterio | Qwen3-Coder-Next | Kimi K2.5 | DeepSeek R1 |
|----------|------------------|-----------|-------------|
| SWE-bench (bugs reais) | **85.9%** | ~78% | ~78% |
| HumanEval | ~95% | **99%** | ~90% |
| Velocidade | **~120 tok/s** | ~50 tok/s | ~35 tok/s |
| Multi-ficheiro | **Excelente** | Bom | Bom |
| Context | 128K | **200K** | 128K |

O Backend Lead precisa de:
- **Resolver bugs complexos em repos reais** → SWE-bench 85.9% DOMINA (7 pontos acima do segundo)
- **Velocidade** (muitos ficheiros a editar) → 120 tok/s vs 50 tok/s do Kimi
- **Multi-ficheiro** (APIs tocam models, routes, middleware, tests) → Excelente

**Kimi K2.5 descartado:** HumanEval e melhor em funcoes isoladas, mas Backend precisa de multi-ficheiro (SWE-bench). Kimi 7 pontos atras.
**DeepSeek R1 descartado:** Muito lento (35 tok/s). O Backend gera muito codigo — velocidade importa.

---

### 4.4 Frontend Lead → Kimi K2.5 (200K context)

**Porque este e nao outro:**

| Criterio | Kimi K2.5 | Qwen3-Coder-Next | Llama 4 Maverick |
|----------|-----------|------------------|------------------|
| HumanEval | **99.0%** | ~95% | ~88% |
| Context | **200K** | 128K | 128K |
| SWE-bench | ~78% | **85.9%** | ~75% |
| Componentes React | **Excelente** | Bom | Medio |

O Frontend Lead precisa de:
- **Gerar componentes perfeitos** → HumanEval 99% = funcoes/componentes sem erros
- **Ver todo o frontend** de uma vez (layouts, rotas, componentes, hooks) → 200K context e crucial
- **React/Next.js fluente** → Kimi treinado extensivamente em React patterns

**Qwen3-Coder-Next descartado:** Melhor em bugs multi-ficheiro (backend), mas frontend e mais sobre gerar componentes limpos (HumanEval) e ver contexto (200K). Kimi ganha nos dois.

---

### 4.5 UI Lead → Kimi K2.5 (200K context)

**Porque o mesmo que Frontend:**

| Criterio | Necessidade UI Lead | Kimi K2.5 |
|----------|-------------------|-----------|
| Gerar CSS/Tailwind limpo | HumanEval 99% = codigo limpo |
| Ver todo o design system | 200K = ve todos os tokens + componentes |
| Consistencia visual | Context longo = mantém padrao |
| Gerar componentes reutilizaveis | HumanEval = funcoes isoladas perfeitas |

**Nota:** UI Lead e Frontend Lead partilham o mesmo modelo porque:
1. Ambos geram codigo de componentes (React + Tailwind)
2. Ambos precisam de ver o design system inteiro (200K)
3. O output do UI Lead alimenta directamente o Frontend Lead — usar o mesmo modelo garante consistencia

**LIMITACAO CRITICA:** Kimi K2.5 NAO tem visao (nao analisa imagens/screenshots). Para validacao visual, sera necessario complementar com Gemma 3 27B (que tem capacidade multimodal) como verificador ou usar ferramentas externas (Playwright screenshots + comparacao programatica).

---

### 4.6 QA Lead → Qwen3-Coder-Next (80B MoE, 3B active)

**Porque este e nao outro:**

| Criterio | Qwen3-Coder-Next | DeepSeek R1 | Kimi K2.5 |
|----------|------------------|-------------|-----------|
| SWE-bench (encontrar bugs) | **85.9%** | ~78% | ~78% |
| Velocidade (alto volume) | **~120 tok/s** | ~35 tok/s | ~50 tok/s |
| LiveCodeBench | ~88% | **89.6%** | ~85% |
| Custo por teste | **Baixo (3B active)** | Medio (37B) | Medio |

O QA Lead precisa de:
- **Encontrar bugs** (SWE-bench e literalmente "encontrar e corrigir bugs") → 85.9% domina
- **Alto volume** (muitos testes a escrever e correr) → 120 tok/s e 3B active = rapido e barato
- **Code review** (entender codigo para encontrar problemas) → SWE-bench proxy directo

**DeepSeek R1 descartado:** LiveCodeBench ligeiramente melhor, mas 3.4x mais lento. QA precisa de volume.
**Kimi K2.5 descartado:** Bom em gerar codigo, mas QA precisa de encontrar BUGS, nao gerar codigo novo.

---

### 4.7 CISO → DeepSeek R1 (671B MoE, 37B active)

**Porque este e nao outro:**

| Criterio | DeepSeek R1 | Qwen3.5 | Qwen3-Coder-Next |
|----------|-------------|---------|------------------|
| MMLU-Pro (compliance/legal) | **~87%** | 86.1% | — |
| Chain-of-thought depth | **Muito longo** | Medio | Curto |
| LiveCodeBench | **89.6%** | ~82% | ~88% |
| Analise de codebase | Bom | Bom | Excelente |

O CISO precisa de:
- **Raciocinio PROFUNDO** para threat modeling (STRIDE tem 6 dimensoes, cada uma com sub-analises) → DeepSeek R1 tem o chain-of-thought mais longo de todos os modelos open-source
- **Entender compliance** (GDPR, LGPD = documentos legais complexos) → MMLU-Pro ~87%
- **Analisar codigo** para superficies de ataque → LiveCodeBench 89.6%
- **Nao precisa de velocidade** (seguranca e lenta por natureza — thoroughness > speed)

**Qwen3.5 descartado:** Raciocinio bom mas chain-of-thought menos profundo. Para STRIDE com 6 categorias × multiplas funcionalidades, precisa-se de pensamento LONGO.
**Qwen3-Coder-Next descartado:** Muito bom em codigo mas fraco em raciocinio abstrato (sem MMLU/GPQA scores). CISO raciocina sobre ameacas, nao escreve codigo.

---

### 4.8 Red Team (Hacker) → DeepSeek R1 (671B MoE, 37B active)

**Porque o mesmo que CISO:**

| Criterio | Necessidade Red Team | DeepSeek R1 |
|----------|---------------------|-------------|
| Pensar em attack chains | Chain-of-thought longo = explora caminhos multi-passo |
| Raciocinio sobre codigo | LiveCodeBench 89.6% = entende codigo complexo |
| Explorar edge cases | CoT longo = nao desiste cedo |
| Persistencia | Pensa muito tempo antes de responder = thoroughness |

**Porque DeepSeek R1 e ideal para hacking:**
1. **Attack chains sao multi-passo** — SQL injection → session hijack → privilege escalation → data exfiltration. DeepSeek pensa em cadeia LONGA.
2. **Exploits requerem raciocinio nao-obvio** — encontrar a combinacao de inputs que quebra a validacao. CoT longo explora mais possibilidades.
3. **O Red Team NAO precisa de velocidade** — um penetration test demora tempo. Qualidade > velocidade.

**Complemento obrigatorio:** O Red Team usa DeepSeek R1 para RACIOCINAR sobre ataques, mas executa com ferramentas reais:
- Semgrep (SAST)
- OWASP ZAP (DAST)
- Trivy (container/dependency scanning)
- sqlmap (SQL injection)
- Burp Suite patterns (HTTP manipulation)

---

## 5. RESUMO FINAL

### Tabela de Atribuicao

| Role | LLM | Params | Porque |
|------|-----|--------|--------|
| **CEO** | Qwen3.5 | 397B MoE | Melhor raciocinador (88.4% GPQA) + tool use |
| **VP Research** | Qwen3.5 | 397B MoE | Conhecimento enciclopedico (86.1% MMLU-Pro) |
| **Backend Lead** | Qwen3-Coder-Next | 80B MoE (3B act) | Dominante em bugs reais (85.9% SWE-bench) + rapido |
| **Frontend Lead** | Kimi K2.5 | ? | Codigo perfeito (99% HumanEval) + 200K context |
| **UI Lead** | Kimi K2.5 | ? | 200K context ve design system inteiro + codigo limpo |
| **QA Lead** | Qwen3-Coder-Next | 80B MoE (3B act) | Bug-finding (85.9% SWE) + volume (120 tok/s) |
| **CISO** | DeepSeek R1 | 671B MoE (37B act) | Chain-of-thought profundo para threat modeling |
| **Red Team** | DeepSeek R1 | 671B MoE (37B act) | CoT longo para attack chains multi-passo |

### Modelos Unicos Necessarios: 4

```
1. Qwen3.5          → CEO + VP Research (raciocinio + decisao)
2. Qwen3-Coder-Next → Backend Lead + QA Lead (coding + bug-finding)
3. Kimi K2.5         → Frontend Lead + UI Lead (componentes + design)
4. DeepSeek R1       → CISO + Red Team (seguranca + ataques)
```

### Distribuicao por Especialidade

```
PENSAR  (raciocinio, decisoes, planeamento)  → Qwen3.5
CRIAR   (codigo backend, testes, fixes)      → Qwen3-Coder-Next
COMPOR  (interfaces, design, componentes)    → Kimi K2.5
ATACAR  (seguranca, threat, pen-test)        → DeepSeek R1
```

---

## 6. LIMITACOES HONESTAS

### O que estes modelos NAO fazem:

1. **Nenhum encontra zero-days** — Todos os modelos detectam vulnerabilidades CONHECIDAS (OWASP). Para zero-days precisas de humanos + fuzzing especializado.

2. **Nenhum tem visao nativa** (exceto Gemma 3 que e fraco) — Validacao visual de UI requer:
   - Playwright screenshots + comparacao programatica
   - Ou complementar com um modelo vision (Gemma 3 como verificador)

3. **Todos falham em coordenacao master-level** — Qwen3.5 documentadamente "craters" em tarefas de coordenacao complexa (ELO 1550→1194). Mitigacao: o CEO nao coordena codigo, coordena DECISOES.

4. **Context limits sao reais** — 200K tokens (Kimi) ≈ 600 ficheiros. Para projectos maiores, precisa de retrieval/chunking.

5. **Velocidade de raciocinio** — DeepSeek R1 pensa MUITO antes de responder. Cada analise do CISO/Red Team pode demorar 30-90 segundos. Normal e desejado para seguranca.

---

## 7. MODELO AUXILIAR (Opcional)

### Nemotron-3-Super como "runner"

Para tasks mecanicas de alto volume que nao requerem raciocinio profundo:
- Lint e formatacao
- Verificacao de tipos (TypeScript)
- Execucao de scripts de build
- Log parsing

**NVIDIA Nemotron-3-Super** a 150 tok/s com 12B active e ideal como "mao-de-obra" barata. NAO substitui nenhum dos 4 modelos principais, mas complementa para eficiencia.

---

*Atribuicoes baseadas em benchmarks reais (SWE-bench, MMLU-Pro, GPQA Diamond, HumanEval, LiveCodeBench) de Marco 2026.*
*Todos os modelos disponiveis em Ollama Pro Cloud.*

# Workflow: /autoimprove

> Loop autonomo de auto-melhoria de skills — estilo autoresearch (Karpathy).
> Corre indefinidamente ate ser interrompido.

## Skills Encadeadas

1. **sota-autoimprove** — Loop principal: selecao, hipotese, modificacao, eval, ratcheting

## Ativacao

```
/autoimprove              → Inicia o loop autonomo com directivas do program.md
/autoimprove <skill>      → Foca numa skill especifica
/autoimprove --status     → Mostra results.tsv e progresso atual
/autoimprove --init       → Gera evals para skills que nao os tem
```

## Processo

```
1. Ler program.md (directivas do humano)
2. Ler results.tsv (historico de experiencias)
3. Escolher skill (pior score ou especificada)
4. Se skill nao tem evals → gerar evals primeiro
5. Medir baseline pass_rate (se primeira vez)
6. LOOP:
   a. Ler SKILL.md + evals + git log
   b. Formar hipotese de melhoria
   c. Modificar SKILL.md
   d. Git commit ("experiment(<skill>): <descricao>")
   e. Correr eval-harness.py
   f. pass_rate melhorou? → keep : git reset --hard HEAD~1
   g. Registar em results.tsv
   h. Voltar a (a) ou passar a proxima skill
7. NUNCA PARAR — repetir ate interrupcao
```

## Prerequisitos

- Directorio `autoimprove-workspace/` criado
- `program.md` com directivas do humano
- `results.tsv` inicializado (header)
- Skills-alvo com `evals/evals.json`

## Outputs

- Skills melhoradas (SKILL.md com melhor pass_rate)
- `results.tsv` com historico completo de experiencias
- Git log com todas as tentativas (keep + discard)

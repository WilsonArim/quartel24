# PROMPT #2 — SOTA Audit Fixes + Build Validation

Lê primeiro `docs/PRD.md`, `SKILLS/ARCHITECTURE.md` e `SKILLS/SECURITY.md` para teres contexto.

---

## CONTEXTO

Foi feita uma auditoria SOTA ao projecto Quartel.24 após o PROMPT-01 (fundações).
Os seguintes fixes já foram aplicados manualmente antes deste prompt:

- ✅ `src/middleware.ts` criado com função `middleware` correcta (substituiu `src/proxy.ts` que estava mal nomeado)
- ✅ `src/proxy.ts` neutralizado (contém apenas um comentário, sem exports activos)
- ✅ `.env.example` criado com placeholders
- ✅ `expire_subscriptions()` adicionada ao dashboard (`src/app/page.tsx`)
- ✅ `README.md` actualizado com instruções do projecto
- ✅ `next.config.ts` com security headers (X-Frame-Options, HSTS, etc.)
- ✅ `.sota/` criado com estrutura de relatórios

---

## TAREFA

Valida e completa o estado do projecto. Faz o seguinte, por esta ordem:

---

### 1. Ler guias do Next.js antes de qualquer código

```bash
ls node_modules/next/dist/docs/
```

Lê os guias relevantes para middleware, App Router e server components antes de tocar em qualquer ficheiro.

---

### 2. Verificar `src/middleware.ts`

Confirma que o ficheiro existe em `src/middleware.ts` e que:
- Exporta uma função chamada `middleware` (não `proxy`, não `default`)
- Usa `updateSession` de `@/lib/supabase/middleware`
- Tem `export const config` com o `matcher` correcto

Se algo estiver errado, corrige.

---

### 3. Verificar `src/proxy.ts`

Confirma que `src/proxy.ts` não tem exports activos (não deve exportar nenhuma função nem `config`).
Se ainda tiver código activo, remove os exports para que o Next.js não o processe como middleware.

---

### 4. Verificar `src/app/page.tsx` (Dashboard)

Confirma que o dashboard chama `supabase.rpc('expire_subscriptions')` em paralelo com os outros RPCs.
O padrão correcto é:

```typescript
const [, statsResult, expiringResult] = await Promise.all([
  supabase.rpc('expire_subscriptions'),
  supabase.rpc('get_dashboard_stats'),
  supabase.rpc('get_expiring_subscriptions'),
])
```

---

### 5. Auditar todos os ficheiros de `src/` quanto a TypeScript

Percorre todos os ficheiros `.ts` e `.tsx` em `src/` e verifica:
- Zero uso de `any` (explícito ou implícito)
- Zero uso de `// @ts-ignore` ou `// @ts-nocheck`
- Todos os props de componentes tipados correctamente
- Sem imports quebrados ou não utilizados

Corrige todos os problemas encontrados.

---

### 6. Verificar `src/app/membros/[id]/page.tsx`

Este é o ficheiro mais complexo. Verifica:
- Os modais ("Nova Subscrição", "Registar Pagamento", "Editar Membro") estão implementados e funcionais
- Os inserts/updates no Supabase usam os tipos correctos de `src/lib/types.ts`
- Não há Server Actions misturadas com `'use client'` de forma incorrecta
- O fetch de dados do membro, subscrição activa e histórico de pagamentos está correcto

Se algum modal estiver incompleto ou com bugs, implementa/corrige.

---

### 7. Verificar `src/app/planos/page.tsx`

Verifica:
- O modal de criar/editar plano está implementado
- A lógica de `plan_type` automático (se >1 modalidade seleccionada → `pack`) funciona
- Os updates de `is_active` (activar/desactivar plano) estão correctos

---

### 8. Verificar `src/app/membros/page.tsx`

Verifica:
- A pesquisa client-side por nome/apelido/NIF/email/telefone funciona
- Os filtros de estado (Todos, Ativos, Inativos, Subscrição Expirada) funcionam
- Os query params `?filtro=` do dashboard (vindos dos cards de métricas) são respeitados

---

### 9. Correr build e corrigir TODOS os erros

```bash
npm run build
```

Corrige todos os erros de TypeScript e de build. Repete até o build passar sem erros nem warnings críticos.

---

### 10. Correr lint e corrigir

```bash
npm run lint
```

Corrige todos os erros de ESLint. Warnings podem ser aceites se não forem corrigíveis sem breaking changes.

---

### 11. Commits atómicos

Após cada grupo de alterações lógicas, faz um commit atómico com mensagem clara:

```bash
git add <ficheiros específicos>
git commit -m "fix: descrição concisa do que foi corrigido"
```

**Nunca** `git add -A` ou `git add .` em conjunto com múltiplas mudanças não relacionadas.

Exemplos de commits esperados:
- `fix: middleware auth — renomear proxy para middleware`
- `fix: dashboard — chamar expire_subscriptions no carregamento`
- `feat: security headers no next.config`
- `docs: README com instruções de setup`
- `chore: criar estrutura .sota/ para state persistence`
- `fix: corrigir erros TypeScript em membros/[id]`

---

## REGRAS DE CÓDIGO

1. **TypeScript strict** — zero `any`, zero `@ts-ignore`
2. **`'use client'`** apenas onde há estado, eventos, ou hooks de browser
3. **Server Components** por defeito para fetch de dados
4. **Imports com `@/`** alias
5. **Comentários em português** onde necessário
6. **Não tocar em `.env.local`** — não sobrescrever com valores diferentes
7. **Não apagar `src/proxy.ts`** — apenas garantir que não tem exports activos

---

## CRITÉRIOS DE CONCLUSÃO

- [ ] `src/middleware.ts` existe e exporta `middleware` correctamente
- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` passa sem erros (warnings aceitáveis)
- [ ] Zero `any` em todo o `src/`
- [ ] Todos os modais nas páginas implementados e funcionais
- [ ] Commits atómicos feitos para cada grupo de alterações
- [ ] `.sota/` actualizado se encontrares novos issues de segurança ou qualidade

Ao terminar, reporta:
1. O que verificaste e estava correcto
2. O que corrigiste (com ficheiro e linha)
3. Resultado do build e lint
4. Lista de commits feitos

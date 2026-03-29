# PROMPT #3 — Refinamentos UX

Lê `docs/PRD.md` e `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` antes de começar.

## CONTEXTO

O projecto está funcional. Este prompt foca-se em refinamentos de UX de alto impacto para a utilizadora principal (Ana — não técnica, usa no balcão do ginásio, mobile e desktop).

---

## TAREFAS

### 1. Urgência visual no dashboard — 3 níveis de cor

**Ficheiro:** `src/app/page.tsx`

A lista "Subscrições a Expirar" deve ter 3 níveis visuais distintos, não apenas amarelo:

| Condição | Cor de fundo da linha | Badge |
|----------|----------------------|-------|
| `days_remaining === 0` (expira hoje) | `bg-red-500/15 border border-red-500/30` | Badge `red` com texto "hoje" |
| `days_remaining <= 3` (1-3 dias) | `bg-orange-500/10 border border-orange-500/20` | Badge `orange` com texto "{n}d" |
| `days_remaining <= 7` (4-7 dias) | `bg-yellow-500/10` (actual) | Badge `yellow` com texto "{n}d" |

Para o badge laranja, adicionar `orange` como nova cor ao componente `Badge.tsx` (mesma estrutura das cores existentes).

---

### 2. Telefone clicável em toda a app

**Ficheiro:** `src/app/membros/MembrosContent.tsx` e `src/app/membros/[id]/MembroPerfilClient.tsx`

O número de telefone deve ser um link `tel:` em **todos os locais onde aparece**:

```tsx
// Em vez de texto simples:
<span>{member.phone}</span>

// Usar:
<a
  href={`tel:${member.phone}`}
  className="text-accent hover:underline"
  onClick={(e) => e.stopPropagation()} // evita navegar para o perfil ao clicar
>
  {member.phone}
</a>
```

Aplicar também na lista de alertas do dashboard (`src/app/page.tsx`) — adicionar o telefone em formato clicável na linha de cada membro a expirar.

---

### 3. Formulário de novo membro com steps visuais

**Ficheiro:** `src/app/membros/novo/page.tsx`

Substituir o formulário de página única por um layout com **barra de progresso e secções collapsáveis**:

**Step 1 — Dados Pessoais** (obrigatório: nome, apelido)
- first_name*, last_name*, email, phone, date_of_birth, gender

**Step 2 — Morada** (tudo opcional)
- address, city, postal_code

**Step 3 — Documentos & Saúde** (tudo opcional)
- nif, cc_number, medical_conditions, allergies, emergency_contact_name, emergency_contact_phone

**Step 4 — Notas** (opcional)
- notes

Implementar como tabs/steps horizontais no topo (não wizard com next/back — manter tudo numa página com scroll mas com secções marcadas visualmente e uma barra de progresso com 4 passos).

**Regra de progresso:** o progresso avança quando os campos obrigatórios do passo estão preenchidos. Os campos opcionais nunca bloqueiam.

Os campos marcados como opcionais devem ter `(opcional)` em texto small abaixo do label, em `quartel-500`.

---

### 4. Empty states orientadores (onboarding)

Cada página deve ter um empty state que orienta a utilizadora para a acção seguinte **pela ordem correcta de setup**:

**`/planos`** (sem planos):
```
Ícone: ClipboardList
Título: "Nenhum plano criado"
Descrição: "Começa por criar os planos de subscrição do Quartel.24 — Ginásio, BJJ, MMA."
Botão: "Criar primeiro plano" → abre modal de novo plano
```

**`/membros`** (sem membros, mas já há planos):
```
Ícone: Users
Título: "Nenhum membro registado"
Descrição: "Regista o primeiro membro do Quartel.24."
Botão: "Registar membro" → /membros/novo
```

**`/membros`** (sem membros E sem planos):
```
Ícone: AlertTriangle (amarelo)
Título: "Começa pelos planos"
Descrição: "Antes de registar membros, cria os planos de subscrição disponíveis."
Botão: "Ir para Planos" → /planos
```

Para saber se há planos, o `MembrosPage` (server component) já busca dados — passa `hasPlans: boolean` ao `MembrosContent`.

**`/pagamentos`** (sem pagamentos):
```
Ícone: CreditCard
Título: "Nenhum pagamento registado"
Descrição: "Os pagamentos são registados no perfil de cada membro."
Botão: "Ver membros" → /membros
```

---

### 5. Confirmação destrutiva nos modais

**Ficheiro:** `src/app/planos/PlanosContent.tsx`

O botão "Desativar" / "Ativar" plano deve mostrar um modal de confirmação antes de executar, não agir directamente.

Para "Desativar":
- Titulo do modal: "Desativar plano?"
- Corpo: "O plano **{nome}** ficará indisponível para novas subscrições. Subscrições activas existentes não são afectadas."
- Botão confirm: "Desativar" (variante `danger`)
- Botão cancel: "Cancelar" (variante `secondary`, recebe foco por defeito via `autoFocus`)

Para "Ativar" não é necessária confirmação (não é destrutivo).

---

### 6. Contagem e chip de filtro activo na lista de membros

**Ficheiro:** `src/app/membros/MembrosContent.tsx`

Abaixo da barra de pesquisa e filtros, mostrar:

```tsx
// Se filtro activo != 'todos' ou pesquisa não vazia:
<div className="flex items-center gap-2 text-sm text-quartel-400">
  <span>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
  {(statusFilter !== 'todos' || search) && (
    <button
      onClick={() => { setSearch(''); setStatusFilter('todos') }}
      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-quartel-700 text-quartel-300 hover:bg-quartel-600 text-xs"
    >
      Limpar filtros <X className="h-3 w-3" />
    </button>
  )}
</div>
```

Importar `X` de `lucide-react`.

---

### 7. Toast de feedback (componente global)

Criar `src/components/ui/Toast.tsx` — componente de notificação temporária para feedback de acções (inserir, actualizar, erro).

```typescript
// API pretendida (simples, sem biblioteca externa):
// Usar Context + useState, expor via hook useToast()

type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
```

Implementar:
- `src/components/ui/Toast.tsx` — componente visual (canto inferior direito, z-50, animação fade-in/out)
- `src/lib/toast.tsx` — ToastProvider (Context) + hook `useToast()`
- Adicionar `<ToastProvider>` ao `AppShell.tsx`

Usar nos modais existentes (PlanosContent, MembroPerfilClient, MembrosContent) para substituir qualquer `alert()` ou feedback inline que exista actualmente.

Exemplo de uso:
```tsx
const { showToast } = useToast()
// após insert com sucesso:
showToast('Membro registado com sucesso', 'success')
// após erro:
showToast('Erro ao guardar. Tenta novamente.', 'error')
```

---

## REGRAS

1. **Sem `any`** — manter TypeScript strict
2. **Comentários em português**
3. **`'use client'`** apenas onde necessário
4. **Não instalar bibliotecas novas** — usar apenas as já existentes (`clsx`, `tailwind-merge`, `lucide-react`, `date-fns`)
5. **Não alterar schema SQL** — apenas frontend

## CRITÉRIOS DE CONCLUSÃO

- [ ] Dashboard com 3 níveis de urgência (vermelho/laranja/amarelo)
- [ ] Telefone clicável (`tel:`) em toda a app
- [ ] Formulário de novo membro com barra de progresso de 4 passos
- [ ] Empty states orientadores em todas as páginas
- [ ] Modal de confirmação antes de desativar plano
- [ ] Chip "Limpar filtros" com contagem de resultados na lista de membros
- [ ] Toast global implementado e usado nas acções de escrita
- [ ] `npm run build` e `npm run lint` a passar sem erros
- [ ] Commits atómicos por feature (um commit por tarefa deste prompt)

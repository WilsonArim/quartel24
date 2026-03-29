# PROMPT #7 — Alertas de Transição de Idade (18 anos)

Lê `node_modules/next/dist/docs/01-app/` antes de começar.

## CONTEXTO

Membros com plano `age_category = 'criança'` devem migrar para plano adulto quando fazem 18 anos. Actualmente não existe qualquer alerta para isso. Este prompt cria:

1. Uma função SQL que detecta estes casos
2. Um tipo TypeScript para o resultado
3. Uma secção de alertas no Dashboard

**Dois tipos de alerta:**
- 🟡 **Faz 18 este mês** — o 18.º aniversário cai no mês actual (pode ainda não ter acontecido)
- 🔴 **Já tem 18+ anos** — passou do mês do 18.º aniversário mas ainda tem plano de criança

---

## 1. Supabase — Nova função SQL

Executar a seguinte migration. Criar ficheiro `supabase/migrations/<timestamp>_age_transition_alerts.sql`:

```sql
-- Função: alertas de membros que atingiram 18 anos mas ainda têm plano de criança
CREATE OR REPLACE FUNCTION get_age_transition_alerts()
RETURNS TABLE (
  member_id        uuid,
  first_name       text,
  last_name        text,
  date_of_birth    date,
  age_years        integer,
  turns_18_this_month boolean,
  plan_name        text,
  subscription_id  uuid,
  subscription_end_date date
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id                                                          AS member_id,
    m.first_name,
    m.last_name,
    m.date_of_birth::date,
    EXTRACT(year FROM AGE(CURRENT_DATE, m.date_of_birth::date))::integer
                                                                  AS age_years,
    (
      EXTRACT(year  FROM (m.date_of_birth::date + INTERVAL '18 years'))
        = EXTRACT(year  FROM CURRENT_DATE)
      AND
      EXTRACT(month FROM (m.date_of_birth::date + INTERVAL '18 years'))
        = EXTRACT(month FROM CURRENT_DATE)
    )                                                             AS turns_18_this_month,
    p.name                                                        AS plan_name,
    s.id                                                          AS subscription_id,
    s.end_date::date                                              AS subscription_end_date
  FROM members m
  JOIN subscriptions s
    ON s.member_id = m.id
   AND s.status    = 'active'
  JOIN subscription_plans p
    ON p.id             = s.plan_id
   AND p.age_category   = 'criança'
  WHERE
    m.date_of_birth IS NOT NULL
    AND m.is_active = true
    AND (
      -- Já tem 18 ou mais anos e ainda em plano criança
      EXTRACT(year FROM AGE(CURRENT_DATE, m.date_of_birth::date)) >= 18
      OR
      -- Vai/acaba de fazer 18 anos este mês
      (
        EXTRACT(year  FROM (m.date_of_birth::date + INTERVAL '18 years'))
          = EXTRACT(year  FROM CURRENT_DATE)
        AND
        EXTRACT(month FROM (m.date_of_birth::date + INTERVAL '18 years'))
          = EXTRACT(month FROM CURRENT_DATE)
      )
    )
  ORDER BY
    -- Primeiro os que já passaram (mais urgente), depois os que fazem este mês
    turns_18_this_month ASC,
    m.date_of_birth ASC;
$$;
```

Aplicar via Supabase MCP (`apply_migration`) OU guardando o ficheiro e correndo `supabase db push`.

---

## 2. `src/lib/types.ts` — Novo tipo

Adicionar no fim do ficheiro:

```ts
export type AgeTransitionAlert = {
  member_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  age_years: number
  turns_18_this_month: boolean
  plan_name: string
  subscription_id: string
  subscription_end_date: string
}
```

---

## 3. `src/app/page.tsx` — Integrar no Dashboard

### 3a. Importações

Adicionar aos imports existentes:
```tsx
import { Cake } from 'lucide-react'
import type { AgeTransitionAlert } from '@/lib/types'
```

### 3b. Query no servidor

No `Promise.all`, adicionar a chamada à nova função:

```tsx
const [, statsResult, expiringResult, ageAlertsResult] = await Promise.all([
  supabase.rpc('expire_subscriptions'),
  supabase.rpc('get_dashboard_stats'),
  supabase.rpc('get_expiring_subscriptions'),
  supabase.rpc('get_age_transition_alerts'),
])

const ageAlerts: AgeTransitionAlert[] = ageAlertsResult.data ?? []
```

### 3c. Nova secção de alertas — após o card "Subscrições a Expirar"

Adicionar imediatamente após o `</Card>` do bloco de "Subscrições a Expirar":

```tsx
{/* Alertas de transição de idade — 18 anos */}
{ageAlerts.length > 0 && (
  <Card
    variant="default"
    header={
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10">
            <Cake className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold dark:text-white text-gray-900">
              Transições de Idade
            </h2>
            <p className="text-xs dark:text-quartel-500 text-gray-400 mt-0.5">
              Membros que atingiram 18 anos com plano de criança activo
            </p>
          </div>
        </div>
        <Badge color="orange" size="sm">
          {ageAlerts.length} {ageAlerts.length === 1 ? 'membro' : 'membros'}
        </Badge>
      </div>
    }
  >
    <div className="space-y-2">
      {ageAlerts.map((alert) => {
        const isTurning18 = alert.turns_18_this_month
        const urgencyBg = isTurning18
          ? 'dark:bg-orange-500/10 bg-orange-50 border dark:border-orange-500/20 border-orange-200'
          : 'dark:bg-red-500/12 bg-red-50 border dark:border-red-500/20 border-red-200'

        // Calcular a data do 18.º aniversário para mostrar
        const dob = new Date(alert.date_of_birth)
        const birthday18 = new Date(dob)
        birthday18.setFullYear(dob.getFullYear() + 18)
        const birthday18Str = birthday18.toLocaleDateString('pt-PT', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        return (
          <Link
            key={alert.member_id}
            href={`/membros/${alert.member_id}`}
            className={`flex items-center justify-between p-3 rounded-xl hover:opacity-90 transition-all ${urgencyBg}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isTurning18 ? 'bg-orange-500/60' : 'bg-red-500/60'}`}>
                {alert.first_name.charAt(0)}{alert.last_name.charAt(0)}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold dark:text-white text-gray-900 truncate">
                  {alert.first_name} {alert.last_name}
                </p>
                <p className="text-xs dark:text-quartel-400 text-gray-500 truncate">
                  Plano actual: <span className="font-medium">{alert.plan_name}</span>
                </p>
                <p className="text-xs dark:text-quartel-500 text-gray-400 mt-0.5">
                  {isTurning18
                    ? `Faz 18 anos a ${birthday18Str}`
                    : `Completou ${alert.age_years} anos — por actualizar`}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-1">
              <Badge color={isTurning18 ? 'orange' : 'red'} size="sm">
                {isTurning18 ? '18 anos este mês' : `${alert.age_years} anos`}
              </Badge>
              <span className="text-xs dark:text-quartel-500 text-gray-400">
                Ver perfil →
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  </Card>
)}
```

---

## 4. Verificação manual da query no Supabase

Após aplicar a migration, correr no SQL Editor do Supabase para confirmar que funciona:

```sql
SELECT * FROM get_age_transition_alerts();
```

Se não existirem membros com as condições, o resultado é vazio — correcto.

Para testar, criar temporariamente um membro com:
- `date_of_birth` = data de há 18 anos neste mês
- Subscrição activa com plano `age_category = 'criança'`

---

## REGRAS

1. **Ler cada ficheiro antes de editar** — `Read` tool obrigatório
2. **Zero `any`** — TypeScript strict
3. **O card de alertas só é renderizado se `ageAlerts.length > 0`** — não mostrar secção vazia
4. **Não quebrar funcionalidade existente**
5. **`npm run build` antes de commitar**

## CRITÉRIOS DE CONCLUSÃO

- [ ] Migration SQL aplicada no Supabase
- [ ] `AgeTransitionAlert` tipo adicionado em `types.ts`
- [ ] `get_age_transition_alerts()` chamada no Dashboard
- [ ] Secção de alertas visível no dashboard (aparece apenas se existirem casos)
- [ ] Alerta laranja para "faz 18 este mês", vermelho para "já tem 18+"
- [ ] Link para perfil do membro em cada linha
- [ ] Secção ocultada quando não há alertas
- [ ] `npm run build` — zero erros
- [ ] `npm run lint` — zero erros
- [ ] 2 commits atómicos (migration + UI)

---
name: Data Analytics
description: >
  Delegar queries de base de dados, analise de dados e tarefas de analytics ao Claude em vez de
  as escrever manualmente. Usa esta skill sempre que o utilizador precisar de consultar uma base de
  dados (SQL, PostgreSQL, MySQL, SQLite, BigQuery, MongoDB), analisar dados, gerar relatorios a
  partir de dados, criar queries complexas, explorar schemas, fazer data exploration, ou quando
  mencionar tabelas, colunas, queries, joins, aggregations, ou analytics. Tambem se aplica quando
  o utilizador tem um CSV/JSON com dados e quer extrair insights, ou quando precisa de migracoes
  de schema. Trigger generoso: se envolve dados estruturados e o utilizador quer respostas — usa esta skill.
phase: 3
---

# Data Analytics

## Proposito

Eliminar a necessidade de escrever queries de base de dados e scripts de analise manualmente.
O Claude deve ser o intermediario entre o utilizador e os seus dados — o utilizador descreve
o que quer saber, o Claude gera a query, executa-a (se possivel), e apresenta os resultados
de forma compreensivel.

Boris Cherny, Head of Claude Code na Anthropic, nao escreve SQL ha mais de 6 meses. A equipa
dele tem uma skill de BigQuery integrada no codebase que toda a gente usa. Esta skill traz
esse mesmo paradigma para qualquer base de dados.

---

## Quando Usar

- O utilizador quer dados de uma base de dados (SQL, NoSQL, data warehouse)
- Analise exploratoria: "quantos utilizadores se registaram este mes?"
- Queries complexas com joins, subqueries, window functions, CTEs
- Transformacao de dados: pivotar, agregar, limpar
- Analise de CSVs ou JSONs carregados pelo utilizador
- Debugging de queries lentas ou incorretas
- Criacao ou alteracao de schemas e migracoes
- Gerar relatorios ou dashboards de dados

---

## Processo

### 1. Identificar a Fonte de Dados

Antes de escrever qualquer query, determinar de onde vem os dados:

| Fonte | Como Aceder | Ferramentas |
|-------|-------------|-------------|
| PostgreSQL/MySQL/SQLite | CLI (`psql`, `mysql`, `sqlite3`) ou MCP | Query direta |
| BigQuery | `bq` CLI ou MCP | `bq query --use_legacy_sql=false` |
| MongoDB | `mongosh` CLI ou MCP | Query com aggregation pipeline |
| Supabase | MCP Supabase ou API | `execute_sql` tool |
| CSV/JSON local | Python (pandas) ou script | Carregar e analisar |
| API externa | HTTP requests | Fetch, transformar, analisar |

Se existir um MCP disponivel para a base de dados (Supabase, Neon, PlanetScale, etc.),
preferir o MCP sobre CLI — e mais seguro e tem melhor integracao.

### 2. Explorar o Schema

Nunca assumir a estrutura dos dados. Comecar sempre por explorar:

```sql
-- PostgreSQL: listar tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Ver colunas de uma tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- Ver relacoes (foreign keys)
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

Para CSVs: ler os primeiros registos e inferir tipos.

### 3. Gerar a Query

Principios para queries de qualidade:

- **Especificar colunas** — nunca `SELECT *` em producao ou queries sobre tabelas grandes
- **Limitar resultados** — usar `LIMIT` durante exploracao para nao sobrecarregar
- **Usar CTEs para legibilidade** — queries complexas devem ser lidas como prosa
- **Comentar a intencao** — `-- Utilizadores ativos nos ultimos 30 dias que nao fizeram compra`
- **Prevenir SQL injection** — usar parametros, nunca concatenar valores

Exemplo de CTE limpo:
```sql
-- Receita mensal por categoria de produto nos ultimos 12 meses
WITH monthly_revenue AS (
    SELECT
        date_trunc('month', o.created_at) AS month,
        p.category,
        SUM(oi.quantity * oi.unit_price) AS revenue
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.created_at >= NOW() - INTERVAL '12 months'
    AND o.status = 'completed'
    GROUP BY 1, 2
)
SELECT
    month,
    category,
    revenue,
    LAG(revenue) OVER (PARTITION BY category ORDER BY month) AS prev_month,
    ROUND(
        (revenue - LAG(revenue) OVER (PARTITION BY category ORDER BY month))
        / NULLIF(LAG(revenue) OVER (PARTITION BY category ORDER BY month), 0) * 100,
        1
    ) AS growth_pct
FROM monthly_revenue
ORDER BY month DESC, revenue DESC;
```

### 4. Executar e Apresentar

Depois de gerar a query:

1. **Executar** — se ha acesso direto (MCP, CLI), executar e capturar resultados
2. **Validar** — verificar se os resultados fazem sentido (nulls inesperados, contagens impossiveis)
3. **Apresentar** — formatar resultados de forma legivel:
   - Tabelas para dados tabulares
   - Numeros com unidades e contexto ("1,234 utilizadores, +12% vs mes anterior")
   - Destacar anomalias ou insights nao obvios
4. **Sugerir proximos passos** — se os dados revelam algo interessante, propor analises adicionais

### 5. Analise de CSVs/JSONs Locais

Quando o utilizador fornece ficheiros de dados em vez de uma base de dados:

```python
import pandas as pd

# Carregar
df = pd.read_csv('data.csv')

# Explorar
print(df.shape)           # dimensoes
print(df.dtypes)          # tipos
print(df.describe())      # estatisticas
print(df.isnull().sum())  # valores em falta

# Analisar conforme pedido do utilizador
result = df.groupby('category')['revenue'].agg(['sum', 'mean', 'count'])
```

Preferir pandas para analise rapida. Para datasets grandes (>1M linhas),
considerar DuckDB que corre SQL diretamente sobre CSVs:

```python
import duckdb

result = duckdb.sql("""
    SELECT category, SUM(revenue) as total
    FROM 'data.csv'
    GROUP BY category
    ORDER BY total DESC
""").df()
```

---

## Seguranca de Dados

- Nunca expor dados sensíveis (PII, financeiros) nos outputs sem mascarar
- Preferir queries de leitura (`SELECT`) — confirmar com o utilizador antes de `UPDATE`/`DELETE`
- Em producao, usar sempre transacoes para operacoes de escrita
- Nunca hardcodar credenciais de base de dados — usar variaveis de ambiente
- Respeitar a skill `SECURITY/secrets-management` (Fase 0, sempre ativa)

---

## Anti-Padroes

- **Query sem LIMIT na exploracao** — uma tabela com 100M linhas vai bloquear tudo
- **SELECT * em tabelas grandes** — especificar colunas necessarias
- **Ignorar indices** — se a query e lenta, verificar se as colunas no WHERE/JOIN tem indice
- **Queries N+1** — se estas a correr uma query por cada item de uma lista, reescreve como JOIN
- **Nao validar resultados** — "0 resultados" pode significar query errada, nao dados vazios
- **Escrever SQL manualmente quando o Claude pode gerar** — delegar e iterar e mais rapido

---

## Relacao com Outras Skills

- **database-design** — Para design de schema e normalizacao (esta skill foca em queries e analise)
- **performance-engineer** — Para otimizacao de queries lentas a nivel profundo
- **SECURITY/secrets-management** — Credenciais de BD nunca em codigo
- **SECURITY/compliance-privacy** — Quando os dados envolvem PII ou GDPR

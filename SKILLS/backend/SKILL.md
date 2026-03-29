---
name: backend
phase: 3
always_active: false
absorbs: [backend-dev-guidelines, senior-fullstack, data-analytics]
description: "Server-side implementation — structure, patterns, data, queries. Platform-agnostic; reads tech stack from CLAUDE.md. Zero silent failures in all error paths."
keywords: [backend, servidor, Node, Express, Next.js, server actions, query, SQL, analytics, dados, BigQuery, database, schema, ORM]
---

# Backend

> Phase 3 — Server-side engineering. Platform-agnostic: reads tech stack from `CLAUDE.md`. All error modes named, handled, and tested—no silent failures.

---

## 1. Project Structure

Organize the codebase **by domain**, not by technical layer. Each module encapsulates its own routes, controllers, services, and types.

### Express/Fastify Convention

```
src/
  modules/
    users/
      users.controller.ts
      users.service.ts
      users.routes.ts
      users.schema.ts       # Zod validation schemas
      users.types.ts
    orders/
      orders.controller.ts
      orders.service.ts
      orders.routes.ts
      orders.schema.ts
      orders.types.ts
  middleware/
    errorHandler.ts
    requestValidator.ts
    auth.ts
    rateLimiter.ts
    requestIdInjector.ts    # Attach unique request ID
  config/
    env.ts                   # Typed environment config
    database.ts
    logger.ts
  utils/
    AppError.ts              # Custom error class with context
    asyncHandler.ts          # Wrap async handlers to catch errors
    response.ts              # Standardized response formatting
  server.ts                  # HTTP listener, graceful shutdown
  app.ts                     # Express setup, middleware, routes
```

**Critical:** Separate `app.ts` (Express setup, middleware, routes) from `server.ts` (HTTP listener, graceful shutdown). This makes the app testable without starting a real server.

### Next.js App Router Convention

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
    layout.tsx              # Auth-specific layout (no sidebar)
  (dashboard)/
    dashboard/page.tsx
    settings/page.tsx
    layout.tsx              # Dashboard layout with sidebar
  api/
    webhooks/stripe/route.ts
  layout.tsx                # Root layout
  error.tsx                 # Global error boundary
  loading.tsx               # Global loading state
  not-found.tsx
lib/
  actions/                  # Server actions by domain
    users.ts
    orders.ts
  db/
    schema.ts               # Drizzle/Prisma schema
    queries.ts              # Reusable query functions
  validators/               # Shared Zod schemas
    user.ts
    order.ts
components/
  ui/                       # Generic UI components
  features/                 # Feature-specific components
types/
  index.ts                  # Shared type definitions
```

---

## 2. Environment Configuration (Platform-Agnostic)

**Never** access `process.env` directly outside of a single config module. Parse and validate all environment variables at startup using Zod.

```typescript
// config/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  // Add more based on tech stack read from CLAUDE.md
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

**Zero Silent Failures:** If any required variable is missing or invalid, the process crashes **immediately** at startup with a **clear error message**. This prevents silent misconfiguration in production.

For Next.js, use `@t3-oss/env-nextjs` with build-time validation:

```typescript
// env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

---

## 3. Request Validation with Zod

Define schemas per route and validate using a **reusable middleware**.

```typescript
// middleware/requestValidator.ts
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate = (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(400, "Validation error", error.flatten().fieldErrors));
      }
      next(error);
    }
  };
```

**Key principle:** Schemas live alongside their module. Validate `body`, `query`, and `params` together so the controller receives only clean data.

---

## 4. Error Handling & Middleware

### Custom AppError Class

Use a custom `AppError` class and a **centralized error handler**. Never let unhandled errors leak raw stack traces.

```typescript
// utils/AppError.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown,
    public isOperational = true  // Distinguish expected errors from bugs
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Centralized Error Handler

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { logger } from "@/config/logger";
import { env } from "@/config/env";

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : "Internal Server Error";

  // Always log errors (named error mode: logged_error)
  logger.error({
    err,
    requestId: req.id,
    path: req.path,
    statusCode,
    isOperational: err instanceof AppError ? err.isOperational : false,
  }, message);

  // Named error modes:
  // - operational_error: expected (404, validation, etc.) → user-friendly response
  // - programmer_error: unexpected bug → internal alert required
  // - logged_error: all errors logged for traceability

  res.status(statusCode).json({
    status: "error",
    message,
    errorMode: err instanceof AppError
      ? (err.isOperational ? "operational_error" : "programmer_error")
      : "programmer_error",
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    ...(err instanceof AppError && err.details && { details: err.details }),
    ...(req.id && { requestId: req.id }),
  });
};
```

**Distinction:**
- **Operational errors** (expected): 404, validation failure, auth required → user-friendly response
- **Programmer errors** (unexpected bugs): should trigger alerts and monitoring
- **Zero Silent Failures:** Every error path is named, categorized, and logged

### Async Handler Wrapper

Wrap all async route handlers to forward errors to the error middleware without manual try/catch.

```typescript
// utils/asyncHandler.ts
import { Request, Response, NextFunction } from "express";

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

### Structured Logging

Use `pino` for structured JSON logging. Every log entry must include a request ID for traceability.

```typescript
// config/logger.ts
import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
  serializers: { err: pino.stdSerializers.err },
  base: { service: "my-api", env: env.NODE_ENV },
});

// middleware/requestIdInjector.ts
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const requestIdInjector = (req: Request, _res: Response, next: NextFunction) => {
  req.id = req.headers["x-request-id"] as string || randomUUID();
  next();
};
```

**Log levels:**
- `debug` — development details
- `info` — request/response lifecycle
- `warn` — recoverable issues
- `error` — failures requiring attention

**Never log sensitive data:** passwords, tokens, full credit card numbers, PII. Redact fields explicitly.

### Response Formatting

Standardize all API responses for consistency.

```typescript
// utils/response.ts
import { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  res.status(statusCode).json({ status: "success", data });
};

export const sendPaginated = <T>(res: Response, data: T[], meta: PaginationMeta) => {
  res.status(200).json({ status: "success", data, meta });
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
```

### Graceful Shutdown

Handle `SIGTERM` and `SIGINT` to close connections cleanly before process exit. Critical in containerized deployments.

```typescript
// server.ts
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import app from "@/app";

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    try {
      await database.disconnect();
      logger.info("All connections closed. Exiting.");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Error during shutdown");
      process.exit(1);
    }
  });

  // Hard timeout: force exit after 10 seconds (named error mode: shutdown_timeout)
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

---

## 5. Next.js Server Actions

Server actions are the preferred mutation mechanism in App Router. They run on the server and can be called directly from client components.

```typescript
// lib/actions/users.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { actionClient } from "@/lib/safe-action";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
});

export const updateProfile = actionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { name, bio } = parsedInput;
    const userId = ctx.session.user.id;

    try {
      await db.user.update({ where: { id: userId }, data: { name, bio } });
      revalidatePath("/settings");
      return { success: true };
    } catch (err) {
      // Named error mode: server_action_error
      return { success: false, error: "Failed to update profile" };
    }
  });
```

**Key:** Always validate inputs. Never trust the client. Use `next-safe-action` or similar wrapper to centralize validation and auth checks.

---

## 6. Data Fetching Strategies: RSC vs Client

### React Server Components (Default)

Fetch data directly in the component. No `useEffect`, no loading states to manage manually.

```typescript
// app/(dashboard)/dashboard/page.tsx
import { db } from "@/lib/db";
import { DashboardView } from "@/components/features/dashboard-view";

export default async function DashboardPage() {
  const [metrics, recentOrders] = await Promise.all([
    db.getMetrics(),
    db.getRecentOrders({ limit: 10 }),
  ]);

  return <DashboardView metrics={metrics} orders={recentOrders} />;
}
```

### Client Components

Use only when you need interactivity. Fetch via React Query or SWR for data that needs polling, optimistic updates, or client-side cache.

### Decision Framework

| Data Type | Mechanism |
|-----------|-----------|
| Static or user-specific page load data | RSC (fetch in server component) |
| Real-time data, polling, infinite scroll | Client component + React Query/SWR |
| Form submissions, mutations | Server actions |
| Data that changes on user interaction without navigation | Client-side fetch via React Query |

---

## 7. Shared Types Between Client and Server

Define types in a central `types/` directory. Derive types from database schema and Zod validators—single source of truth.

```typescript
// lib/validators/order.ts
import { z } from "zod";

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  shippingAddressId: z.string().uuid(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// types/index.ts
import type { InferSelectModel } from "drizzle-orm";
import type { orders } from "@/lib/db/schema";

export type Order = InferSelectModel<typeof orders>;
export type OrderWithItems = Order & { items: OrderItem[] };
```

**Never duplicate types manually.** If the database schema changes, types update automatically.

---

## 8. Monorepo Structure

For projects with >2 packages, use a monorepo with **Turborepo** or **Nx**.

```
packages/
  ui/                   # Shared UI component library
    src/
    package.json
  db/                   # Database schema, migrations, client
    src/
    package.json
  validators/           # Shared Zod schemas
    src/
    package.json
  config-ts/            # Shared tsconfig bases
    base.json
    nextjs.json
    library.json
apps/
  web/                  # Next.js frontend
    package.json
  api/                  # Express/Fastify API (if separate)
    package.json
  admin/                # Admin dashboard
    package.json
turbo.json
package.json
```

### Monorepo Rules

- Shared packages use `"main"` and `"types"` fields pointing to source (not built output) during development. Use Turborepo's `transpilePackages` in Next.js config.
- Database package owns all schema definitions and exports the client. No app should define its own database connection.
- Validators package exports Zod schemas used by both frontend forms and backend endpoints.
- Use workspace root `package.json` for shared dependencies (ESLint, TypeScript, Prettier).

---

## 9. Data Analytics & Queries

### When to Use

- User wants data from database (SQL, NoSQL, data warehouse)
- Exploratory analysis: "how many users registered this month?"
- Complex queries: joins, subqueries, window functions, CTEs
- Data transformation: pivot, aggregate, clean
- CSV/JSON analysis
- Debugging slow queries
- Schema migrations

### Process

#### 1. Identify Data Source

| Source | Access | Tools |
|--------|--------|-------|
| PostgreSQL/MySQL/SQLite | CLI or MCP | Direct query |
| BigQuery | `bq` CLI or MCP | `bq query --use_legacy_sql=false` |
| MongoDB | `mongosh` CLI or MCP | Aggregation pipeline |
| Supabase | MCP or API | `execute_sql` tool |
| CSV/JSON local | Python (pandas) or script | Load and analyze |

Prefer MCP over CLI when available—more secure, better integration.

#### 2. Explore Schema First

```sql
-- PostgreSQL: list tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- View columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- View foreign keys
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

#### 3. Generate Quality Queries

Principles for production-grade queries:

- **Specify columns** — never `SELECT *` on large tables
- **Limit results** — use `LIMIT` during exploration
- **Use CTEs for clarity** — complex queries should read like prose
- **Comment intent** — `-- Active users in last 30 days with no purchase`
- **Prevent SQL injection** — use parameters, never concatenate

Example of clean CTE:

```sql
-- Monthly revenue by product category (last 12 months)
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

#### 4. Execute & Validate

1. **Execute** — if access exists (MCP, CLI), run and capture results
2. **Validate** — check results make sense (unexpected nulls? impossible counts?)
3. **Present** — format readably:
   - Tables for tabular data
   - Numbers with units ("1,234 users, +12% vs last month")
   - Highlight anomalies
4. **Suggest next steps** — if data reveals insights, propose follow-up analyses

#### 5. CSV/JSON Local Analysis

When user provides files instead of database:

```python
import pandas as pd

# Load
df = pd.read_csv('data.csv')

# Explore
print(df.shape)           # dimensions
print(df.dtypes)          # types
print(df.describe())      # statistics
print(df.isnull().sum())  # missing values

# Analyze per user request
result = df.groupby('category')['revenue'].agg(['sum', 'mean', 'count'])
```

For large datasets (>1M rows), use **DuckDB**:

```python
import duckdb

result = duckdb.sql("""
    SELECT category, SUM(revenue) as total
    FROM 'data.csv'
    GROUP BY category
    ORDER BY total DESC
""").df()
```

### Data Security

- Never expose sensitive data (PII, financial) without masking
- Prefer read-only queries (`SELECT`) — confirm with user before `UPDATE`/`DELETE`
- Use transactions for write operations in production
- Never hardcode database credentials—use environment variables
- Respect `SECURITY/secrets-management` (Phase 0, always active)

### Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Query without `LIMIT` in exploration | Blocks on large tables | Always `LIMIT` during exploration |
| `SELECT *` on large tables | Transfers unnecessary data | Specify columns needed |
| Ignoring indices | Slow queries | Verify WHERE/JOIN columns are indexed |
| N+1 queries | Loop executes query per row | Rewrite as JOIN |
| Not validating results | "0 results" = wrong query? | Sanity-check counts, nulls, ranges |

---

## 10. API Routes vs Server Actions (Next.js)

| Use Case | Mechanism |
|---|---|
| Mutations from your own UI | Server actions |
| Third-party webhooks (Stripe, GitHub) | API routes (`route.ts`) |
| Public API consumed by external clients | API routes |
| File uploads with progress | API routes |
| Simple CRUD from forms | Server actions |

**Server actions reduce boilerplate:** no fetch calls, no manual error parsing, automatic revalidation. Use API routes only when you need a traditional HTTP endpoint.

---

## 11. Key Principles

### Fail Fast at Startup
- Validate config
- Check DB connection
- Verify required services

### Dependency Injection
- Use DI or factory functions for testability
- Avoid importing singletons directly in service files
- Makes unit testing possible

### Thin Controllers
- Parse request
- Call service
- Format response
- Keep business logic in services

### Testing Strategy
- Integration tests against Express app using `supertest`
- Server components tested with full-page rendering
- Client components tested with React Testing Library
- Always test error paths (named error modes)

### TypeScript Strictness
- Enable `strict: true`
- Enable `noUncheckedIndexedAccess`
- Enable `exactOptionalPropertyTypes`
- No `any` without `@ts-expect-error` comment with justification

### No Silent Failures
- Every error path is named and logged
- Operational vs programmer errors are distinguished
- Request ID attached to all logs for traceability
- Timeout mechanisms in place for async operations
- Graceful shutdown prevents zombie processes

---

## 12. Platform-Agnostic Dispatch

This skill automatically adapts based on tech stack defined in `CLAUDE.md`:

- **Framework: Express** → Applies Express/Fastify patterns
- **Framework: Next.js** → Applies App Router + Server Actions patterns
- **Runtime: Node.js** → Validates Node.js conventions
- **Database: PostgreSQL** → Uses PostgreSQL-specific query patterns
- **Database: MongoDB** → Uses aggregation pipeline patterns
- **Monorepo: >2 packages** → Applies monorepo structure

When implementation starts, check `CLAUDE.md` tech stack and automatically select correct patterns. Never hardcode framework assumptions.

---

## 13. Relation to Other Skills

| Skill | Relation |
|-------|----------|
| **database-design** | Covers schema design and normalization; this skill focuses on queries and analysis |
| **api-patterns** | Covers REST/GraphQL/tRPC design; this skill covers implementation patterns |
| **api-security-best-practices** | Covers API security; use alongside for auth, rate limiting, CORS |
| **auth-implementation-patterns** | Covers JWT, OAuth, sessions; integrate with server logic |
| **performance-engineer** | Deep query optimization; consult for slow query analysis |
| **SECURITY/secrets-management** | Database credentials never in code; Phase 0, always active |
| **SECURITY/compliance-privacy** | Data involving PII or GDPR compliance |
| **test-driven-development** | Write tests alongside backend code |

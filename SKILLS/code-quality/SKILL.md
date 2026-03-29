---
name: code-quality
phase: 5
always_active: false
absorbs: code-review-checklist, vibe-code-auditor, performance-engineer, security-auditor
description: "Holistic code evaluation — correctness, security, performance, maintainability. Fix-first resolution, not just reporting."
keywords: [review, PR, qualidade, audit, score, performance, OWASP, Core Web Vitals, checklist, seguranca, linting, triage]
---

# Code Quality

> Phase 5 — Evaluate, score, and FIX. Not just report — resolve mechanical issues automatically, escalate judgment calls.

---

## 1. Quality Scoring Framework (1-10)

Every codebase, module, or PR receives a deterministic score across five dimensions. Scores are weighted to produce a **Overall Score** and Grade.

### Scoring Dimensions

| Dimension | Weight | Score 1-3 | Score 4-6 | Score 7-8 | Score 9-10 |
|-----------|--------|-----------|-----------|-----------|-----------|
| **Readability** | 20% | Cryptic names, deep nesting, no comments | Mostly readable, some unclear sections | Clean naming, consistent style, self-documenting | Exemplary clarity, reads like prose |
| **Maintainability** | 25% | Tightly coupled, changes break unrelated code | Some modularity, implicit dependencies | Well-structured, clear interfaces, localized changes | Highly modular, DI, open/closed principle |
| **Performance** | 20% | N+1 queries, memory leaks, O(n²) alternatives exist | Generally okay, some missed optimizations | Efficient algorithms, appropriate caching | Profiled, measured budgets, zero waste |
| **Security** | 20% | SQL injection possible, no validation, secrets in code | Basic protections, some gaps, incomplete auth | OWASP Top 10 addressed, proper auth/authz | Defense-in-depth, security headers, audit logging |
| **Testing** | 15% | No tests, or tests don't verify behavior | Some tests, patchy coverage, missing edge cases | Good coverage, behavior tested, edge cases | Comprehensive, TDD evident, mutation testing |

### Grade Scale

| Overall Score | Grade | Interpretation |
|---|---|---|
| 9.0 - 10.0 | A+ | Exceptional. Reference-quality code. |
| 8.0 - 8.9 | A | Excellent. Production-ready, minimal issues. |
| 7.0 - 7.9 | B | Good. Solid foundation with minor improvements. |
| 6.0 - 6.9 | C | Acceptable. Noticeable issues, plan to address. |
| 5.0 - 5.9 | D | Below standard. Significant improvements needed. |
| Below 5.0 | F | Critical. Major rework required. |

**Calculation:** `Overall = (R × 0.20) + (M × 0.25) + (P × 0.20) + (S × 0.20) + (T × 0.15)`

### Readability Evaluation Points

- Variable and function naming quality
- Consistent code style and formatting
- Appropriate use of comments (why, not what)
- Nesting depth (max 3 levels recommended)
- Function length (max 30 lines recommended)
- File length (max 300 lines recommended)

### Maintainability Evaluation Points

- Separation of concerns
- Coupling between modules (low is better)
- Cohesion within modules (high is better)
- Single Responsibility Principle adherence
- DRY (Don't Repeat Yourself) compliance
- Presence and quality of type definitions (TypeScript)
- Error handling consistency

### Performance Evaluation Points

- Algorithm complexity appropriateness
- Database query efficiency (N+1 detection)
- Memory management (no leaks, reasonable allocations)
- Bundle size impact (frontend)
- Caching strategy effectiveness
- Unnecessary re-renders (frontend frameworks)

### Security Evaluation Points

- Input validation and sanitization
- Authentication and authorization completeness
- Secrets management (no hardcoded credentials)
- Dependency vulnerability status
- Security headers configuration
- XSS, CSRF, and injection prevention
- TLS/encryption implementation

### Testing Evaluation Points

- Test coverage percentage (line and branch)
- Test quality (behavior vs implementation)
- Edge case coverage
- Test naming and readability
- Test isolation (no interdependencies)
- CI enforcement
- Flakiness and determinism

---

## 2. PR Review Checklist

Every pull request must be evaluated systematically across dimensions, in order of priority.

### Priority Tier 1: Correctness and Logic

- Does the code do what the PR description claims?
- Are edge cases handled (null, empty, boundary values, negative numbers)?
- Are error paths handled gracefully with appropriate error messages?
- Is the logic free from off-by-one errors?
- Are race conditions possible in concurrent scenarios?
- Does the code handle failure modes (network errors, timeouts, disk full)?
- Are there N+1 query patterns in database access?

### Priority Tier 2: Security

- Is user input validated and sanitized before use?
- Are SQL queries parameterized (no string concatenation)?
- Are secrets, API keys, or tokens absent from the code?
- Is authentication checked on all protected routes?
- Is authorization enforced (not just authentication)?
- Are sensitive data fields excluded from logs and error messages?
- Are CORS headers configured correctly?
- Are dependency changes introducing known vulnerabilities?

### Priority Tier 3: Performance

- Are large datasets paginated rather than loaded entirely into memory?
- Are expensive computations memoized or cached where appropriate?
- Are database queries using indexes effectively?
- Are unnecessary re-renders avoided in frontend components?
- Is the bundle size impact acceptable?
- Are images optimized and lazy-loaded appropriately?
- Is the critical rendering path optimized?

### Priority Tier 4: Readability and Maintainability

- Are variable and function names descriptive and consistent?
- Is the code self-documenting, or are complex sections commented?
- Does the code follow the project's established patterns and conventions?
- Is there unnecessary duplication that should be extracted?
- Are abstractions at the right level (not too abstract, not too concrete)?
- Are magic numbers replaced with named constants?
- Is error handling consistent across similar operations?

### Priority Tier 5: Testing

- Are new behaviors covered by tests?
- Do tests follow the AAA pattern (Arrange, Act, Assert)?
- Are tests testing behavior, not implementation details?
- Are edge cases tested?
- Are test names descriptive enough to serve as documentation?
- Is test coverage maintained or improved?
- Are tests deterministic (no flakiness)?

### Common Code Smells

Watch for and flag these patterns:

| Smell | Symptom | Suggested Fix |
|-------|---------|---------------|
| Long method | Function exceeds 30 lines | Extract into smaller functions |
| Deep nesting | More than 3 levels of indentation | Use early returns, extract functions |
| Feature envy | Method accesses another object's data excessively | Move method to the data owner |
| Primitive obsession | Using strings/numbers where a type would be clearer | Create domain types or enums |
| Boolean blindness | Functions with boolean parameters | Use named options or separate methods |
| God object | Class doing too many things | Split by responsibility |
| Shotgun surgery | One change requires edits in many unrelated files | Improve cohesion, reduce coupling |
| Dead code | Unreachable or commented-out code | Remove it; version control has history |

### PR Size Guidelines

Small PRs lead to better reviews and faster fixes.

| PR Size (lines changed) | Classification | Review Depth |
|---|---|---|
| 1 - 50 | Excellent | Thorough, all dimensions checked |
| 51 - 200 | Good | Solid, all major concerns addressed |
| 201 - 400 | Acceptable | Declining quality, primary concerns only |
| 401 - 800 | Too Large | Superficial, many gaps likely |
| 800+ | Unacceptable | Rubber stamp; high bug risk |

**Action:** If a PR exceeds 400 lines, ask the author to split it into smaller, independently reviewable PRs. If splitting is not possible, request a walkthrough before reviewing and use multi-pass analysis.

### Blocking vs Non-Blocking Feedback

Clearly distinguish feedback that must be addressed from suggestions.

**Blocking (must fix before merge):**
- Security vulnerabilities
- Data loss risks
- Broken functionality
- Missing tests for critical paths
- Violations of regulatory requirements (GDPR, PCI-DSS, etc.)
- Hardcoded secrets or credentials

**Non-blocking (author's discretion):**
- Style preferences beyond the linter's scope
- Alternative approaches that are equally valid
- Naming suggestions
- Minor performance improvements with negligible impact
- Documentation improvements

**Mark comments explicitly:**
- `[blocking]` — Must be addressed before approval.
- `[suggestion]` — Consider this, but it is not required.
- `[question]` — I need clarification to continue the review.
- `[nit]` — Trivial improvement, entirely optional.

### Review Etiquette

#### For Reviewers

- Review within 24 hours of being assigned. Delays compound.
- Start with the PR description and linked issue to understand intent before reading code.
- Comment on the code, not the person. Say "this function could be simplified" not "you wrote this wrong."
- Ask questions instead of making demands. "What happens if this is null?" is better than "Handle the null case."
- Acknowledge good work. A "nice approach" comment costs nothing and builds trust.
- Provide concrete suggestions. Include code snippets when proposing alternatives.
- Limit nitpicks. Prefix optional suggestions with "nit:" so the author can prioritize.

#### For Authors

- Keep PRs small and focused on a single concern.
- Write a thorough PR description explaining what and why.
- Self-review before requesting review. Read every diff line.
- Respond to every comment, even if just "Done" or "Acknowledged."
- Do not take feedback personally. The goal is better code.

### Review Workflow

```
1. Read the PR description and linked issue
2. Check CI status (tests, lint, build)
3. Review file-by-file, starting with tests to understand intent
4. Check the diff against all five dimensions (correctness, security, performance, readability, tests)
5. Determine which issues are blocking vs non-blocking
6. Leave comments with clear labels
7. Approve, request changes, or comment
8. For large PRs: use multi-pass analysis (see section 6)
9. Re-review after changes are made
10. Approve and merge
```

---

## 3. Security Audit (OWASP Top 10 2021)

Audit every application against these categories. Document findings for each.

### A01: Broken Access Control

- [ ] Enforce deny-by-default for all protected resources.
- [ ] Verify that users cannot act outside their intended permissions.
- [ ] Ensure CORS configuration is restrictive and intentional.
- [ ] Disable directory listing on the web server.
- [ ] Verify that API endpoints enforce authorization, not just authentication.
- [ ] Check that JWT tokens are validated on every request (signature, expiration, issuer).

**Auto-fix opportunities:** Remove debug endpoints; enforce CORS defaults.

### A02: Cryptographic Failures

- [ ] All data in transit uses TLS 1.2 or higher.
- [ ] Passwords are hashed with bcrypt, scrypt, or Argon2 (never MD5 or SHA-1).
- [ ] Sensitive data at rest is encrypted (PII, payment data, health records).
- [ ] Encryption keys are stored in a key management service, not in code.
- [ ] Deprecated cryptographic algorithms are not in use.

**Auto-fix opportunities:** Flag weak hash algorithms; update TLS versions.

### A03: Injection

- [ ] All database queries use parameterized statements or an ORM.
- [ ] User input is never interpolated into SQL, LDAP, or OS commands.
- [ ] Template engines use auto-escaping by default.
- [ ] Input validation uses allowlists, not denylists.

**Auto-fix opportunities:** Rewrite string concatenation to parameterized queries; enable auto-escaping.

### A04: Insecure Design

- [ ] Threat modeling has been performed for critical features.
- [ ] Rate limiting is applied to authentication and sensitive endpoints.
- [ ] Business logic abuse scenarios have been considered and mitigated.

**Review requirement:** Requires architectural judgment.

### A05: Security Misconfiguration

- [ ] Default credentials are changed or disabled.
- [ ] Error messages do not leak stack traces or internal details to users.
- [ ] Unnecessary features, ports, and services are disabled.
- [ ] Security headers are configured (see Security Headers section below).

**Auto-fix opportunities:** Add security headers; redact stack traces from user-facing errors.

### A06: Vulnerable and Outdated Components

- [ ] Run `npm audit` (or equivalent) and address critical/high findings.
- [ ] Dependencies are pinned to specific versions in lockfiles.
- [ ] A process exists for monitoring and updating vulnerable dependencies.

**Auto-fix opportunities:** Run `npm audit fix`; update lockfiles.

### A07: Identification and Authentication Failures

- [ ] Multi-factor authentication is available for sensitive accounts.
- [ ] Session tokens are invalidated on logout.
- [ ] Password policies enforce minimum length (12+ characters).
- [ ] Account lockout or progressive delays exist after failed attempts.
- [ ] Session IDs are rotated after login.

**Review requirement:** Requires policy and UX judgment.

### A08: Software and Data Integrity Failures

- [ ] CI/CD pipelines are secured against unauthorized modifications.
- [ ] Dependencies are verified using integrity checks (lockfile hashes).
- [ ] Auto-update mechanisms verify signatures before applying updates.

**Review requirement:** Requires infrastructure and deployment process review.

### A09: Security Logging and Monitoring Failures

- [ ] Authentication successes and failures are logged.
- [ ] Authorization failures are logged.
- [ ] Logs do not contain sensitive data (passwords, tokens, PII).
- [ ] Alerting is configured for anomalous patterns.

**Auto-fix opportunities:** Remove PII from logs; add missing log statements.

### A10: Server-Side Request Forgery (SSRF)

- [ ] User-supplied URLs are validated against an allowlist of domains.
- [ ] Internal network ranges (10.x, 172.16.x, 192.168.x) are blocked for outbound requests.
- [ ] URL redirects do not follow arbitrary destinations.

**Auto-fix opportunities:** Add URL validation; block private IP ranges.

### Dependency Audit

Run these checks regularly and on every PR that modifies dependencies:

```bash
# Node.js / npm
npm audit --production
npm audit fix
npx audit-ci --critical

# Check for outdated packages
npm outdated

# Python
pip-audit
safety check

# General (multi-language)
snyk test
```

**Severity response times:**
- **Critical**: Fix within 24 hours or remove the dependency.
- **High**: Fix within 1 week.
- **Medium**: Fix within 1 month.
- **Low**: Fix in the next scheduled maintenance window.

### Secrets Detection

Prevent secrets from entering the codebase with pre-commit hooks:

```bash
# Pre-commit hook with gitleaks
gitleaks detect --source . --verbose

# Scan git history for leaked secrets
gitleaks detect --source . --log-opts="--all"

# Alternative: truffleHog
trufflehog filesystem --directory . --only-verified
```

**Patterns to detect:**
- AWS access keys: `AKIA[0-9A-Z]{16}`
- Generic API keys: `(api[_-]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9]{16,}`
- Private keys: `-----BEGIN (RSA |EC )?PRIVATE KEY-----`
- Database connection strings: `(postgres|mysql|mongodb)://[^\s]+`
- JWT tokens: `eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+`

### XSS Prevention

- Use framework-provided auto-escaping for all rendered output (React JSX, Vue templates).
- Never use `dangerouslySetInnerHTML`, `v-html`, or `innerHTML` with user-supplied data.
- Sanitize rich text input with a library like DOMPurify before rendering.
- Set `Content-Security-Policy` headers to restrict inline scripts and styles.
- Encode output contextually: HTML entities for HTML, JS encoding for JavaScript, URL encoding for URLs.

### CSRF Protection

- Use anti-CSRF tokens for all state-changing operations (POST, PUT, DELETE).
- Set `SameSite=Strict` or `SameSite=Lax` on session cookies.
- Verify the `Origin` or `Referer` header on sensitive endpoints.
- For API-only backends with Bearer token authentication, CSRF tokens are generally not needed.

### SQL Injection Prevention

- Always use parameterized queries or prepared statements.
- Never concatenate user input into SQL strings.
- Use an ORM with parameterized query support.
- Apply the principle of least privilege to database accounts.
- Validate and type-check all query parameters before they reach the database layer.

### Authentication Review

Verify these controls:
- Passwords are hashed with a strong, salted algorithm (Argon2id preferred).
- Login endpoints are rate-limited (e.g., 5 attempts per minute per IP).
- Session tokens have a defined expiration and are rotated on privilege changes.
- "Remember me" tokens are stored hashed in the database.
- Password reset tokens are single-use, time-limited (max 1 hour), and invalidated after use.
- OAuth flows validate the `state` parameter to prevent CSRF.

### Authorization Review

Verify these controls:
- Every API endpoint has explicit authorization checks.
- Authorization is enforced server-side, never relying on client-side checks alone.
- Role-based or attribute-based access control is consistently applied.
- Users cannot access resources belonging to other users by manipulating IDs.
- Admin endpoints are separated and protected with additional verification.
- API responses exclude data the requesting user is not authorized to see.

### Security Headers

Verify these HTTP response headers are set:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 0  (disabled in favor of CSP)
```

Use https://securityheaders.com to verify production headers. **Auto-fix:** Add missing headers to middleware/config.

---

## 4. Performance Engineering (Core Web Vitals)

These are Google's key metrics for user experience. All production web applications must meet the "Good" thresholds.

### Largest Contentful Paint (LCP)

Measures how long it takes for the largest visible content element to render.

| Rating | Threshold |
|---|---|
| Good | < 2.5s |
| Needs Improvement | 2.5s - 4.0s |
| Poor | > 4.0s |

**Optimization strategies:**
- Optimize the critical rendering path. Inline critical CSS.
- Preload the LCP resource (`<link rel="preload">`).
- Use a CDN for static assets to reduce TTFB.
- Optimize server response time (target < 200ms TTFB).
- Avoid render-blocking JavaScript and CSS.
- Use responsive images with `srcset` and `sizes` attributes.

### Interaction to Next Paint (INP) / First Input Delay (FID)

Measures responsiveness — how quickly the page responds to user interaction.

| Rating | Threshold |
|---|---|
| Good | < 200ms (INP) / < 100ms (FID) |
| Needs Improvement | 200-500ms / 100-300ms |
| Poor | > 500ms / > 300ms |

**Optimization strategies:**
- Break long tasks (> 50ms) into smaller chunks using `requestIdleCallback` or `scheduler.yield()`.
- Defer non-critical JavaScript with `async` or `defer` attributes.
- Minimize main thread work during page load.
- Use web workers for CPU-intensive computations.
- Avoid synchronous layout thrashing (read then write DOM properties in batches).

### Cumulative Layout Shift (CLS)

Measures visual stability — how much the page layout shifts unexpectedly.

| Rating | Threshold |
|---|---|
| Good | < 0.1 |
| Needs Improvement | 0.1 - 0.25 |
| Poor | > 0.25 |

**Optimization strategies:**
- Always include `width` and `height` attributes on images and videos.
- Use CSS `aspect-ratio` for dynamic media containers.
- Reserve space for ads, embeds, and dynamically injected content.
- Avoid inserting content above existing content after initial render.
- Use `font-display: swap` with font preloading to minimize FOIT/FOUT shifts.

### Database Query Optimization

| Problem | Symptom | Fix |
|---|---|---|
| N+1 queries | 100+ queries for one page load | Use JOINs or eager loading |
| Missing indexes | Full table scans on WHERE clauses | Add indexes on filtered/sorted columns |
| SELECT * | Transferring unused columns | Select only needed columns |
| No pagination | Loading entire tables | Use LIMIT/OFFSET or cursor-based pagination |
| Unoptimized JOINs | Slow multi-table queries | Analyze with EXPLAIN ANALYZE, add indexes |

**Query analysis:**
```sql
-- Identify slow queries
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Find missing indexes
SELECT relname, seq_scan, idx_scan,
       seq_scan - idx_scan AS too_many_seqs
FROM pg_stat_user_tables
WHERE seq_scan - idx_scan > 0
ORDER BY too_many_seqs DESC;
```

### Bundle Size Optimization

Target: Keep the initial JavaScript bundle under 200KB gzipped.

**Strategies:**
- **Code splitting:** Split by route using dynamic `import()`. Each page loads only the code it needs.
- **Tree shaking:** Ensure all imports are ES modules. Avoid `import *` and side-effect-heavy modules.
- **Dependency audit:** Regularly review `node_modules`. Use `bundlephobia.com` to check package sizes before adding.
- **Replace heavy libraries:** Consider lighter alternatives (e.g., `date-fns` instead of `moment`, `clsx` instead of `classnames`).
- **Compression:** Enable Brotli compression on your CDN/server (20-25% smaller than gzip).
- **Dead code elimination:** Remove unused exports and unreachable code paths.

```bash
# Analyze bundle composition
npx webpack-bundle-analyzer stats.json
# or for Next.js
ANALYZE=true next build
```

### Caching Strategies

#### CDN Caching

- Cache static assets (JS, CSS, images, fonts) with long TTLs (1 year) using content hashing in filenames.
- Use `Cache-Control: public, max-age=31536000, immutable` for hashed assets.
- Use `Cache-Control: no-cache` (which means "revalidate") for HTML documents.
- Configure cache purging for emergency updates.

#### Application Caching

- Cache expensive computations with in-memory stores (Redis, Memcached).
- Use cache-aside pattern: check cache first, compute on miss, store result.
- Set appropriate TTLs based on data freshness requirements.
- Implement cache invalidation on data mutations.
- Use stale-while-revalidate for non-critical data.

```typescript
// Cache-aside pattern example
async function getUser(id: string): Promise<User> {
  const cached = await cache.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await db.users.findById(id);
  await cache.set(`user:${id}`, JSON.stringify(user), { ttl: 300 });
  return user;
}
```

### Lazy Loading

- **Images:** Use `loading="lazy"` for below-the-fold images. Do NOT lazy load the LCP image.
- **Components:** Use `React.lazy()` with `Suspense` for non-critical UI components.
- **Routes:** Split routes with dynamic imports so each page is a separate chunk.
- **Third-party scripts:** Load analytics, chat widgets, and non-essential scripts with `defer` or after page load.
- **Data:** Fetch non-critical data after the initial render using intersection observers or idle callbacks.

### Image Optimization

- Use modern formats: WebP (90% support) or AVIF (70% support) with JPEG/PNG fallbacks.
- Serve responsive images using `srcset` and `sizes` attributes.
- Compress images to appropriate quality (80-85% for photos, lossless for graphics).
- Use a CDN with automatic image optimization (Cloudflare Images, Vercel Image Optimization, imgix).
- Implement blur-up or LQIP (Low Quality Image Placeholder) for perceived performance.
- Set explicit dimensions to prevent layout shifts.

```html
<img
  src="/images/hero.webp"
  srcset="/images/hero-400.webp 400w,
         /images/hero-800.webp 800w,
         /images/hero-1200.webp 1200w"
  sizes="(max-width: 600px) 400px,
         (max-width: 1000px) 800px,
         1200px"
  width="1200"
  height="600"
  alt="Hero image"
  loading="eager"
  fetchpriority="high"
/>
```

### Server-Side Rendering vs Static Generation

| Strategy | Best For | Trade-offs |
|---|---|---|
| Static Generation (SSG) | Marketing pages, blogs, docs | Fastest TTFB, but data is stale until rebuild |
| ISR (Incremental Static Regeneration) | E-commerce, content sites | Near-static speed with periodic updates |
| Server-Side Rendering (SSR) | Personalized content, dashboards | Fresh data, but higher server load and TTFB |
| Client-Side Rendering (CSR) | Internal tools, authenticated apps | Simplest, but poor SEO and initial load |

**Decision framework:**
1. Is the content the same for all users? Use **SSG** or **ISR**.
2. Does the content change per-user or per-request? Use **SSR**.
3. Is SEO irrelevant and the app behind authentication? **CSR** is acceptable.
4. Do you need real-time data on a public page? Use **SSR** with streaming or **CSR** with a loading skeleton.

### Performance Budget

Define and enforce budgets in CI:

| Metric | Budget |
|---|---|
| Total JS (gzipped) | < 200 KB |
| Total CSS (gzipped) | < 50 KB |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Time to Interactive | < 3.5s |
| Lighthouse Performance | > 90 |

```bash
# Enforce with bundlesize
npx bundlesize --config bundlesize.config.json

# Or with Lighthouse CI
lhci assert --preset=lighthouse:recommended
```

### Profiling Tools

| Tool | Purpose | When to Use |
|---|---|---|
| Chrome DevTools Performance | CPU profiling, flame charts | Diagnosing slow interactions |
| Lighthouse | Overall performance audit | Pre-deployment checks |
| WebPageTest | Real-world loading performance | Production baseline measurement |
| React DevTools Profiler | Component render analysis | React-specific optimization |
| Node.js --inspect | Server-side CPU profiling | API response time issues |
| pg_stat_statements | PostgreSQL query analysis | Database bottleneck detection |
| bundle-analyzer | JavaScript bundle composition | Bundle size optimization |

---

## 5. Fix-First Triage

When reviewing code, differentiate between mechanical issues (auto-fixable) and judgment calls (require discussion).

### Auto-Fix Categories

**Always fix automatically (no discussion needed):**
1. **Formatting violations** — linting errors, indentation, spacing. Use ESLint/Prettier.
2. **Hardcoded secrets** — API keys, tokens, passwords. Remove and require .env.
3. **Console statements** — Remove all `console.log`, `console.debug` in production code (except intentional debug utilities).
4. **Unused imports** — Eliminate dead code.
5. **Type errors** — Fix obvious TypeScript mismatches.
6. **SQL injection vectors** — Rewrite string concatenation to parameterized queries.
7. **Missing security headers** — Add CSP, X-Frame-Options, Strict-Transport-Security to middleware/config.
8. **N+1 patterns** — Obvious eager-loading or JOIN fixes.
9. **Dead code blocks** — Remove unreachable branches.
10. **Stale or deprecated API usage** — Update to current library versions.

**Auto-fix process:**
```
Identify → Propose fix inline → Apply → Re-test → Commit with [auto-fix] tag
```

### Judgment Call Categories

**Always discuss with author (do not auto-fix):**
1. **Architectural decisions** — Module splitting, abstraction level, design patterns.
2. **Performance trade-offs** — Caching vs consistency, latency vs throughput.
3. **API contract changes** — Naming, parameters, response structure.
4. **Business logic changes** — Anything that affects behavior beyond mechanics.
5. **Test strategy** — What to test, coverage targets, testing approach.
6. **Error handling philosophy** — Strict vs lenient, fail-fast vs graceful degradation.
7. **Naming** — Variable, function, or class names (subjective, context-dependent).
8. **Alternative approaches** — Where multiple valid solutions exist.

**Judgment call process:**
```
Identify → Ask clarifying question or suggest alternative → Wait for author response → Discuss if needed → Author decides
```

### Auto-Fix Session Limits

To prevent runaway auto-fixes from introducing subtle bugs:

- **Max auto-fixes per PR:** 10 (after which, request author review of all proposed fixes)
- **Max auto-fixes per file:** 5 (to avoid over-touching one area)
- **Max auto-fixes per category:** 3 (e.g., max 3 console.log removals before discussing overall logging approach)

If limits are exceeded, pause and ask: "I've identified X auto-fixable issues. Should I proceed with all of them, or would you prefer to handle some manually?"

---

## 6. Multi-Pass Analysis

For large PRs (> 400 lines), use multiple focused passes instead of one unfocused review.

### Pass 1: CRITICAL (Lines Changed: All)

Check for show-stoppers that block merge immediately.

**Focus areas:**
- **SQL injection risk** — Any user input in SQL? Check for parameterization.
- **Race conditions** — Concurrent access to shared state without locks?
- **LLM trust issues** — Direct LLM output used without validation/escaping?
- **Test coverage gaps** — New code paths without tests?
- **Authentication bypass** — Route handlers missing auth checks?
- **Data loss** — Migrations without backups? Cascade deletes?
- **Credentials in code** — Secrets, API keys, or tokens exposed?

**Output:** BLOCKING issues only. Stop here if any are found; request author fixes before continuing.

### Pass 2: INFORMATIONAL (Lines Changed: Changed only, not test files)

Check for design inconsistencies and improvement opportunities.

**Focus areas:**
- **Readability** — Variable names, function length, nesting depth.
- **Maintainability** — Tight coupling, code duplication, separation of concerns.
- **Performance** — N+1 queries, unnecessary computations, bundle size impact.
- **Security** — Input validation, CORS, headers, logging (non-blocking).
- **Testing** — Test quality, edge case coverage, AAA pattern.

**Output:** Mix of [suggestion] and [nit] comments. Non-blocking; author discretion.

### Pass 3 (Optional): DEEP DIVE (If High Risk)

For PRs touching critical paths (auth, payment, data migration), add a third pass.

**Focus areas:**
- **Edge case exhaustion** — What if X is null, empty, negative, or very large?
- **Error scenarios** — Network timeouts, database failures, permission denials?
- **Concurrency** — Race conditions under load?
- **Backward compatibility** — Will this break existing clients or data?
- **Rollback safety** — Can this change be rolled back cleanly?

**Output:** Deep questions and edge case suggestions. Non-blocking.

### Pass Execution

```
Pass 1 (5 min): CRITICAL issues only
  ↓ Any found? → Request changes → Back to Pass 1 after author fixes
  ↓ None found? → Proceed to Pass 2

Pass 2 (15 min): Readability, maintainability, performance, non-critical security
  ↓ Leave comments with [suggestion] tags
  ↓ Proceed to approval (author can choose to address)

Pass 3 (Optional, 10 min): Deep dive for critical paths
  ↓ Leave edge case and error scenario questions
  ↓ Proceed to approval
```

---

## 7. Adversarial Review

Auto-scale review depth by diff size and risk level. Larger or riskier diffs get adversarial challenge.

### Risk Scoring

**Assign a risk level to each PR:**

- **🟢 Low:** Small changes (< 50 LOC), well-tested, isolated. Example: color variable update, test file fix.
- **🟡 Medium:** Moderate changes (50-200 LOC), affects business logic or APIs, adequate tests. Example: form validation refactor, new endpoint.
- **🔴 High:** Large changes (> 200 LOC), touches auth/payment/data, incomplete tests, or third-party integrations. Example: user auth rewrite, database schema change.

### Review Passes by Risk

| Risk | Lines | Passes | Challenge |
|---|---|---|---|
| Low | < 50 | 1 | Standard checklist only |
| Medium | 50-200 | 1 | Standard checklist + 1 adversarial question per major function |
| High | 200-400 | 2 | Pass 1 CRITICAL + Pass 2 INFORMATIONAL + 2-3 adversarial questions |
| Critical | > 400 | 3 | Pass 1 CRITICAL + Pass 2 INFORMATIONAL + Pass 3 DEEP DIVE + full adversarial scenario |

### Adversarial Questions (Examples)

Ask "what if?" questions to stress-test the code:

**For database changes:**
- "What if a user deletes their account while this operation is in flight?"
- "How does this handle a simultaneous write from another service?"
- "What's the rollback plan if this migration fails halfway?"

**For API changes:**
- "What if a client sends null for every required field?"
- "How does this behave under 1000 concurrent requests?"
- "If we need to add a new required parameter next month, can we do it without breaking existing clients?"

**For auth/security changes:**
- "Can an unauthenticated user trigger this endpoint?"
- "Is the user's role checked server-side, not just in the frontend?"
- "What happens if a token expires mid-operation?"

**For performance changes:**
- "What's the memory footprint if this processes 1M records?"
- "Will this query still be fast with 10 billion rows?"
- "Is there a query timeout if the database is slow?"

**For third-party integrations:**
- "What if the external API is down? Do we have a fallback?"
- "Are we rate-limited? Is that accounted for?"
- "If their API changes tomorrow, how will we know?"

---

## 8. Self-Regulation

Prevent review feedback from becoming unreliable or overwhelming.

### WTF-Likelihood Gate

Before commenting, ask: "Would a competent developer ask 'WTF?' about this feedback?"

If the answer is **yes**, you're nitpicking or being unclear. Reconsider or mark as `[nit]`.

**Examples of high WTF-likelihood:**
- "This variable should be `foo` instead of `fooValue`." (Subjective naming)
- "This comment should use British English." (Pedantic)
- "You could use a ternary operator here." (Alternative style, no better)

**Examples of low WTF-likelihood:**
- "This endpoint is missing the user role check." (Security issue)
- "This creates an N+1 query pattern." (Performance issue with known fix)
- "This hardcodes a secret." (Correctness issue)

### Feedback Velocity Limits

To avoid feedback fatigue, cap the number of comments per PR:

- **0-50 LOC:** Max 3 comments (mostly [nit])
- **51-200 LOC:** Max 7 comments (mix of blocking and [suggestion])
- **201-400 LOC:** Max 10 comments (focused on CRITICAL + top 2-3 improvements)
- **400+ LOC:** Multi-pass analysis required; cap feedback per pass

**Guideline:** Prioritize high-impact feedback. Skip low-impact [nit] comments if you've already left 3+.

### Feedback Quality Checklist

Before posting a comment, verify:

- [ ] Is this blocking? (Yes → post immediately with `[blocking]`)
- [ ] Is this a known anti-pattern? (Yes → post with specific fix)
- [ ] Is this actionable? (No → rephrase as a question instead)
- [ ] Is this subjective? (Yes → mark as `[nit]` or consider skipping)
- [ ] Would I leave this comment on code I wrote? (No → probably skip)

### Re-Review After Author Changes

After the author addresses feedback:

- **Blocking feedback:** Re-review the specific change only. Approve immediately if fixed.
- **Suggestion feedback:** Trust the author's judgment. No need to re-review unless they requested input.
- **[nit] feedback:** No re-review needed unless the author asked.

This prevents "nitpick loop" fatigue where reviewers endlessly improve cosmetics.

---

## 9. Audit Report Template

Use this template for formal vibe audits or comprehensive quality assessments.

```markdown
# Code Quality Audit Report

**Module/Project:** [Name]
**Date:** [YYYY-MM-DD]
**Auditor:** [Name or AI Agent]
**Scope:** [Description of what was audited]
**Files Reviewed:** [Count]
**Lines of Code:** [Count]

## Score Summary

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Readability | X/10 | 20% | X.XX |
| Maintainability | X/10 | 25% | X.XX |
| Performance | X/10 | 20% | X.XX |
| Security | X/10 | 20% | X.XX |
| Testing | X/10 | 15% | X.XX |
| **Overall** | | | **X.XX** |

**Grade:** [A+ / A / B / C / D / F]

## Top Findings (CRITICAL First)

1. **[FINDING-001]** (Severity: Critical) — [Description] → [Location: file:line] → [Fix: specific action]
2. **[FINDING-002]** (Severity: High) — [Description] → [Location] → [Fix]
3. **[FINDING-003]** (Severity: Medium) — [Description] → [Location] → [Fix]

## Security Audit Summary (OWASP)

| Category | Status | Notes |
|----------|--------|-------|
| A01: Broken Access Control | ✓ Pass / ✗ Fail | [Notes] |
| A02: Cryptographic Failures | ✓ Pass / ✗ Fail | [Notes] |
| A03: Injection | ✓ Pass / ✗ Fail | [Notes] |
| A04: Insecure Design | ✓ Pass / ✗ Fail | [Notes] |
| A05: Security Misconfiguration | ✓ Pass / ✗ Fail | [Notes] |
| A06: Vulnerable Components | ✓ Pass / ✗ Fail | [Notes] |
| A07: Auth Failures | ✓ Pass / ✗ Fail | [Notes] |
| A08: Integrity Failures | ✓ Pass / ✗ Fail | [Notes] |
| A09: Logging & Monitoring | ✓ Pass / ✗ Fail | [Notes] |
| A10: SSRF | ✓ Pass / ✗ Fail | [Notes] |

## Performance Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| LCP | Xs | < 2.5s | ✓ / ✗ |
| INP | Xms | < 200ms | ✓ / ✗ |
| CLS | X | < 0.1 | ✓ / ✗ |
| JS Bundle (gzipped) | XKB | < 200KB | ✓ / ✗ |
| Test Coverage | X% | > 80% | ✓ / ✗ |

## Improvement Priorities

| Priority | Impact | Effort | Action |
|----------|--------|--------|--------|
| P0 (Do immediately) | High | Low | [Description] |
| P1 (Next sprint) | High | Medium | [Description] |
| P2 (Backlog) | Medium | Low | [Description] |
| P3 (Consider later) | Low | High | [Description] |

## Technical Debt Estimate

- **Current debt**: X hours/days to resolve all identified issues
- **Trend**: [Increasing / Stable / Decreasing] compared to last audit
- **Risk**: [Low / Medium / High] if left unaddressed
- **Recommendation**: [Next steps]

## Auto-Fix Suggestions Applied

- [ ] Removed X console statements
- [ ] Fixed X linting errors
- [ ] Updated X deprecated API usages
- [ ] Added X missing security headers
- [ ] Fixed X SQL injection vectors

## Next Audit Scheduled

[Date or trigger]
```

---

## 10. Automation & CI Integration

### Auto-Review CI Configuration

Configure your CI to automatically flag common patterns before human review:

```yaml
auto_review:
  - name: "Large PR warning"
    trigger: lines_changed > 400
    action: comment "This PR exceeds 400 lines. Consider splitting it. Will use multi-pass analysis."

  - name: "Missing tests"
    trigger: source_files_changed AND NOT test_files_changed
    action: comment "Source files changed without corresponding test changes."

  - name: "Dependency changes"
    trigger: lockfile_changed
    action: request_review from security_team

  - name: "Migration present"
    trigger: migration_files_added
    action: request_review from database_team

  - name: "Secrets detection"
    trigger: pattern_match "(API_KEY|SECRET|PASSWORD|TOKEN)\\s*=\\s*['\"]\\w+"
    action: block_merge "Possible hardcoded secret detected."

  - name: "Console statements"
    trigger: pattern_match "console\\.(log|debug|info)"
    action: comment "Remove console statements before merging."

  - name: "SQL concatenation"
    trigger: pattern_match "query\\(\\s*['\"].*\\$\\{.*\\}.*['\"]"
    action: comment "SQL string interpolation detected. Use parameterized queries."

  - name: "Hardcoded URLs"
    trigger: pattern_match "https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    action: comment "Hardcoded URL detected. Extract to configuration."

  - name: "Performance check"
    trigger: bundle_size_increased_by > 50KB
    action: comment "Bundle size increased significantly. Review and optimize."

  - name: "Dependency audit"
    trigger: npm_audit_vulnerabilities > 0
    action: comment "npm audit found vulnerabilities. Run `npm audit fix`."
```

### Recommended Tools

- **Linting:** ESLint with Prettier for formatting
- **Type checking:** TypeScript with strict mode
- **Secrets detection:** gitleaks or truffleHog in pre-commit hooks
- **Dependency audit:** npm audit (CI + local), Snyk, or Dependabot
- **Performance:** Lighthouse CI, bundle-size, speedcurve
- **Security scanning:** Semgrep, CodeQL, Trivy (container images)
- **Test enforcement:** Jest with coverage thresholds, GitHub branch protection

---
name: ship
phase: 6
always_active: false
absorbs: deployment-procedures, docker-expert, SECURITY/production-readiness
description: "From merge to production — containers, CI/CD, rollout, gates, canary monitoring, revert, version management"
keywords: [Docker, container, deploy, producao, rollout, CI/CD, canary, ship, imagem, Dockerfile, blue-green, revert, monitoring, version]
---

# Ship

> Phase 6 — The complete deployment pipeline. Build, gate, deploy, monitor, revert.

## 1. Production Readiness Gate

This is the mandatory checklist before ANY production deployment. This skill intervenes proactively whenever a DEPLOY request is detected — it does not wait for the user to ask.

**Central Principle:** The difference between an amateur project and a professional one is not code quality — it is operational quality. Excellent code without monitoring, backups, containers, and CI/CD is a house of cards.

### 1A. Containerization (REQUIRED)

| Check | Criterion | If Missing |
|-------|-----------|-----------|
| Dockerfile present? | Multi-stage build, no warnings | Create optimized multi-stage Dockerfile |
| docker-compose.yml? | All services with healthchecks | Create compose with all services |
| Minimal base images? | Alpine or distroless, not full | Migrate to minimal base (node:20-alpine) |
| Non-root user? | `USER appuser` defined | Add non-root user (UID 1001) |
| .dockerignore? | Excludes node_modules, .env, .git, venv | Create complete .dockerignore |
| Reproducible builds? | Lockfile copied before install | Reorganize Dockerfile layers for caching |
| Health checks? | HEALTHCHECK instruction defined | Add health check endpoint |

**Minimal Professional Node.js Dockerfile (Multi-Stage):**

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

**Minimal Professional Python Dockerfile:**

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
COPY --from=builder /install /usr/local
COPY --chown=appuser:appgroup . .
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
CMD ["python", "-m", "app.main"]
```

**Minimal Professional docker-compose.yml:**

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file: .env
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  pgdata:
```

**Complete .dockerignore:**

```
node_modules
.git
.gitignore
*.md
.env
.env.*
dist
coverage
.nyc_output
.vscode
.idea
docker-compose*.yml
Dockerfile*
.dockerignore
*.log
.next
.pytest_cache
__pycache__
venv
.DS_Store
```

### 1B. Dockerfile Optimization

#### Layer Ordering (Cache Efficiency)

Order instructions from least to most frequently changing:

```dockerfile
FROM node:20-alpine AS base         # Rarely changes
RUN apk add --no-cache dumb-init   # Changes occasionally
WORKDIR /app
COPY package.json package-lock.json ./ # Changes when deps change
RUN npm ci --only=production        # Cached unless manifests change
COPY . .                             # Changes most frequently
```

#### Image Size Optimization

- Use Alpine-based images (`node:20-alpine` instead of `node:20`)
- Combine RUN commands with `&&` to reduce layers
- Remove caches in the same layer: `RUN npm ci && npm cache clean --force`
- Use `--no-cache` for apk: `RUN apk add --no-cache curl`
- Copy only what is needed in final stage; avoid `COPY . .` in production
- Pin exact image digests for reproducibility: `FROM node:20-alpine@sha256:abc123...`

#### Security Hardening

- Never run containers as root in production
- Use non-root user (UID 1001, not 0)
- Do not store secrets in images; use runtime environment variables or secret managers
- Scan images with `docker scout` or `trivy` before pushing to registry
- Use minimal base images in order of security: `distroless` > `alpine` > `slim` > full

#### Health Checks

Ensure the application exposes a `/health` endpoint that returns 200 when service is ready:

```typescript
// Express health check
app.get("/health", async (req, res) => {
  const dbOk = await checkDatabase();
  const status = dbOk ? "healthy" : "degraded";
  res.status(dbOk ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION ?? "unknown",
    uptime: process.uptime(),
  });
});
```

```python
# Flask health check
@app.route("/health")
def health():
    checks = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.getenv("APP_VERSION", "unknown"),
        "checks": {
            "database": check_db_connection(),
            "disk_space": check_disk_space(),
            "memory": check_memory_usage(),
        }
    }
    status_code = 200 if all(checks["checks"].values()) else 503
    return jsonify(checks), status_code
```

#### Environment Variables

- Use `ENV` for build-time defaults that are safe to bake into the image
- Use runtime environment injection (`docker run -e` or Docker Compose `environment:`) for secrets and per-environment config
- Never hardcode secrets in a Dockerfile

```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

#### Common Patterns

- Use `dumb-init` or `tini` as PID 1 to handle signals: `RUN apk add --no-cache dumb-init`
- Set `NODE_ENV=production` before `npm ci` so dev dependencies are excluded
- Use `npm ci` instead of `npm install` for deterministic installs
- For Next.js, use standalone output and copy only `.next/standalone` and `.next/static`
- For NestJS, build with `nest build` and run with `node dist/main.js`

### 1C. CI/CD Pipeline (REQUIRED)

| Check | Criterion | If Missing |
|-------|-----------|-----------|
| CI exists? | GitHub Actions, GitLab CI, or equivalent | Create basic workflow |
| Lint in CI? | ESLint/Ruff/etc run on each push | Add lint step |
| Tests in CI? | Unit tests run and pass | Add test step |
| Build in CI? | Production build compiles without errors | Add build step |
| Security scan in CI? | npm audit / pip-audit / Trivy | Add security step |
| Auto-deploy? | Push to main → deploy automatically | Configure deploy step |
| Branch protection? | Main protected, PRs required | Configure GitHub Settings |

**Minimal Professional CI/CD (.github/workflows/ci.yml):**

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - run: npm audit --production

  deploy:
    needs: validate
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t app:latest .
      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push app:latest
      - name: Deploy to production
        run: ./scripts/deploy.sh production
      - name: Run smoke tests
        run: npm run test:smoke -- --env=production
      - name: Notify team
        if: success()
        run: ./scripts/notify-deploy.sh success
      - name: Rollback on failure
        if: failure()
        run: ./scripts/rollback.sh production
```

### 1D. Monitoring & Observability

| Check | Criterion | If Missing |
|-------|-----------|-----------|
| Healthcheck endpoint? | GET /health returns 200 + status | Create endpoint |
| Alerts configured? | Alert when service is down | Configure (Telegram/Slack/email) |
| Structured logs? | JSON logs with timestamp, level, context | Migrate to structured logging |
| Log rotation? | Logs don't grow indefinitely | Configure logrotate or Docker log limits |
| Basic metrics? | CPU, memory, request count, latency | Add /metrics endpoint or healthcheck stats |
| Uptime monitoring? | External service checks availability | Configure UptimeRobot/Betterstack |

### 1E. Backups & Recovery

| Check | Criterion | If Missing |
|-------|-----------|-----------|
| Database backup? | Daily automated backup | Create cron job with pg_dump/mongodump |
| Code backup? | Code in Git, pushed to remote | Verify git status and push |
| Config backup? | .env and configs backed up | Include in backup script |
| Retention defined? | Old backups are purged | Define policy (30d code, 90d DB) |
| Restore tested? | Backup was tested at least 1x | Test restore manually |
| Disaster recovery? | RTO and RPO defined | Document recovery procedure |

**Professional Daily Backup Script:**

```bash
#!/bin/bash
# backup.sh — Automated daily backup
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Database backup
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"

# Code + configs
tar czf "$BACKUP_DIR/app_${DATE}.tar.gz" \
    --exclude='node_modules' --exclude='.next' --exclude='venv' \
    /app/src /app/.env /app/docker-compose.yml

# Purge old backups
find "$BACKUP_DIR" -name "*.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup complete: db_${DATE}.sql.gz + app_${DATE}.tar.gz"
```

### 1F. Infrastructure Security

| Check | Criterion | If Missing |
|-------|-----------|-----------|
| HTTPS/TLS? | All traffic encrypted | Configure Let's Encrypt + Nginx/Caddy |
| SSH hardened? | Key-only auth, no root, fail2ban | Apply hardening (see SECURITY/infrastructure-hardening) |
| Firewall active? | Only necessary ports open | Configure ufw/iptables |
| Secrets secure? | .env in .gitignore, no tokens in code | Audit with gitleaks |
| Rate limiting? | API protected against abuse | Configure on reverse proxy |
| Security headers? | X-Frame-Options, CSP, HSTS | Add to Nginx/app |
| Swap configured? | System doesn't depend only on RAM | Create swapfile if needed |
| Auto-updates? | Security patches applied | Configure unattended-upgrades |

### 1G. Process Management

| Check | Criterion | If Missing |
|-------|-----------|-----------|
| Process manager? | systemd, Docker, or PM2 | **Never use nohup or screen** |
| Auto-restart? | Service restarts after crash | Configure restart policy |
| Graceful shutdown? | SIGTERM handled correctly | Implement shutdown handler |
| Resource limits? | Memory and CPU constrained | Define in Docker/systemd |
| Log management? | Logs accessible and rotated | Configure journald/Docker logs |

**Graceful Shutdown Handler (Python):**

```python
import signal
import sys

def shutdown_handler(signum, frame):
    logger.info("Shutting down gracefully...")
    # Close database connections
    # Finish pending tasks
    # Flush logs
    sys.exit(0)

signal.signal(signal.SIGTERM, shutdown_handler)
signal.signal(signal.SIGINT, shutdown_handler)
```

### 1H. Database in Production

| Check | Criterion | If Missing |
|-------|-----------|-----------|
| Connection pooling? | Pool configured, not ad-hoc connections | Configure pool (pgBouncer, Prisma pool) |
| Indexes created? | Frequent queries have indexes | Analyze slow queries, create indexes |
| Migrations versioned? | All migrations in version control | Move to Git |
| Cleanup policy? | Temporary/log tables are purged | Create cleanup cron job |
| Backups tested? | Restore was performed at least 1x | Test restore |
| RLS/Permissions? | Principle of least privilege | Restrict permissions |

### Maturity Levels

#### Level 1 — Minimum Viable (MVP in production)
- [ ] Docker or process manager (never loose venvs)
- [ ] HTTPS with valid certificate
- [ ] Daily database backup
- [ ] Healthcheck endpoint
- [ ] Logs accessible
- [ ] Secure .env (in .gitignore)

#### Level 2 — Professional
Everything from Level 1, plus:
- [ ] CI/CD pipeline (lint + test + build + deploy)
- [ ] Monitoring with alerts (service down → notification)
- [ ] Rate limiting
- [ ] SSH hardened + Fail2Ban
- [ ] Backups tested with restore verified
- [ ] Docker Compose with healthchecks
- [ ] Structured logging (JSON)

#### Level 3 — Enterprise
Everything from Level 2, plus:
- [ ] Container scanning in CI (Trivy)
- [ ] SAST/DAST in pipeline
- [ ] Signed commits
- [ ] Blue-green or canary deploys
- [ ] APM (Application Performance Monitoring)
- [ ] Disaster recovery tested
- [ ] SLA defined with uptime target
- [ ] Incident response playbook
- [ ] Compliance documented (GDPR, etc.)

### Proactive Intervention Protocol

When this skill is activated (DEPLOY request or production keywords), follow this protocol:

```
1. SCAN — Analyze current project state
   - Has Dockerfile? docker-compose.yml?
   - Has CI/CD (GitHub Actions, etc.)?
   - Has monitoring/healthcheck?
   - How do services run? (systemd? nohup? Docker?)
   - Do backups exist?

2. DIAGNOSE — Classify maturity level
   - Level 0 (Amateur): loose venvs, manual deploy, no monitoring
   - Level 1 (MVP): containers, HTTPS, basic backups
   - Level 2 (Professional): CI/CD, monitoring, alerts
   - Level 3 (Enterprise): scanning, APM, tested DR

3. PRESCRIBE — Recommend priority actions
   - Order by impact (security > stability > convenience)
   - Estimate effort for each action
   - Offer immediate implementation for critical items

4. IMPLEMENT — Execute with user
   - Create Dockerfiles, compose, CI/CD, scripts
   - Don't wait for the user to ask — propose proactively
```

**Golden Rule:** If the project is in production without Docker and without CI/CD, this skill must flag that BEFORE doing anything else.

---

## 2. Deployment Strategies

### Blue-Green Deployment

Maintain two identical production environments (blue and green). At any time, one is live and the other is idle.

**Process:**
1. Deploy the new version to the idle environment
2. Run smoke tests against the idle environment
3. Switch the load balancer to point traffic to the newly deployed environment
4. If issues are detected, switch back immediately (instant rollback)
5. The previously live environment becomes the next deployment target

**Pros:** Zero-downtime, instant rollback
**Cons:** Requires double infrastructure, database migrations must be backward-compatible

### Canary Releases

Route a small percentage of traffic to the new version before rolling it out fully.

**Process:**
1. Deploy the new version alongside the current version
2. Route 5% of traffic to the canary
3. Monitor error rates, latency, and business metrics
4. Gradually increase traffic (5% → 25% → 50% → 100%)
5. If metrics degrade, route all traffic back to the stable version

**Pros:** Limits blast radius, data-driven rollout decisions
**Cons:** More complex routing infrastructure, requires good observability

### Rolling Updates

Replace instances of the old version one at a time.

**Process:**
1. Take one instance out of the load balancer
2. Deploy the new version to that instance
3. Run health checks; if healthy, add it back to the pool
4. Repeat for each instance

**Pros:** Simple, no extra infrastructure
**Cons:** Mixed versions running simultaneously, slower rollback

### Environment Promotion

Follow strict promotion path: **dev → staging → production**

| Environment | Purpose | Data |
|-------------|---------|------|
| dev | Active development, fast iteration | Seed/synthetic |
| staging | Pre-production validation | Anonymized copy |
| production | Live user traffic | Real user data |

**Rules:**
- Never deploy directly to production without passing through staging
- Staging should mirror production configuration as closely as possible
- Use the same Docker image across all environments; only environment variables change
- Database migrations must be tested in staging before production

---

## 3. Pre-Merge Readiness Dashboard

Before merging a PR to main, this automated dashboard checks that the branch is truly ready for deployment.

### Checks Performed

```
✓ All CI checks pass (lint, test, build, security scan)
✓ All code reviews are fresh (< 1 day old, not stale)
✓ No blocking review comments remain
✓ Changelog entry exists (for non-docs changes)
✓ Version bumped correctly (MICRO/PATCH auto-decided, MINOR/MAJOR user-confirmed)
✓ PR description is accurate and complete
✓ Branch is up-to-date with main (no merge conflicts)
✓ Commit messages follow conventional format
✓ No secrets detected (gitleaks pre-commit hook passed)
✓ Database migrations backward-compatible (if any)
✓ Feature flags properly configured (if applicable)
```

### Automated Report

```markdown
## Pre-Merge Readiness Dashboard

**Branch:** feat/new-checkout
**Status:** ✅ READY TO MERGE

### CI Status
- ✅ Lint: PASSED (0 issues)
- ✅ Tests: PASSED (234 tests, 98.2% coverage)
- ✅ Build: PASSED (prod build 4.2MB)
- ✅ Security: PASSED (0 vulnerabilities)

### Review Status
- ✅ All reviewers approved (2/2)
- ✅ No blocking comments
- ⚠️ Last review: 3h ago (fresh)

### Release Readiness
- ✅ Changelog updated
- ✅ Version decision: PATCH (1.2.4 → 1.2.5) — AUTO-DECIDED
- ✅ Commit messages conventional
- ✅ No secrets detected

### Deployment Readiness
- ✅ Database migrations backward-compatible
- ✅ Feature flags configured
- ✅ Health checks pass
- ✅ Branch up-to-date with main

**Decision:** MERGE TO MAIN ✅
**Next:** Automated deploy to staging in 5min, production canary in 10min
```

### Dashboard Rules

- **Stale reviews:** If review > 1 day old, flag as potentially stale; ask reviewer to re-approve if significant changes were made
- **Missing changelog:** Require changelog entry (see `changelog-automation` skill) unless commit is tagged `docs:` or `chore:`
- **Version decision:** If PATCH or MICRO bump, auto-decide; if MINOR or MAJOR, ask user to confirm intent
- **Secrets detection:** Fail merge if gitleaks finds any secrets; require user to remediate and force-push
- **Merge conflicts:** Do not allow merge if conflicts exist; require rebase

---

## 4. Canary Monitoring

After deployment, monitor the canary for 10 minutes at 60-second intervals to detect failures early.

### Health Baseline (Pre-Canary)

Before routing any traffic to canary, establish production baseline:

```json
{
  "baselineMetrics": {
    "pageLoadTime_p95": 1250,      // milliseconds
    "errorRate": 0.2,               // percent
    "consoleErrors": 3,             // count
    "consoleWarnings": 12,          // count
    "responseTime_p95": 450,        // milliseconds
    "cpuUsage": 35,                 // percent
    "memoryUsage": 62               // percent
  },
  "capturedAt": "2026-03-26T10:00:00Z"
}
```

### Canary Monitoring Loop (10 minutes, 60-second intervals)

```typescript
interface CanaryMetric {
  timestamp: ISO8601;
  pageLoadTime_p95: number;
  errorRate: number;
  consoleErrors: number;
  consoleWarnings: number;
  responseTime_p95: number;
  cpuUsage: number;
  memoryUsage: number;
  comparisons: {
    vs_baseline: {
      pageLoadTime_pctChange: number;
      errorRate_pctChange: number;
      responseTime_pctChange: number;
    };
  };
}
```

**Sample 10-minute canary report:**

```markdown
## Canary Monitoring Report — v1.2.5

**Canary Traffic:** 5% (deployed 2 minutes ago)
**Monitoring Duration:** 10 minutes
**Sample Period:** 60-second intervals

### Metrics Snapshot (Latest)
| Metric | Current | Baseline | Δ | Status |
|--------|---------|----------|---|--------|
| Page Load (p95) | 1280ms | 1250ms | +2.4% | ✅ OK |
| Error Rate | 0.22% | 0.20% | +10% | ✅ OK |
| Response Time (p95) | 465ms | 450ms | +3.3% | ✅ OK |
| Console Errors | 4 | 3 | +1 | ✅ OK |
| CPU Usage | 37% | 35% | +2% | ✅ OK |
| Memory Usage | 64% | 62% | +2% | ✅ OK |

### Timeline (Last 10 minutes)
```
T+0m   ✅ Deploy complete, 5% traffic routed to canary
T+1m   ✅ Metrics nominal, no errors
T+2m   ✅ Page load stable (1271ms, +1.7% vs baseline)
T+3m   ✅ Response time good (452ms, +0.4% vs baseline)
T+4m   ✅ No degradation detected
T+5m   ✅ Mid-point check: all metrics green
T+6m   ✅ Error rate stable (0.21%, +5% vs baseline)
T+7m   ✅ Resource usage nominal
T+8m   ✅ No anomalies, proceeding
T+9m   ✅ Final check: ready for gradual rollout
T+10m  ✅ CANARY PASSED — Increase to 25% traffic
```

### Auto-Rollback Triggers

Automatic rollback if ANY of these conditions hit:

- **Error rate** exceeds 5% for 2 consecutive minutes
- **p95 latency** exceeds 2x the baseline for 3 minutes
- **Health check failures** on > 30% of instances
- **CPU usage** exceeds 90% for 2 consecutive minutes
- **Memory usage** exceeds 95% for 2 consecutive minutes
- **Console errors** > 10x baseline
- **Any unhandled exception** thrown during deploy

### Progressive Traffic Rollout

If canary passes all checks:

```
✅ Canary (5%) — PASS
  ↓
Increase to 25% after 2 minutes of stability
  ↓
✅ 25% (10 minutes of monitoring)
  ↓
Increase to 50%
  ↓
✅ 50% (10 minutes of monitoring)
  ↓
Increase to 100% (full rollout)
  ↓
✅ 100% (30-minute active watch)
```

### Monitoring Dashboard Output

```
╔════════════════════════════════════════════════════════════════╗
║                 CANARY DEPLOYMENT MONITOR                      ║
║                    v1.2.5 Canary Release                       ║
╚════════════════════════════════════════════════════════════════╝

Current Traffic: 5% → canary, 95% → stable
Elapsed Time: 5m 23s of 10m monitoring window

┌─ Metrics (Real-Time) ────────────────────────────────────────┐
│ Page Load (p95):     1265ms  │  +1.2% vs baseline   ✅ OK    │
│ Error Rate:          0.21%   │  +5% vs baseline     ✅ OK    │
│ Response Time (p95): 458ms   │  +1.8% vs baseline   ✅ OK    │
│ Console Errors:      4       │  +1 vs baseline      ✅ OK    │
│ CPU Usage:           38%     │  +3% vs baseline     ✅ OK    │
│ Memory Usage:        65%     │  +3% vs baseline     ✅ OK    │
└──────────────────────────────────────────────────────────────┘

┌─ Health Status ──────────────────────────────────────────────┐
│ Canary Instances:    12/12 healthy (100%)          ✅ OK    │
│ Stable Instances:    42/42 healthy (100%)          ✅ OK    │
│ Request Rate:        4200 req/s                    ✅ OK    │
│ p99 Latency:         1850ms (target: 2500ms)       ✅ OK    │
└──────────────────────────────────────────────────────────────┘

┌─ Auto-Rollback Triggers ─────────────────────────────────────┐
│ Error Rate > 5%:     NO (0.21%)                   ✅ OK    │
│ Latency > 2x base:   NO (1.265s vs 1.250s)        ✅ OK    │
│ Instance Failures:   NO (0 failures)               ✅ OK    │
│ CPU > 90%:           NO (38%)                      ✅ OK    │
│ Memory > 95%:        NO (65%)                      ✅ OK    │
│ Console Errors > 30: NO (4 errors)                ✅ OK    │
└──────────────────────────────────────────────────────────────┘

Next Action: Continue monitoring (4m 37s remaining)
Rollout Plan: 5% → 25% → 50% → 100% (if stable)
```

---

## 5. Revert Protocol

If canary monitoring detects failures, execute automatic revert without force-pushing.

### Revert Decision Tree

```
Canary Health Check
        ↓
    PASS?  ╔═══════════════╗
      │    ║ YES: Proceed  ║
      │    ║ to next phase ║
      │    ╚═══════════════╝
      │
      NO
      ↓
  ╔═══════════════════════════════╗
  ║ ERROR DETECTED                ║
  ║ Initiating automatic revert   ║
  ╚═══════════════════════════════╝
      ↓
  Create Revert Commit
  (git revert SHA --no-edit)
      ↓
  Push Revert Branch
  (git push origin revert-SHA)
      ↓
  Merge Revert to Main
  (via CI/CD, no force-push)
      ↓
  Deploy Revert to Production
      ↓
  Monitor Reverted Version
      ↓
  If Stable: Alert team + begin investigation
  If Still Failing: Emergency manual intervention
```

### Automated Revert Execution

```bash
#!/bin/bash
# scripts/revert-deploy.sh

FAILED_COMMIT=$1
REVERT_REASON=$2

echo "[REVERT] Detected failure in $FAILED_COMMIT"
echo "[REVERT] Reason: $REVERT_REASON"

# Create revert commit (does not force-push)
git revert $FAILED_COMMIT --no-edit --no-verify

REVERT_COMMIT=$(git rev-parse HEAD)

echo "[REVERT] Revert commit created: $REVERT_COMMIT"

# Push revert commit to origin
git push origin HEAD:revert/$FAILED_COMMIT

echo "[REVERT] Pushed revert branch to origin"

# Trigger CI/CD to automatically merge and deploy revert
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_REPOSITORY/pulls \
  -d "{
    \"title\": \"REVERT: $FAILED_COMMIT\",
    \"body\": \"Automatic revert due to: $REVERT_REASON\",
    \"head\": \"revert/$FAILED_COMMIT\",
    \"base\": \"main\"
  }"

echo "[REVERT] Revert PR created, awaiting CI approval and auto-merge"

# Wait for CI and auto-merge to complete
# Then monitor the reverted version

echo "[REVERT] Monitoring reverted version for 15 minutes..."
# Call canary monitoring on reverted version
./scripts/canary-monitor.sh production 15m
```

### Revert Monitoring (15 minutes)

After revert is deployed, monitor the reverted version for 15 minutes:

```markdown
## Revert Monitoring Report

**Reverted Commit:** abc1234 (v1.2.4, stable)
**Revert Time:** 2026-03-26T10:15:30Z
**Monitoring Duration:** 15 minutes

### Metrics After Revert
| Metric | Reverted | Baseline | Status |
|--------|----------|----------|--------|
| Page Load (p95) | 1240ms | 1250ms | ✅ RESTORED |
| Error Rate | 0.19% | 0.20% | ✅ RESTORED |
| Response Time (p95) | 445ms | 450ms | ✅ RESTORED |
| CPU Usage | 34% | 35% | ✅ RESTORED |
| Memory Usage | 61% | 62% | ✅ RESTORED |

**Verdict:** ✅ REVERTED VERSION STABLE
**Action:** Team alerted, investigation of failed version begun

### Timeline
- T+0m: Revert deployed to 100% traffic
- T+2m: All metrics stable
- T+5m: No errors, no degradation
- T+10m: Sustained stability
- T+15m: Revert confirmed stable — incident response initiated
```

### Manual Revert Steps (If Automated Fails)

1. Identify the last known good version (check deployment history)
2. Create a revert commit: `git revert SHA --no-edit`
3. Push to a new branch: `git push origin HEAD:revert/SHA`
4. Create PR and merge to main (standard process, no force-push)
5. Verify health checks pass on reverted version
6. Document the incident in the post-mortem
7. Investigate the root cause of the failed deployment

### Post-Revert Actions

```markdown
## Incident Response Post-Revert

1. **Immediate (0-5 min)**
   - [ ] Reverted version confirmed stable
   - [ ] Team notified on Slack/email
   - [ ] On-call engineer engaged

2. **Short-term (5-30 min)**
   - [ ] Collect error logs from failed canary
   - [ ] Identify root cause (code? config? infrastructure?)
   - [ ] Document findings in issue

3. **Medium-term (30min-2h)**
   - [ ] Create fix in new branch
   - [ ] Test fix in staging
   - [ ] Code review by senior engineer
   - [ ] Re-deploy with canary monitoring

4. **Long-term (2h+)**
   - [ ] Write post-mortem
   - [ ] Identify preventive measures
   - [ ] Update runbooks/monitoring
   - [ ] Schedule retrospective
```

---

## 6. Version Decision Engine

Automatically decide MICRO/PATCH version bumps; ask user for MINOR/MAJOR.

### Version Bump Rules (Semantic Versioning)

```
Given a version MAJOR.MINOR.PATCH (e.g., 1.2.5):

1. MAJOR (x.0.0)
   - Breaking API changes
   - Breaking database schema changes
   - User confirmation required

2. MINOR (x.y.0)
   - New features (backward-compatible)
   - Deprecations with fallback
   - User confirmation required

3. PATCH (x.y.z) — Auto-decided
   - Bug fixes
   - Performance improvements
   - Non-user-facing changes
   - Security patches (no user exposure)
```

### Auto-Decision Criteria (PATCH)

Scan commit messages and changes. If ALL of the following are true, auto-decide PATCH:

✓ No commit message contains `BREAKING CHANGE:`
✓ No commit message contains `feat!:`
✓ No database schema additions or deletions (migrations only add new columns with defaults)
✓ No public API signature changes
✓ No new dependencies (same lockfile hash)
✓ Test coverage maintained or improved

If ANY of the above is violated → escalate to MINOR/MAJOR decision (ask user to confirm intent).

### User Confirmation Flow (MINOR/MAJOR)

```markdown
## Version Decision Required

**Current Version:** 1.2.5
**Detected Changes:**
- ✓ Bug fixes (PATCH)
- ✓ Performance improvements (PATCH)
- ✓ New endpoint: POST /api/v2/users (MINOR or BREAKING?)

**Question:** Should this be:
- [ ] 1.2.6 (PATCH — bug fixes only)
- [ ] 1.3.0 (MINOR — new features, backward-compatible)
- [ ] 2.0.0 (MAJOR — breaking changes)

**Recommendation:** MINOR (1.3.0) — new endpoint is additive, existing API unchanged

Confirm your choice: (respond with 1, 2, or 3)
```

### Version Bump in CI/CD

```bash
#!/bin/bash
# scripts/bump-version.sh

CURRENT_VERSION=$(cat package.json | jq -r '.version')
BUMP_TYPE=$1  # patch, minor, major

echo "Current version: $CURRENT_VERSION"
echo "Bump type: $BUMP_TYPE"

# Use npm version to bump (updates package.json and creates git tag)
npm version $BUMP_TYPE --no-git-tag-version

NEW_VERSION=$(cat package.json | jq -r '.version')

echo "New version: $NEW_VERSION"

# Commit version bump
git add package.json package-lock.json
git commit -m "chore(release): bump to v$NEW_VERSION"

# Create and push tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
git push origin HEAD
git push origin "v$NEW_VERSION"

# Update CHANGELOG (see changelog-automation skill)
./scripts/generate-changelog.sh $CURRENT_VERSION $NEW_VERSION

echo "Version bumped to $NEW_VERSION and tagged"
```

---

## 7. Rollback Procedures

### Automated Rollback Triggers

Define automatic rollback conditions:

- **Error rate** exceeds 5% for 2 consecutive minutes
- **p95 latency** exceeds 2x the baseline for 3 minutes
- **Health check failures** on > 30% of instances
- **CPU usage** exceeds 90% for 2 consecutive minutes
- **Memory usage** exceeds 95% for 2 consecutive minutes

### Database Rollback

- Always write forward-compatible migrations. Never drop columns in the same release that removes the code using them.
- Use a two-phase approach: Phase 1 deploys code that no longer uses the column. Phase 2 (next release) drops the column.
- Keep migration rollback scripts tested and ready.

---

## 8. Feature Flags

Use feature flags to decouple deployment from release.

```typescript
// Simple feature flag check
if (featureFlags.isEnabled('new-checkout-flow', { userId: user.id })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

**Best practices:**
- Use a feature flag service (LaunchDarkly, Unleash, or Supabase edge config)
- Clean up flags after full rollout; do not let stale flags accumulate
- Log flag evaluations for debugging
- Use percentage-based rollouts for gradual releases

---

## 9. Post-Deploy Monitoring

After every deployment, monitor for at least 30 minutes:

- **Error rate:** Compare against pre-deploy baseline
- **Latency:** Check p50, p95, and p99 response times
- **Resource usage:** CPU, memory, and disk on all services
- **Business metrics:** Conversion rates, signups, or other KPIs
- **Logs:** Watch for new error patterns or warnings

Set up alerts that trigger within 5 minutes if any metric degrades beyond acceptable thresholds.

---

## 10. Pre-Deployment Checklist

Before every deployment, verify:

- [ ] All tests pass (unit, integration, e2e)
- [ ] Build succeeds with no warnings treated as errors
- [ ] Database migrations are backward-compatible
- [ ] Environment variables are configured for the target environment
- [ ] Feature flags are set correctly for the release
- [ ] Rollback plan is documented and tested
- [ ] Monitoring dashboards and alerts are active
- [ ] Changelog and release notes are prepared
- [ ] Team has been notified of the deployment window
- [ ] No stale reviews (all reviewers have fresh approval)
- [ ] Secrets detection passed (gitleaks)
- [ ] Version bumped correctly (MICRO/PATCH auto-decided, MINOR/MAJOR user-confirmed)

---

## 11. Quick Reference

| Concern | Recommendation |
|---------|----------------|
| Strategy | Blue-green for critical, canary for gradual |
| Rollback | Automated triggers + manual procedure documented |
| Pipeline | test → deploy staging → deploy production |
| Feature flags | Decouple deploy from release |
| Monitoring | 30-minute active watch post-deploy, 10-minute canary watch |
| Database | Forward-compatible migrations only |
| Containerization | Multi-stage Dockerfile, Alpine base, non-root user |
| Process mgmt | systemd, Docker, or PM2 (never nohup/screen) |
| Secrets | Runtime injection, never baked into image |
| Image scanning | `docker scout` or `trivy` in CI |

---

*This skill is invoked automatically on ALL DEPLOY requests. It does not wait for the user to ask — it intervenes proactively.*

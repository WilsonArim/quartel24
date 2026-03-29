---
name: security-ops
phase: 6
always_active: false
absorbs: SECURITY/infrastructure-hardening, SECURITY/devsecops-pipeline, SECURITY/incident-response, SECURITY/supply-chain-security
description: "Operational security lifecycle — pipeline, infrastructure, incidents, supply chain, CSO audits, trend tracking"
keywords: [seguranca ops, hardening, SSH, firewall, TLS, SAST, DAST, SCA, Semgrep, Trivy, CodeQL, Bandit, incidente, breach, postmortem, dependencia, CVE, SBOM, supply-chain, CSO, audit, trend, fingerprint]
---

# Security Ops

> Phase 6 — Comprehensive operational security from infrastructure hardening to incident response, DevSecOps pipelines, supply chain management, and executive-level security audits with trend tracking.

---

## 1. Infrastructure Hardening

### SSH Hardening

#### Authentication via keys only

Disable password authentication in `/etc/ssh/sshd_config`:

```
PasswordAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey
```

Generate RSA 4096 or ED25519 keys:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
```

Set correct permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
chmod 600 ~/.ssh/authorized_keys
```

#### Fail2Ban for brute force mitigation

Install and configure:

```bash
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Edit `/etc/fail2ban/jail.local`:

```
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 600
bantime = 3600
```

Restart service:

```bash
sudo systemctl restart fail2ban
```

#### Port change and restrictions

Edit `/etc/ssh/sshd_config`:

```
Port 2222
AllowUsers user1 user2
PermitRootLogin no
X11Forwarding no
AllowTcpForwarding no
PermitEmptyPasswords no
ClientAliveInterval 300
ClientAliveCountMax 2
```

Validate and reload:

```bash
sudo sshd -t
sudo systemctl reload ssh
```

### Firewall Configuration

#### UFW (Uncomplicated Firewall)

```bash
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status verbose
```

#### Iptables Rules

Complete example:

```bash
# Allow loopback
sudo iptables -A INPUT -i lo -j ACCEPT

# Allow SSH on custom port
sudo iptables -A INPUT -p tcp --dport 2222 -j ACCEPT

# Allow HTTP/HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Rate limit SSH
sudo iptables -A INPUT -p tcp --dport 2222 -m limit --limit 10/minute --limit-burst 20 -j ACCEPT

# Drop default
sudo iptables -A INPUT -j DROP

# Save configuration
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

#### NFTables (modern alternative)

```bash
sudo nft add table inet filter
sudo nft add chain inet filter input { type filter hook input priority 0 \; }
sudo nft add rule inet filter input iif lo accept
sudo nft add rule inet filter input tcp dport 2222 limit rate 10/minute accept
sudo nft add rule inet filter input tcp dport { 80, 443 } accept
sudo nft add rule inet filter input counter drop
```

### Kernel Hardening

Edit `/etc/sysctl.d/99-hardening.conf`:

```
# SYN flood protection
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048

# Disable packet forwarding
net.ipv4.ip_forward = 0
net.ipv6.conf.all.forwarding = 0

# Disable ICMP redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Enable reverse path filtering
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Enable execshield
kernel.exec-shield = 1

# Enable ASLR
kernel.randomize_va_space = 2

# Restrict dmesg access
kernel.dmesg_restrict = 1

# Restrict module access
kernel.modules_disabled = 1
```

Apply:

```bash
sudo sysctl -p /etc/sysctl.d/99-hardening.conf
```

### Swap Configuration

Disable or encrypt swap:

```bash
# Check current
swapon --show

# Disable permanently
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# Or encrypt swap with dm-crypt
sudo cryptsetup close swap
sudo cryptsetup open --type plain /dev/sdX1 swap
```

### TLS/SSL Certificates

#### Let's Encrypt with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d example.com -d www.example.com
sudo certbot renew --dry-run
```

Automate renewal:

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### Nginx TLS 1.3 configuration

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Reverse Proxy Security

#### Nginx rate limiting

```nginx
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

server {
    location / {
        limit_req zone=general burst=20 nodelay;
    }

    location /api/ {
        limit_req zone=api burst=5 nodelay;
    }
}
```

#### Security headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';" always;
```

### Systemd Service Isolation

Example hardened service:

```ini
[Unit]
Description=MyApplication
After=network.target

[Service]
Type=simple
User=appuser
ExecStart=/opt/myapp/bin/start

PrivateTmp=yes
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/lib/myapp
ProtectClock=yes
ProtectHostname=yes
ProtectKernelLogs=yes
ProtectKernelModules=yes
ProtectKernelTunables=yes
RemoveIPC=yes
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
RestrictNamespaces=yes
RestrictRealtime=yes
SystemCallFilter=@system-service
SystemCallErrorNumber=EPERM

MemoryLimit=512M
TasksMax=100

Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Verify:

```bash
sudo systemd-analyze security myapp.service
```

### Disk Encryption

#### LUKS for volumes

```bash
# Create encrypted container
sudo cryptsetup luksFormat /dev/sdX1
sudo cryptsetup luksOpen /dev/sdX1 encrypted_volume
sudo mkfs.ext4 /dev/mapper/encrypted_volume
sudo mkdir /mnt/encrypted
sudo mount /dev/mapper/encrypted_volume /mnt/encrypted

# Add to fstab
echo "/dev/mapper/encrypted_volume /mnt/encrypted ext4 defaults 0 2" | sudo tee -a /etc/fstab
```

### Automated Security Updates

```bash
sudo apt install unattended-upgrades apt-listchanges
sudo dpkg-reconfigure -plow unattended-upgrades
```

Configure `/etc/apt/apt.conf.d/50unattended-upgrades`:

```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Mail "root";
Unattended-Upgrade::AutoReboot "true";
Unattended-Upgrade::AutoRebootWithUsers "false";
Unattended-Upgrade::AutoRebootTime "02:00";
```

### Log Rotation

Configure `/etc/logrotate.d/myapp`:

```
/var/log/myapp/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 appuser appuser
    postrotate
        systemctl reload myapp > /dev/null 2>&1 || true
    endscript
}
```

Test:

```bash
sudo logrotate -f /etc/logrotate.d/myapp
```

---

## 2. DevSecOps Pipeline

### SAST (Static Application Security Testing)

#### Semgrep for general analysis

Install:

```bash
brew install semgrep
# or
pip install semgrep
```

Run:

```bash
# Basic scan
semgrep --config=p/security-audit .

# Custom scan
semgrep --config=rules/ --output=report.json --json .

# Language-specific
semgrep --config=p/javascript --lang=js src/
```

Custom rule example:

```yaml
# rules/sql-injection.yaml
rules:
  - id: sql-injection-detect
    pattern: |
      db.query($QUERY)
    pattern-where: |
      metavariable-comparison:
        metavariable: $QUERY
        operator: "not-contains"
        pattern: "?"
    message: "Possible SQL injection - use parameterized queries"
    languages: [python]
    severity: ERROR
```

CI/CD integration:

```yaml
# .github/workflows/sast.yml
name: SAST

on: [pull_request, push]

jobs:
  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Semgrep
        run: |
          pip install semgrep
          semgrep --config=p/security-audit \
                  --output=semgrep-report.json \
                  --json .

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: semgrep-results
          path: semgrep-report.json

      - name: Fail on HIGH/CRITICAL
        run: |
          CRITICAL=$(jq '[.results[] | select(.severity=="CRITICAL")] | length' semgrep-report.json)
          HIGH=$(jq '[.results[] | select(.severity=="HIGH")] | length' semgrep-report.json)
          if [ $((CRITICAL + HIGH)) -gt 0 ]; then
            echo "Found $CRITICAL critical and $HIGH high severity issues"
            exit 1
          fi
```

#### CodeQL for depth

```yaml
name: CodeQL
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: github/codeql-action/init@v2
        with:
          languages: ['javascript', 'python']
      - uses: github/codeql-action/autobuild@v2
      - uses: github/codeql-action/analyze@v2
```

Example CodeQL query (insecure deserialization):

```
import javascript

from CallExpression call, Identifier func
where func.getName() = "JSON.parse"
  and call.getCallee() = func
  and not exists(
    Literal lit | call.getAnArgument() = lit
  )
select call, "Potential JSON parsing from untrusted source"
```

#### Bandit for Python

```bash
pip install bandit

# Scan project
bandit -r . -f json -o bandit-report.json

# Ignore paths
bandit -r . --skip B101,B601 --exclude "tests/,venv/"

# Minimum severity
bandit -r . -ll  # Only MEDIUM and HIGH
```

Example `.bandit`:

```yaml
exclude_dirs: ['tests', 'venv', 'docs']
skips: [B101]  # assert_used
tests: [B201, B301, B302, B303]
```

#### ESLint with security plugins

```bash
npm install --save-dev eslint eslint-plugin-security

# .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:security/recommended"],
  "rules": {
    "security/detect-eval-with-expression": "error",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error"
  }
}
```

### DAST (Dynamic Application Security Testing)

#### OWASP ZAP

Install:

```bash
brew install zaproxy
```

Run:

```bash
zaproxy -cmd \
  -quickurl http://localhost:3000 \
  -quickout zap-report.html
```

CI/CD integration:

```yaml
name: DAST

on: [push]

jobs:
  dast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Deploy to staging
      - name: Deploy staging
        run: ./deploy-staging.sh

      - name: Wait for deployment
        run: sleep 30

      # ZAP scan
      - name: OWASP ZAP scan
        uses: zaproxy/action-baseline@v0.4.0
        with:
          target: 'http://staging.example.com'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

      - name: Upload ZAP results
        uses: actions/upload-artifact@v3
        with:
          name: zap-report
          path: report_html.html
```

#### Nuclei for specific tests

Install:

```bash
go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest
```

Run:

```bash
# Scan with templates
nuclei -u http://localhost:3000 -t nuclei-templates/

# Custom checks
nuclei -u http://localhost:3000 -t custom-checks/
```

Example Nuclei template:

```yaml
# custom-checks/api-auth.yaml
id: api-missing-auth
info:
  name: Missing Authentication on API Endpoints
  severity: high
  author: security-team

requests:
  - method: GET
    path:
      - "{{BaseURL}}/api/users"
      - "{{BaseURL}}/api/admin"
    matchers:
      - type: status
        status:
          - 200
          - 201
        negative: true  # Should be 401/403, not 200
```

### SCA (Software Composition Analysis)

#### Snyk for dependency vulnerabilities

Install:

```bash
npm install -g snyk
```

Use:

```bash
snyk test
snyk monitor
snyk fix
```

Configuration `.snyk`:

```yaml
version: v1.25.0
cli: 2.128.0

ignore:
  SNYK-JS-AXIOS-XXXX:
    - node_modules/axios:
        reason: "Mitigated by WAF"
        expires: "2024-03-01T00:00:00Z"

patch: {}
```

#### Trivy for multiple formats

Install:

```bash
brew install trivy
```

Run:

```bash
# Scan dependencies
trivy fs .

# Scan container image
trivy image myapp:latest

# JSON output
trivy fs . --format json --output results.json
```

CI/CD example:

```yaml
name: Trivy Scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### Container Scanning

#### Trivy for Docker images

```bash
# Scan local image
trivy image myapp:latest

# Scan remote image
trivy image ghcr.io/user/app:latest

# JSON with details
trivy image --format json --output image-scan.json myapp:latest
```

Policy enforcement with OPA:

```yaml
# trivy-policy.rego (Open Policy Agent)
package trivy

deny[msg] {
    severity := input.Results[_].Severity
    severity == "CRITICAL"
    msg := sprintf("CRITICAL vulnerability found: %v", [input.Results[_].VulnerabilityID])
}

deny[msg] {
    count(input.Results[_]) > 10
    msg := "More than 10 vulnerabilities found"
}
```

#### Grype for complete visibility

Install:

```bash
brew install anchore/grype/grype
```

Scan:

```bash
grype ghcr.io/user/app:latest

# Generate SBOM
grype ghcr.io/user/app:latest -o cyclonedx > sbom.json
```

### CI/CD Security Gates

#### GitHub branch protection rules

```
Settings > Branches > Add rule (main branch)

REQUIRE:
✓ Pull request reviews before merging (2 reviewers)
✓ Dismiss stale pull request approvals
✓ Require status checks to pass:
  - SAST (Semgrep)
  - DAST (ZAP)
  - SCA (Snyk)
  - Container scan (Trivy)
  - Build succeeds
  - All tests pass
✓ Require signed commits
✓ Require branches be up to date before merging
✓ Restrict who can push to matching branches
```

#### GitHub Actions security workflow

```yaml
name: Security Gates

on: [pull_request, push]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # SAST
      - name: Semgrep SAST
        continue-on-error: true
        run: |
          pip install semgrep
          semgrep --config=p/security-audit --json --output=sast.json .

      # SCA
      - name: Trivy SCA
        continue-on-error: true
        run: |
          brew install trivy
          trivy fs . --format json --output sca.json

      # Build
      - name: Build
        run: npm run build

      # DAST (main branch only)
      - name: Deploy staging
        if: github.ref == 'refs/heads/main'
        run: ./deploy-staging.sh

      - name: DAST Scan
        if: github.ref == 'refs/heads/main'
        continue-on-error: true
        run: |
          pip install nuclei
          nuclei -u http://staging.example.com -t nuclei-templates/ -json

      # Vulnerability check
      - name: Check for HIGH/CRITICAL
        run: |
          CRITICAL=$(jq '[.[] | select(.severity == "CRITICAL")] | length' sast.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "CRITICAL vulnerabilities found"
            exit 1
          fi
```

#### Pre-commit hooks

Install framework:

```bash
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml <<EOF
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

  - repo: https://github.com/semgrep/semgrep
    rev: v1.45.0
    hooks:
      - id: semgrep

  - repo: local
    hooks:
      - id: npm-audit
        name: npm audit
        entry: npm audit --audit-level=high
        language: system
        files: package-lock.json
        pass_filenames: false
EOF

# Install hooks
pre-commit install
```

Custom security hook:

```bash
#!/bin/bash
# .git/hooks/pre-commit

set -e

echo "[*] Running security checks..."

# 1. Secret detection
echo "[1] Checking for secrets..."
if command -v gitleaks &> /dev/null; then
    gitleaks protect --verbose
fi

# 2. SAST
echo "[2] Running SAST..."
npm run lint:security

# 3. Dependency audit
echo "[3] Auditing dependencies..."
npm audit --audit-level=moderate || exit 1

# 4. Format check
echo "[4] Checking code format..."
npm run format:check

echo "[✓] All security checks passed"
```

#### Artifact signing with Cosign

Generate key:

```bash
cosign generate-key-pair
```

Sign image:

```bash
cosign sign --key cosign.key ghcr.io/user/app:v1.0.0
```

Verify:

```bash
cosign verify --key cosign.pub ghcr.io/user/app:v1.0.0
```

Deployment verification:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    spec:
      containers:
      - name: app
        image: ghcr.io/user/app:v1.0.0@sha256:abcd1234...
```

#### Pre-deployment verification script

```bash
#!/bin/bash
# verify-deployment.sh

set -e

VERSION=$1

echo "[1] Verify image signature"
cosign verify --key cosign.pub "ghcr.io/myapp:$VERSION"

echo "[2] Verify SBOM"
trivy image "ghcr.io/myapp:$VERSION" \
  --format cyclonedx --output sbom.json
if [ ! -f sbom.json ]; then
  echo "ERROR: SBOM not found"
  exit 1
fi

echo "[3] Verify no CRITICAL vulnerabilities"
CRITICAL=$(trivy image "ghcr.io/myapp:$VERSION" \
  --format json | \
  jq '[.Results[] | select(.Severity == "CRITICAL")] | length')
if [ "$CRITICAL" -gt 0 ]; then
  echo "ERROR: $CRITICAL CRITICAL vulnerabilities found"
  exit 1
fi

echo "[4] Verify commit is signed"
git verify-commit "v$VERSION" || exit 1

echo "[✓] All verifications passed"
```

### Security Dashboard & Metrics

Consolidate security metrics:

```python
# security_metrics.py
from dataclasses import dataclass
from datetime import datetime

@dataclass
class SecurityMetrics:
    timestamp: datetime
    sast_issues_critical: int
    sast_issues_high: int
    sca_vulnerabilities_critical: int
    sca_vulnerabilities_high: int
    container_scan_issues: int
    coverage_percent: float
    last_deployment: str
    days_since_last_update: int
    compliance_score: float

    def to_json(self):
        return {
            'timestamp': self.timestamp.isoformat(),
            'sast': {
                'critical': self.sast_issues_critical,
                'high': self.sast_issues_high
            },
            'sca': {
                'critical': self.sca_vulnerabilities_critical,
                'high': self.sca_vulnerabilities_high
            },
            'containers': self.container_scan_issues,
            'coverage': self.coverage_percent,
            'compliance_score': self.compliance_score
        }
```

Prometheus metrics:

```python
def export_metrics(metrics):
    print(f"# HELP security_sast_critical SAST critical issues")
    print(f"# TYPE security_sast_critical gauge")
    print(f"security_sast_critical {metrics.sast_issues_critical}")
    # Continue for other metrics...
```

Alert rules:

```yaml
# alertas.yaml
rules:
  - alert: CriticalVulnerabilityFound
    expr: security_sast_critical > 0 or security_sca_critical > 0
    for: 5m
    annotations:
      summary: "Critical vulnerability in {{ $labels.service }}"
      action: "Trigger incident response"

  - alert: OutdatedDependencies
    expr: security_days_since_dependency_update > 90
    for: 1h
    annotations:
      summary: "Dependencies not updated in {{ $value }} days"
      action: "Schedule dependency review"

  - alert: LowCoverageScanning
    expr: security_coverage_percent < 80
    for: 24h
    annotations:
      summary: "Security scanning coverage below 80%"
      action: "Extend scanning configuration"
```

---

## 3. Supply Chain Security

### Dependency Pinning

#### Package Manager Lockfiles

Always commit lock files for exact reproducibility:

**npm/yarn:**

```bash
git add package-lock.json
git commit -m "Update dependencies"

# In CI/CD, use clean install
npm ci  # Uses exact versions from package-lock.json
yarn ci --frozen-lockfile
```

**Python:**

```bash
pip freeze > requirements.txt

# Better: pip-compile for deterministic generation
pip install pip-tools
pip-compile requirements.in
git add requirements.txt
```

Example `requirements.in`:

```
flask>=2.0.0,<3.0.0
sqlalchemy>=2.0.0,<3.0.0
requests>=2.28.0
```

Generate lockfile:

```bash
pip-compile requirements.in  # Generates requirements.txt with all hashes
```

**Cargo (Rust):**

```bash
cargo build
git add Cargo.lock

# Verify exact versions
cargo tree --locked
```

#### Avoid floating versions

Bad:

```json
{
  "dependencies": {
    "express": "^2.0.0",
    "lodash": "*"
  }
}
```

Good:

```json
{
  "dependencies": {
    "express": "2.28.1",
    "lodash": "4.17.21"
  }
}
```

### SBOM Generation

#### CycloneDX

Install:

```bash
# Node.js
npm install -g @cyclonedx/cyclonedx-npm

# Python
pip install cyclonedx-python

# General (Java-based)
brew install cyclonedx-cli
```

Generate:

```bash
# npm
cyclonedx-npm --output-file sbom.json

# Python
cyclonedx-py -o sbom.json requirements.txt

# CLI generic
cyclonedx-cli resource --input-file package.json --output-file sbom.json
```

Example SBOM:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2",
      "licenses": [
        {
          "license": {
            "id": "MIT"
          }
        }
      ]
    }
  ]
}
```

#### SPDX for compliance

Generate SPDX document:

```bash
pip install spdx-tools

spdx-generator \
  --input-dir . \
  --output-file sbom.spdx \
  --license-list-file LICENSES.spdx
```

### Signed Commits

#### GPG Signing

Generate key:

```bash
gpg --full-generate-key
# or
gpg --default-new-algo rsa4096 --gen-key

# List keys
gpg --list-secret-keys
```

Configure Git:

```bash
git config user.signingkey [KEY-ID]
git config commit.gpgsign true
```

Sign commits:

```bash
git commit -S -m "Feature: add auth"

# Verify
git log --show-signature
git verify-commit HEAD
```

#### SSH Signing (alternative)

```bash
git config user.signingkey ~/.ssh/id_ed25519.pub
git config gpg.format ssh
git config commit.gpgsign true

git commit -S -m "Feature: add auth"
```

#### Enforce signed commits

GitHub branch protection:

```
Require signed commits: checked
```

Or via API:

```bash
gh api repos/owner/repo/branches/main/protection \
  --input - <<EOF
{
  "required_commit_signing": true
}
EOF
```

### Container Image Signing with Cosign

Install:

```bash
brew install sigstore/tap/cosign
cosign version
```

Sign image:

```bash
# Login
cosign login ghcr.io

# Generate key (once)
cosign generate-key-pair

# Sign image
cosign sign --key cosign.key ghcr.io/user/app:v1.0.0

# Verify
cosign verify --key cosign.pub ghcr.io/user/app:v1.0.0
```

#### Keyless signing with GitHub OIDC

```bash
# Sign using GitHub authentication (no local key)
cosign sign --keyless ghcr.io/user/app:v1.0.0

# In GitHub Actions, uses OIDC token automatically

# Verify
cosign verify --certificate-identity-regexp https://github.com/user/app/.github/workflows/release.yml@main ghcr.io/user/app:v1.0.0
```

#### Policy enforcement with Kyverno

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image-signatures
spec:
  validationFailureAction: enforce
  rules:
  - name: verify-cosign
    match:
      resources:
        kinds:
        - Pod
    verifyImages:
    - imageReferences:
      - ghcr.io/user/app:*
      attestations:
      - name: signed-attestation
        predicateType: cosign.sigstore.dev/attestation/vuln/v1
        conditions:
        - all:
          - key: "{{ attestation.vulnerability }}"
            operator: equals
            value: "fixed"
      cosignPubKey: |-
        -----BEGIN PUBLIC KEY-----
        ...
        -----END PUBLIC KEY-----
```

### Dependency Monitoring

#### GitHub Dependabot

Configure `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
      time: "03:00"
    open-pull-requests-limit: 5
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    allow:
      - dependency-type: "direct"
      - dependency-type: "indirect"
    ignore:
      - dependency-name: "old-insecure-package"

  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
    version-update-strategy: "increase-minor"

  - package-ecosystem: "cargo"
    directory: "/"
    schedule:
      interval: "weekly"
```

#### Renovate for monorepos

```json
{
  "extends": [
    "config:base",
    ":dependencyDashboard",
    ":semanticCommits"
  ],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    },
    {
      "matchPackagePatterns": ["typescript"],
      "automerge": false,
      "groupName": "Major TypeScript update"
    }
  ],
  "vulnerabilityAlerts": {
    "enabled": true
  }
}
```

### License Compliance

Check licenses:

```bash
# npm
npm install -g license-checker
license-checker --json > licenses.json

# Python
pip install pip-licenses
pip-licenses --format=json --output-file=licenses.json

# Cargo
cargo-license --json
```

Compliance verification:

```bash
#!/bin/bash
# verify_licenses.sh

ALLOWED=("MIT" "Apache-2.0" "BSD-2-Clause" "BSD-3-Clause" "ISC")

license-checker --json | jq -r 'to_entries[] | "\(.value.licenses)"' | \
while read license; do
    if [[ ! " ${ALLOWED[@]} " =~ " ${license} " ]]; then
        echo "ERROR: Disallowed license: $license"
        exit 1
    fi
done

echo "All licenses OK"
```

CI/CD integration:

```yaml
- name: Check licenses
  run: |
    npm install -g license-checker
    license-checker \
      --onlyAllow "MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC" \
      --fail-on disallowed
```

---

## 4. Incident Response

### Incident Classification

#### Severity by impact

**P1 - Critical (0-4 hours)**
- Confirmed data breach
- Complete service outage
- Active unauthorized access to critical systems
- Ransomware/malware detected in production
- Admin credential compromise

**P2 - High (4-24 hours)**
- Unauthorized access to non-critical system
- Confidential data leak (internal)
- Significant performance degradation
- Privileged account compromise
- Active vulnerability being exploited

**P3 - Medium (1-7 days)**
- Vulnerability discovered (not exploited)
- Suspicious log anomalies (inconclusive)
- Multiple failed brute force attempts
- Possible targeted phishing

**P4 - Low (1-30 days)**
- Unnecessary security update
- Minor processing anomaly
- Configuration alerts

### Response Playbooks

#### Generic response template

```markdown
# Incident Response Playbook: [Type]

## Trigger Indicators
- [Indicator 1]
- [Indicator 2]

## Immediate Actions (first 30 min)
1. [ ] Declare incident and notify escalation chain
2. [ ] Gather initial evidence (screenshots, logs, timestamps)
3. [ ] Preserve evidence (snapshot, memory dump)
4. [ ] Isolate affected systems if necessary
5. [ ] Notify communication lead
6. [ ] Open incident ticket

## Investigation Phase (1-2 hours)
1. [ ] Timeline: discovery vs occurrence
2. [ ] Scope: users/systems affected
3. [ ] Root cause: how it occurred
4. [ ] Data exposed: which data accessed
5. [ ] Culprit: who/what caused it

## Containment Phase (parallel)
1. [ ] Revoke access if compromise
2. [ ] Activate additional protections (WAF, rate limits)
3. [ ] Disable vulnerable features if necessary
4. [ ] Communicate affected users per timeline

## Recovery Phase
1. [ ] Patch vulnerability or fix root cause
2. [ ] Deploy fix
3. [ ] Monitor for recurrence
4. [ ] Schedule post-mortem in 2-5 days

## Communication (parallel)
- Affected users: [internal template]
- Media/public: [external template]
- Regulatory: [compliance template]
```

#### Data Breach Playbook

```
## Trigger
- Confirmed data exfiltration

## Immediate (0-2h)
1. Confirm scope and data types
   - PII (names, emails, CPF)?
   - Passwords (hashes or plaintext)?
   - Payment info?
   - IP addresses?

2. Notify:
   - CEO/Founder
   - Legal/Compliance Officer
   - PR lead
   - Engineering lead

3. Preserve evidence:
   - Database snapshots
   - Logs (authentication, access, exfiltration)
   - Network captures (PCAP)
   - Screenshots of dashboards/queries

4. Containment:
   - Revoke suspicious credentials
   - Block detected access patterns
   - Disable affected accounts if necessary

## Investigation (2-24h)
1. Determine:
   - Exact record count
   - Fields affected
   - Compromise start date
   - How attacker gained access
   - If data already sold/published

2. Consult:
   - Cyber insurance provider
   - External forensics firm (if sophisticated)
   - Legal counsel (GDPR compliance)

## Notification Timeline
- GDPR: 72 hours to notify authorities
- USA: 30-60 days (varies by state)
- Email template: [see below]
```

#### Credential Leak Playbook

```
## Immediate Actions
1. Identify secret:
   - API key, password hash, JWT token, SSH key?
   - Access scope (read-only or read-write)?
   - Services affected

2. Monitor use:
   - 24h before/after discovery
   - Any malicious requests using key?

3. Revoke immediately:
   - Invalidate secret everywhere
   - Generate new secret
   - Deploy with zero-downtime

4. Search in public repositories:
   - GitHub, GitLab, Bitbucket public repos
   - Pastebin, GitHub Gists
   - Dark web (optional)

## Evidence
- First noticed date/time
- Committed date (if in git)
- Who had access (git log)
- If password: force-reset related accounts
- Check for secondary access (backdoor accounts)

## Prevention
- Pre-commit hook (gitleaks)
- Rotate secrets monthly
- Monitor for unauthorized access patterns
```

#### DDoS/Availability Playbook

```
## Detection
- Alerts: abnormally high traffic
- Elevated error rates (5xx)
- Service timeouts
- Maxed infrastructure (CPU/bandwidth)

## Immediate Response (< 5 min)
1. [ ] Activate aggressive rate limiting
2. [ ] Enable CDN DDoS protection (Cloudflare, AWS Shield)
3. [ ] Block known botnet IPs
4. [ ] Failover to backup infrastructure if available

## Analysis
1. Identify origin:
   - Distributed botnet (IP types, geographies)
   - Volumetric (UDP flood, DNS amplification)
   - Protocol attack (SYN flood, HTTP slowloris)
   - Application layer (valid but abusive requests)

2. Size of attack:
   - Bandwidth in Gbps
   - RPS (requests per second)
   - Geographic distribution

## Mitigation
- Rate limiting per IP
- CAPTCHA for suspicious users (if app level)
- Geo-blocking if appropriate
- Escalate to CDN provider for upstream filtering

## Communication
- Status page updates (5-10 min intervals)
- Notify customers via email
- Post-mortem at end
```

### Communication Templates

#### Internal Communication

```
Subject: SECURITY INCIDENT - [TYPE] [SEVERITY]

Team,

We have identified a security incident affecting [scope].

SEVERITY: [P1/P2/P3/P4]
DISCOVERED: [Date/Time UTC]
AFFECTED SYSTEMS: [List]
STATUS: [Investigating/Contained/Resolved]

TIMELINE:
- [Time]: Incident occurred
- [Time]: Detected
- [Time]: Escalated
- [Time]: Contained

IMPACT:
- Users affected: ~[number] or [%]
- Data types: [PII/passwords/payment/internal docs]
- Services down: [service 1], [service 2]

CURRENT ACTIONS:
1. [Action 1]
2. [Action 2]
3. [Action 3]

NEXT STEPS:
- Team X investigating [component]
- Team Y implementing [fix]
- All: Do not share details externally until clearance

Questions? Ask in #security-incident channel.

[Incident Commander]
```

#### External Communication (Breach Notification)

```
Subject: Important Security Notice - Action Required

Dear Valued Customer,

We are writing to inform you of a security incident that may have affected your account.

WHAT HAPPENED:
On [Date], we discovered unauthorized access to our systems. Our investigation determined that
the following information may have been accessed:
- Name
- Email address
- Password hash (bcrypt-encrypted)
- [Additional data]

WHAT WE'RE DOING:
- Immediately revoked unauthorized access
- Enhanced monitoring on affected accounts
- Notified law enforcement
- Engaging external cybersecurity firm

WHAT YOU SHOULD DO:
1. Change your password immediately
2. Enable two-factor authentication
3. Monitor account for unauthorized activity
4. Consider credit monitoring if payment info exposed

COMPENSATION:
We're offering [months] of free [service] and $[amount] for credit monitoring
as a token of our commitment to your security.

SUPPORT:
Email us at security@example.com or call [number]. We're available 24/7.

We deeply regret this incident and are committed to earning back your trust.

[CEO Name]
```

#### Regulatory Notification (GDPR)

```
To: [Supervisory Authority]
From: [Data Controller DPO]
Date: [Within 72 hours of discovery]

INCIDENT NOTIFICATION

Supervisory Authority: [GDPR Authority, e.g., CNPD Portugal]

INCIDENT DETAILS:
- Date of discovery: [DD/MM/YYYY]
- Estimated date of incident: [DD/MM/YYYY]
- Number of data subjects affected: [Number]
- Categories of personal data: [List]
- Categories of recipients of data: [List]

RISK ASSESSMENT:
Risk of high severity breach: [Yes/No]
Reason: [Explain likelihood and severity]

MEASURES TAKEN/PLANNED:
- Technical measures: [List]
- Organizational measures: [List]
- Notification to data subjects: [Date planned]

CONTACT POINT:
[DPO name, email, phone]
```

### Evidence Preservation

#### Immediate snapshot protocol

```bash
#!/bin/bash
# preserve_evidence.sh

INCIDENT_ID=$1
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
EVIDENCE_DIR="/secure/evidence/$INCIDENT_ID/$TIMESTAMP"

mkdir -p "$EVIDENCE_DIR"
chmod 700 "$EVIDENCE_DIR"

echo "[1] System state"
uname -a > "$EVIDENCE_DIR/system.txt"
date -u >> "$EVIDENCE_DIR/system.txt"
ps aux >> "$EVIDENCE_DIR/system.txt"
netstat -pantul >> "$EVIDENCE_DIR/network.txt"

echo "[2] Memory dump"
sudo bash -c "cat /proc/kcore" > "$EVIDENCE_DIR/memory.dump" 2>/dev/null || \
    echo "Memory dump unavailable" > "$EVIDENCE_DIR/memory.dump"

echo "[3] Disk snapshot (LVM)"
sudo lvcreate -L 100G -s -n evidence /dev/vg0/root || \
    echo "Could not snapshot filesystem"

echo "[4] Recent logs"
sudo tar czf "$EVIDENCE_DIR/logs.tar.gz" /var/log/ 2>/dev/null

echo "[5] Database backup"
sudo mysqldump --all-databases --events > "$EVIDENCE_DIR/databases.sql"

echo "[6] Network traffic (PCAP)"
tcpdump -i any -w "$EVIDENCE_DIR/traffic.pcap" "host $(hostname -I)" \
    -G 60 -W 10 &

echo "[7] Command history"
history > "$EVIDENCE_DIR/bash_history.txt"
sudo cat ~/.bash_history >> "$EVIDENCE_DIR/bash_history.txt"

echo "[8] Chain of custody"
cat > "$EVIDENCE_DIR/CHAIN_OF_CUSTODY" <<EOF
Incident ID: $INCIDENT_ID
Collection time: $TIMESTAMP
Collected by: $(whoami)
Purpose: Security incident investigation
File list:
EOF

find "$EVIDENCE_DIR" -type f -exec sha256sum {} \; >> "$EVIDENCE_DIR/CHAIN_OF_CUSTODY"

echo "Evidence collected to: $EVIDENCE_DIR"
```

### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Type]

Date: [YYYY-MM-DD]
Duration: [X hours from detection to resolution]
Severity: [P1/P2/P3/P4]
Participants: [Names, roles]

## Executive Summary
[1-2 paragraphs of what happened, impact, resolution]

## Timeline
- **[Time1] UTC**: Incident occurred (e.g., unauthorized access)
- **[Time2] UTC**: Detected by [alert/manual review]
- **[Time3] UTC**: Escalated to [team]
- **[Time4] UTC**: Root cause identified
- **[Time5] UTC**: Mitigation started
- **[Time6] UTC**: Fully resolved

## Contributing Factors (Blameless)
NOT: "Engineer X forgot to enable 2FA"
BUT: "Process gap: 2FA not enforced in deployment pipeline"

Examples of root factors:
- Incomplete runbook for deployment
- Alert threshold was too high
- No monitoring for specific attack vector
- Configuration drift from standard hardening
- Missing validation in API endpoint
- Lack of rate limiting on endpoint

## Learnings
### What went well
- [Positive aspect 1]
- [Positive aspect 2]

### What could be improved
- [Area 1] - affected response time
- [Area 2] - made detection harder
- [Area 3] - complicated mitigation

## Action Items
| Item | Owner | Due Date | Priority |
|------|-------|----------|----------|
| [1] Implement [control] to prevent | Team X | [Date] | P1 |
| [2] Add [alert] to detect | Team Y | [Date] | P1 |
| [3] Update [runbook] | Team Z | [Date] | P2 |
| [4] Conduct [training] | HR | [Date] | P2 |

## Appendix
- [Link to incident ticket]
- [Link to war room recording]
- [Link to logs analysis]
```

### Escalation Matrix

```
Detected by: Alert -> On-call Engineer (5 min response)

Severity:
P1:
  - Notify CEO, CTO, Compliance Officer (immediately)
  - Page on-call from 2+ teams
  - War room setup
  - Public status page update (5 min)

P2:
  - Notify Team Lead + Manager
  - Page on-call engineer
  - Slack notification to team
  - Status page update (30 min)

P3:
  - Notify Team Lead
  - Create ticket
  - Update via email (1 day)

P4:
  - Create backlog item
  - Track in planning meeting
```

### Regulatory Timelines

**GDPR (EU)**
- 72 hours from discovery → Notify supervisory authority
- Without undue delay → Notify affected individuals IF high risk
- 30 days → Response to data subject access request
- Permanent record of all incidents for 3 years

**LGPD (Brazil)**
- 72 hours from discovery → Notify ANPD if sensitive data
- Without undue delay → Notify affected individuals
- Cooperation with authorities for investigation

**CCPA (California)**
- Without undue delay → Notify affected consumers
- Reasonable security required (business judgment)
- Right to opt-out of sale of personal information

**HIPAA (Healthcare - USA)**
- 60 days from discovery → Notify affected individuals
- 60 days → Notify media (if >500 individuals)
- Breach notification to HHS if >500 individuals

### Disaster Recovery

RTO/RPO targets:

```yaml
services:
  api:
    rto: "15 minutes"
    rpo: "5 minutes"
    backup_frequency: "every 5 minutes (incremental)"
    restore_procedure:
      1. "Restore database from latest backup"
      2. "Redeploy application from git tag"
      3. "Run health checks"
      4. "Gradual traffic shift to new instance"

  database:
    rto: "30 minutes"
    rpo: "1 minute"
    backup_type: "Continuous replication to standby"
    restore_procedure:
      1. "Promote read replica to primary"
      2. "Update connection strings"
      3. "Verify data consistency"

  cache:
    rto: "5 minutes"
    rpo: "0 minutes (non-critical)"
    restore_procedure:
      1. "New cache cluster from scratch"
      2. "Application refills cache"
```

Failover script:

```bash
#!/bin/bash
# failover.sh

set -e

echo "[1] Promoting read replica..."
aws rds promote-read-replica \
    --db-instance-identifier prod-db-replica

echo "[2] Waiting for promotion..."
sleep 120

echo "[3] Updating connection strings..."
kubectl patch secret database-creds \
    --patch='{"stringData":{"DATABASE_URL":"new-url"}}'

echo "[4] Rolling restart of app pods..."
kubectl rollout restart deployment/app -n production

echo "[5] Health check..."
kubectl rollout status deployment/app -n production
```

---

## 5. CSO Audit Structure (14 Phases)

Comprehensive security audit framework for executive-level review with verification-first methodology.

### Phase 1: Stack Detection & Reconnaissance

**Goal**: Map complete technology stack and external dependencies.

**Actions:**
- Domain WHOIS & DNS enumeration
- SSL/TLS certificate transparency logs
- GitHub repository discovery (public + organization)
- Package manager registry search (npm, PyPI, crates.io, Maven)
- Technology stack fingerprinting (Wappalyzer, Builtwith)
- Cloud account discovery (AWS, Azure, GCP via IP ranges)
- CDN/cache discovery (Cloudflare, CloudFront, Fastly)
- Third-party API integrations (via website inspection)

**Deliverable**: Technology inventory spreadsheet with all services, frameworks, databases, hosting platforms

---

### Phase 2: Attack Surface Mapping

**Goal**: Identify all public-facing endpoints and entry points.

**Actions:**
- Subdomain enumeration (dnsrecon, assetfinder, subfinder)
- Port scanning (Nmap) on all discovered domains
- API endpoint discovery (via Swagger/OpenAPI files, GitHub, web archives)
- Mobile app analysis (if applicable)
- WebSocket/gRPC endpoint discovery
- Third-party integrations and webhooks
- S3 bucket discovery (s3scanner, aws s3api)
- Database public exposures (Shodan queries)
- VPN/admin panel discovery
- Git repository public exposure checks

**Deliverable**: Attack surface diagram (Mermaid or visual) showing all entry points

---

### Phase 3: Git History & Secret Scanning

**Goal**: Detect leaked credentials, API keys, tokens in version control.

**Actions:**
- Run gitleaks on entire repository history
- truffleHog scanning (entropy-based detection)
- git-secrets pre-commit validation
- Check GitHub secret scanning alerts
- Scan for common secret patterns:
  - AWS keys (AKIA...)
  - Google API keys
  - Private SSH keys
  - Database connection strings
  - JWT tokens with claims
  - Bearer tokens
  - Slack/Discord webhooks
  - Payment processor keys (Stripe, Twilio)
- Date-range analysis: when were secrets committed, when revoked?
- Access logging: who had access to leaked secrets?

**Finding Validation (Verification-First):**
- Attempt to use leaked secret (safe environment only)
- Check if secret is still active in production
- Trace access logs if secret was used maliciously
- Verify remediation: is old secret revoked and new one deployed?

**Deliverable**: Secret leak report with:
- Secret type & value hash
- Committed date & committer
- Revoked date (if applicable)
- Verification of non-exploitation

---

### Phase 4: Dependency Analysis & SBOM

**Goal**: Inventory all dependencies and known vulnerabilities.

**Actions:**
- Generate SBOM (CycloneDX or SPDX format)
- npm/pip/cargo audit for all transitive dependencies
- Snyk scan for CVE cross-reference
- Trivy filesystem scan
- Dependency age analysis (unpinned versions, floating ranges)
- Outdated dependency detection
- Abandoned/unmaintained package detection (last update >2 years)
- High-risk dependency patterns:
  - Packages with >100 transitive dependencies
  - Native/binary packages
  - Packages from new maintainers
  - Typosquatting checks
- License compliance verification
- Dependency tree visualization

**Finding Validation (Verification-First):**
- Verify CVE actually affects code path (not false positive)
- Check if vulnerable code is reachable from entry points
- Trace exploit scenario: can attacker trigger vulnerability?
- Verify patch/mitigation is applied

**Deliverable**: SBOM with vulnerability matrix, risk score per dependency

---

### Phase 5: CI/CD Pipeline Security

**Goal**: Audit build pipeline for security misconfigurations.

**Actions:**
- Inspect `.github/workflows/*.yml` for security issues:
  - Unpinned GitHub Actions (use specific version or hash)
  - `pull_request_target` with untrusted code execution
  - Secrets exposure in logs
  - No required reviews before production deployment
  - Weak branch protection rules
- Check for artifact signing (Cosign, etc.)
- Verify SBOM generation in pipeline
- Audit secret management (GitHub Secrets, HashiCorp Vault)
- Container registry scanning integration
- Deployment approval process
- Audit log retention
- Third-party CI/CD integrations security

**Finding Validation (Verification-First):**
- Simulate PR from fork + unpinned action to verify risk
- Check CI/CD audit logs for evidence of misconfiguration exploitation
- Verify remediation: test that patched CI/CD blocks malicious scenarios

**Deliverable**: CI/CD security report with risk matrix

---

### Phase 6: SAST Results Analysis

**Goal**: Deep dive into static analysis findings for false positives.

**Actions:**
- Re-run Semgrep, CodeQL, ESLint security plugins
- Triage findings by severity and exploitability
- Filter false positives:
  - Dead code paths (not reachable)
  - Test/fixture code
  - Mitigated by upstream controls
- Identify patterns of vulnerability (repeated mistakes)
- Check if findings are tracked in issue tracker
- Verify remediation timeline
- Cross-reference with DAST findings

**Finding Validation (Verification-First):**
- Trace code path from entry point to vulnerability
- Construct exploit scenario: can attacker reach vulnerable code?
- Verify fix: re-run SAST after remediation

**Deliverable**: Filtered SAST report with exploitability scores

---

### Phase 7: DAST Results Analysis

**Goal**: Validate dynamic testing findings for real-world exploitability.

**Actions:**
- Run OWASP ZAP baseline scan
- Nuclei scan with custom templates for application
- Manual penetration testing (authentication bypass, authorization flaws)
- Cookie/session management review
- API security testing (OWASP API Top 10)
- Test CORS misconfiguration
- Check CSRF protections
- Input validation fuzz testing
- Business logic flaws (price manipulation, workflow bypass)

**Finding Validation (Verification-First):**
- Attempt to reproduce each DAST finding in controlled environment
- Document steps to trigger vulnerability
- Verify mitigation works before remediation deadline

**Deliverable**: DAST report with reproducible exploit steps

---

### Phase 8: Infrastructure & Webhooks Audit

**Goal**: Verify hardening of servers and external callbacks.

**Actions:**
- SSH configuration review (key-only, no root login, port change)
- Firewall rules (UFW, iptables, AWS Security Groups)
- TLS certificate validation (Let's Encrypt, expiration dates)
- Kernel hardening (sysctl settings, ASLR, execshield)
- Service isolation (systemd ProtectSystem, capabilities)
- Container image scanning (Trivy, Grype)
- Kubernetes RBAC & network policies
- Webhook URL validation:
  - No internal IP ranges allowed
  - Signature verification enabled
  - Rate limiting on webhook handlers
  - Retry logic doesn't expose secrets
- VPN/bastion host security
- Log aggregation security

**Finding Validation (Verification-First):**
- Attempt SSH brute force to verify Fail2Ban
- Scan for open ports outside firewall rules
- Test TLS handshake (SSL Labs rating)
- Verify webhook signature validation (send crafted payload)

**Deliverable**: Infrastructure hardening scorecard

---

### Phase 9: LLM Vector & Prompt Injection Risk

**Goal**: Identify risks from AI/LLM usage in application.

**Actions:**
- Scan for LLM service integrations (OpenAI API, Anthropic, etc.)
- Identify all user input flowing into prompts
- Check for prompt injection vulnerabilities:
  - Unescaped user input in system prompts
  - Indirect prompt injection (via uploaded files)
  - Jailbreak attempts
- Verify API key management for LLM services
- Check token usage limits & cost controls
- Audit log retention for LLM API calls
- Data leakage risk (sensitive data in prompts?)
- Model output validation (filtering harmful/nonsensical output)
- Third-party LLM provider security assessment

**Finding Validation (Verification-First):**
- Construct prompt injection payload and test
- Verify LLM calls are logged and rate-limited
- Check if sensitive data is exposed in prompts

**Deliverable**: LLM security assessment

---

### Phase 10: Skill Supply Chain Security (SOTA Meta-Audit)

**Goal**: Audit security of SOTA skills themselves and their dependencies.

**Actions:**
- Review SKILL.md frontmatter and versioning
- Check if skills have security review process
- Audit skill dependencies (other skills they invoke)
- Scan skill code for hardcoded secrets or credentials
- Verify skill permissions model (what can they access?)
- Check skill update frequency and maintenance
- Audit custom scripts in skills for injection risks
- Verify skill signing/integrity (if applicable)
- Cross-reference skill findings with SAST/DAST

**Finding Validation (Verification-First):**
- Execute suspect skill in sandboxed environment
- Trace data flow to identify security implications

**Deliverable**: Skill security audit report

---

### Phase 11: OWASP Top 10 Mapping

**Goal**: Systematically verify controls for OWASP Top 10 risks.

**Actions:**
- A01 Broken Access Control: Authorization testing, privilege escalation
- A02 Cryptographic Failures: Encryption in transit & at rest, key management
- A03 Injection: SQLi, NoSQLi, OS command injection, LDAP injection
- A04 Insecure Design: Threat modeling, STRIDE analysis
- A05 Security Misconfiguration: Configuration drift, default passwords
- A06 Vulnerable Components: Dependency analysis (Phase 4)
- A07 Authentication Failures: Password policies, MFA, session management
- A08 Data Integrity Failures: Input validation, CSRF, XXE
- A09 Logging & Monitoring Failures: Audit trail, alerting, SIEM integration
- A10 SSRF: Server-side request forgery testing

**Deliverable**: OWASP Top 10 compliance matrix

---

### Phase 12: STRIDE Threat Modeling

**Goal**: Systematically identify threats using STRIDE framework.

**Actions:**
- Spoofing: Can attacker impersonate legitimate users/systems?
- Tampering: Can attacker modify data in transit or at rest?
- Repudiation: Can attacker deny actions they took?
- Information Disclosure: Can attacker access confidential data?
- Denial of Service: Can attacker take system offline?
- Elevation of Privilege: Can attacker gain admin/system access?

For each threat:
- Likelihood assessment
- Impact assessment
- Existing mitigations
- Recommended controls

**Deliverable**: STRIDE threat model diagram and mitigation roadmap

---

### Phase 13: Data Classification & Privacy

**Goal**: Verify data handling aligns with sensitivity levels.

**Actions:**
- Data inventory:
  - Public (non-sensitive)
  - Internal (confidential to organization)
  - Restricted (PII, payment info, health data)
  - Secret (credentials, encryption keys)
- Verify encryption for each data class:
  - At rest (AES-256, LUKS)
  - In transit (TLS 1.3)
  - In motion (secure APIs)
- Data retention policies
- Backup encryption & access control
- Data minimization: are we collecting necessary data?
- Third-party data processor contracts (DPA)
- GDPR/CCPA compliance:
  - Right to access/delete/portability
  - Consent mechanisms
  - Privacy notices
- PII handling checklist:
  - Masking/anonymization in logs
  - No PII in error messages
  - Secure disposal

**Finding Validation (Verification-First):**
- Attempt to access encrypted data without key
- Trace PII through logs and error messages
- Verify data deletion functionality

**Deliverable**: Data classification matrix with compliance checklist

---

### Phase 14: False Positive Filtering & Trend Report

**Goal**: Generate final audit with filtered false positives and security trend fingerprinting.

**Actions:**
- Consolidate findings from all 13 phases
- Filter out confirmed false positives (documented in Phase 6/7)
- Prioritize findings by:
  - Severity (CRITICAL/HIGH/MEDIUM/LOW)
  - Exploitability (easy/moderate/difficult)
  - Business impact
- Risk scoring formula: `Severity × Exploitability × Impact = Risk Score`
- Trend fingerprinting (CSO audit signature):
  - Hash of key findings for comparison to previous audits
  - Track improvement/regression over time
  - Example fingerprint: `sha256(sorted([CVEs, SAST issues, DAST issues, Config gaps]))`
- Recommendations prioritized by ROI
- Remediation timeline (30/60/90 days)
- Executive summary (C-suite focused)
- Technical deep-dive (engineering focused)

**Deliverable:**
- Executive audit report (5 pages)
- Technical detailed findings (30+ pages)
- Fingerprint hash for trend tracking
- Remediation roadmap with milestones

---

## 6. Trend Tracking & Fingerprinting

### Fingerprint-Based Security Findings

Security audit fingerprints enable detection of trends across multiple audits without manual comparison.

#### Fingerprint Generation

```python
import hashlib
import json
from datetime import datetime

class SecurityFingerprint:
    def __init__(self, audit_id: str, timestamp: datetime):
        self.audit_id = audit_id
        self.timestamp = timestamp
        self.findings = []

    def add_finding(self, category: str, severity: str, title: str, cve: str = None):
        """Add a finding to the fingerprint"""
        self.findings.append({
            'category': category,
            'severity': severity,
            'title': title,
            'cve': cve
        })

    def generate_fingerprint(self) -> str:
        """Generate SHA256 hash of sorted findings"""
        # Sort findings for consistent hashing
        sorted_findings = sorted(
            self.findings,
            key=lambda f: (f['category'], f['severity'], f['title'])
        )

        # Convert to JSON string
        findings_str = json.dumps(sorted_findings, indent=0)

        # Generate SHA256 hash
        fingerprint = hashlib.sha256(findings_str.encode()).hexdigest()
        return fingerprint

    def to_report(self) -> dict:
        """Generate fingerprint report"""
        return {
            'audit_id': self.audit_id,
            'timestamp': self.timestamp.isoformat(),
            'finding_count': len(self.findings),
            'by_severity': {
                'CRITICAL': len([f for f in self.findings if f['severity'] == 'CRITICAL']),
                'HIGH': len([f for f in self.findings if f['severity'] == 'HIGH']),
                'MEDIUM': len([f for f in self.findings if f['severity'] == 'MEDIUM']),
                'LOW': len([f for f in self.findings if f['severity'] == 'LOW'])
            },
            'by_category': self._group_by_category(),
            'fingerprint': self.generate_fingerprint()
        }

    def _group_by_category(self) -> dict:
        """Group findings by category"""
        categories = {}
        for finding in self.findings:
            cat = finding['category']
            if cat not in categories:
                categories[cat] = 0
            categories[cat] += 1
        return categories
```

#### Trend Detection Across Audits

```python
class SecurityTrendTracker:
    def __init__(self):
        self.audits = []  # List of SecurityFingerprint objects

    def add_audit(self, fingerprint: SecurityFingerprint):
        """Add audit fingerprint to tracker"""
        self.audits.append(fingerprint)

    def detect_trends(self) -> dict:
        """Detect security trends across audits"""
        if len(self.audits) < 2:
            return {'error': 'Need at least 2 audits for trend analysis'}

        # Sort by timestamp
        sorted_audits = sorted(self.audits, key=lambda a: a.timestamp)

        # Compare consecutive audits
        trends = {
            'improving': [],
            'regressing': [],
            'stable': [],
            'fingerprint_changes': []
        }

        for i in range(len(sorted_audits) - 1):
            current = sorted_audits[i]
            next_audit = sorted_audits[i + 1]

            current_report = current.to_report()
            next_report = next_audit.to_report()

            # Compare severity distribution
            severity_change = self._compare_severities(current_report, next_report)

            # Compare fingerprints
            fp_change = current.generate_fingerprint() != next_audit.generate_fingerprint()

            change_record = {
                'from_audit': current.audit_id,
                'to_audit': next_audit.audit_id,
                'timestamp_diff_days': (next_audit.timestamp - current.timestamp).days,
                'severity_change': severity_change,
                'fingerprint_changed': fp_change
            }

            # Classify trend
            if severity_change['total'] < 0:  # Fewer findings
                trends['improving'].append(change_record)
            elif severity_change['total'] > 0:  # More findings
                trends['regressing'].append(change_record)
            else:
                trends['stable'].append(change_record)

            trends['fingerprint_changes'].append(change_record)

        return trends

    def _compare_severities(self, current: dict, next_audit: dict) -> dict:
        """Compare severity counts between audits"""
        return {
            'CRITICAL': next_audit['by_severity']['CRITICAL'] - current['by_severity']['CRITICAL'],
            'HIGH': next_audit['by_severity']['HIGH'] - current['by_severity']['HIGH'],
            'MEDIUM': next_audit['by_severity']['MEDIUM'] - current['by_severity']['MEDIUM'],
            'LOW': next_audit['by_severity']['LOW'] - current['by_severity']['LOW'],
            'total': next_audit['finding_count'] - current['finding_count']
        }

    def generate_trend_report(self) -> dict:
        """Generate comprehensive trend report"""
        trends = self.detect_trends()

        return {
            'period': {
                'start': self.audits[0].timestamp.isoformat(),
                'end': self.audits[-1].timestamp.isoformat(),
                'audit_count': len(self.audits)
            },
            'trends': trends,
            'recommendations': self._generate_recommendations(trends)
        }

    def _generate_recommendations(self, trends: dict) -> list:
        """Generate recommendations based on trends"""
        recommendations = []

        if trends['regressing']:
            recommendations.append({
                'priority': 'HIGH',
                'action': 'Security posture is regressing. Review recent changes and rollback if necessary.'
            })

        if not trends['improving']:
            recommendations.append({
                'priority': 'MEDIUM',
                'action': 'No security improvements detected. Increase remediation efforts.'
            })

        return recommendations

# Usage Example
if __name__ == '__main__':
    # Create two audit fingerprints
    audit1 = SecurityFingerprint('audit-2024-01', datetime(2024, 1, 15))
    audit1.add_finding('SAST', 'CRITICAL', 'SQL Injection in user search', 'CVE-2024-1234')
    audit1.add_finding('Dependency', 'HIGH', 'Outdated Log4j', 'CVE-2021-44228')
    audit1.add_finding('Config', 'MEDIUM', 'SSH password auth enabled')

    audit2 = SecurityFingerprint('audit-2024-02', datetime(2024, 2, 15))
    audit2.add_finding('Dependency', 'HIGH', 'Outdated Log4j', 'CVE-2021-44228')
    audit2.add_finding('Config', 'MEDIUM', 'SSH password auth enabled')

    # Track trends
    tracker = SecurityTrendTracker()
    tracker.add_audit(audit1)
    tracker.add_audit(audit2)

    # Generate report
    trend_report = tracker.generate_trend_report()
    print(json.dumps(trend_report, indent=2))
```

#### CSO Dashboard Metrics

```python
class CSODashboard:
    """Executive dashboard for security metrics"""

    def __init__(self, fingerprints: list):
        self.fingerprints = fingerprints

    def get_executive_summary(self) -> dict:
        """High-level security posture summary"""
        latest = self.fingerprints[-1] if self.fingerprints else None

        if not latest:
            return {'error': 'No audit data'}

        report = latest.to_report()

        return {
            'security_score': self._calculate_score(report),
            'critical_count': report['by_severity']['CRITICAL'],
            'high_count': report['by_severity']['HIGH'],
            'risk_level': self._classify_risk(report),
            'trend': self._get_trend(),
            'last_audit': latest.timestamp.isoformat(),
            'next_audit_due': self._next_audit_date(latest.timestamp).isoformat()
        }

    def _calculate_score(self, report: dict) -> int:
        """Calculate security score 0-100"""
        max_points = 100
        critical_penalty = report['by_severity']['CRITICAL'] * 10
        high_penalty = report['by_severity']['HIGH'] * 5
        medium_penalty = report['by_severity']['MEDIUM'] * 2

        score = max(0, max_points - critical_penalty - high_penalty - medium_penalty)
        return score

    def _classify_risk(self, report: dict) -> str:
        """Classify overall risk level"""
        critical = report['by_severity']['CRITICAL']
        high = report['by_severity']['HIGH']

        if critical > 0:
            return 'CRITICAL'
        elif high > 3:
            return 'HIGH'
        elif high > 0:
            return 'MEDIUM'
        else:
            return 'LOW'

    def _get_trend(self) -> str:
        """Get trend from last 2 audits"""
        if len(self.fingerprints) < 2:
            return 'UNKNOWN'

        prev_count = self.fingerprints[-2].to_report()['finding_count']
        curr_count = self.fingerprints[-1].to_report()['finding_count']

        if curr_count < prev_count:
            return 'IMPROVING'
        elif curr_count > prev_count:
            return 'REGRESSING'
        else:
            return 'STABLE'

    def _next_audit_date(self, last_audit: datetime) -> datetime:
        """Calculate next audit date (quarterly)"""
        from datetime import timedelta
        return last_audit + timedelta(days=90)
```

---

## Summary

**security-ops** consolidates four critical security disciplines:

1. **Infrastructure Hardening** — SSH, firewall, TLS, kernel, systemd isolation
2. **DevSecOps Pipeline** — SAST, DAST, SCA, container scanning, CI/CD gates, signing
3. **Supply Chain Security** — Dependency pinning, SBOM, signed commits, Cosign
4. **Incident Response** — Classification, playbooks, communication, evidence preservation, post-mortems

**New Additions:**
- **CSO Audit Structure** — 14-phase comprehensive security audit from reconnaissance to trend tracking
- **Fingerprint-Based Trending** — SHA256 fingerprints of findings enable rapid comparison across audit cycles, trend detection (improving/regressing/stable), and CSO dashboard metrics
- **Verification-First Methodology** — Every finding requires exploit scenario validation and active code tracing before remediation

All phases are ready for immediate use in Phase 6 deployment and security operations workflows.

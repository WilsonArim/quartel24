---
name: security-design
phase: 2
always_active: false
absorbs: SECURITY/threat-modeling, SECURITY/compliance-privacy
description: "Design-time security — threats, STRIDE, GDPR, PII, privacy by design, attack surface mapping, data classification, and regulatory compliance"
keywords: [ameaca, threat, STRIDE, modelo-ameaca, superficie-ataque, GDPR, privacidade, PII, LGPD, CCPA, compliance, classificacao-dados, attack-surface, privacy-by-design]
---

# Security Design

> Phase 2 — Security at the architecture level, before code is written. Integrates threat modeling, compliance requirements, data classification, and privacy principles into system architecture.

---

## 1. Threat Modeling (STRIDE)

### STRIDE Framework

Framework para identificar seis categorias de ameacas:

#### Spoofing (Falsificacao de Identidade)

Atacante pretende ser alguem que nao eh.

**Exemplo:**
- Falsificar JWT token
- Enganar verificacao de email
- Usar identidade falsa em API
- Falsificar origem em chamadas servico-a-servico

**Controles:**
- Autenticacao forte (MFA, biometria)
- Validacao de origem (TLS, assinatura digital)
- Rate limiting em tentativas de login
- Certificados X.509 para comunicacao servico-a-servico

**Questoes:**
- Como o usuario eh identificado?
- Pode a identidade ser falsificada?
- Como validar identidade de servico-a-servico?
- Que mecanismos impedem token forgery?

#### Tampering (Adulteracao de Dados)

Atacante modifica dados durante transmissao ou armazenamento.

**Exemplo:**
- Modificar requisicao HTTP (man-in-the-middle)
- Alterar dados no database
- Modificar arquivo de configuracao
- Alterar query parameters em URL

**Controles:**
- Encriptacao (TLS 1.3 em transit)
- Integridade (HMAC, assinatura digital)
- Controle de acesso (quem pode modificar)
- Validacao de checksums em dados criticos

**Questoes:**
- Dados sao transmitidos em plaintext?
- Ha validacao de integridade?
- Quem pode modificar dados criticos?
- Como detectar tampering depois de acontecer?

#### Repudiation (Repudio)

Atacante nega ter realizado uma acao.

**Exemplo:**
- Usuario nega ter feito transferencia bancaria
- Admin nega ter deletado dados
- Ninguem sabe quem fez mudanca no sistema

**Controles:**
- Auditoria completa (quem, quando, o que, resultado)
- Assinatura digital (prova criptografica)
- Logs imutaveis (WORM - Write Once Read Many)
- Timestamps sincronizados (NTP)

**Questoes:**
- Todas as acoes sao registradas?
- Ha prova de autoria (assinatura)?
- Logs podem ser alterados/deletados?
- Como provar que alguem fez uma acao?

#### Information Disclosure (Divulgacao de Informacao)

Dados sensiveis sao expostos a usuario nao autorizado.

**Exemplo:**
- Erro expoe caminho de arquivo ou versao de software
- Logs contem senhas em plaintext
- API retorna dados de outro usuario (IDOR)
- Dados em cache nao eh criptografado
- Informacao estrutural revelada em mensagens de erro

**Controles:**
- Encriptacao at-rest para dados sensiveis
- Sanitizar mensagens de erro
- Masking/redaction em logs
- Validacao de autorizacao (authorization checks)
- Caching seguro (nao guardar PII em cache publica)

**Questoes:**
- Dados sensiveis sao encriptados?
- Mensagens de erro revealam informacao estrutural?
- Usuarios podem acessar dados de outros?
- Existe information leakage em timing attacks?

#### Denial of Service (Negacao de Servico)

Atacante torna servico indisponivel para usuarios legitimos.

**Exemplo:**
- Enviar muitos requests (DDoS)
- Consumir toda memoria de servidor
- Algoritmo de busca ineficiente (ReDoS em regex)
- Zerar database
- Criar loops infinitos em processamento

**Controles:**
- Rate limiting
- Auto-scaling (handle picos de traffic)
- Input validation (prevenir algoritmos O(n²))
- Backups e disaster recovery
- WAF (Web Application Firewall)
- Timeouts em operacoes custosas

**Questoes:**
- Servico pode ser sobrecarregado com requests?
- Usuarios podem consumir recursos indefinidamente?
- Ha fallback se recurso principal cair?
- Regex patterns sao vulneraveis a ReDoS?

#### Elevation of Privilege (Escalacao de Privilegio)

Usuario de baixo privilegio ganha acesso de alto privilegio.

**Exemplo:**
- Usuario regular se torna admin
- Bug permite bypass de autorizacao
- Credencial de servico esta muito permissiva
- IDOR permite modificar parametros de outro usuario
- Vulnerabilidade permite carregar arquivo como admin

**Controles:**
- Validacao rigorosa de autorizacao (authorization checks em toda mudanca)
- Separacao de responsabilidades (principle of least privilege)
- Input validation (prevenir injection)
- Auditoria de permissoes

**Questoes:**
- Existe validacao de autorizacao antes de operacoes sensiveis?
- Qual eh o escopo de cada credencial/token?
- Usuarios podem modificar parametros pra escalate privilege?
- Como testar que escalacao eh impossivel?

### Threat Modeling na Design Phase

#### Quando fazer threat modeling

Obrigatorio no inicio de:
- Nova feature principal (especialmente data-heavy)
- Mudanca de arquitetura
- Integracao com sistema terceiro
- Mudanca significativa em dados sensveis
- Qualquer novidade em autenticacao/autorizacao

**Trigger para automacao:** Se novo arquivo em `features/` → Re-threat-model obrigatorio

#### Threat Model Template

```markdown
# Threat Model: [Feature Name]

## Overview
[1-2 paragraphs describing the feature and scope]

## Architecture
[DFD or architecture diagram]

## Trust Boundaries
```
[User] ---|HTTPS|--- [API] ---|Encrypted| --- [Database]
           Trust boundary here ^
```

## STRIDE Analysis

### Spoofing
- **Threat:** Attacker impersonates user via JWT token forgery
  - Likelihood: MEDIUM (requires secret key)
  - Impact: HIGH (access other user's data)
  - Risk: MEDIUM-HIGH
  - Mitigation: Strong JWT secret, short expiration, refresh token rotation

### Tampering
- **Threat:** Man-in-the-middle modifies order amount
  - Likelihood: LOW (HTTPS prevents, but BREACH possible)
  - Impact: CRITICAL (wrong charges)
  - Risk: MEDIUM
  - Mitigation: TLS 1.3, HSTS headers, HMAC on sensitive fields

### Repudiation
- **Threat:** User denies making purchase
  - Likelihood: MEDIUM (customers do this)
  - Impact: MEDIUM (financial loss, customer dispute)
  - Risk: MEDIUM
  - Mitigation: Signed order confirmation, audit log, email receipt

### Information Disclosure
- **Threat:** API error reveals database structure
  - Likelihood: HIGH (common coding error)
  - Impact: LOW (helps reconnaissance)
  - Risk: MEDIUM
  - Mitigation: Generic error messages, sanitize logs

### Denial of Service
- **Threat:** Attacker floods checkout endpoint with requests
  - Likelihood: MEDIUM (easy to automate)
  - Impact: HIGH (customers can't purchase)
  - Risk: HIGH
  - Mitigation: Rate limiting, DDoS protection, auto-scaling

### Elevation of Privilege
- **Threat:** Regular user modifies 'user_id' parameter to access other account
  - Likelihood: HIGH (common vulnerability)
  - Impact: CRITICAL (complete account takeover)
  - Risk: CRITICAL
  - Mitigation: Server-side authorization checks, never trust client-side IDs

## Action Items
| Threat | Risk | Mitigation | Owner | Due |
|--------|------|-----------|-------|-----|
| SQL Injection | CRITICAL | Use parameterized queries | Backend team | Sprint N |
| Elevation | CRITICAL | Add authz checks | Backend team | Sprint N |
| DDoS | HIGH | Rate limiting + WAF | Platform | Sprint N+1 |
| Info Disclosure | MEDIUM | Generic errors | Backend | Sprint N+1 |

## Approval
Reviewed by: [Security lead]
Approved: [Date]
```

---

## 2. Data Flow Diagrams (DFD)

Desenhar fluxo de dados mostra pontos de ameaca e limites de confianca.

### DFD simples: Autenticacao

```
[User Browser]
     |
     | username/password (HTTPS)
     v
[Web Server]
     |
     | SQL query (parameterized)
     v
[User Database]

Elementos:
- Entities: [brackets] - usuarios, sistemas externos
- Processes: (parenteses) - o que acontece
- Data Stores: [=====] - databases, caches
- Data Flows: arrows com labels (proteccao indicada)
```

### DFD completo: E-commerce

```
[User]
  |
  | HTTP request (HTTPS)
  v
[Web Server] (1)
  |        |
  | SQL    | JSON
  v        v
[Product DB]  [Cache]
             |
             | (2) Charge card
             v
         [Stripe API]

[Admin] <-- (3) Admin interface (MFA required)
```

### Trust Boundaries

Definir limites entre componentes confiados e nao confiados.

```
TRUSTED ZONE          |     UNTRUSTED ZONE
- Our code            |     - User input
- Our database        |     - External APIs
- Internal network    |     - Third-party libraries
- Cryptographic keys  |     - Network packets
                      |     - Cookies/localStorage
         BOUNDARY -----
         (Apply security controls)
```

**Exemplo de analise com trust boundaries:**

```
[User Mobile App] <-- UNTRUSTED (pode ser modificada)
        |
        | [HTTPS] - VALIDATED
        v
[API Gateway] <-- TRUSTED (nossa infraestrutura)
        |
        | [JSON-RPC internal]
        v
[Backend Services]
        |
        | [SQL parameterized]
        v
[Database]

Actions at boundaries:
- Validate all input from User App
- Sanitize before passing to Database
- Encrypt sensitive data crossing network
- Authenticate and authorize on each boundary
```

---

## 3. Attack Surface Mapping

Systematic identification and classification of all entry points and data flows where an attacker could interact with the system.

### Entry Points (Ingress)

Lista completa de como dados entram no sistema:

**API Endpoints:**
- `/api/auth/login` — autenticacao
- `/api/users/profile` — dados usuario
- `/api/payments/checkout` — pagamentos
- `/api/webhooks/stripe` — externos (Stripe)

**Web Interfaces:**
- User dashboard (public URL)
- Admin console (requires MFA)
- Support portal (public + auth)

**File Uploads:**
- Profile pictures
- Document uploads
- CSV imports

**External Integrations:**
- Payment processor webhooks
- Email service callbacks
- Social login (OAuth)

**Configuration Sources:**
- Environment variables
- Configuration files
- Secrets vault
- Feature flags service

**Network Protocols:**
- DNS records (zone transfer?)
- SSH access (bastion hosts)
- Database connections (tunnel?)

### Data Sources

Clasificar origem de cada stream de dados:

```
User Input (UNTRUSTED):
├─ Form fields
├─ URL parameters
├─ Headers (User-Agent, etc)
├─ Cookies
├─ POST body
└─ File uploads

Configuration (SEMI-TRUSTED):
├─ Environment variables (.env)
├─ Config files (config.yaml)
├─ Database seeding
└─ Feature flags

External APIs (UNTRUSTED):
├─ Stripe webhook
├─ OAuth provider response
├─ Third-party data feeds
└─ CDN headers

Internal Systems (TRUSTED):
├─ Our database
├─ Our cache (Redis)
└─ Internal microservices
```

### Processing Points

Onde dados sao transformados/usados:

```
1. Entrada → Authentication
   ├─ Username/password validation
   ├─ JWT signature check
   └─ Session lookup

2. Validacao → Authorization
   ├─ Check user role
   ├─ Check resource ownership
   └─ Check permission level

3. Transformacao → Business Logic
   ├─ Discount calculations
   ├─ Email parsing
   └─ Data aggregation

4. Persistencia → Data Storage
   ├─ Database insert
   ├─ Cache update
   └─ File write

5. Saida → Response Generation
   ├─ JSON serialization
   ├─ HTML rendering
   └─ Error message formatting
```

### Data Storage

Onde dados residem:

```
Database (Primary):
├─ User table
├─ Product table
├─ Transaction table
└─ Audit log table

Cache (Temporary):
├─ Session cache (Redis)
├─ Query results (Memcached)
└─ Rate limit counters

File Storage:
├─ User uploads (S3 bucket)
├─ Backups (AWS backup vault)
└─ Logs (CloudWatch, ELK)

Secrets Vault:
├─ Database password
├─ API keys
├─ JWT secret
└─ Encryption keys
```

### Output Channels

Como dados saem do sistema:

```
User-Facing:
├─ API responses (JSON)
├─ Web pages (HTML)
├─ Error messages
└─ Email notifications

Monitoring/Logging:
├─ Application logs
├─ Security logs
├─ Audit trail
└─ Metrics (Prometheus)

Third-Party:
├─ Stripe (payment info)
├─ SendGrid (emails)
├─ Datadog (monitoring data)
└─ S3 (backups)
```

### Attack Surface Scoring

Para cada entry point, classificar risco:

```
Risco = Likelihood × Impact

HIGH RISK (Likelihood=HIGH, Impact=HIGH):
- Public API without rate limiting
- File upload without validation
- SQL injection vulnerability

MEDIUM RISK:
- Admin endpoint with weak auth
- Information disclosure in errors
- Weak password policy

LOW RISK:
- Rate limited endpoint
- Sanitized output
- Properly validated input
```

---

## 4. Data Classification

Estabelecer niveis de protecao para diferentes tipos de dados.

### Classification Levels

```
RESTRICTED (Critico)
├─ User passwords (plaintext or hashes requiring secrecy)
├─ API keys and authentication tokens
├─ Financial account numbers
├─ SSN/CPF/Passport numbers
├─ Medical records
├─ Biometric data
├─ Multi-factor authentication codes
├─ Encryption keys and key material
└─ Private keys (SSH, TLS)

CONFIDENTIAL (Alto)
├─ Customer email addresses
├─ User IP addresses
├─ Transaction history
├─ Browsing behavior and behavior analytics
├─ Location data
├─ Usage analytics per user (PII-linked)
├─ Usernames and display names
├─ Phone numbers
└─ Payment method details (last 4 digits only)

INTERNAL (Medio)
├─ Product roadmap
├─ Financial projections
├─ Employee information
├─ Internal documentation
├─ Source code (if not public)
├─ Infrastructure diagrams
└─ Aggregate statistics (no PII)

PUBLIC (Baixo)
├─ Marketing materials
├─ Public documentation
├─ General statistics
├─ Published articles
├─ Product descriptions
└─ Feature announcements
```

### Protection Policies by Classification

```yaml
# data_classification.yaml

RESTRICTED:
  encryption: "AES-256 at rest, TLS 1.3 in transit"
  access_control: "Need-to-know basis, signed approval required"
  retention: "Minimum necessary (usually days/weeks)"
  logging: "All access logged and monitored in real-time"
  deletion: "Secure wipe (7-pass overwrite or cryptographic erase)"
  backups: "Encrypted backups, tested recovery, separate encryption keys"
  audit: "Quarterly access review"
  example: "passwords, API keys"

CONFIDENTIAL:
  encryption: "AES-256 at rest, TLS in transit"
  access_control: "Role-based, audit trail maintained"
  retention: "As per privacy policy (usually months)"
  logging: "Sampled access logging (not every access)"
  deletion: "Standard delete + eventual overwrite"
  backups: "Encrypted backups, automatic retention"
  audit: "Monthly retention verification"
  example: "user emails, transaction history"

INTERNAL:
  encryption: "At rest if on shared systems or cloud"
  access_control: "Employee/contractor only"
  retention: "Project-based (years for compliance)"
  logging: "No individual logging required"
  deletion: "Standard delete when project ends"
  backups: "Standard corporate backup policy"
  audit: "Annual documentation review"
  example: "product roadmap, financial projections"

PUBLIC:
  encryption: "Not required"
  access_control: "Open access"
  retention: "Indefinite"
  logging: "No logging required"
  deletion: "Delete when superseded or outdated"
  backups: "Standard web backup (version control)"
  audit: "No audit required"
  example: "marketing materials, documentation"
```

### Implementation in Code

**Database Schema Tagging:**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    -- RESTRICTED
    password_hash VARCHAR(255) COMMENT 'RESTRICTED: bcrypt hash',
    -- CONFIDENTIAL
    email VARCHAR(255) COMMENT 'CONFIDENTIAL: encrypted at rest',
    phone VARCHAR(20) COMMENT 'CONFIDENTIAL: encrypted at rest',
    -- INTERNAL
    signup_date TIMESTAMP COMMENT 'INTERNAL: for analytics',
    -- PUBLIC
    username VARCHAR(100) COMMENT 'PUBLIC: displayed on profile'
);
```

**Environment Variable Classification:**

```bash
# .env.example

# RESTRICTED - Never commit actual values
DATABASE_PASSWORD=***RESTRICTED***
JWT_SECRET=***RESTRICTED***
STRIPE_SECRET_KEY=***RESTRICTED***
ENCRYPTION_KEY=***RESTRICTED***

# CONFIDENTIAL - Treat as sensitive
SENDGRID_API_KEY=***CONFIDENTIAL***
AWS_ACCESS_KEY=***CONFIDENTIAL***

# INTERNAL - Business sensitive
FEATURE_FLAG_SERVICE_URL=http://localhost:3000
ANALYTICS_ENDPOINT=https://analytics.internal

# PUBLIC - Can be shared
APP_NAME=MyApp
VERSION=1.0.0
```

### Data Classification in Privacy Reviews

```
Before storing new data, ask:
1. What classification does it fall into?
2. Is encryption required based on classification?
3. Who needs access? (Role-based control)
4. How long to retain?
5. How to delete securely?
6. Does it require user consent?
7. How to respond to user requests for this data?
```

---

## 5. Risk Assessment Matrix

Matriz de Probabilidade × Impacto:

```
              LOW                MEDIUM              HIGH
           Impact = 1-3        Impact = 4-6        Impact = 7-10

HIGH      [MEDIUM]           [HIGH]              [CRITICAL]
Prob=0.7-1.0


MEDIUM    [LOW]              [MEDIUM]            [HIGH]
Prob=0.4-0.7


LOW       [LOW]              [LOW]               [MEDIUM]
Prob=0.1-0.4

Exemplo:
SQL Injection:
  - Likelihood: 0.8 (comum, many endpoints)
  - Impact: 9 (all database exposed)
  - Risk = 0.8 × 9 = 7.2 = HIGH/CRITICAL
  - Mitigation: Parameterized queries, input validation

Weak password:
  - Likelihood: 0.6 (some users will choose weak)
  - Impact: 7 (account compromise)
  - Risk = 0.6 × 7 = 4.2 = MEDIUM
  - Mitigation: Password policy, MFA
```

---

## 6. GDPR & Compliance

### Sete Principios do GDPR

1. **Lawfulness, Fairness, Transparency**
   - Dados processados apenas com base legal (consentimento, contrato, obrigacao legal, etc)
   - Justo para o individuo (nao surpreendente)
   - Transparencia na coleta ("privacy notice" clara)

2. **Purpose Limitation**
   - Dados coletados apenas para proposito declarado
   - Nao pode reusar para proposito diferente sem novo consentimento

3. **Data Minimization**
   - Coletar apenas dados necessarios
   - Se nao precisa de CPF, nao coleta

4. **Accuracy**
   - Manter dados acurados
   - Permitir que usuario corrija dados incorretos

5. **Storage Limitation**
   - Guardar dados apenas pelo tempo necessario
   - Nao indefinidamente "just in case"
   - Politica de retencao documentada

6. **Confidentiality & Integrity (Security)**
   - Proteger dados contra acesso nao autorizado
   - Criptografia, controle de acesso, etc

7. **Accountability**
   - Demonstrar compliance
   - Manter registros de consentimento
   - Data Protection Impact Assessment (DPIA) para processamento novo

### Consentimento Valido

Consentimento deve ser:
- **Granular**: Consentir para marketing é diferente de consentir para analytics
- **Ativo**: Sem pre-checked boxes (opt-in, nao opt-out)
- **Documentado**: Guardar prova de consentimento com timestamp
- **Revogavel**: Usuario pode retirar consentimento facilmente

**Implementacao:**

```javascript
// consentimento.js
function recordConsent(userId, consentType, value) {
    const record = {
        user_id: userId,
        consent_type: consentType,  // 'marketing', 'analytics', 'personalization'
        given: value,               // true or false
        timestamp: new Date().toISOString(),
        ip_address: getClientIP(),  // para prova
        user_agent: navigator.userAgent
    };

    // Guardar em database com protecao
    saveConsentRecord(record);

    // Garantir que dados so sao processados se consentimento = true
    if (consentType === 'marketing' && !value) {
        disableMarketingPixels();
    }
}

// Ao revogar consentimento
function revokeConsent(userId, consentType) {
    // 1. Parar novo processamento
    // 2. Nao precisa deletar dados historicos (processamento era legal na epoca)
    // 3. Mas parar enviando marketing email
}
```

### Right to Erasure (Direito ao Esquecimento)

Quando usuario solicita delecao:

```sql
-- Delete PII do usuario
DELETE FROM users WHERE id = $1;
DELETE FROM user_events WHERE user_id = $1;
DELETE FROM marketing_lists WHERE user_id = $1;

-- Anonimizar dados historicos necessarios por compliance
UPDATE transactions
SET user_id = NULL,
    user_name = 'ANONYMIZED',
    user_email = 'ANONYMIZED'
WHERE user_id = $1;

-- Guardar auditoria que delecao foi realizada
INSERT INTO audit_log (action, target, timestamp)
VALUES ('user_deletion_request', $1, NOW());
```

**Excecoes (nao precisa deletar):**
- Dados necessarios para cumprir obrigacao legal (contabil)
- Dados necessarios para defesa judicial
- Dados anonimizados (nao pode ser rastreado ate individuo)

### Data Protection Officer (DPO)

**Obrigatorio se:**
- Processamento em larga escala de dados sensiveis
- Processamento sistematico de dados pessoais
- Autoridade publica (governo)

**Responsabilidades do DPO:**
- Monitorar compliance
- Recepcionar data subject requests
- Coordenar DPIA para novo processamento
- Liaison com reguladores

---

## 7. PII Handling

### Criptografia de dados em repouso

```python
# pii_encryption.py
from cryptography.fernet import Fernet
import os

class PIIEncryptor:
    def __init__(self):
        # Guardar chave em vault ou Key Management Service
        self.key = os.environ['PII_ENCRYPTION_KEY'].encode()
        self.cipher = Fernet(self.key)

    def encrypt_email(self, email):
        """Criptografar antes de salvar no database"""
        return self.cipher.encrypt(email.encode()).decode()

    def decrypt_email(self, encrypted):
        """Desencriptar apenas quando necessario"""
        return self.cipher.decrypt(encrypted.encode()).decode()

# Database schema
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String(255))  # Criptografado
    phone = Column(String(255))  # Criptografado

    # Indice searchable (hash)
    email_hash = Column(String(255), unique=True, index=True)
```

### Masking em logs

Nunca logar PII em plaintext:

```javascript
// logger.js
function sanitizeForLogging(data) {
    const sanitized = JSON.parse(JSON.stringify(data));

    // Mascarar patterns conhecidos
    if (sanitized.email) {
        sanitized.email = sanitized.email.replace(
            /([^@]{2})[^@]*(@.+)/,
            '$1***$2'  // user@***@example.com
        );
    }

    if (sanitized.phone) {
        sanitized.phone = sanitized.phone.replace(
            /(\d{2})\d{4}(\d{4})/,
            '$1****$2'  // 11****1234
        );
    }

    if (sanitized.cpf) {
        sanitized.cpf = '***.***.***-**';
    }

    if (sanitized.password) {
        delete sanitized.password;  // Nunca logar
    }

    return sanitized;
}

// Uso
logger.info('User login attempt', sanitizeForLogging({
    email: 'user@example.com',
    password: 'secret',  // Sera deletado
    timestamp: new Date()
}));
```

### Data Retention Policies

Estabelecer prazos claros:

```
User Account Data:
  - While active: Keep
  - On account deletion: Secure delete immediately
  - Anonymized logs: Keep 12 months for analytics

Customer Communications:
  - Email (support): Keep 3 years for dispute resolution
  - Chat (support): Keep 1 year
  - Complaint records: Keep 5 years

Marketing Data:
  - Email list: Keep while active + 30 days post-unsubscribe
  - Browsing cookies: 12 months
  - Marketing consent: Keep indefinitely for compliance proof

Financial Data:
  - Transaction records: Keep 7 years (tax/legal)
  - Invoice: Keep 7 years
  - Payment method: Delete after transaction + 2 months

System Logs:
  - Access logs: Keep 90 days
  - Error logs: Keep 30 days
  - Security logs: Keep 12 months
  - Audit logs: Keep 5+ years
```

**Script de retencao automatica:**

```sql
-- Delete expired data automatically
DELETE FROM marketing_emails
WHERE created_at < NOW() - INTERVAL '30 days'
  AND unsubscribed = true;

DELETE FROM session_logs
WHERE created_at < NOW() - INTERVAL '90 days';

-- Anonimizar dados vencidos
UPDATE user_analytics
SET user_id = NULL, user_email = 'REDACTED'
WHERE created_at < NOW() - INTERVAL '12 months';

-- Garantir consistencia
SELECT COUNT(*) FROM users WHERE id IN (
    SELECT user_id FROM deleted_users
);
```

---

## 8. Cookie Consent

### Consentimento valido para cookies

```html
<!-- cookie_banner.html -->
<div id="cookie-banner" class="cookie-banner">
  <p>We use cookies for analytics and marketing.
     <a href="/privacy">Learn more</a></p>

  <!-- Granular choices (nao pre-checked) -->
  <label>
    <input type="checkbox" name="essential" disabled checked>
    Essential Cookies (required)
  </label>

  <label>
    <input type="checkbox" name="analytics">
    Analytics Cookies (to improve experience)
  </label>

  <label>
    <input type="checkbox" name="marketing">
    Marketing Cookies (personalized ads)
  </label>

  <button onclick="acceptAll()">Accept All</button>
  <button onclick="acceptSelected()">Accept Selected</button>
  <button onclick="rejectNonEssential()">Reject Non-Essential</button>
</div>

<script>
function acceptSelected() {
    const consent = {
        essential: true,
        analytics: document.querySelector('[name="analytics"]').checked,
        marketing: document.querySelector('[name="marketing"]').checked,
        timestamp: new Date().toISOString()
    };

    // Enviar para server para guardar
    fetch('/api/consent', {
        method: 'POST',
        body: JSON.stringify(consent)
    });

    // Carregar cookies apenas se consentimento foi dado
    if (consent.analytics) {
        loadGoogleAnalytics();
    }
    if (consent.marketing) {
        loadFacebookPixel();
    }
}
</script>
```

---

## 9. Privacy by Design

Aplicar desde o inicio do projeto:

```
Etapa 1: Conceito
- Qual eh o proposito do processamento?
- Qual base legal? (consentimento, contrato, obrigacao legal)
- Que dados sao realmente necessarios?
- Por quanto tempo guardar?

Etapa 2: Design
- Minimizar dados (pseudonymization/anonymization)
- Encriptar desde o inicio
- Default para opcoes mais privadas
- Planejar direitos de usuario (acesso, correcao, delecao)

Etapa 3: Implementacao
- Encriptar tudo em transit e rest
- Audit logging de acessos
- Validacao de consentimento
- Testar controles

Etapa 4: Manutencao
- Revisar dados armazenados periodicamente
- Deletar dados expirados
- Testar direitos de usuario (DSAR)
- Manter compliance
```

**Exemplo: Feature nova de personalizacao**

```
Problema: Quer recomendar produtos baseado em historico de usuario

Privacidade by Design:
1. Dados: Precisa apenas de product_id + timestamp, nao nome de usuario
2. Retencao: Guardar apenas 12 meses (nao indefinidamente)
3. Consentimento: Novo consentimento granular para recomendacoes
4. Anonimizacao: Apos 12 meses, converter para dados anonimos para ML training
5. Direitos: Usuario pode visualizar e deletar historico

Implementacao:
- Criptografar user_id em analytics table (ja eh de RESTRICTED classification)
- Criar separada anonymized_events table para dados vencidos
- API endpoint /my-data/recommendations para usuario ver
- API endpoint DELETE /my-data para revogar historico
```

---

## 10. Data Processing Agreements (DPA)

Quando usar servicos terceiros (AWS, Stripe, etc):

```
Acordo obrigatorio especificar:

1. Finalidade: O que dados serao usados
2. Duracao: Por quanto tempo
3. Natureza: Quais tipos de dados
4. Escopo: Quantos usuarios/registros
5. Processador: Quem pode acessar
6. Sub-processadores: Outras empresas que tenham acesso

Exemplo: Using Stripe for payments

Data Subject: Customer
Data Controller: Your company (decides para que dados usados)
Data Processor: Stripe (processa em nome seu)

DPA Components:
- Stripe processes payment data (PAN, expiry) - nao pode usar para outro proposito
- Stripe guardar dados por 3+ anos para compliance
- Stripe usa sub-processadores [AWS, etc] - deve estar documentado
- Data security: Stripe faz encriptografia, controle de acesso
- Your responsibility: Nao exceder escopo consentido
```

**Template minimo de DPA:**

```
DATA PROCESSING AGREEMENT

Between: [Your Company] (Controller)
And: [Vendor] (Processor)

Personal Data:
- Categories: [emails, payment info, etc]
- Scope: [All customers, beta users only, etc]
- Duration: [Project duration, contract term, etc]

Processing Instructions:
- Vendor SHALL: Only process as directed
- Vendor SHALL: Implement technical and organizational measures
- Vendor SHALL: Assist with DSAR, deletion requests
- Vendor SHALL: Sub-processor list: [attached]

Security:
- Vendor responsible for: [Encryption, access control, etc]
- Vendor shall notify of breach within 48 hours
- Vendor shall assist with incident response

Sub-processing:
- No new sub-processor without written approval
- Controller may object to new sub-processor

Signature: [Date]
```

---

## 11. International Data Transfers

Se transferir dados entre paises:

### EU -> US (after Schrems II)
- Standard Contractual Clauses (SCC) com US vendor
- Plus: Supplementary measures (encriptografia, etc) se dados em cloud publica

### EU -> Non-adequacy country
- Standard Contractual Clauses (SCC)
- Or Binding Corporate Rules (BCR) se multi-empresa
- Additional safeguards na contrato

**Exemplo: AWS Data Processing Addendum (DPA)**
```
AWS oferece modelo de SCC
Your Company deve assinar no AWS Contract Management Console
Garante que dados em EU sao processados em conformidade
```

---

## 12. Data Subject Access Requests (DSAR)

Usuario pode solicitar: "Quais dados voce tem sobre mim?"

**Processamento obrigatorio:**

```python
# dsar_handler.py
from datetime import datetime, timedelta

class DSARHandler:
    def __init__(self, user_id, request_date):
        self.user_id = user_id
        self.request_date = request_date
        self.response_deadline = request_date + timedelta(days=30)

    def gather_data(self):
        """Coleta TODOS dados associados ao usuario"""
        return {
            'profile': self.get_user_profile(),
            'emails': self.get_user_emails(),
            'activity': self.get_user_activity(),
            'preferences': self.get_user_preferences(),
            'payments': self.get_user_payments(),
            'communications': self.get_user_communications(),
        }

    def get_user_profile(self):
        """Incluir TODOS campos, mesmo que nao sao normalmente vistos"""
        return db.query(User).filter(User.id == self.user_id).first()

    def get_user_activity(self):
        """Incluir events, logs, etc"""
        return db.query(UserEvent).filter(
            UserEvent.user_id == self.user_id
        ).all()

    def format_response(self, data):
        """Formato acessivel (CSV, JSON, XML)"""
        # GDPR requer formato estruturado e legivel
        # Nao pode ser raw database dump
        return {
            'format': 'JSON',
            'data': data,
            'export_date': datetime.now().isoformat(),
            'note': 'Contains all personal data we process about you'
        }

    def send_response(self):
        """Enviar ao usuario por meio seguro"""
        # Encryptar arquivo
        # Enviar por email com password temporaria
        # Manter registro de envio
        pass
```

**Procedimento:**
1. Receber solicitacao (email, formulario, etc)
2. Verificar identidade (nao pode ser pedido publico)
3. Coletar dados de todos sistemas (3 horas a 30 dias dependendo de escopo)
4. Formatar de modo legivel
5. Enviar ao usuario (por meio seguro) dentro de 30 dias
6. Documentar no registro de DSAR

---

## 13. MITRE ATT&CK Overview

Banco de dados global de tecnicas de ataque usadas por adversarios reais.

### Frameworks principais:

1. **Initial Access:** Como atacante entra (phishing, supply chain)
2. **Execution:** Rodar codigo (malware, script)
3. **Persistence:** Manter acesso (backdoor, scheduled task)
4. **Privilege Escalation:** Ganhar mais acesso
5. **Defense Evasion:** Esconder trilhas (disable logging, anti-virus bypass)
6. **Credential Access:** Roubar credenciais (brute force, phishing)
7. **Discovery:** Mapear o alvo (port scan, system enumeration)
8. **Lateral Movement:** Spreads across network
9. **Collection:** Coletar dados
10. **Command & Control:** Comunicacao com atacante
11. **Exfiltration:** Roubar dados
12. **Impact:** Deletar/criptografar dados

**Exemplo: Phishing para ransomware**

```
Threat: Ransomware via phishing email

MITRE Mapping:
1. Initial Access [T1566.002]: Phishing with attachment
   - Mitigacao: Email filtering, user training

2. Execution [T1204]: User enables macros
   - Mitigacao: Disable macros, EDR monitoring

3. Persistence [T1547]: Scheduled task for re-infection
   - Mitigacao: Endpoint protection, process monitoring

4. Defense Evasion [T1562.008]: Disable event logging
   - Mitigacao: Centralized logging (SIEM), immutable logs

5. Lateral Movement [T1021]: RDP to other systems
   - Mitigacao: Network segmentation, MFA on RDP

6. Impact [T1491.001]: Encrypt files and demand ransom
   - Mitigacao: Regular backups (offline), disaster recovery
```

---

## 14. Common Threat Patterns para Web Apps

### Pattern 1: Authentication Bypass

```
Threat: Attacker bypasses login

Common causes:
- No rate limiting on login attempts
- Predictable session tokens
- JWT secret hardcoded in frontend
- SQL injection in login query
- Logic flaw (if error == "user not found", means account exists)

Detection:
- Multiple failed logins from same IP
- Successful login from unusual location
- Session cookie tampering

Mitigation:
- Strong password hashing (bcrypt, argon2)
- MFA (TOTP, FIDO2)
- Rate limiting + account lockout
- Secure random token generation
- Parameterized SQL queries
```

### Pattern 2: Privilege Escalation via Parameter Tampering

```
Web form:
<input type="hidden" name="user_id" value="123">

Attacker changes to:
<input type="hidden" name="user_id" value="456">

Server processes without validation → Attacker sees user 456's data

Mitigation:
- Never trust client-provided IDs
- Always validate: logged_in_user.id == request.user_id
- Use server-side sessions, not just client cookies
- Implement proper authorization checks on EVERY action
```

### Pattern 3: Insecure Direct Object Reference (IDOR)

```
API: GET /api/invoices/12345

Attacker tries:
GET /api/invoices/12346
GET /api/invoices/12347
...

If no authorization checks:
- All invoices from all customers exposed

Mitigation:
- Check: invoice.user_id == current_user.id
- Use non-sequential IDs (UUID)
- Rate limit API lookups
```

### Pattern 4: Injection Attacks

```
SQL Injection:
username = "admin' --"
Query becomes: SELECT * FROM users WHERE name = 'admin' --'
Result: Returns all users

Command Injection:
file = "test.pdf; rm -rf /"
Command becomes: cp test.pdf; rm -rf / (disaster!)

Template Injection:
Input: "{{7*7}}"
Output: "49" (template engine executed math!)

Mitigation:
- Use parameterized queries / ORM
- Avoid shell commands (use library functions)
- Disable template expression evaluation in user input
- Input validation + whitelist allowed characters
```

### Pattern 5: Cross-Site Scripting (XSS)

```
Stored XSS:
User comments: "<script>stealCookie()</script>"
Other users see comment → Script runs in their browser

Reflected XSS:
URL: https://site.com/?search=<script>steal()</script>
If server echoes search param without escaping → Malicious

Mitigation:
- Escape HTML in output (< becomes &lt;)
- Use templating engines that auto-escape
- Content Security Policy (CSP) headers
- HTTPOnly flag on cookies
```

---

## 15. When to Re-Model (Recurring Threat Modeling)

Threat model pode se desatualizar. Re-fazer quando:

```
IMMEDIATELY (within sprint):
- Critical security issue found in code
- Major breach or incident
- New zero-day affecting your stack

WHEN SHIPPING NEW FEATURE:
- New API endpoint
- New data type collected
- Integration with external service
- Change in auth method

QUARTERLY:
- Full threat model review
- STRIDE analysis on major components
- Risk assessment update
- New threats in industry

ANNUALLY:
- Complete re-threat-modeling
- Update architecture diagram
- Verify all mitigations still deployed
- Training on findings
```

**Exemplo de checklist para new feature:**

```
Feature: "Add two-factor authentication"

Threat model checklist:
[ ] Updated DFD (TOTP generation flow added)
[ ] Trust boundary analysis (OTP code validation where?)
[ ] STRIDE analysis:
    [ ] Spoofing: Can attacker fake OTP?
    [ ] Tampering: Can SMS be intercepted?
    [ ] Repudiation: Can user deny enabling 2FA?
    [ ] Info Disclosure: OTP backup codes stored securely?
    [ ] DoS: Can attacker lock user out?
    [ ] Privilege Escalation: N/A (no privilege change)
[ ] Attack surface: New endpoint for 2FA setup
[ ] Risk assessment: Any HIGH/CRITICAL risks?
[ ] Mitigations: Implemented?
[ ] Approved by security team
```

---

## 16. Auditoria de Compliance

Checklist periodico:

```
MONTHLY:
[ ] Review deletion requests - foram deletados?
[ ] Check data minimization - coleta ainda necessaria?
[ ] Audit access logs - alguem acessou dados desnecessariamente?
[ ] Verify encryption - tudo ainda encriptado?

QUARTERLY:
[ ] DPIA review - novo processamento planejado?
[ ] Vendor DPA review - todos processadores tem acordo?
[ ] Retention policy audit - deletar dados vencidos
[ ] Consentimento validation - records validos?

ANNUALLY:
[ ] Privacy impact assessment completa
[ ] Testar DSAR process (completar em 30 dias)
[ ] Revisar Data Processing Register
[ ] Compliance training para staff
[ ] Audit externa se possivel
[ ] Atualizar Privacy Policy se necessario
```

**Manter registro centralizado:**

```yaml
# ROPA (Records of Processing Activities)
processings:
  - name: "Customer Email Marketing"
    purpose: "Send promotional emails"
    legal_basis: "Consent (opt-in)"
    data_categories:
      - Email address
      - Signup date
      - Preferences
    recipients: ["Email service provider (Mailchimp)"]
    retention: "12 months after unsubscribe"
    safeguards:
      - "AES-256 encryption at rest"
      - "TLS 1.3 in transit"
      - "Access logged"
    dpia_required: false

  - name: "Payment Processing"
    purpose: "Process customer payments"
    legal_basis: "Contract (payment is necessary)"
    data_categories:
      - Card last 4 digits
      - Transaction amount
      - Billing address
    recipients: ["Payment processor (Stripe)"]
    retention: "7 years (compliance requirement)"
    safeguards:
      - "Stripe handles encryption (PCI-DSS)"
      - "We dont store full card numbers"
    dpia_required: false
```

---

## 17. Automacao de Threat Modeling

### Ferramentas

```bash
# Markdown-based threat modeling
pip install pytm

# gera DFD + STRIDE analysis da descricao

# Microsoft Threat Modeling Tool (free)
# - GUI para desenhar DFDs
# - Auto-generate STRIDE threats

# IriusRisk (commercial)
# - Library de threat patterns
# - Rastreamento de mitigacao

# ThreatDragon (open source)
# - Web-based DFD drawing
# - STRIDE analysis
```

### Integracao em CI/CD

```yaml
# Gerar threat report a cada deploy

name: Threat Modeling Report

on: [pull_request]

jobs:
  threat-model:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for new features
        run: |
          # Se novo arquivo em features/, re-threat-model
          git diff origin/main --name-only | grep features/

      - name: Run threat modeling
        if: env.NEW_FEATURE == 'true'
        run: |
          pip install pytm
          pytm --file threat-model.yaml --output report.html

      - name: Comment on PR
        run: |
          gh pr comment -b "Threat model review required for new feature"
```

---

## 18. Knowledge Sharing

Manter threat models atualizados e acessiveis:

```
/threat-models/
├─ authentication.md (STRIDE analysis)
├─ payment-processing.md (high-risk)
├─ api-architecture.md (DFD + analysis)
├─ infrastructure.md (cloud security)
└─ external-integrations.md (third-party risks)

Process:
1. New feature design → Threat model
2. Review with security team
3. Document in /threat-models/
4. Link from feature spec
5. Update during implementation
6. Periodic reviews (quarterly)
```

---

## Invocation Criteria

This skill is invoked automatically when:
- Keywords detected: `ameaca`, `threat`, `STRIDE`, `modelo-ameaca`, `superficie-ataque`, `GDPR`, `privacidade`, `PII`, `LGPD`, `CCPA`, `compliance`, `classificacao-dados`, `attack-surface`, `privacy-by-design`
- New feature requires threat modeling or compliance review
- Request type: `PLAN`, `SECURE`, or `ADAPT` with security concerns
- Phase 2 tasks (Architecture) that touch data, auth, or compliance

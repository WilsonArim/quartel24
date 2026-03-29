# SECURITY — Guia Mestre de Seguranca

> Este documento define a postura de seguranca obrigatoria para qualquer projecto SOTA.
> **Consolidacao v2** — Seguranca agora distribuida em 4 skills dedicadas + integrada em 2 skills adicionais.

## Relacao com Skills

| Skill | Foco | Escopo | Fase |
|-------|------|--------|------|
| **secrets-guard** | Disciplina de segredos | .env, vault, rotacao, leak detection | 0 (sempre) |
| **security-design** | Seguranca em design-time | STRIDE, GDPR, attack surface, data classification | 2 |
| **api-engineering** | Seguranca de APIs | OWASP API Top 10, auth, rate-limiting, LLM trust boundaries | 3 |
| **code-quality** | Auditoria de codigo | OWASP Top 10, security audit integrado, fix-first | 5 |
| **ship** | Production readiness | Gate proativo, canary monitoring, revert protocol | 6 |
| **security-ops** | Seguranca operacional | Hardening, DevSecOps, supply chain, incident response, CSO audit | 6 |

Este documento articula QUANDO e COMO cada skill se ativa. Trata-se de um maestro orquestral de seguranca.

---

## Principio Zero: Defense in Depth

Seguranca nao e conseguida com uma unica camada. Assumimos compromisso absoluto com defesa em profundidade:

```
Codigo (validacao, encoding)
    ↓
APIs (OWASP, auth, rate-limiting)                    ← api-engineering
    ↓
Dependencias (lockfiles, audit, SBOM)                ← security-ops
    ↓
Segredos (vault, rotacao, .env)                      ← secrets-guard
    ↓
Infraestrutura (SSH, firewall, TLS, least privilege) ← security-ops
    ↓
Rede (mTLS, VPN, segmentacao)                        ← security-ops
    ↓
Monitorizacao (logs estruturados, anomalias, alertas)← ship
    ↓
Resposta (playbooks, comunicacao, post-mortem)        ← security-ops
```

Se uma camada falha, as outras impedem o dano.

---

## Camada 1 — Codigo Seguro

**Responsabilidade:** code-quality (security audit section) + api-engineering

**Minimos obrigatorios:**
- Validacao de inputs: whitelist, nao blacklist. Contrato entre camadas.
- Output encoding: HTML, URL, CSS, JavaScript contextos diferentes.
- Tratamento de erros: nunca expoem stack traces, paths, versoes ou dados sensveis em respostas publicas.
- SQL injection: parametrizacao obrigatoria (prepared statements, ORMs validados).
- CORS: configuracao explcita, nunca wildcards (*) em producao.
- Dependency scanning: `npm audit`, `pip-audit`, `cargo audit` em CI/CD.

**Ativacao:** Pre-desenvolvimento. Auditorias mensais em codigo ja produzido.

---

## Camada 2 — Dependencias & Supply Chain

**Responsabilidade:** security-ops (supply chain section)

**Essencial:**
- **Lockfiles:** package-lock.json, poetry.lock, Cargo.lock OBRIGATORIOS em VCS.
- **Auditoria:** `npm audit --production` antes de cada deploy.
- **SBOM:** gerar Software Bill of Materials (cyclonedx ou spdx) para rastreabilidade.
- **Signed commits:** commits assinados com GPG, verificacao obrigatoria em main branch.
- **Dependency pinning:** nunca usar ranges fuzzy (^, ~) em producao; pinning exato.
- **Quarentena:** packages descontinuados ou com vulns criticas sao sinalizados antes de uso.

**Monitoramento:** Dependabot, Snyk, ou Trivy em CI/CD.

---

## Camada 3 — Segredos & Credenciais

**Responsabilidade:** secrets-guard (Fase 0, sempre ativa)

**Regra de Ouro:** Nunca, sob nenhuma circunstancia, commitar secrets em VCS.

**Implementacao:**
- **.env.example:** template sem valores, para demonstracao.
- **.env (local):** gitignored, carregado em runtime.
- **Vault/Secrets Manager:** HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, ou 1Password Business para producao.
- **Rotacao:** secrets de API/BD rotacionadas a cada 90 dias; credenciais de servico a cada 30 dias.
- **Auditoria:** logs de acesso a secrets, quem acedeu e quando.
- **Revogacao:** processo de revogacao imediata em caso de comprometimento.
- **State files:** nunca guardar segredos em .sota/ ou qualquer state file.

**Deteccao:** git-secrets, TruffleHog em pre-commit hook.

---

## Camada 4 — Infraestrutura

**Responsabilidade:** security-ops (hardening section)

**Hardening obrigatorio:**
- **SSH:** chaves ED25519, nao passwords; acesso por bastion/jump host em producao.
- **Firewall:** ufw/iptables com regras de least privilege; abertura de portos documentada.
- **Swap seguro:** encryption, permissoes restritivas (chmod 600).
- **Fail2ban:** proteccao contra brute-force em SSH e servicos criticos.
- **TLS/HTTPS:** obrigatorio em QUALQUER comunicacao em rede; certificados Let's Encrypt, rotacao automatica.
- **Reverse proxy:** Nginx/Caddy entre aplicacao e internet; filtro de requests malformados.
- **Permissoes:** aplicacao roda como usuario nao-root; umask 0077.
- **Updates:** patching automatico (unattended-upgrades em Linux).

**Verificacao:** security scanner (Trivy, Grype) em imagens de container.

---

## Camada 5 — Rede & Comunicacao

**Principios:**
- **TLS Everywhere:** HTTP apenas em localhost; HSTS obrigatorio (min-age 31536000).
- **mTLS:** servico-para-servico com certificados bidirecionais, validacao obrigatoria.
- **VPN/WireGuard:** acesso administrativo APENAS atraves VPN, nao acesso direto.
- **Segmentacao:** zero-trust network; firewalls entre zonas (DB isolada de frontend).
- **Rate-limiting:** DDoS mitigation, validacao em edge (Cloudflare, AWS Shield).
- **WAF:** Web Application Firewall para bloqueio de padroes OWASP.

**Monitoramento:** alertas em conexoes suspeitas, tentativas de lateral movement.

---

## Camada 6 — Monitorizacao & Alertas

**Logging obrigatorio:**
- **Estrutura:** JSON logs (ELK, Loki, Datadog) nao text logs.
- **Campos essenciais:** timestamp, nivel (ERROR, WARN, INFO), servico, usuario_id, request_id, acao, resultado.
- **Retencao:** minimo 90 dias em producao, 1 ano para eventos de seguranca.
- **Proteccao:** logs sao imutaveis (append-only); acesso auditado.

**Alertas (SLA de resposta):**
- **CRITICAL:** falhas de autenticacao em massa, acesso nao-autorizado → resposta em 5 minutos.
- **HIGH:** brute-force detectado, modificacao nao-esperada de ficheiros → 15 minutos.
- **MEDIUM:** padroes anomalos em trafego → 1 hora.
- **LOW:** updates disponveis, pequenas anomalias → 24 horas.

**SIEM basico:** correlacao de eventos, deteccao de padroes anormais.

---

## Camada 7 — Resposta a Incidentes

**Responsabilidade:** security-ops (incident response section)

**Playbooks obrigatorios:**
1. **Data Breach:** isolamento de sistema, notificacao de stakeholders, analise forense.
2. **DDoS:** ativacao de mitigation, escalada para CDN/ISP.
3. **Compromise de credenciais:** revogacao imediata, password reset, 2FA refresh.
4. **Malware:** isolamento, scan completo, verificacao de backups.

**Processo:**
- **Deteccao:** alertas acionam runbook automatico.
- **Comunicacao:** escalada em cadeia; stakeholders informados em tempo real.
- **Mitigacao:** pasos definidos, nao improvisacao.
- **Postmortem:** dentro de 48h; raiz, timeline, accoes preventivas.

---

## Matriz de Responsabilidade (RACI)

| Atividade | secrets-guard | security-design | api-engineering | code-quality | ship | security-ops |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| Gestao de secrets | **R/A** | I | I | I | I | I |
| Threat modeling | I | **R/A** | C | I | I | I |
| Compliance & privacidade | I | **R/A** | I | I | I | C |
| Design de API segura | I | C | **R/A** | I | I | I |
| Auth (JWT/OAuth) | I | I | **R/A** | I | I | I |
| Auditoria OWASP | I | I | C | **R/A** | I | I |
| Performance security | I | I | I | **R/A** | I | I |
| Production readiness | I | I | I | I | **R/A** | C |
| Hardening infra | I | I | I | I | I | **R/A** |
| DevSecOps pipeline | I | I | I | I | C | **R/A** |
| Supply chain | I | I | I | I | I | **R/A** |
| Incident response | C | I | I | I | I | **R/A** |

**Legenda:** R=Responsible, A=Accountable, C=Consulted, I=Informed

---

## Checklist Security-by-Default

**Obrigatorio ANTES de qualquer deploy em producao:**

- [ ] Todas as inputs validadas com whitelist
- [ ] Outputs encoded segundo contexto (HTML/URL/JS)
- [ ] Nao ha secrets em VCS; .gitignore valido
- [ ] Lockfiles presentes e auditados (zero vulns CRITICAL)
- [ ] SSH keys ED25519, nao passwords
- [ ] HTTPS/TLS obrigatorio; HSTS configurado
- [ ] Firewall configurado; ports minimos abertos
- [ ] Aplicacao roda como user nao-root
- [ ] Logging estruturado (JSON) com campos obrigatorios
- [ ] Alertas configurados (CRITICAL, HIGH)
- [ ] Backup testado; plano de restauro documentado
- [ ] Secrets Manager em uso (vault, Secrets Manager, etc.)
- [ ] 2FA habilitado para acesso administrativo
- [ ] WAF ou rate-limiting ativo
- [ ] Postmortem de seguranca realizado no ultimo mes (zero findings pendentes)

**Falha neste checklist = bloqueio de deploy.**

---

## Classificacao de Severidade

| Nivel | Impacto | SLA de Resposta | Exemplos |
|-------|---------|-----------------|----------|
| **CRITICAL** | Roubo de dados, downtime completo | 5 minutos | Breach confirmado, RCE em uso, falha de autenticacao |
| **HIGH** | Compromisso de contas, funcionalidade afetada | 15 minutos | Brute-force ativo, privesc, unauthorized access |
| **MEDIUM** | Risco potencial, usuario afetado | 1 hora | Padroes anomalos, tentativas explorados, weak crypto |
| **LOW** | Observacao, qualidade | 24 horas | Updates disponiveis, config suboptima, lint warnings |

---

## Workflows de Seguranca

Workflows definidos no CLAUDE.md — sequencias de routing:

```
/security-audit    → code-quality (security section) → security-ops (CSO audit 14 fases)
                     Output: OWASP audit report, SBOM, CSO dashboard, trend tracking

/harden            → secrets-guard → security-ops (hardening + pipeline)
                     Output: playbook de hardening, checklist pre-deploy

/incident          → security-ops (incident response) → secrets-guard
                     Output: runbook especifico, playbook, comunicacao template
```

---

## Governance & Compliance

**Revisao:** Este documento e revisto trimestralmente. Mudancas regulatorias (GDPR, NIS2, SOC 2) sao integradas imediatamente.

**Auditoria:** Todas as camadas auditadas anualmente por terceiro independente.

**Evidencia:** Cada security decision deixa trail auditavel (logs, commits assinados, postmortems). Reports persistidos em `.sota/reports/security/`.

---

## Referencia Cruzada

- **CLAUDE.md (raiz):** regras fundamentais, router automatico, routing por keywords de seguranca
- **ARCHITECTURE.md:** mapa completo de 17 skills, cobertura por camada, fluxo de ativacao
- **SKILLS/<skill-name>/SKILL.md:** implementacoes concretas

**Skills com cobertura de seguranca (6):**
- `secrets-guard` — Fase 0, sempre ativa
- `security-design` — Fase 2 (threat modeling + compliance)
- `api-engineering` — Fase 3 (OWASP API + auth)
- `code-quality` — Fase 5 (security audit integrado)
- `ship` — Fase 6 (production readiness gate)
- `security-ops` — Fase 6 (hardening + DevSecOps + incident + supply chain)

**Ultima atualizacao:** 2026-03-26 (consolidacao v2)

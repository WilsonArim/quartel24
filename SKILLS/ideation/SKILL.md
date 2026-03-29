---
name: ideation
phase: 1
always_active: false
absorbs: brainstorming, product-manager-toolkit, competitive-landscape, prd, architecture-decision-records
description: "From idea to complete spec — Think → Validate → Document"
keywords: [ideia, brainstorm, mvp, conceito, PRD, requisitos, concorrencia, ADR, decisao, spec, feature]
---

# Ideation

> Phase 1 — From raw idea to actionable specification. Transform vague ideas into validated, documented product concepts ready for engineering execution.

---

## 1. Brainstorm Framework: Diverge Then Converge

### Phase A — Diverge (Expand the Space)

The goal is volume. Generate as many ideas, angles, and variations as possible without judgment.

1. **Problem Mining** — List every problem the target user faces in the domain. Do not filter yet.
2. **How Might We** — Reframe each problem as a "How might we..." question to open solution space.
3. **Crazy Eights** — For each HMW question, sketch eight distinct solution approaches in eight minutes.
4. **Analogy Transfer** — Look at how adjacent industries solve similar problems. Borrow patterns.
5. **Reverse Brainstorm** — Ask "How could we make this problem worse?" then invert the answers.

### Phase B — Converge (Collapse to Decisions)

The goal is clarity. Filter, rank, and commit.

1. **Dot Voting** — Each stakeholder gets three votes. Identify the top-voted ideas.
2. **Impact vs Effort Matrix** — Plot surviving ideas on a 2x2 grid (high impact / low effort = do first).
3. **One-Liner Test** — If you cannot describe the idea in one sentence, it is not clear enough yet.
4. **Kill Criteria** — Explicitly state what would make you abandon this idea. If nothing would, you are not being honest.

---

## 2. Market & Competitive Analysis

### Step 1 — Identify Competitors

Organize competitors into three tiers:

| Tier | Definition | Example |
|------|-----------|---------|
| **Direct** | Same problem, same audience, same approach | Notion vs Coda |
| **Indirect** | Same problem, different approach or different audience | Notion vs Google Docs + Trello |
| **Potential** | Not competing today but could enter your space easily | A large platform adding your feature as a tab |

### Step 2 — Gather Intelligence

For each competitor, collect:

- **Product**: Core features, pricing tiers, free tier limitations
- **Traction**: Estimated users, revenue (check Crunchbase, SimilarWeb, app store rankings)
- **Positioning**: Tagline, landing page messaging, who they say they are for
- **Technology**: Tech stack (check job postings, BuiltWith, Wappalyzer)
- **Sentiment**: User reviews on G2, Capterra, Reddit, Twitter. Focus on complaints.
- **Trajectory**: Recent launches, funding rounds, hiring patterns

### Step 3 — Analyze Patterns

Look for:

- Features every competitor has (table stakes — you need these too)
- Features no competitor has (potential differentiator or validated dead end)
- Common user complaints across competitors (your opportunity)
- Pricing gaps (underserved segment at a price point)
- Platform gaps (mobile, API, integrations nobody offers)

### Step 4 — Decide Your Position

Choose one of four positioning strategies:

1. **Head-to-head** — Better execution on the same value proposition (requires significant resources)
2. **Niche focus** — Serve one segment far better than generalist competitors
3. **Disruptive pricing** — Offer comparable value at dramatically lower cost
4. **New angle** — Solve the same underlying problem with a fundamentally different approach

### Feature Comparison Matrix Template

```markdown
| Feature | Your Product | Competitor A | Competitor B | Competitor C |
|---------|--------------|--------------|--------------|--------------|
| [Core Feature 1] | [Yes/No/Partial] | [Yes/No/Partial] | [Yes/No/Partial] | [Yes/No/Partial] |
| [Core Feature 2] | | | | |
| [Core Feature 3] | | | | |
| Free Tier | [Details] | [Details] | [Details] | [Details] |
| Starting Price | [$X/mo] | [$X/mo] | [$X/mo] | [$X/mo] |
| API Available | [Yes/No] | [Yes/No] | [Yes/No] | [Yes/No] |
| Mobile App | [Yes/No] | [Yes/No] | [Yes/No] | [Yes/No] |
| SSO/Enterprise | [Yes/No] | [Yes/No] | [Yes/No] | [Yes/No] |
| Integrations Count | [Number] | [Number] | [Number] | [Number] |
```

**How to use the matrix:**
- Columns where you have "Yes" and all competitors have "No" are your differentiators. Emphasize these in marketing.
- Columns where all competitors have "Yes" and you have "No" are your gaps. Prioritize closing critical ones.
- Columns where nobody has "Yes" represent either innovation opportunities or features the market has rejected.

### SWOT Analysis Template

```markdown
## SWOT Analysis: [Your Product] vs [Market]

### Strengths (Internal, Positive)
- [What you do better than competitors]
- [Unique resources, technology, or expertise]
- [Cost advantages]

### Weaknesses (Internal, Negative)
- [What competitors do better]
- [Resource limitations]
- [Technical debt or architectural constraints]

### Opportunities (External, Positive)
- [Market trends favoring your approach]
- [Competitor weaknesses you can exploit]
- [Unserved or underserved segments]
- [Regulatory or technology shifts]

### Threats (External, Negative)
- [Competitors with more resources entering your space]
- [Market contraction or changing user behavior]
- [Platform risk (dependency on a third party)]
- [Regulatory risk]
```

**SWOT rules:**
- Each quadrant should have 3-5 items. More than that means you have not prioritized.
- Be brutally honest in Weaknesses and Threats. Self-deception here is expensive.
- Every Opportunity should map to a potential action. If you cannot act on it, it is not relevant.
- Every Threat should have a mitigation plan, even if the plan is "monitor and revisit."

### Differentiation Strategy

**The Differentiation Test** — Answer these three questions:

1. **Is it valuable?** — Do users care about this difference?
2. **Is it defensible?** — Can competitors copy it in less than 6 months?
3. **Is it communicable?** — Can you explain the difference in one sentence?

If all three answers are yes, you have a real differentiator. If any answer is no, keep looking.

**Types of defensible differentiation:**
- **Network effects** — Product gets better as more people use it
- **Data moat** — Proprietary data that improves the product over time
- **Integration depth** — Deep integration with a platform that is painful to replicate
- **Workflow embedding** — Becoming part of a daily habit that has high switching cost
- **Brand trust** — Reputation in a domain where trust is critical (security, finance, health)

### Pricing Analysis

When analyzing competitor pricing:

1. **Map the tiers** — List every pricing tier for each competitor, including free.
2. **Identify the value metric** — What do they charge per? (seats, usage, features, storage)
3. **Find the inflection points** — At what usage level does each competitor become expensive?
4. **Calculate effective price** — For your target customer profile, what would they actually pay?
5. **Spot bundling strategies** — What do competitors give away free to lock users in?

**Pricing strategy options:**

| Strategy | When to Use |
|----------|------------|
| **Undercut** | When competitors are overpriced for the value delivered |
| **Premium** | When your product is demonstrably superior and the audience can pay |
| **Freemium** | When you need volume and the free tier drives viral growth |
| **Usage-based** | When value scales linearly with usage and users prefer pay-as-you-go |

### Competitive Analysis Key Questions

Before concluding any competitive analysis, answer every one of these:

1. Who are the top 3 competitors and what is each one's primary strength?
2. What do users complain about most with existing solutions?
3. Is the market growing, stable, or shrinking? What evidence supports this?
4. What would it cost a user to switch from a competitor to us?
5. Which competitor is most likely to copy our approach, and how fast could they?
6. Is there a segment that every competitor is ignoring?
7. What is the minimum feature set needed to be considered a viable alternative?
8. How do competitors acquire customers? (organic, paid, partnerships, sales team)
9. Are there regulatory or compliance requirements that act as barriers to entry?
10. If we succeed, who would try to acquire us, and does that inform our strategy?

---

## 3. Idea Validation Checklist

Before committing engineering time, every idea must pass these gates:

- [ ] **Problem Exists** — Can you find 5+ real people who have this problem today?
- [ ] **Problem is Painful** — Are people actively spending money, time, or effort to work around it?
- [ ] **Solution is Feasible** — Can a small team build a working version in 2-4 weeks?
- [ ] **Market is Reachable** — Do you have a clear channel to reach the first 100 users?
- [ ] **Differentiation is Real** — Can you name the top 3 alternatives and explain why yours is better for a specific segment?
- [ ] **Business Model Exists** — Is there a plausible path to revenue, even if indirect?
- [ ] **Team has Domain Fit** — Does the team have (or can quickly acquire) the domain knowledge needed?

If fewer than 5 of 7 boxes are checked, the idea needs more research before proceeding.

---

## 4. MVP Scoping: Must-Have vs Nice-to-Have

### Classification Rules

| Category | Definition | Example |
|----------|-----------|---------|
| **Must-Have** | Without this, the product does not solve the core problem at all | User authentication for a SaaS app |
| **Should-Have** | Significantly improves experience but core works without it | Password reset via email |
| **Nice-to-Have** | Delightful but clearly non-essential for launch | OAuth with 5 social providers |
| **Out of Scope** | Explicitly excluded from the MVP to prevent scope creep | Admin dashboard with analytics |

### Scoping Process

1. List every feature the team has discussed.
2. For each feature, ask: "If we launched without this, would the first 10 users still get value?" If yes, it is not Must-Have.
3. Cap Must-Have features at 3-5. If you have more, your scope is too large.
4. Write a one-sentence justification for every Must-Have feature.
5. Move everything else to Should-Have or lower.
6. Set a hard deadline. Features not done by the deadline ship in v2, not v1.

---

## 5. RICE Prioritization Framework

RICE scores help objectively compare features when everything feels urgent.

### Formula

```
RICE Score = (Reach x Impact x Confidence) / Effort
```

### Factor Definitions

| Factor | Definition | Scale |
|--------|-----------|-------|
| **Reach** | How many users will this affect per quarter? | Actual number (e.g., 500 users) |
| **Impact** | How much will this move the target metric per user? | 3 = massive, 2 = high, 1 = medium, 0.5 = low, 0.25 = minimal |
| **Confidence** | How sure are you about Reach and Impact estimates? | 100% = high (data-backed), 80% = medium (educated guess), 50% = low (gut feel) |
| **Effort** | How many person-months will this take? | Actual estimate (e.g., 2 person-months) |

### Example Calculation

| Feature | Reach | Impact | Confidence | Effort | RICE Score |
|---------|-------|--------|-----------|--------|-----------|
| Onboarding redesign | 1000 | 2 | 80% | 3 | 533 |
| Export to CSV | 200 | 1 | 100% | 0.5 | 400 |
| Dark mode | 800 | 0.5 | 50% | 2 | 100 |

Decision: Onboarding redesign ships first, then CSV export. Dark mode goes to backlog.

### RICE Pitfalls

- Do not inflate Confidence to win arguments. Be honest about what you do not know.
- Effort must include QA, documentation, and deployment -- not just coding.
- Revisit scores quarterly. Reach and Impact change as the product evolves.

---

## 6. User Stories & Acceptance Criteria

### User Story Format

```
As a [type of user],
I want [action or capability],
so that [benefit or outcome].
```

### Rules for Good User Stories (INVEST)

- **I**ndependent — Can be developed without depending on other stories
- **N**egotiable — Details can be discussed; the story is not a contract
- **V**aluable — Delivers value to the user, not just to the system
- **E**stimable — Team can estimate the effort required
- **S**mall — Can be completed in a single sprint
- **T**estable — Has clear criteria for "done"

### Acceptance Criteria Format (Given/When/Then)

```
Given [precondition],
When [action],
Then [expected result].
```

### Example

```
User Story:
As a free-tier user,
I want to upgrade to a paid plan from the settings page,
so that I can access premium features without contacting support.

Acceptance Criteria:
1. Given I am on the Settings page and logged in as a free-tier user,
   When I click "Upgrade Plan",
   Then I see a comparison of available paid plans with pricing.

2. Given I have selected a plan and entered payment details,
   When I click "Confirm Payment",
   Then my account is upgraded immediately and I receive a confirmation email.

3. Given the payment fails,
   When the payment processor returns an error,
   Then I see a clear error message and my account remains on the free tier.
```

---

## 7. Feature Prioritization Matrix

When RICE alone is not sufficient, use a multi-dimensional matrix:

| Feature | RICE Score | Strategic Alignment | Technical Risk | User Demand | Final Priority |
|---------|-----------|-------------------|-----------------|------------|-----------------|
| [Feature] | [Score] | High/Med/Low | High/Med/Low | High/Med/Low | P0/P1/P2/P3 |

### Priority Levels

- **P0 (Critical)** — Must ship this cycle. Blocks other work or addresses critical user pain.
- **P1 (High)** — Should ship this cycle if capacity allows. Clear user value.
- **P2 (Medium)** — Plan for next cycle. Important but not urgent.
- **P3 (Low)** — Backlog. Revisit during next planning session.

### Decision Rules

1. Any feature with Technical Risk = High must have a spike or proof-of-concept before committing to a deadline.
2. Features with User Demand = High but low RICE score likely have a reach problem — investigate distribution.
3. Never have more than 3 P0 items. If everything is critical, nothing is.
4. Review and re-prioritize at the start of every cycle, not just once.

---

## 8. PRD (Product Requirements Document) Template

### Discovery Phase Questions

Before writing a PRD, gather context by asking:

1. **Qual e o problema?** — Que dor ou necessidade estamos a resolver? Para quem?
2. **Porque agora?** — O que mudou que torna isto urgente ou relevante?
3. **Quem sao os utilizadores?** — Personas principais e secundarias
4. **Que sucesso parece?** — Metricas concretas (nao "melhorar a experiencia", mas "reduzir churn em 15%")
5. **Que restricoes existem?** — Tempo, budget, stack tecnica, regulamentacao, dependencias
6. **Que ja existe?** — Contexto do sistema atual, decisoes ja tomadas, tentativas anteriores
7. **Quem precisa de aprovar?** — Stakeholders e processo de decisao

Do not proceed without clear answers to questions 1, 3, and 4.

### PRD Quality Checklist

Before delivering a PRD, ensure:

**Clareza e Completude**
- [ ] Resumo executivo e compreensivel por alguem fora da equipa
- [ ] Problema esta suportado por dados ou evidencia concreta, nao suposicoes
- [ ] Todas as user stories seguem o formato "Como/Quero/Para que" com criterios de aceitacao
- [ ] Requisitos sao especificos o suficiente para dois engenheiros chegarem a mesma implementacao
- [ ] Scope tem seccao explicita de "Out of Scope" com justificacoes

**Mensurabilidade**
- [ ] Cada objetivo tem uma metrica, baseline, meta e metodo de medicao
- [ ] Metricas de guarda estao definidas (o que nao pode piorar)
- [ ] Timeline tem datas concretas, nao "em breve" ou "Q3"

**Viabilidade**
- [ ] Dependencias estao identificadas com status e risco
- [ ] Restricoes tecnicas estao documentadas
- [ ] Timeline inclui buffer para imprevistos (minimo 20-30%)
- [ ] Riscos tem mitigacoes concretas, nao apenas "monitorizar"

**Alinhamento**
- [ ] Stakeholders estao listados com papeis claros
- [ ] Questoes em aberto tem owner e prazo
- [ ] Historico de decisoes captura o "porque", nao so o "o que"

### Levels of PRD

Adapt depth to context:

**PRD Leve (Feature pequena, 1-2 sprints)**
- Sections: Executive Summary, Problem, Goals & Metrics, P0 User Stories, Scope, Timeline
- Estimated time: 30-60 minutes

**PRD Standard (Feature media, 2-6 sprints)**
- All sections except Decision History
- Estimated time: 2-4 hours

**PRD Completo (Produto novo ou feature critica)**
- All sections, with possible annexes (research, competitive analysis, detailed mockups)
- Estimated time: 1-2 days

### PRD Anti-Patterns to Avoid

- **PRD como wish-list** — Each requisite must have justification and priority. If everything is P0, nothing is.
- **Requisitos vagos** — "O sistema deve ser rapido" is not a requirement. "API responde em < 200ms no p95" is.
- **Ausencia de "Out of Scope"** — Without explicit limits, scope creep is inevitable.
- **Metricas sem baseline** — "Aumentar conversao em 20%" means nothing without knowing the current value.
- **PRD escrito depois do desenvolvimento** — The PRD guides decisions; it is not documentation of what was built.
- **Ignorar anti-personas** — Know who you are NOT serving to avoid building features nobody asked for.

---

## 9. Architecture Decision Records (ADRs)

### When to Write an ADR

Write an ADR when a decision meets any of these criteria:

1. **Irreversibility** — The decision is expensive to reverse (e.g., choosing a database, programming language, cloud provider)
2. **Cross-team impact** — The decision affects more than one team or service
3. **Significant trade-offs** — You are explicitly choosing to accept a downside in exchange for a benefit
4. **Recurring debate** — The team has discussed this topic more than twice. Write it down and stop re-litigating.
5. **Compliance or security** — The decision has regulatory, legal, or security implications
6. **Pattern establishment** — The decision sets a precedent that future work will follow

### When NOT to Write an ADR

- Trivial choices with no meaningful trade-offs
- Temporary decisions with a planned expiration
- Decisions already captured in another canonical document

### ADR Lifecycle

```
Proposed --> Accepted --> [Active]
                            |
                            +--> Deprecated (no longer relevant)
                            |
                            +--> Superseded by ADR-XXX (replaced by a new decision)
```

**Status Definitions:**

| Status | Meaning |
|--------|---------|
| **Proposed** | Under discussion. Not yet approved. Open for feedback. |
| **Accepted** | Approved and in effect. This is the current decision. |
| **Deprecated** | No longer relevant due to changed circumstances. The original reasoning was not wrong; the world changed. |
| **Superseded** | Replaced by a newer ADR. Always link to the replacement. |

### ADR Rules

- Never delete an ADR. Change its status instead. The history of decisions is valuable.
- When superseding an ADR, update the old ADR's status to "Superseded by ADR-XXX" and reference the old ADR in the new one's Context section.
- Review ADRs during quarterly architecture reviews to identify any that are outdated.

### ADR Template

```markdown
# ADR-[NUMBER]: [TITLE]

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-[NUMBER]
**Date:** [YYYY-MM-DD]
**Decision Makers:** [Names or roles]

## Context

[Describe the situation and the forces at play. What problem are you facing?
What constraints exist? What options did you consider? Be specific about the
technical and business context that makes this decision necessary.]

## Decision

[State the decision clearly and concisely. Use active voice.
"We will use PostgreSQL as the primary database" not "It was decided that
PostgreSQL would be used."]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

### Risks
- [Risk and mitigation plan]

## Alternatives Considered

### [Alternative 1]
- **Pros:** [List]
- **Cons:** [List]
- **Why rejected:** [Reason]

### [Alternative 2]
- **Pros:** [List]
- **Cons:** [List]
- **Why rejected:** [Reason]
```

### ADR Naming Convention

Store ADRs in `docs/adr/`:

```
docs/
  adr/
    ADR-001-use-postgresql-as-primary-database.md
    ADR-002-adopt-event-driven-architecture.md
    ADR-003-choose-react-for-frontend.md
    ADR-004-implement-cqrs-for-order-service.md
```

**Rules:**
- Use sequential numbering with zero-padded three-digit prefix: `ADR-001`, `ADR-002`, etc.
- Use lowercase kebab-case for the rest of the filename
- The title in the filename should match the title in the document
- Never reuse a number, even if the ADR is deprecated

### ADR Best Practices

1. **Write ADRs at decision time, not after.** If you write it a month later, you will forget key context.
2. **Keep them short.** One to two pages maximum. If it is longer, you are explaining the implementation, not the decision.
3. **Include the alternatives you rejected.** This is often the most valuable part for future readers.
4. **Use concrete numbers.** "Faster" is useless. "Reduces p99 latency from 120ms to 15ms" is useful.
5. **Link to evidence.** Reference benchmarks, user research, RFCs, or tickets that informed the decision.
6. **Make ADRs discoverable.** Add a table of contents or index file. An ADR nobody can find is an ADR that does not exist.
7. **Involve the right people.** List decision makers explicitly. This creates accountability and makes it clear who to ask for context.

### ADR Index Template

Maintain an index file at `docs/adr/README.md`:

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|---|---|---|---|
| [ADR-001](ADR-001-use-postgresql-as-primary-database.md) | Use PostgreSQL as primary database | Accepted | 2025-01-10 |
| [ADR-002](ADR-002-adopt-event-driven-architecture.md) | Adopt event-driven architecture | Accepted | 2025-01-22 |
| [ADR-003](ADR-003-choose-react-for-frontend.md) | Choose React for frontend | Superseded by ADR-007 | 2025-02-05 |
```

---

## 10. Forcing Questions (Startup Validation)

Use these six forcing questions to quickly validate whether an idea is worth pursuing:

### Question 1: Who specifically suffers from this problem?

**Intent:** Avoid vague market descriptions. Force precision about the target user.

- [ ] Can you name three specific people (real or composite) who have this problem?
- [ ] Can you describe their job, their day-to-day workflow, and the exact moment the pain occurs?
- [ ] Do they represent a cohesive market segment or are they scattered across multiple segments?

**Red flag:** "Lots of people" or "anyone who uses a computer." Too broad = no market clarity.

### Question 2: How much is this problem costing them today?

**Intent:** Quantify pain. If nobody is spending money or time to solve it, the problem is not painful enough.

- [ ] Are they actively spending money on workarounds, alternatives, or manual labor?
- [ ] If not money, are they losing revenue, time, or customers because of the problem?
- [ ] What is the approximate annual cost per user? (If less than $100/year, rethink the business model.)

**Red flag:** "It would save them time" without evidence of actual time loss or cost. Hypothetical benefits do not validate.

### Question 3: Why have existing solutions failed to solve this?

**Intent:** Understand the defensibility gap. Why is this a real opportunity and not just a crowded market?

- [ ] Can you name all direct competitors and explain why each one is not good enough?
- [ ] Is it a technology gap (a better product is now possible) or a go-to-market gap (the market segment was ignored)?
- [ ] Is there a structural reason why the incumbents cannot or will not solve this? (Network lock-in, misaligned incentives, etc.)

**Red flag:** "There are no competitors" or "The market has not discovered the problem yet." If the problem is real, someone is solving it badly.

### Question 4: Can you launch a working MVP in 4 weeks with two people?

**Intent:** Filter for feasibility. If you cannot build a defensible MVP quickly, you do not have enough clarity or the technical risk is too high.

- [ ] Can you describe the MVP in 3-5 features with justification for each?
- [ ] Have you sketched the core user flow? Can two engineers build it in 4 weeks?
- [ ] Are there external dependencies (APIs, platforms, regulations) that block you?

**Red flag:** "We need 6 months and 10 people to validate." If the problem is real, the MVP should be scrappy and fast.

### Question 5: Do you have a direct channel to reach 100 initial users?

**Intent:** Ensure you can actually find customers, not just build a nice product in a vacuum.

- [ ] Can you name the top 3 channels to reach your target user? (Community, social, partnerships, sales team, etc.)
- [ ] Do you already have access to or relationships with potential users? (Advisor network, warm intros, etc.)
- [ ] Is the go-to-market distribution as clear as the product idea?

**Red flag:** "We will grow virally" or "Marketing will figure it out." Viral is a feature, not a strategy. Know your first 100 users before you start.

### Question 6: What would make you stop working on this idea?

**Intent:** Test for intellectual honesty. Founders who cannot articulate kill criteria are often delusional.

- [ ] If users do not find value within 2 weeks of signup, would you pivot or kill it?
- [ ] If you discover a competitor has 80% market share with a superior product, would you still pursue this?
- [ ] If the team discovers the problem was not actually painful enough to monetize, would you admit it?

**Red flag:** "Nothing would stop us" or "We will always find a way." This is cargo-cult entrepreneurship. Good ideas survive scrutiny; bad ones do not.

---

## 11. Ideation Modes

Every ideation session operates in one of two modes:

### Startup Mode (Validation-Focused)

**Goal:** Discover if the idea is worth pursuing before committing engineering resources.

**Characteristics:**
- Focus on talking to real users and discovering the actual problem
- Build only as much as necessary to test hypotheses (paper prototypes, landing pages, simple prototypes)
- Iterate rapidly on problem definition and positioning
- Kill ideas early if they fail any of the six forcing questions
- Success = "Should we keep going?" answered with data, not optimism

**Timeline:** 1-2 weeks per idea hypothesis

**Activities:**
- Competitive analysis and market sizing
- User interviews (5-10 conversations minimum)
- Landing page and fake sign-ups to test demand
- Simple prototype or video to demonstrate the concept
- Business model exploration and pricing brainstorm

**Exit criteria:**
- Answers to all six forcing questions with data
- Clear decision: Go, Pivot, or Kill
- Documented learning and reasons for the decision

### Builder Mode (Execution-Focused)

**Goal:** Translate a validated idea into a complete, shippable product specification.

**Characteristics:**
- Assume the problem and audience are clear (validated in Startup Mode)
- Deep dive into feature prioritization, technical architecture, and team allocation
- Write comprehensive PRDs and ADRs
- Plan for 4-12 week engineering execution
- Success = "Here is exactly what to build" with complete clarity

**Timeline:** 1-2 weeks per validated idea to produce complete spec

**Activities:**
- User story mapping and feature breakdown
- RICE prioritization of all features
- Technical ADRs for high-risk decisions
- UX flow documentation and design briefs
- Data migration and integration planning
- Risk assessment and launch readiness checklist

**Exit criteria:**
- Complete PRD approved by all stakeholders
- All ADRs written for non-obvious technical decisions
- Engineering team can start coding without ambiguity
- Success metrics and launch criteria defined

### Mode Selection Decision Tree

```
Do you know with certainty that:
├── Users suffer from this problem?
├── The problem is painful enough to pay for?
├── Your solution is better than existing alternatives?
└── You can reach 100 users?

YES to all 4 → Use Builder Mode
```

```
Any hesitation on the above?
→ Use Startup Mode first
```

---

## 12. Design Document Output

Every ideation session (Startup Mode or Builder Mode) must produce a Design Document with specific structure and content.

### Document Template

```markdown
# Ideation Document: [Project Name]

**Date:** [YYYY-MM-DD]
**Author(s):** [Name(s)]
**Mode:** Startup | Builder
**Status:** In Progress | Complete | Ready for Engineering

---

## Executive Summary

[3-4 sentences: What is the idea? Why does it matter? What stage are we at?]

---

## Problem

### Problem Statement
[Describe the specific problem in user language, not internal jargon.]

### Evidence
- [Data point or quote from research]
- [Metric showing the scale of the problem]
- [User quote or story illustrating the pain]

### Current State
[How do users solve this today? What workarounds exist?]

---

## Market & Competitive Landscape

### Target User
- [Brief persona description: role, context, pain point]

### Top 3 Competitors
| Competitor | Strength | Weakness | Why Ours is Better |
|-------------|----------|----------|-------------------|
| [Name] | | | |
| [Name] | | | |
| [Name] | | | |

### Market Opportunity
- Total Addressable Market (TAM): [Size and data source]
- Serviceable Market: [Realistic segment we target]
- Growth trajectory: [Is this market growing or shrinking?]

---

## Solution

### Core Concept
[One sentence description of the solution.]

### MVP Features (3-5 only)
1. [Feature] — [Why it is must-have in one sentence]
2. [Feature] — [Why it is must-have in one sentence]
3. [Feature] — [Why it is must-have in one sentence]

### Why This Matters
[Explain the differentiation. Why does our approach work better than existing solutions?]

---

## Validation Status (Startup Mode)

### Forcing Questions Answers
| Question | Answer | Evidence |
|----------|--------|----------|
| Q1: Who suffers? | [Answer] | [User interviews, customer data] |
| Q2: How much does it cost? | [Answer] | [Time/money quantified] |
| Q3: Why have existing solutions failed? | [Answer] | [Competitive analysis, user feedback] |
| Q4: Can we build MVP in 4 weeks? | [Answer] | [Risk assessment, team capacity] |
| Q5: Do we have user acquisition channels? | [Answer] | [Distribution partnerships, channels identified] |
| Q6: Kill criteria? | [Answer] | [Specific milestones that would trigger pivot or kill] |

### Validation Learnings
- [Key insight from interviews or research]
- [Assumption we validated]
- [Assumption we need to test further]

---

## Specification (Builder Mode)

### Personas & User Stories

#### Primary Persona
- [Name, role, context, need]

**Key User Stories (P0 — Must-Have):**
1. As [user type], I want [action], so that [benefit]
   - Acceptance criteria: [Given/When/Then]

2. As [user type], I want [action], so that [benefit]
   - Acceptance criteria: [Given/When/Then]

#### Secondary Personas
[Same structure as primary]

### Success Metrics
| Goal | Metric | Target | Baseline | Timeline |
|------|--------|--------|----------|----------|
| [Goal] | [KPI] | [N] | [Current] | [Date] |

### Feature Prioritization (RICE)
| Feature | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------|-------|--------|-----------|--------|-----------|----------|
| [Feature] | [N] | [1-3] | [%] | [PM] | [Score] | P0/P1/P2 |

### Technical Approach
- [Database choice and rationale]
- [API/architecture approach]
- [Key technical decisions (ADRs)]
- [Known constraints or risks]

---

## Business Model

### Pricing Strategy
[How will we monetize? What is the unit of value?]

### Revenue Projections (Directional)
- Year 1: [Estimate] based on [assumptions]
- Year 2: [Estimate] based on [assumptions]
- Key dependencies: [What has to be true for these numbers to work?]

---

## Go / No-Go Decision

### Recommendation
[Go / Pivot / No-Go]

### Reasoning
[Why this recommendation? Which forcing questions determine the outcome?]

### Next Steps
[If Go: What are the first 3 actions?]
[If Pivot: What is the new hypothesis to test?]
[If No-Go: Why kill this idea? What did we learn?]

---

## Appendices

### A. Interview Summaries
[Brief summaries of conversations with target users]

### B. Competitive Feature Comparison
[Detailed matrix of feature gaps]

### C. ADRs (if any)
[Links to any architecture decision records written during ideation]

### D. Assumptions & Dependencies
[Explicit list of what has to be true for this to work]
```

### Design Document Checklist

- [ ] Executive Summary is crystal clear (could be understood in 30 seconds)
- [ ] Problem is backed by evidence, not assumptions
- [ ] All six forcing questions have answers with data
- [ ] MVP scope is crisp (3-5 features max)
- [ ] Success metrics are measurable and have targets
- [ ] Business model is articulated (even if "undecided")
- [ ] Go/No-Go decision is explicit with clear reasoning
- [ ] All stakeholders have reviewed and approved

---

## Anti-Patterns to Avoid

- **Brainstorming without a time box** — Sessions longer than 60 minutes produce diminishing returns.
- **Skipping the convergence phase** — A list of 50 ideas is not a plan. You must filter.
- **Building before validating** — Talk to users before writing code. Five interviews cost less than one sprint.
- **MVP that is not Minimum** — If your MVP takes more than 4 weeks, it is not minimum.
- **Consensus-driven prioritization** — Prioritize by evidence and impact, not by who argues loudest.
- **PRD as wish-list** — Every feature must have justification. If everything is P0, nothing is.
- **Ignoring competitive intelligence** — Knowing your competition is not optional; it is strategic.
- **ADRs written after the fact** — Write decisions when they are made, not weeks later.
- **Design Document as theater** — The document serves the team; the team does not serve the document.

---

## When to Use This Skill

- At the very start of a new product or feature initiative
- When the team feels stuck and needs to reset direction
- When pivoting after initial user feedback invalidates assumptions
- During quarterly planning to evaluate new opportunities
- Before any major engineering commitment (> 1 month of team capacity)
- When stakeholders disagree on priorities and you need an objective framework
- When writing specs that will be handed to engineers for implementation

---

## Relation to Other Skills

- **brainstorming** ← Source material for this unified skill
- **product-manager-toolkit** ← Source material for this unified skill
- **competitive-landscape** ← Source material for this unified skill
- **prd** ← Source material for this unified skill
- **architecture-decision-records** ← Source material for this unified skill
- **senior-architect** — When ideation surfaces complex technical decisions requiring deep architecture review
- **backend-dev-guidelines** — When validating technical feasibility of MVP ideas
- **frontend-developer** — When sketching UX flows and design validation
- **ui-ux-pro-max** — When detailing design and user experience for Builder Mode specs

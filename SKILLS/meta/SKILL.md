---
name: meta
phase: null
always_active: false
absorbs: sota-autoimprove
description: "Self-improvement loop — eval, hypothesis, modification, ratchet, retrospective, telemetry. Cross-cutting skill that improves all other skills."
keywords: [autoimprove, auto-melhoria, melhorar skills, otimizar SOTA, retro, retrospectiva, telemetry, analytics, trends]
---

# Meta

> Cross-cutting — The skill that improves all other skills.

## 1. Autoimprove Loop (hypothesis → modify → eval → ratchet)

Apply the Karpathy autoresearch pattern to the SOTA system: a continuous autonomous loop that improves skills by measuring progress with an objective scalar metric, keeping only improvements and discarding regressions.

```
┌─────────────────────────────────────────────────────────┐
│              SOTA AUTOIMPROVE LOOP                       │
│                                                          │
│  eval-harness   (IMUTAVEL)  ← metrica: pass_rate        │
│  SKILL.md       (EDITAVEL)  ← agente modifica            │
│  program.md     (DIRECTIVAS) ← humano guia               │
│                                                          │
│  1. Escolher skill (pior score ou proxima na fila)       │
│  2. Ler SKILL.md + evals + historico + results.tsv       │
│  3. Formar hipotese de melhoria                          │
│  4. Modificar SKILL.md                                   │
│  5. Git commit (experiment: descricao)                   │
│  6. Correr evals (subagentes com e sem skill)            │
│  7. Medir pass_rate                                      │
│  8. Melhorou? → KEEP    Piorou? → git reset --hard       │
│  9. Registar em results.tsv                              │
│  10. NUNCA PARAR — repetir ate ser interrompido          │
└─────────────────────────────────────────────────────────┘
```

### The Contract of 3 Files (Adapted from Karpathy)

#### 1. Eval Harness (IMMUTABLE)

Script `scripts/eval-harness.py` that:
- Reads the evals of a skill (`evals/evals.json` within the skill directory)
- Executes each eval prompt using subagent with skill active
- Evaluates assertions against outputs
- Calculates **pass_rate** (0.0 to 1.0) — the unique scalar metric
- Never modified by the agent — it is absolute truth

The agent cannot change the metric nor the harness. This prevents "gaming the metric".

#### 2. SKILL.md (EDITABLE)

The only file the agent can modify in each iteration. Contains the instructions of the skill being improved. The agent forms a hypothesis, edits the SKILL.md, and measures the impact.

#### 3. program.md (HUMAN DIRECTIVES)

Markdown file in the autoimprove workspace root that humans can edit to guide the agent. Contains:
- Which skills to prioritize
- What types of improvement to try
- Constraints (ex: "don't increase SKILL.md above 500 lines")
- Specific research directions

The agent reads this file at the start of each iteration. If the human updates it mid-loop, the agent adapts in the next iteration.

### Prerequisites

Before running the loop, each skill needs evals. If a skill has no evals:

1. Generate 3-5 realistic test prompts for the skill
2. Define objective and verifiable assertions for each prompt
3. Store in `<skill-dir>/evals/evals.json`

Format:
```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "Realistic prompt a user would say",
      "expected_output": "Description of expected result",
      "assertions": [
        {
          "name": "descriptive-assertion-name",
          "check": "Output contains X",
          "type": "contains|structure|quality|programmatic"
        }
      ],
      "files": []
    }
  ]
}
```

### The Autonomous Loop

#### Phase 1: Skill Selection

Choose the next skill to improve. Prioritization criteria:

1. **program.md** — if human specified priority skills, follow the order
2. **Worst pass_rate** — skills with lowest score in results.tsv have most margin
3. **Most used** — frequently invoked skills benefit most from improvements
4. **No evals** — skills without evals need them first

#### Phase 2: Context Reading

Before each iteration, read:
- `SKILL.md` of target skill
- `evals/evals.json` of target skill
- `results.tsv` global (history of all experiments)
- `program.md` (human directives)
- `git log --oneline -20` (last 20 experiments)

This gives the agent context about what's been tried and what works.

#### Phase 3: Hypothesis

Form a specific and testable hypothesis:

- **GOOD:** "Adding concrete CTE examples to the complex queries section will improve pass_rate because evals test if output includes well-formed CTEs"
- **BAD:** "Improve the skill"

The hypothesis must explain WHAT to change, WHY it will improve, and HOW to measure.

#### Phase 4: Modification

Edit the SKILL.md. One change per iteration — don't change multiple things at once. This isolates the impact of each change.

Types of modification to consider:
- Add concrete examples where missing
- Clarify ambiguous instructions
- Remove content that doesn't contribute (skill should be lean)
- Reorganize for better logical flow
- Add anti-patterns section
- Improve description for better triggering
- Explain the "why" instead of just the "what"

#### Phase 5: Commit

```bash
git add SKILLS/<skill-name>/SKILL.md
git commit -m "experiment(<skill-name>): <short description of hypothesis>"
```

The commit happens BEFORE running evals. If evals fail, the commit is reverted. This ensures git log maintains the complete history of experiments.

#### Phase 6: Eval Execution

Run the eval harness:

```bash
python SKILLS/meta/scripts/eval-harness.py \
  --skill-path SKILLS/<skill-name> \
  --results-file .sota/autoimprove/results.tsv
```

The harness:
1. Reads each eval prompt
2. Launches subagent with skill active to execute the prompt
3. Evaluates assertions against output
4. Calculates pass_rate = assertions_passed / total_assertions

#### Phase 7: Decision (Ratcheting)

```
If pass_rate >= pass_rate_previous:
    STATUS = "keep"
    → maintain the commit
    → update best_pass_rate

If pass_rate < pass_rate_previous:
    STATUS = "discard"
    → git reset --hard HEAD~1
    → SKILL.md reverts to previous state
```

The rule is implacable: only forward progress is kept. There is no "almost improved" or "different but not worse". Improved = keep. Not improved = discard.

#### Phase 8: Registration

Append to `.sota/autoimprove/results.tsv`:

```
commit          skill               pass_rate   prev_rate   status    hypothesis
a1b2c3d4        data-analytics      0.850       0.800       keep      Added CTE examples
e5f6g7h8        data-analytics      0.780       0.850       discard   Removed SQL section
i9j0k1l2        visual-diagrams     0.900       0.875       keep      Added Mermaid examples
```

#### Phase 9: Repeat

NEVER STOP. Return to Phase 1 and choose next skill or iterate on the same. The loop only terminates when the human interrupts.

---

## 2. Eval Harness

### Implementation Details

The eval harness (`scripts/eval-harness.py`) is the immutable source of truth. It:

1. **Loads evals** from `<skill-dir>/evals/evals.json`
2. **Launches subagents** — for each eval prompt:
   - Subagent receives the prompt
   - Skill is active in the subagent's context
   - Output is captured
3. **Evaluates assertions** — for each assertion in the eval:
   - Parse assertion type (contains, structure, quality, programmatic)
   - Check assertion against output
   - Record pass/fail
4. **Calculates metrics**:
   - `pass_rate` = assertions_passed / total_assertions
   - `tokens_used` (context consumed)
   - `eval_time` (wall-clock duration)
5. **Outputs results** — appends to results.tsv with:
   - timestamp
   - skill_name
   - pass_rate
   - hypothesis (from git commit message)
   - status (keep or discard)

### Assertion Types

- **contains**: Check if output contains specific text/substring
- **structure**: Validate output structure (JSON schema, format, etc.)
- **quality**: Qualitative checks (readability, coherence, tone)
- **programmatic**: Custom Python assertions for complex validation

---

## 3. Ratcheting (Never Regress)

Ratcheting is the enforcement mechanism that prevents degradation:

### The Ratchet Algorithm

```python
def ratchet(new_pass_rate, prev_pass_rate, commit_hash):
    """
    Apply ratcheting: keep improvements, discard regressions.
    """
    if new_pass_rate >= prev_pass_rate:
        # KEEP: move forward
        status = "keep"
        log_result(status, new_pass_rate, commit_hash)
    else:
        # DISCARD: revert to previous state
        status = "discard"
        git_reset_hard(f"{commit_hash}~1")
        log_result(status, new_pass_rate, commit_hash)

    return status
```

### Key Properties

1. **Monotonic improvement** — pass_rate can only stay same or increase (never decrease)
2. **Automatic enforcement** — no human decision needed, purely metric-driven
3. **Immutable commits** — once ratcheted, commits are permanent record
4. **Revertible changes** — failed experiments are discarded without manual effort

### Boundary Conditions

- **Tie case** (new_pass_rate == prev_pass_rate): KEEP. Neutral changes don't hurt and can enable future progress.
- **First experiment** (no prev_rate): Always KEEP the first baseline.
- **Catastrophic failure** (new_pass_rate == 0.0): Still follows algorithm — DISCARD if regression, even if dramatic.

---

## 4. Retrospective (Periodic Analysis)

Retrospectives provide periodic insights into skill health, trends, and hotspots. They run weekly by default or on-demand.

### Retrospective Dimensions

#### 4.1 Velocity Analysis

Track improvement speed over time:

```json
{
  "period": "2026-03-19 to 2026-03-26",
  "experiments_total": 28,
  "experiments_kept": 18,
  "experiments_discarded": 10,
  "keep_rate": 0.643,
  "avg_improvement_per_keep": 0.034,
  "total_improvement": 0.612,
  "velocity_trend": "accelerating"
}
```

- **experiments_total** — Number of iterations in the period
- **experiments_kept** — Successful iterations
- **experiments_discarded** — Failed iterations (ratcheted)
- **keep_rate** — Ratio of kept to total (target: >0.60)
- **avg_improvement_per_keep** — Average pass_rate delta per successful experiment
- **total_improvement** — Cumulative pass_rate improvement
- **velocity_trend** — "accelerating" | "stable" | "decelerating"

#### 4.2 Per-Skill Health

Analyze each skill's trajectory:

```json
{
  "skill": "data-analytics",
  "experiments": 12,
  "pass_rate_start": 0.65,
  "pass_rate_current": 0.92,
  "improvement": 0.27,
  "status": "healthy",
  "last_keep": "2026-03-26T14:22:00Z",
  "consecutive_discards": 0,
  "hypothesis_types_that_work": [
    "Add examples (7 keeps)",
    "Clarify instructions (4 keeps)",
    "Reorganize structure (1 keep)"
  ],
  "hypothesis_types_that_fail": [
    "Remove content (3 discards)",
    "Condense text (2 discards)"
  ]
}
```

- **status** — "healthy" (improving) | "stale" (no change >3 days) | "struggling" (>2 consecutive discards)
- **hypothesis_types_that_work** — Empirical list of what actually improves pass_rate
- **hypothesis_types_that_fail** — Empirical list of what degrades or stalls

#### 4.3 Per-Author Contributions

If multiple agents run experiments, track contribution:

```json
{
  "agent_id": "agent-meta-001",
  "experiments_run": 45,
  "experiments_kept": 29,
  "keep_rate": 0.644,
  "avg_pass_rate_improvement": 0.041,
  "total_pass_rate_improvement": 1.89,
  "preferred_tactics": [
    "Add examples",
    "Reorganize",
    "Clarify"
  ],
  "less_effective_tactics": [
    "Condense",
    "Remove"
  ]
}
```

#### 4.4 Hotspots and Gaps

Identify skills or areas that need attention:

```json
{
  "stale_skills": [
    {
      "skill": "frontend-design",
      "days_without_keep": 8,
      "pass_rate": 0.78,
      "suggestion": "Hypothesis creativity may be exhausted. Consider human input."
    }
  ],
  "emerging_winners": [
    {
      "skill": "data-analytics",
      "consecutive_keeps": 4,
      "pass_rate_improvement": 0.15,
      "trend": "strong momentum"
    }
  ],
  "regression_risks": [
    {
      "skill": "auth-implementation",
      "consecutive_discards": 3,
      "last_keep": "2026-03-15",
      "recommendation": "Review eval quality or reset hypothesis direction"
    }
  ]
}
```

### Retrospective Output

Retrospectives are written to `.sota/retros/retrospective-YYYY-MM-DD.md`:

```markdown
# SOTA Meta Retrospective — 2026-03-26

## Summary
- **Period:** 2026-03-19 to 2026-03-26
- **Experiments:** 28 total, 18 kept (64%), 10 discarded
- **Velocity:** Accelerating (+12% keep_rate vs prior week)
- **Overall pass_rate improvement:** +0.62 (avg across all skills)

## Velocity Snapshot
[Graphs and charts of improvement over time]

## Per-Skill Health
[Table of each skill's trajectory]

## Per-Author Contributions
[Breakdown of work by agent_id]

## Hotspots & Gaps
- **Stale:** frontend-design (8 days no keep)
- **Winners:** data-analytics (+0.15 this week)
- **Struggling:** auth-implementation (3 consecutive discards)

## Emerging Patterns
- Hypotheses with concrete examples: 87% keep rate
- Hypotheses with removals: 23% keep rate
- Reorganization: 56% keep rate

## Recommendations
1. Double down on example-driven improvements
2. Investigate auth-implementation eval quality
3. Consider human guidance for frontend-design

## Next Week Goals
- Target data-analytics to 1.0 (currently 0.92)
- Stabilize auth-implementation (break discard streak)
- Frontload examples in all hypotheses
```

---

## 5. Telemetry (Logging and Analytics)

Telemetry captures fine-grained execution data for analysis and optimization.

### 5.1 Telemetry Collection

Every experiment logs telemetry to `.sota/analytics/telemetry.jsonl`:

```json
{
  "timestamp": "2026-03-26T14:22:15.342Z",
  "experiment_id": "exp-meta-0284",
  "skill_name": "data-analytics",
  "phase": 4,
  "hypothesis": "Added CTEs to complex queries section",
  "hypothesis_category": "add_examples",
  "status": "keep",
  "pass_rate_new": 0.92,
  "pass_rate_prev": 0.88,
  "pass_rate_delta": 0.04,
  "eval_count": 5,
  "assertions_total": 23,
  "assertions_passed": 21,
  "assertions_failed": 2,
  "tokens_used": 4521,
  "eval_time_ms": 8340,
  "skill_size_bytes": 2847,
  "skill_size_lines": 112,
  "git_commit": "a1b2c3d4",
  "agent_id": "agent-meta-001",
  "model": "claude-opus-4",
  "notes": "Strong improvement, examples directly addressed eval assertions"
}
```

Fields:
- **experiment_id** — Unique ID for this experiment (for tracing)
- **hypothesis_category** — Classify hypothesis type (add_examples, clarify, reorganize, remove, etc.)
- **pass_rate_delta** — Improvement (positive) or degradation (negative)
- **eval_count** — Number of evals run
- **tokens_used** — Total tokens consumed
- **eval_time_ms** — Wall-clock time for evals
- **skill_size_*** — Track skill growth (prevent bloat)
- **agent_id** — Which agent ran this experiment
- **model** — Which model was used for the subagent
- **notes** — Free-form observations

### 5.2 Trend Snapshots

Persist JSON snapshots to `.sota/retros/trends-YYYY-MM-DD.json` for longitudinal analysis:

```json
{
  "date": "2026-03-26",
  "timestamp": "2026-03-26T23:59:59Z",
  "period": "weekly",
  "snapshot": {
    "total_experiments_cumulative": 284,
    "total_experiments_kept": 182,
    "global_keep_rate": 0.641,
    "skill_count": 28,
    "skills_healthy": 22,
    "skills_stale": 3,
    "skills_struggling": 3,
    "avg_pass_rate_all_skills": 0.834,
    "median_pass_rate": 0.88,
    "highest_pass_rate_skill": "visual-diagrams (0.98)",
    "lowest_pass_rate_skill": "auth-implementation (0.62)",
    "hypothesis_category_stats": {
      "add_examples": {
        "total": 78,
        "kept": 68,
        "keep_rate": 0.872
      },
      "clarify": {
        "total": 64,
        "kept": 45,
        "keep_rate": 0.703
      },
      "reorganize": {
        "total": 42,
        "kept": 23,
        "keep_rate": 0.548
      },
      "remove": {
        "total": 28,
        "kept": 6,
        "keep_rate": 0.214
      }
    },
    "velocity_acceleration": 1.12,
    "trend": "accelerating"
  }
}
```

### 5.3 Analytics Queries

The telemetry system supports analytics queries to answer questions like:

- **"What hypothesis types have the highest keep_rate?"** → Aggregate by hypothesis_category, sort by keep_rate
- **"Which skills are progressing fastest?"** → Group by skill_name, calculate pass_rate_delta over time window
- **"How does token usage correlate with pass_rate improvement?"** → Scatter plot of tokens_used vs pass_rate_delta
- **"Has velocity accelerated this week?"** → Compare keep_rate this week vs last week
- **"Which agent_id is most effective?"** → Rank agents by keep_rate and total improvement

### 5.4 Telemetry Storage Format

- **JSONL** (`.sota/analytics/telemetry.jsonl`) — Streaming log of all experiments (one JSON per line, append-only)
- **Snapshots** (`.sota/retros/trends-*.json`) — Daily/weekly aggregate snapshots for time-series analysis
- **CSV export** (`results.tsv`) — Simplified view for quick inspection

### 5.5 Privacy and Retention

- Telemetry is **local only** — never sent to external services
- Retention: Keep last 90 days of telemetry, archive older data
- Aggregation: Individual experiment details decay into summaries over time

---

## 6. Security of the Loop

### What the agent CANNOT do:
- Modify `eval-harness.py` — the metric is immutable
- Modify `evals.json` — tests are immutable within a round
- Modify `CLAUDE.md` or `ARCHITECTURE.md` — only humans update structure
- Skip the eval phase — every change is measured
- Keep a change that worsened the score — ratcheting is automatic
- Modify telemetry or retrospective scripts — analytics are immutable

### What the agent CAN do:
- Modify any `SKILL.md` in the priority list
- Add/remove/reorganize content within SKILL.md
- Read any project file for context
- Launch subagents to execute evals
- Record results in results.tsv
- Update telemetry logs
- Generate retrospectives (read-only analysis)

---

## 7. Initialization

To initialize the loop for the first time:

```bash
# 1. Create directories
mkdir -p .sota/autoimprove .sota/analytics .sota/retros

# 2. Create program.md with initial directives
# (human writes or agent generates draft for approval)
cat > .sota/autoimprove/program.md <<EOF
# SOTA Meta — Directives

## Priorities
1. data-analytics — pass_rate at 0.65, needs boost
2. visual-diagrams — quality of Mermaid examples
3. auth-implementation — new skill, establish baseline

## Constraints
- Don't exceed 500 lines per SKILL.md
- Prefer removing unused content to adding
- Always explain the "why"

## Directions to Explore
- Do concrete examples improve pass_rate more than clarifications?
- What's the optimal skill file length?

## Do Not Touch
- Fase 0 skills (stable)
- SECURITY/* skills (need human review)
EOF

# 3. Create results.tsv with header
echo -e "commit\tskill\tpass_rate\tprev_rate\tstatus\thypothesis\ttimestamp" \
  > .sota/autoimprove/results.tsv

# 4. Create telemetry header (JSONL is append-only, no header needed)
touch .sota/analytics/telemetry.jsonl

# 5. Verify target skills have evals
# If not, generate them first

# 6. Launch the loop
# Agent begins iterating autonomously
```

---

## 8. Relations to Other Skills

- **kaizen** — Meta is automated kaizen: continuous improvement via loop
- **enforcement-layer** — Ensures improved skills continue to be invoked
- **verification-before-completion** — Each iteration verifies before declaring "keep"
- **dispatching-parallel-agents** — Subagents execute evals in parallel
- **vibe-code-auditor** — Can be used as complementary eval for general quality
- **skill-creator** — Create evals when skill is missing them
- **concise-planning** — Meta uses planning in hypothesis formation
- **systematic-debugging** — When evals fail, systematic debugging identifies root cause
- **git-pushing** — Meta relies on atomic commits and ratcheting via git

---

## 9. Running Meta

### On-Demand Execution

Invoke meta when user requests autoimprovement:

```
User: "Run a meta cycle on the data-analytics skill"
→ Router detects "auto-melhoria" keyword
→ Activates meta skill
→ Agent runs phases 1-9 once
```

### Continuous Execution

For long-running autonomous loops:

```bash
# Run meta indefinitely (runs until interrupted)
./scripts/meta-daemon.sh start

# Check status
./scripts/meta-daemon.sh status

# View live progress
tail -f .sota/analytics/telemetry.jsonl | jq '.[] | select(.status=="keep")'

# Stop daemon
./scripts/meta-daemon.sh stop
```

### Inspection Commands

```bash
# View recent results
tail -20 .sota/autoimprove/results.tsv

# See latest retrospective
cat .sota/retros/retrospective-$(date +%Y-%m-%d).md

# Analyze trends
python .sota/scripts/trend-analysis.py --days 7

# Compare agents
python .sota/scripts/agent-comparison.py
```

---

## 10. Directivas for program.md

Humans create `.sota/autoimprove/program.md` with instructions like:

```markdown
# SOTA Meta — Directivas

## Priorities
1. data-analytics — pass_rate está em 0.60, precisa de subir
2. prd — skill nova, precisa de evals e primeira ronda de melhorias
3. visual-diagrams — focar na qualidade dos exemplos Mermaid

## Restricoes
- Nao aumentar nenhum SKILL.md acima de 500 linhas
- Preferir remover conteudo inutil a adicionar novo
- Explicar o "porque" — nao usar MUST/ALWAYS sem justificacao

## Direcoes a Explorar
- Testar se adicionar anti-padroes melhora a qualidade dos outputs
- Experimentar reorganizar skills por fluxo de trabalho em vez de topico
- Ver se exemplos com erros comuns (e como evita-los) ajudam

## Nao Tocar
- Fase 0 skills (concise-planning, systematic-debugging, etc.) — estao estaveis
- SECURITY/* skills — requerem revisao humana
```

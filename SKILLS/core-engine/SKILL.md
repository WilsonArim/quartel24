---
name: core-engine
phase: 0
always_active: true
absorbs: [concise-planning, systematic-debugging, lint-and-validate, kaizen, verification-before-completion, enforcement-layer]
description: "Operating system of SOTA — governs HOW work is done, not WHAT is built. Merges planning, debugging, validation, continuous improvement, verification, and enforcement into a unified execution protocol."
keywords: [planning, debug, lint, validate, verify, done, complete, improve, enforce, decision, autonomous, chaining]
---

# Core Engine

> Phase 0 — ALWAYS ACTIVE. The execution engine behind every SOTA interaction.

The Core Engine is not a collection of separate skills. It is a unified operating system that governs how ALL work is executed in SOTA. Every response, every commit, every decision flows through this protocol.

---

## 1. Planning Protocol

Always start with a plan. Never jump straight into code. A few minutes of structured thinking prevents hours of rework, miscommunication, and wasted effort.

### Core Principle

Think first, then act. Every task above trivial complexity deserves a brief plan. The plan is not a document for its own sake — it is a forcing function for clarity.

### When to Plan

- Before implementing any feature or fix that touches more than one file.
- Before refactoring existing code.
- Before investigating a bug that is not immediately obvious.
- When a task has ambiguous requirements or multiple valid approaches.
- When coordinating work across multiple people or systems.

You do NOT need a formal plan for:
- Single-line fixes with obvious solutions.
- Renaming a variable or fixing a typo.
- Tasks where the entire scope fits in your head with zero uncertainty.

### Plan Template

Every plan should contain these four sections. Keep each section to 1-5 bullet points.

#### 1. Goal
State the desired outcome in one sentence. Be specific.
- BAD: "Fix the auth bug"
- GOOD: "Ensure that expired JWT tokens return 401 instead of 500 on all protected endpoints"

#### 2. Steps
List the concrete actions in order. Number them. Each step should be independently verifiable.
```
1. Reproduce the issue with an expired token on /api/users
2. Trace the middleware chain to find where the error is swallowed
3. Add proper token validation with explicit expiry check
4. Update error handler to return 401 with structured error body
5. Add test case for expired token scenario
```

#### 3. Risks
Identify what could go wrong or what you are uncertain about.
- "The auth middleware is shared across 12 routes — changes may have side effects"
- "Not sure if the refresh token flow is affected"
- "No existing test coverage for this path"

#### 4. Success Criteria
Define how you will know the task is done. These should be objectively verifiable.
- Expired tokens return 401 with `{ error: "token_expired" }` body
- All existing auth tests still pass
- New test covers the expired token case
- Manual verification against staging environment

### Iterative Planning

Plans are not set in stone. They are living documents that evolve as you learn more.

#### Plan-Execute-Revise Cycle
1. Write the initial plan (5 minutes max).
2. Execute the first 1-2 steps.
3. Revise the plan based on what you learned.
4. Repeat until done.

#### When to Revise
- You discover the problem is different from what you assumed.
- A step turns out to be more complex than expected.
- You find a simpler approach mid-execution.
- New requirements or constraints emerge.

#### When to Escalate
- The revised plan is fundamentally different from the original.
- The scope has grown beyond the original estimate by more than 2x.
- You have been stuck on a single step for more than 30 minutes.

### Anti-Patterns in Planning

#### Over-Planning
Writing a 50-line plan for a 10-line change. The plan should be proportional to the complexity and risk of the task. If your plan is longer than your implementation, something is wrong.

#### Planning Without Context
Writing a plan before reading the relevant code. Always read first, then plan. Your plan should reference specific files, functions, and data structures.

#### Plan-and-Forget
Writing a plan and then ignoring it. The plan is a checklist — refer back to it as you work. Cross off steps as you complete them.

#### Premature Architecture
Designing an entire system architecture when you only need to fix one endpoint. Plan at the appropriate level of abstraction for the task at hand.

#### Analysis Paralysis
Spending 45 minutes planning a 15-minute task. Set a time box: if the plan is not done in 5 minutes for a small task or 15 minutes for a large task, start executing and refine as you go.

### Planning Rules

1. ALWAYS state the goal before writing any code.
2. ALWAYS list steps when the task has more than two actions.
3. NEVER skip the risks section — even "no known risks" is a valid entry.
4. KEEP plans concise. Brevity is a feature, not a bug.
5. REVISE the plan when reality diverges from expectations.
6. SHARE the plan with collaborators before executing when working in a team.
7. TIME-BOX planning to prevent analysis paralysis.

### Quick Reference

For small tasks (under 30 min):
```
Goal: [one sentence]
Steps: [numbered list, 2-4 items]
```

For medium tasks (30 min to half day):
```
Goal: [one sentence]
Steps: [numbered list, 4-8 items]
Risks: [1-3 bullets]
Success: [2-4 criteria]
```

For large tasks (more than half day):
```
Full template with all four sections.
Consider breaking into multiple smaller plans.
```

---

## 2. Debug Protocol

Debugging is not guessing. It is a disciplined process of forming hypotheses and testing them. Random changes waste time and often introduce new bugs.

### Core Principle

Every debugging session follows a protocol. You never change code without a hypothesis about why that change will fix the problem.

### The Five-Step Debug Sequence

Follow these five steps in order. Do not skip steps.

#### Step 1: Reproduce
Before anything else, reproduce the bug reliably.
- Get the exact error message, stack trace, or incorrect behavior.
- Identify the minimum steps to trigger the issue.
- Note the environment: OS, Node version, browser, database state.
- If you cannot reproduce it, you cannot fix it. Gather more information first.

#### Step 2: Hypothesize
Form a specific, testable hypothesis about the cause.
- BAD: "Something is wrong with the database"
- GOOD: "The query in getUserById returns null because the id parameter is a string but the column type is integer, causing a type mismatch in the WHERE clause"

Write your hypothesis down. This prevents you from drifting into random exploration.

#### Step 3: Test
Design a minimal test for your hypothesis.
- Add a targeted log statement or breakpoint.
- Write a failing test case that captures the bug.
- Inspect the specific variable, query, or response you suspect.
- Do NOT change multiple things at once. Test one hypothesis at a time.

#### Step 4: Fix
Apply the smallest possible change that addresses the confirmed root cause.
- Fix the root cause, not the symptom.
- If the fix is more than 10 lines, pause and reconsider whether you found the real root cause.
- Do not add workarounds unless you document why and create a follow-up task.

#### Step 5: Verify
Confirm the fix works and has no side effects.
- Reproduce the original bug scenario — it should be gone.
- Run the full test suite.
- Check related functionality for regressions.
- Remove any temporary debug logging or breakpoints.

### When NOT to Debug — Read First

Sometimes the answer is right in front of you. Before entering the debug protocol:

1. **Read the error message.** Many developers skip the actual error text. Read it carefully, word by word. Most error messages tell you exactly what is wrong.
2. **Read the stack trace.** Find YOUR code in the stack trace (ignore framework internals). The bug is almost always at the boundary between your code and the library code.
3. **Check the obvious.** Typos, missing imports, wrong file paths, undefined environment variables. A 5-second check saves a 30-minute investigation.
4. **Search the error.** Paste the exact error message into your search engine. If thousands of people have hit the same error, the fix is documented.

### Binary Search Technique

When you have no idea where the bug is, use binary search to narrow it down.

#### For Logic Bugs
1. Find a known-good state and a known-bad state in your data flow.
2. Add a checkpoint at the midpoint.
3. If the data is correct at the midpoint, the bug is in the second half.
4. If incorrect, the bug is in the first half.
5. Repeat until you isolate the exact line or function.

#### For Regressions
1. Find a commit where the feature worked (git log / git bisect).
2. Find the current broken commit.
3. Use `git bisect` to binary search through commits.
```bash
git bisect start
git bisect bad HEAD
git bisect good abc1234
# Test each commit git bisect suggests
git bisect good  # or git bisect bad
```

#### For Configuration Issues
1. Start with a minimal working configuration.
2. Add settings back one at a time until the bug appears.
3. The last added setting is the culprit.

### Logging Strategy for Debugging

#### Effective Debug Logging
- Log INPUTS and OUTPUTS of the suspected function.
- Include timestamps when investigating timing issues.
- Log the ACTUAL value, not just "value exists": `console.log('userId:', userId)` not `console.log('has userId')`.
- Use structured logging: `{ event: 'query_failed', table: 'users', error: err.message }`.

#### What to Log at Each Level
- **ERROR**: Something failed that should not have. Requires attention.
- **WARN**: Something unexpected happened but the system recovered.
- **INFO**: Significant business events (user created, payment processed).
- **DEBUG**: Detailed technical information for troubleshooting. Never in production.

#### Cleanup Rule
All debug logging added during investigation MUST be removed or converted to appropriate permanent logging before the fix is merged.

### Common Debugging Patterns

#### The Null Reference
Symptom: "Cannot read property X of undefined"
Protocol: Trace the variable backward from the error to its source. Find where it was supposed to be assigned and why it was not.

#### The Race Condition
Symptom: Works sometimes, fails sometimes. Passes locally, fails in CI.
Protocol: Look for shared mutable state, missing await keywords, unguarded async operations. Add sequencing or locking.

#### The Silent Failure
Symptom: No error, but wrong behavior.
Protocol: Add assertions at key points. Check for swallowed exceptions (empty catch blocks). Verify return values are being used.

#### The Environment Bug
Symptom: Works on my machine.
Protocol: Compare environment variables, package versions, OS, database state. Use `diff` on configuration files between environments.

### The Three-Strike Rule for Debugging

When you've attempted to fix the same bug three different ways and none worked, STOP. The problem is not the fix — it is your understanding of the root cause.

- After 3 failed attempts: **REVERT all changes** and start fresh.
- Review what you learned from each attempt.
- Form a new hypothesis about the actual root cause.
- Proceed with a clean implementation.

This is not failure. This is disciplined debugging. Persisting past 3 strikes creates tangled code that surprises everyone later.

### The Revert & Reimplement Rule

When the fix process gets messy — multiple failed attempts, spaghetti patches, or code that "works but nobody knows why" — the right move is to stop patching and start fresh.

This happens more often than you'd think: you try approach A, it half-works, you patch it with B, then C fixes a side effect of B, and now you have a Frankenstein fix that's harder to understand than the original bug. This is the single most important debugging habit: **revert and reimplement cleanly**.

#### When to Revert
- You've made 3+ failed attempts and the code is getting tangled.
- The fix works but you can't explain why in one sentence.
- You found the right solution but arrived at it through messy trial-and-error.
- The diff is large and full of experimental leftovers.

#### How to Revert & Reimplement
1. **Identify the winning approach** — understand what actually solved the problem.
2. **Git stash or note the solution** — save the key insight, not the messy code.
3. **Revert all changes** — `git checkout .` or `git stash` to get back to clean state.
4. **Reimplement only the clean solution** — as if you knew the answer from the start.
5. **Verify** — run the same reproduction steps to confirm the fix.

The result is a clean, minimal diff that reviewers can understand and that won't surprise anyone six months from now.

### Debug Protocol Rules

1. NEVER change code without a hypothesis about why that change will fix the issue.
2. ALWAYS reproduce the bug before attempting to fix it.
3. ALWAYS read the full error message and stack trace first.
4. TEST one hypothesis at a time. Never change multiple things simultaneously.
5. FIX the root cause, not the symptom.
6. VERIFY the fix by reproducing the original failure scenario.
7. CLEAN UP all temporary debug code before committing.
8. DOCUMENT non-obvious bugs with a comment explaining what went wrong and why.
9. WRITE a regression test for every bug you fix.
10. TIME-BOX your investigation. If stuck for 30 minutes, step back and reassess.
11. INVOKE the 3-strike rule — revert and start fresh after 3 failed attempts.
12. REVERT & REIMPLEMENT when the fix gets messy — clean solution > patched solution.

---

## 3. Validation Gate

Code that has not been linted and validated is not ready to deliver. Automated checks catch entire categories of bugs before a human ever needs to look at the code.

### Core Principle

Never rely on manual review to catch what a machine can catch automatically. Linting and validation are the first line of defense, not an afterthought.

### Linting Rules

#### What Linting Catches
- Syntax errors and typos in variable names.
- Unused variables and imports (dead code).
- Inconsistent formatting that hinders readability.
- Common anti-patterns and known bug sources.
- Accessibility violations in UI code.
- Security issues like eval() usage or prototype pollution.

#### When to Lint
- After every file save (IDE integration).
- Before every commit (pre-commit hook).
- In CI on every pull request (enforcement gate).
- Linting is not optional. It is infrastructure.

### TypeScript Strict Mode

Always enable strict mode in TypeScript projects. The following compiler options should be active in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### Why Strict Mode Matters
- `strict: true` enables all strict type checking options at once.
- `noUncheckedIndexedAccess` prevents assuming array/object access always returns a value. This alone catches a large class of runtime errors.
- `noImplicitReturns` ensures every code path in a function returns a value.
- These are not pedantic rules. Each one prevents a real category of production bugs.

#### Dealing with Strict Mode in Legacy Code
- Enable strict mode incrementally using per-file `// @ts-strict` comments or by configuring `include` paths.
- Never weaken the tsconfig to accommodate new code. Fix the code instead.
- Use `// @ts-expect-error` with a comment explaining why, never `// @ts-ignore`.

### ESLint Configuration Recommendations

#### Recommended Base Configs
- `@typescript-eslint/recommended` as the minimum for TypeScript projects.
- `eslint:recommended` as the baseline for JavaScript projects.
- `eslint-plugin-import` for import order and unused import detection.
- `eslint-config-prettier` to avoid conflicts between ESLint and Prettier.

#### Key Rules to Enable
```javascript
{
  "rules": {
    "no-console": "warn",
    "no-debugger": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "import/no-cycle": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }],
    "eqeqeq": ["error", "always"],
    "no-var": "error",
    "prefer-const": "error"
  }
}
```

#### Rules to Avoid
- Do not enable stylistic rules that conflict with Prettier. Let Prettier handle formatting and ESLint handle logic.
- Do not disable rules project-wide to fix one file. Use inline overrides sparingly.

### Pre-Commit Hooks

Use `husky` and `lint-staged` to enforce validation before code enters the repository.

#### Recommended Setup
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

#### What Pre-Commit Hooks Should Run
1. Linting with auto-fix on staged files.
2. Formatting with Prettier on staged files.
3. Type checking (`tsc --noEmit`) on the full project.
4. Unit tests related to changed files (optional but recommended).

#### What Pre-Commit Hooks Should NOT Run
- Full test suite (too slow — save for CI).
- Build steps (too slow — save for CI).
- Anything that takes more than 10 seconds.

### Validation Checklist Before Delivering Code

Run through this checklist before marking any task as complete:

#### Automated Checks
- [ ] `tsc --noEmit` passes with zero errors.
- [ ] `eslint .` passes with zero errors and zero warnings.
- [ ] `prettier --check .` reports no formatting issues.
- [ ] All existing tests pass.
- [ ] New code has corresponding test coverage.

#### Manual Checks
- [ ] No `console.log` statements left in production code.
- [ ] No `any` types introduced without justification.
- [ ] No `// @ts-ignore` or `// @ts-expect-error` without explanatory comments.
- [ ] No hardcoded secrets, URLs, or environment-specific values.
- [ ] No TODO comments without a linked issue or ticket number.
- [ ] Error handling is present for all async operations.
- [ ] Function and variable names are descriptive and consistent.

### Validation Gate Rules

1. NEVER deliver code that does not pass linting and type checking.
2. ALWAYS run `tsc --noEmit` before considering TypeScript code complete.
3. NEVER disable a lint rule project-wide to fix a local issue.
4. ALWAYS use `--max-warnings=0` in CI to prevent warning accumulation.
5. TREAT warnings as errors in CI. Warnings in CI are just errors you have not fixed yet.
6. FIX lint errors by improving code, not by adding disable comments.
7. CONFIGURE pre-commit hooks in every project from day one.
8. KEEP lint configuration in version control. It is project infrastructure, not personal preference.
9. UPDATE lint rules when the team agrees on new standards. Do not let the config become stale.
10. RUN the full validation checklist before every pull request.

---

## 4. Improvement Habits (Kaizen)

Kaizen means "change for the better." In software, it is the disciplined practice of making small, continuous improvements to code, processes, and tools. Not as a separate initiative, but as a natural part of daily work.

### Core Principle

Leave every file, system, and process slightly better than you found it. Improvement is not a project — it is a habit.

### The Boy Scout Rule

"Always leave the campground cleaner than you found it."

When you open a file to make a change, look for one small improvement you can make while you are there. Not a rewrite. Not a refactor epic. One thing:

- Rename an unclear variable.
- Add a missing type annotation.
- Remove a dead import.
- Fix a misleading comment.
- Extract a magic number into a named constant.

#### Boundaries
- The improvement must be small enough to include in your current commit.
- The improvement must not change the behavior of the system.
- The improvement must not require its own review cycle.
- If the improvement is larger than these bounds, create a ticket instead.

### When to Suggest Improvements

#### During Code Review
This is the primary venue for improvement suggestions. When reviewing code:
- Focus on patterns, not just the specific lines changed.
- Distinguish between "must fix" (bugs, security) and "consider improving" (style, performance).
- Provide the improved version, not just criticism.

#### During Implementation
When you encounter code that could be better while working on your own task:
- Small fixes: apply the Boy Scout Rule and include in your commit.
- Medium fixes: note them and create a separate commit or ticket.
- Large fixes: document the issue and propose it for a future sprint.

#### During Debugging
Debugging often reveals structural problems. When you fix a bug:
- Ask: "Why was this bug possible? What structural change would prevent this class of bug entirely?"
- If the answer is a reasonable refactor, propose it.

#### During Onboarding
New team members see the codebase with fresh eyes. Their confusion points to documentation gaps, naming problems, and unnecessary complexity. Capture their feedback systematically.

### Improvement Categories

#### Performance
- Identify N+1 queries and batch them.
- Cache expensive computations that are called repeatedly with the same inputs.
- Replace synchronous blocking operations with async alternatives.
- Measure before and after. Performance improvements without benchmarks are guesses.

Trigger: Response times exceeding SLA, high CPU/memory usage, user complaints about speed.

#### Readability
- Replace clever code with clear code. Clever is the enemy of maintainable.
- Break long functions into smaller ones with descriptive names.
- Add type annotations where inference is not obvious.
- Use domain language in variable and function names.

Trigger: You need to read a function more than twice to understand it. A colleague asks "what does this do?"

#### Security
- Remove hardcoded credentials and replace with environment variables.
- Add input validation and sanitization at system boundaries.
- Update dependencies with known vulnerabilities.
- Add rate limiting to public endpoints.
- Review and tighten permissions (database roles, API scopes, file access).

Trigger: Dependency audit warnings, penetration test results, new OWASP guidelines, any security incident.

#### Developer Experience (DX)
- Reduce build times. Every second matters when it runs hundreds of times per day.
- Improve error messages. A good error message tells the developer what happened, why, and what to do about it.
- Automate repetitive tasks with scripts or tooling.
- Keep documentation close to the code it describes.
- Simplify local development setup. Ideally: clone, install, run.

Trigger: New team member takes more than 30 minutes to set up the project. A common task requires more than 3 manual steps. Developers frequently ask the same questions.

### How to Propose Improvements Without Being Intrusive

#### Frame as Suggestions, Not Demands
- BAD: "This function is terrible and needs to be rewritten."
- GOOD: "This function has grown complex. A possible improvement would be to extract the validation logic into a separate function, which would also make it easier to test independently."

#### Provide Context and Rationale
Explain the WHY behind the improvement. People resist changes they do not understand.
- "Extracting this into a hook would reduce duplication across these three components and make the auth logic testable in isolation."

#### Separate Concerns
Never mix improvement suggestions with critical bug feedback. Use clear labels:
- MUST: Security vulnerability, data loss risk, broken functionality.
- SHOULD: Performance issue, maintainability concern, missing test.
- COULD: Style improvement, minor readability enhancement, nice-to-have.

#### Pick Your Battles
Not every improvement is worth the discussion cost. Consider:
- How often is this code touched? (Frequently changed code benefits more from improvements.)
- How many people work with this code? (Shared code has higher improvement ROI.)
- How risky is the change? (Low-risk improvements are easier to justify.)

### Refactoring Triggers

These are signals that code needs improvement. Not every trigger demands immediate action, but each should be acknowledged and tracked.

1. **Duplication**: The same logic exists in three or more places.
2. **Long Functions**: A function exceeds 40-50 lines or has more than 3 levels of nesting.
3. **Primitive Obsession**: Using strings and numbers where a domain type would be clearer (e.g., `string` instead of `EmailAddress`).
4. **Feature Envy**: A function that spends more time working with another module's data than its own.
5. **Shotgun Surgery**: A single change requires edits to 5 or more files.
6. **Dead Code**: Functions, variables, or branches that are never executed.
7. **Comment Crutches**: Comments explaining WHAT the code does instead of the code being self-explanatory.
8. **Test Brittleness**: Tests that break when implementation details change but behavior stays the same.

### Boil the Lake Philosophy

When the complete implementation costs only minutes more than shortcuts, do the complete thing.

Often, a "quick fix" saves 5 minutes but creates a 20-minute debt later. If you can implement the full, clean solution in 10 minutes instead of the hacky version in 5, choose the full solution. The delta is small. The debt saved is large.

Examples:
- Extracting duplication now prevents copy-paste bugs later.
- Adding proper error handling now prevents production incidents later.
- Writing a config system now prevents hardcoded values scattered everywhere.

This is not perfectionism. This is pragmatism. Measure the true cost-benefit ratio, not just the immediate effort.

### Kaizen Rules

1. ALWAYS apply the Boy Scout Rule when editing a file.
2. NEVER let the pursuit of improvement block delivery of working features.
3. ALWAYS measure before optimizing performance. Intuition about bottlenecks is frequently wrong.
4. ALWAYS separate improvement commits from feature commits.
5. PROPOSE improvements with rationale, not just opinion.
6. TRACK larger improvements as tickets rather than letting them live only in your head.
7. PRIORITIZE improvements that reduce bug surface area over cosmetic changes.
8. CELEBRATE improvements. Acknowledge when the team makes the codebase better.
9. REVIEW improvement proposals with the same rigor as feature code.
10. ACCEPT that not every improvement will be adopted. The suggestion still has value even if the team decides the cost-benefit ratio does not justify it now.

---

## 5. Completion Gate (Verification Before Completion)

No declaration of completion without fresh evidence of verification. This is non-negotiable.

### Iron Law

**NO COMPLETION CLAIM WITHOUT FRESH VERIFICATION EVIDENCE EXECUTED NOW.**

It doesn't matter how confident you are. It doesn't matter if "it worked before." Every claim of completion requires a command executed NOW, with output READ, that SUPPORTS the claim.

### Gate Function — 5 Steps

Before declaring any task as completed:

1. **Identify** — What command validates this assertion?
2. **Execute** — Run the command completely, no shortcuts.
3. **Read** — Read the ENTIRE output and check exit codes.
4. **Verify** — Does the output really support the claim?
5. **Declare** — Only then assert, with evidence.

```
Claim: "The tests pass"
  ✗ WRONG: "I ran the tests before and they passed"
  ✓ RIGHT: Run `npm test` NOW → read output → "0 failures" → declare
```

### Verification by Claim Type

| Claim | Required Verification |
|-------|----------------------|
| Tests pass | Output from test runner with zero failures |
| Linter clean | Output from linter with zero errors |
| Build successful | Build command with exit code 0 |
| Bug fixed | Original symptom reproduced AND now passes |
| Regression test works | Full red-green cycle verified |
| Edge Function deployed | 200 response from endpoint after deploy |
| Migration applied | Verification query confirms schema correct |
| Component renders | Screenshot or snapshot of preview without errors |
| TypeScript clean | `npx tsc --noEmit` with zero errors |
| Responsive | Preview on mobile (375px) + desktop (1280px) |

### Red Flags — Prohibited Language

These words signal unverified claims. If you catch yourself using them, STOP and verify:

| Word | Problem | Replace With |
|------|---------|--------------|
| "should work" | You didn't verify | "I verified..." |
| "probably" | You're not sure | "I confirmed..." |
| "seems to" | You didn't read the output | "The output shows..." |
| "I believe" | Belief is not evidence | "I measured..." |
| "it worked before" | The past is not the present | "Just now, I confirmed..." |
| "similar to what we did" | Each case is unique | "In this specific case..." |

Replace with: "I executed X, the output shows Y, therefore Z."

### Absolute Rules

1. **Never commit without verifying** — `npm run build` + `npx tsc --noEmit` before any commit.
2. **Never push without evidence** — Tests and build pass NOW, not "last time."
3. **Never create PR without full verification** — Build + lint + tests + visual preview.
4. **Never declare bug fixed without reproduction** — Prove the symptom existed AND disappeared.
5. **Never trust agent output** — Independently verify every claim from sub-agents.

### Completion Gate Rules

1. Evidencia antes de claims, siempre.
2. Fresh verification — never reuse old results.
3. Complete output — never assume based on partial output.
4. Exit codes matter — zero is the only acceptable result.
5. Each context is unique — "it worked elsewhere" doesn't count.

---

## 6. Enforcement Rules

Skills are law, not suggestions. If there is a 1% probability that a skill applies, invoking it is mandatory.

### Iron Law

**IF THERE IS 1% PROBABILITY A SKILL APPLIES, INVOCATION IS MANDATORY.**

Skills are not suggestions. They are not "nice to have." They are mandatory protocols that exist to ensure quality, security, and consistency. Ignoring them is the definition of technical debt.

### Hierarchy of Instructions

```
1. Explicit user instructions          (MAXIMUM PRIORITY)
2. Active SOTA skills                  (HIGH PRIORITY)
3. Default system prompt               (BASE PRIORITY)
```

If a skill contradicts the default prompt, the skill prevails. If the user contradicts a skill, the user prevails.

### Enforcement Flow

Before EVERY response to a user request:

```
[User Request]
       │
       ▼
[1. SKILL CHECK]
   "Does any skill apply to this request?"
   Check: keywords, context, request type
       │
       ├─ YES → Invoke skill(s)
       │         Internally announce: "Activating: [skill names]"
       │         Follow the skill EXACTLY
       │
       └─ NO → Proceed normally
              BUT: Double-check — are you SURE no skills apply?
              If in doubt: invoke the skill anyway
       │
       ▼
[2. EXECUTE]
   Apply the combined knowledge of all active skills
       │
       ▼
[3. VERIFICATION GATE]
   Before declaring "done":
   → Activate verification-before-completion
   → Fresh evidence mandatory
```

### Invalid Rationalizations for Ignoring Skills

These are common excuses. ALL are invalid:

| Rationalization | Why It's Invalid | Correct Action |
|-----------------|-----------------|-----------------|
| "It's just a simple question" | Simple questions can have complex implications | Check if any skills apply |
| "I need context first" | Skills INFORM context gathering | Invoke the skill; it guides context |
| "This feels productive" | Feeling productive ≠ being productive | Stop. Check skills. Then act. |
| "I already know the answer" | Confidence without verification is dangerous | The skill may reveal what you missed |
| "It's a small change" | Small changes cause big bugs | lint-and-validate ALWAYS applies |
| "There's no time" | Skipping skills creates debt that costs MORE time | Skills SAVE time medium-term |
| "The user is in a hurry" | Delivering fast and wrong is worse than slow and right | Quality is non-negotiable |
| "It's obvious what to do" | The obvious doesn't exclude verification | Gate function applies to the obvious too |

### Skill Categories

#### Rigid Skills — Follow the Letter
These skills have exact protocols that MUST NOT be adapted:

- **concise-planning** — Goal-Steps-Risks-Success template mandatory
- **systematic-debugging** — 5 steps non-negotiable
- **verification-before-completion** — Gate function exact
- **lint-and-validate** — Full checklist required
- **enforcement-layer** — 1% threshold absolute

#### Flexible Skills — Adapt to Context
These skills have principles that adapt to the problem:

- **senior-architect** — Patterns adapted to project scale
- **kaizen** — Improvements prioritized by impact
- **code-review-checklist** — Checklist adapted to team standards
- **frontend-design** — Aesthetics adapted to branding

### Priority of Invocation

When multiple skills apply, invoke in this order:

```
1. PROCESS skills first:
   - concise-planning (plan before execute)
   - systematic-debugging (if there's an error)
   - enforcement-layer (if there's decision ambiguity)

2. DOMAIN skills next:
   - Technical skills relevant to the work (frontend, backend, DB, etc.)

3. QUALITY skills last:
   - lint-and-validate (before delivery)
   - verification-before-completion (before declaring "done")
   - kaizen (improvement suggestions)
```

### Enforcement Rules

1. Skills are law — not suggestions, not options, not "nice to have."
2. 1% = mandatory — when in doubt, invoke the skill.
3. Verify BEFORE responding — skill check is the first step, not the last.
4. Rigid is rigid — do not adapt skills that must be followed to the letter.
5. Process before implementation — plan, debug, organize BEFORE coding.
6. Rationalization is a red flag — if you're justifying why NOT to invoke, that's reason TO invoke.

---

## 7. Output Chaining Protocol (Sequential Output Chaining)

Every skill produces structured artifacts for the next skill to consume.

### Core Principle

Work flows through the Core Engine in predictable stages. Each stage produces explicit, structured output that becomes the input for the next stage. This eliminates ambiguity and allows multiple skills to compose seamlessly.

### The Chaining Sequence

```
PLANNING OUTPUT → EXECUTION INPUT
    (Goal, Steps, Risks, Success)
          │
          ▼
    EXECUTION OUTPUT → VALIDATION INPUT
    (Code diffs, tests, changes)
          │
          ▼
    VALIDATION OUTPUT → VERIFICATION INPUT
    (Lint clean, types clean, tests pass)
          │
          ▼
    VERIFICATION OUTPUT → COMPLETION CLAIM
    (Fresh evidence, all gates passed)
```

### Structured Output Format

Every skill output follows this format:

```
SKILL: [skill-name]
STATUS: [in-progress | complete | blocked]
ARTIFACTS:
  - [artifact-name]: [specific output location/reference]
  - [artifact-name]: [specific output location/reference]
NEXT INPUT: [what the next skill needs from this output]
BLOCKERS: [if STATUS is blocked, what's blocking]
```

### Examples of Output Chaining

#### Planning → Execution
Planning produces:
- Goal (one sentence)
- Steps (numbered, verifiable)
- Risks (identified)
- Success criteria (objective)

Execution consumes this and produces:
- Code changes (specific files/lines)
- Test cases (added or modified)
- Documentation (if needed)

#### Execution → Validation
Execution produces:
- Changed files
- New tests
- Modified code

Validation consumes this and produces:
- Lint report (exit code)
- Type check report (exit code)
- Test results (exit code)

#### Validation → Verification
Validation produces:
- All checks passing (exit code 0)
- No warnings
- Full coverage

Verification consumes this and produces:
- Fresh evidence (command output, timestamp)
- Claim assertion
- Completion status

### Chaining Rules

1. EVERY skill output includes a "NEXT INPUT" section.
2. NEVER skip a stage in the chain.
3. ALWAYS pass full output to the next stage, not summaries.
4. DOCUMENT dependencies between stages.
5. BLOCK if a prerequisite stage hasn't produced its output.
6. RERUN previous stages if downstream validation fails.

---

## 8. Self-Regulation Protocol (Self-Regulating Loops)

Stop if WTF-likelihood > 20%. Apply the 3-strike rule for debugging. Limit fixes per session.

### Core Principle

Work that produces more confusion than clarity should stop. The system should defend against accumulating debt through a disciplined stopping mechanism.

### WTF-Likelihood Test

Before committing to a significant change, ask: "Does this make sense to someone reading this code in 6 months?"

If the answer is "probably not, they would go 'WTF?'" and you estimate that likelihood > 20%, STOP.

Instead:
1. Document what you've learned.
2. Step back and reassess the approach.
3. If the approach is fundamentally unclear, revert and try a different path.

Examples:
- Complex nested logic that requires 5 minutes to understand: WTF-likelihood is HIGH.
- Clever one-liner that does 3 different things at once: WTF-likelihood is HIGH.
- Workaround that "fixes it for now" but nobody understands why: WTF-likelihood is VERY HIGH.

### The Three-Strike Rule for Debugging

When you've attempted to fix the same bug three different ways and none worked, STOP.

The problem is not the fix — it is your understanding of the root cause.

#### After 3 Failed Attempts:
1. Revert all changes (`git checkout .` or `git stash`).
2. Review what you learned from each attempt (without keeping the code).
3. Form a new hypothesis about the actual root cause.
4. Proceed with a clean implementation.

This is not failure. This is disciplined debugging. Persisting past 3 strikes creates tangled code.

### Scope Lock Per Session

In a single debugging or implementation session, do not attempt more than 5 significant fixes or changes.

Why?
- After 5 changes, context fatigue sets in.
- The cumulative risk of side effects increases exponentially.
- Your mental model of the system becomes unreliable.

#### When You Hit 5:
1. Commit what you have (or stash if it's not production-ready).
2. Stop for the session.
3. Return fresh to continue the next session.

This is not laziness — it's maintaining accuracy.

### Blockers Trigger Escalation

If you encounter a blocker (something that prevents progress for >15 minutes), do not persist.

#### On Blocker:
1. Document the exact blocker.
2. Note what you've tried.
3. Escalate to a colleague or defer to another session.
4. Moving to a different task is valid. Persisting is not.

### Self-Regulation Rules

1. Stop if WTF-likelihood > 20% — clarity is mandatory.
2. Apply 3-strike rule for debugging — revert after 3 failed attempts.
3. Limit to 5 significant changes per session — context fatigue is real.
4. Document blockers — don't persist against walls.
5. Return fresh — stepping back is not failure.

---

## 9. Autonomous Decision Framework (6 Principles)

When the path forward is ambiguous, follow these 6 principles in order. They resolve most conflicts.

### Principle 1: Completeness > Shortcuts

Do the complete thing if the cost delta is small (<10% additional time).

Why: Shortcuts create debt. Complete implementations last.

Example:
- Shortcut: Handle the happy path, ignore edge cases.
- Complete: Handle happy path + all documented edge cases + error scenarios.
- If complete costs only 10% more time, choose complete.

### Principle 2: Fix Everything in Blast Radius (within <1 day)

If your change affects multiple systems, fix all side effects in the same session if possible (<1 day of work).

Why: Deferred fixes compound. Related bugs tend to cluster.

Example:
- You fix an auth bug. It affects both API and WebSocket layers.
- If both fixes fit in <1 day: do both.
- If they don't: fix the API, document the WebSocket issue, create a ticket.

### Principle 3: Pragmatic When Equivalent

If two approaches are equally good (same outcome, same complexity, same maintainability), choose the one that requires least context or tooling.

Why: Reducing cognitive overhead matters.

Example:
- Option A: Custom build script (requires team training).
- Option B: Standard npm script (everyone already knows it).
- Outcomes identical. Choose B.

### Principle 4: Reuse > Duplicate

If existing code does 80%+ of what you need, reuse it. Do not duplicate.

Why: Duplication is a source of divergence and bugs.

Example:
- Don't copy-paste a validation function. Extract it to a shared utility.
- Don't rebuild an existing pattern. Reuse and adapt if needed.

Exception: If reuse requires more complexity than duplication AND the code is stable, accept duplication.

### Principle 5: Explicit > Clever

Write code that is immediately clear. Avoid clever one-liners that require re-reading.

Why: Clarity scales. Cleverness doesn't.

Example:
- Clever: `const result = x?.y?.z ?? fallback ? process(x.y) : null`
- Explicit: Extract into named functions with clear logic flow.

### Principle 6: Action > Deliberation

After you've thought for 10 minutes and still have two viable options, pick one and act.

Why: Most decisions are reversible. Information gained from action > information from deliberation.

Example:
- 10 minutes of debate on whether to use Library A or B.
- Pick one, implement for 1 hour, evaluate with actual code.
- You now know which is better based on evidence, not theory.

### Decision Framework Process

When facing a decision:

1. Check if it's covered by explicit project rules (e.g., "always TypeScript strict mode").
2. If not, evaluate against the 6 principles in order.
3. The first principle that clearly favors one option wins.
4. If all 6 are neutral, use Action > Deliberation — pick one and proceed.

### Autonomous Decision Rules

1. Completeness beats shortcuts (< 10% cost delta).
2. Fix all side effects in blast radius (<1 day) before shipping.
3. When equivalent, choose least tooling/context overhead.
4. Reuse existing code if 80%+ matches; duplicate only if simpler.
5. Prioritize clarity over cleverness — code is read more than written.
6. After 10 minutes deliberation with 2+ viable options, pick one and act.

---

## Summary: How the Core Engine Works

The Core Engine is not 6 separate skills. It is a unified operating system. Every work session flows through these stages:

```
1. PLAN (Planning Protocol)
   → Produce: Goal, Steps, Risks, Success Criteria

2. EXECUTE (Improvement Habits + Autonomous Decisions)
   → Produce: Code changes, tests, documentation

3. DEBUG if needed (Debug Protocol + 3-Strike Rule)
   → Produce: Root cause fix, regression test

4. VALIDATE (Validation Gate)
   → Produce: Lint report, type check, test results (all pass)

5. VERIFY (Completion Gate)
   → Produce: Fresh execution evidence

6. IMPROVE (Kaizen)
   → Suggest one small improvement while here

7. COMMIT with ENFORCE (Enforcement Layer)
   → All skills applied
   → All gates passed
   → Ready for review
```

The Core Engine ensures that SOTA work is planned, executed correctly, validated thoroughly, and completed with evidence. No assumptions. No debt. No surprises.

**Every response. Every commit. Every decision flows through this protocol.**

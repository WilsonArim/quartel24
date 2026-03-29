---
name: git-ops
phase: 0
always_active: true
absorbs: [git-pushing, commit, create-pr, changelog-automation]
description: "Complete version control pipeline — commit → push → PR → changelog → versioning. Atomic commits, conventional messages, safe pushes, and semantic versioning."
keywords: [commit, push, PR, pull request, changelog, version, release, merge, branch, git, semantic versioning, conventional commits]
---

# Git Ops

> Phase 0 — ALWAYS ACTIVE. Full release pipeline from atomic commit through changelog automation and semantic versioning.

Git is not just version control. It is a communication tool. Every commit tells a story. A clean git history makes debugging, reviewing, and collaborating dramatically easier.

---

## 1. Conventional Commits

Every commit message must follow the Conventional Commits specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

- **type**: The category of change (required).
- **scope**: The area of the codebase affected (optional but recommended).
- **subject**: A concise summary in imperative mood (required).
- **body**: Additional context, motivation, implementation details (optional).
- **footer**: References to issues, breaking change notes (optional).

### Commit Types

| Type       | When to Use                                          |
|------------|------------------------------------------------------|
| `feat`     | A new feature visible to the user                    |
| `fix`      | A bug fix                                            |
| `refactor` | Code restructuring without changing external behavior|
| `perf`     | Performance improvement                              |
| `test`     | Adding or updating tests                             |
| `docs`     | Documentation-only changes                           |
| `style`    | Formatting, whitespace, semicolons (no logic change) |
| `chore`    | Build process, dependencies, tooling                 |
| `ci`       | CI/CD configuration changes                          |
| `build`    | Build system or dependency changes                   |

### Scope Guidelines

The scope narrows down which part of the codebase is affected. Use consistent, project-specific scopes.

Common patterns:
- **By module:** `auth`, `api`, `ui`, `db`, `config`
- **By feature:** `checkout`, `profile`, `search`, `notifications`
- **By layer:** `controller`, `service`, `repository`, `middleware`

Scope rules:
- Keep lowercase.
- Use a single word or hyphenated compound: `user-auth`, not `user authentication`.
- Define an allowed list in your project and enforce it with commitlint.
- Omit the scope only when the change is truly cross-cutting.

### Subject Line Rules

- Use imperative mood: "add feature" not "added feature" or "adds feature".
- Do not capitalize the first letter.
- Do not end with a period.
- Keep under 72 characters.
- Describe WHAT changed, not HOW.

### Body

Use the body when:
- The change is not self-explanatory from the subject line alone.
- You need to explain WHY you made this choice over alternatives.
- There are breaking changes that consumers need to know about.

```
fix(auth): handle expired refresh tokens gracefully

Previously, an expired refresh token caused an unhandled exception that
returned a 500 error. Now the auth middleware explicitly checks token
expiry and returns a 401 with a clear error message, prompting the
client to re-authenticate.

BREAKING CHANGE: /api/refresh now returns 401 instead of 500 for
expired tokens. Clients should handle this status code.
```

### Breaking Changes

Indicate breaking changes in two ways:

**Exclamation Mark in Header:**
```
feat(api)!: change authentication endpoint response format
```

**BREAKING CHANGE Footer:**
```
feat(api): change authentication endpoint response format

BREAKING CHANGE: The /auth/login endpoint now returns { token, user }
instead of { accessToken, refreshToken }. All clients must update their
response parsing logic.
```

Both methods trigger a major version bump under semantic versioning.

### Good Examples

```
feat(auth): add password reset via email

Implement the forgot-password flow with a time-limited token
sent to the user's registered email address.

Closes #142
```

```
fix(cart): prevent duplicate items when clicking add rapidly

Added a debounce guard on the add-to-cart handler to prevent
race conditions that resulted in duplicate line items.

Fixes #287
```

```
refactor(db): extract query builder into shared utility

Moved duplicated query construction logic from three service
files into a single reusable QueryBuilder class.
```

```
perf(search): add database index on products.name column

Reduced search query time from 800ms to 45ms for the product
listing page.
```

### Bad Examples

```
# Too vague
fix: fix bug

# Past tense instead of imperative
feat(auth): added login feature

# No type
update user profile page

# Scope too broad
fix(everything): resolve issues

# Multiple unrelated changes in one commit
feat(auth,cart,search): add login, fix cart, update search
```

### Enforcing Conventional Commits

**commitlint Configuration:**
```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['auth', 'api', 'ui', 'db', 'config', 'ci']],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
};
```

**Husky Git Hook:**
```json
// package.json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint --edit $1"
    }
  }
}
```

---

## 2. Atomic Commits

Each commit should represent exactly one logical change. This is non-negotiable.

### What Atomic Means

- A commit compiles and passes tests on its own (bisectable).
- A commit can be reverted without breaking unrelated functionality.
- A commit does not mix feature work with formatting or refactoring.
- One purpose per commit. Do not mix a feature addition with a formatting fix.

### How to Achieve Atomic Commits

1. Use `git add -p` to stage only the hunks related to one change.
2. If you realize mid-work that you have two changes, stash one and commit the other first.
3. Plan your work in small increments: write one test, make it pass, commit.
4. If a refactor is needed to implement a feature, commit the refactor first, then the feature.

### Splitting Large Changes

Instead of one monolithic commit:
```
feat(checkout): complete checkout redesign with new payment flow
```

Break it into a sequence:
```
refactor(checkout): extract payment form into dedicated component
feat(checkout): add credit card validation with Luhn algorithm
feat(checkout): integrate Stripe payment intent API
test(checkout): add e2e tests for complete checkout flow
style(checkout): align spacing and typography to design spec
```

### Anti-Patterns to Avoid

- A single commit with the message "WIP" or "misc changes" or "stuff".
- A commit that adds a feature AND fixes a bug AND reformats three files.
- A commit that breaks the build, with a follow-up "fix build" commit.
- A commit mixing refactoring with feature work (refactor first, then feature).

---

## 3. Branch Naming

Use a consistent naming convention for branches.

### Format

```
<type>/<ticket-id>-<short-description>
```

### Examples

```
feat/AUTH-123-token-refresh
fix/API-456-null-pointer-users
chore/INFRA-789-upgrade-node
refactor/PERF-001-query-optimization
```

### Rules

- Use lowercase and hyphens only. No spaces, underscores, or camelCase.
- Include the ticket/issue ID when one exists.
- Keep the description to 3-5 words maximum.
- Delete branches after merging. Stale branches are noise.

---

## 4. Push Safety

### Core Principle

Never push code that breaks the build, and verify what you are pushing before it goes to the remote.

### Pre-Push Checklist

Before running `git push`, verify all of the following:

**Automated:**
- [ ] `tsc --noEmit` passes (no type errors).
- [ ] `eslint .` passes (no lint errors).
- [ ] All tests pass locally (`npm test`).
- [ ] No merge conflicts with the target branch.

**Manual:**
- [ ] Review your own diff: `git diff origin/main..HEAD` or `git log --oneline -5`.
- [ ] No files included that should not be (check `git status`).
- [ ] No secrets or credentials in the diff.
- [ ] Commit messages follow conventional format.
- [ ] Branch is up to date with the base branch (`git pull origin main`).

### When to Commit

**Commit Frequently:**
- After completing each logical step in your plan.
- After making a test pass.
- After a successful refactoring step.
- Before switching context to a different task.
- When you reach a stable state you might want to return to.

**Do NOT Commit:**
- Code that does not compile or pass type checking.
- Halfway through a refactoring that leaves the code in a broken state.
- Debug logging or temporary test code.
- Secrets, credentials, or environment-specific configuration.
- Generated files that should be in .gitignore.

### Git Safety Rules

These rules exist to prevent data loss and repository corruption.

1. **NEVER force push to main, master, or any shared branch.**
2. **NEVER rewrite history on branches that others are working on.**
3. **ALWAYS pull before pushing to shared branches.**
4. **NEVER commit directly to main/master. Use feature branches.**
5. **ALWAYS use `git push --force-with-lease` instead of `git push --force`** when force pushing is truly necessary on your own branch.
6. **NEVER store secrets in git.** Not even for "just a second". The git history is permanent. Use environment variables or secret managers.
7. **KEEP `.gitignore` up to date.** Review it when adding new tools or frameworks.
8. **ALWAYS verify what you are pushing** with `git log origin/main..HEAD` before pushing.
9. **USE signed commits** when working on security-sensitive projects.
10. **BACK UP important branches** before destructive operations like rebase or reset.

### Verification Before Push

Run this before pushing:
```bash
# See what you are about to push
git log origin/main..HEAD

# See the diff
git diff origin/main..HEAD

# Run pre-push validation
npm run lint && npm test
```

### Recovery Patterns

**Undo the Last Commit (keep changes):**
```bash
git reset --soft HEAD~1
```

**Undo Changes to a Specific File:**
```bash
git checkout -- path/to/file
```

**Find a Lost Commit:**
```bash
git reflog
```

**Emergency: Pushed Secrets:**
1. Immediately rotate the exposed credential.
2. Remove from code and commit the removal.
3. Use `git filter-branch` or `bfg-repo-cleaner` to remove from history.
4. Force push the cleaned history.
5. Notify the team.

---

## 5. Pull Requests

### PR Template

Every pull request should include the following sections. Save this as `.github/PULL_REQUEST_TEMPLATE.md` in your repository.

```markdown
## Summary

Brief description of what this PR does and why.

## Changes

- Bullet list of specific changes made.
- Focus on what a reviewer needs to understand.

## Test Plan

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed (describe steps)
- [ ] Edge cases considered

## Screenshots

If this PR includes UI changes, attach before/after screenshots or screen recordings.

## Related Issues

Closes #ISSUE_NUMBER
```

### PR Title Conventions

Follow the same format as conventional commits:

```
type(scope): concise description
```

Examples:
```
feat(auth): add Google OAuth2 login
fix(cart): resolve race condition on quantity update
refactor(api): extract middleware into shared module
docs(readme): update local development setup instructions
chore(deps): bump express from 4.18.2 to 4.19.0
```

Rules:
- Use imperative mood ("add" not "added" or "adding").
- Keep under 72 characters.
- Do not end with a period.
- The title should make sense in a changelog context.

### PR Size Guidelines

Keep pull requests small and focused. The ideal PR is under 400 lines of meaningful changes.

| Size         | Lines Changed | Review Time | Risk       |
|--------------|---------------|-------------|------------|
| Small        | < 100         | 15 min      | Low        |
| Medium       | 100-400       | 30-60 min   | Medium     |
| Large        | 400-800       | 1-2 hours   | High       |
| Too Large    | > 800         | Unreliable  | Very High  |

**Why Small PRs Matter:**
- Faster review turnaround (reviewers are more willing to start).
- Higher quality feedback (reviewers catch more issues in smaller diffs).
- Easier to revert if something breaks.
- Reduces merge conflict likelihood.

**Strategies for Keeping PRs Small:**

1. **Split by layer:** One PR for the database migration, another for the API, another for the UI.
2. **Split by behavior:** One PR for the happy path, another for error handling.
3. **Extract refactors:** If a feature requires refactoring existing code, submit the refactor as a separate PR first.
4. **Use feature flags:** Merge incomplete features behind a flag so partial work can land safely.

### Draft PRs

Use draft PRs for work-in-progress that needs early feedback.

```bash
gh pr create --draft --title "feat(auth): add OAuth2 flow" --body "WIP: Looking for feedback on the token refresh approach."
```

When to use drafts:
- You want to share an approach for discussion before it is complete.
- CI needs to run to validate an architectural decision.
- You are pairing asynchronously and need the other developer to see progress.

Convert to ready-for-review only when all checks pass and the self-review checklist is complete.

### Linking Issues

Always link the PR to the issue it addresses. This enables automatic issue closure on merge.

In the PR body:
```
Closes #142
Fixes #287
Resolves #301
```

For multiple issues:
```
Closes #142, closes #143
```

When the PR is related but does not fully resolve an issue:
```
Related to #142
```

### Reviewer Assignment

- Assign 1-2 reviewers who are familiar with the affected area of the codebase.
- Use GitHub CODEOWNERS to auto-assign reviewers based on file paths.
- Rotate reviewers to spread knowledge across the team.
- Do not assign more than 3 reviewers; it dilutes responsibility.

**CODEOWNERS Example:**
```
# .github/CODEOWNERS
/src/auth/       @team/backend
/src/components/ @team/frontend
/infra/          @team/devops
*.sql            @team/backend @team/dba
```

### Self-Review Checklist

Before requesting review, go through this checklist:

**Code Quality:**
- [ ] I have read through the entire diff myself.
- [ ] No commented-out code or debug statements remain.
- [ ] No `TODO` comments without a linked issue.
- [ ] Variable and function names are clear and descriptive.
- [ ] No duplicated logic that should be extracted.

**Testing:**
- [ ] New code is covered by tests.
- [ ] Existing tests still pass.
- [ ] Edge cases are tested (empty inputs, large data, error conditions).
- [ ] No flaky tests introduced.

**Security:**
- [ ] No secrets, tokens, or credentials in the diff.
- [ ] User input is validated and sanitized.
- [ ] Authorization checks are in place for new endpoints.

**Documentation:**
- [ ] Public APIs have JSDoc or equivalent documentation.
- [ ] README is updated if setup steps changed.
- [ ] Breaking changes are called out in the PR description.

**CI/CD:**
- [ ] All CI checks pass (lint, typecheck, test, build).
- [ ] No new warnings introduced.

### Responding to Review Feedback

- Respond to every comment, even if just with "Done" or "Acknowledged."
- If you disagree, explain your reasoning respectfully; do not just dismiss.
- Push fixes as new commits during review (do not force-push) so reviewers can see incremental changes.
- After all feedback is addressed, leave a summary comment: "All feedback addressed, ready for re-review."
- Squash commits on merge, not during review.

---

## 6. Pre-Merge Readiness Dashboard

Before merging to main, verify this checklist. This is the final gate before code lands.

### Branch Status
- [ ] All CI checks pass (lint, typecheck, test, build).
- [ ] No merge conflicts with the base branch.
- [ ] Branch is up to date with base branch (rebase if necessary).

### Review Status
- [ ] At least 1 approval from a code owner.
- [ ] No stale reviews (reviews older than 7 days should be refreshed).
- [ ] All feedback resolved.
- [ ] Discussions marked as resolved.

### Code Quality
- [ ] No commented-out code in diff.
- [ ] No debug statements or TODO without issue links.
- [ ] Linting, type checking, and test coverage requirements met.
- [ ] Self-review checklist completed.

### Documentation
- [ ] CHANGELOG.md updated (if not auto-generated).
- [ ] Version bump decided (see Version Decision section below).
- [ ] Release notes prepared if this is a release commit.
- [ ] README or docs updated if setup changed.

### Security & Compliance
- [ ] No secrets or credentials in diff.
- [ ] No supply-chain vulnerabilities introduced.
- [ ] Security self-review checklist completed.

### Merge Readiness
- [ ] PR template fully filled out.
- [ ] Commit history is clean (all commits follow conventional commits).
- [ ] Squash or rebase strategy decided (prefer squash for single features).
- [ ] Linked issues are accurate.

### Anti-Patterns to Catch
- [ ] No commits with messages like "fix build", "linting", "wip".
- [ ] No massive PRs (>800 lines) merged without strong justification.
- [ ] No direct commits to main (always via PR).
- [ ] No force pushes to main or shared branches.

---

## 7. Changelog & Versioning

### Changelog Format (Keep a Changelog)

Follow the [Keep a Changelog](https://keepachangelog.com/) convention. Every release entry is organized by change type.

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- OAuth2 login with Google provider (#142)

### Fixed
- Race condition on cart quantity update (#287)

## [1.2.0] - 2026-03-10

### Added
- Password reset via email (#130)
- Product search with full-text indexing (#135)

### Changed
- Upgraded Node.js runtime from 18 to 20 (#138)

### Fixed
- Duplicate items appearing in cart on rapid clicks (#125)
- Incorrect tax calculation for international orders (#128)

### Security
- Updated express to 4.19.0 to patch CVE-2026-XXXX (#140)

## [1.1.0] - 2026-02-15

### Added
- User profile page with avatar upload (#110)

[Unreleased]: https://github.com/org/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/org/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/org/repo/compare/v1.0.0...v1.1.0
```

### Change Categories

| Category     | Description                                        |
|--------------|----------------------------------------------------|
| Added        | New features                                       |
| Changed      | Changes to existing functionality                  |
| Deprecated   | Features that will be removed in a future release  |
| Removed      | Features that were removed                         |
| Fixed        | Bug fixes                                          |
| Security     | Vulnerability patches                              |

### Semantic Versioning (SemVer)

Version numbers follow the format `MAJOR.MINOR.PATCH`:

| Component | When to Increment                              | Example       |
|-----------|------------------------------------------------|---------------|
| MAJOR     | Breaking changes to the public API             | 1.0.0 -> 2.0.0 |
| MINOR     | New features that are backward-compatible      | 1.0.0 -> 1.1.0 |
| PATCH     | Bug fixes that are backward-compatible         | 1.0.0 -> 1.0.1 |

### Mapping Commit Types to Version Bumps

| Commit Type          | Version Bump | When                              |
|----------------------|--------------|-----------------------------------|
| `feat`               | MINOR        | New backward-compatible features  |
| `fix`                | PATCH        | Bug fixes                         |
| `perf`               | PATCH        | Performance improvements          |
| `BREAKING CHANGE`    | MAJOR        | Breaking API changes              |
| `feat!` / `fix!`     | MAJOR        | Explicit breaking change marker   |
| `chore`, `docs`, etc.| No release   | No version bump or release        |

### Version Decision Logic

**Auto-Decide (Claude decides):**
- PATCH: Only `fix` and `perf` commits since last release.
- MINOR: At least one `feat` commit, no breaking changes.

**Ask User:**
- MAJOR: Any `BREAKING CHANGE` or `!` marker detected.
  - Confirm: "This PR contains breaking changes. Should I bump to MAJOR version (e.g., 2.0.0)?"
- Custom: When user needs specific version (e.g., skipping a version, pre-release like `1.2.0-rc.1`).

---

## 8. Automated Changelog from Conventional Commits

### Using standard-version

```bash
npm install --save-dev standard-version
```

Add to `package.json`:
```json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:dry": "standard-version --dry-run"
  }
}
```

Configuration in `.versionrc.json`:
```json
{
  "types": [
    { "type": "feat", "section": "Added" },
    { "type": "fix", "section": "Fixed" },
    { "type": "perf", "section": "Performance" },
    { "type": "refactor", "section": "Changed", "hidden": false },
    { "type": "chore", "hidden": true },
    { "type": "docs", "hidden": true },
    { "type": "style", "hidden": true },
    { "type": "test", "hidden": true },
    { "type": "ci", "hidden": true },
    { "type": "build", "hidden": true }
  ],
  "commitUrlFormat": "https://github.com/org/repo/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/org/repo/compare/{{previousTag}}...{{currentTag}}"
}
```

### Using release-please (GitHub Action)

```yaml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          release-type: node
          changelog-types: >
            [
              {"type":"feat","section":"Added","hidden":false},
              {"type":"fix","section":"Fixed","hidden":false},
              {"type":"perf","section":"Performance","hidden":false},
              {"type":"docs","section":"Documentation","hidden":true},
              {"type":"chore","section":"Miscellaneous","hidden":true}
            ]
```

---

## 9. Git Tags

Use annotated tags for releases:

```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

Conventions:
- Prefix tags with `v`: `v1.2.0`, not `1.2.0`.
- Never delete or move published tags.
- Use lightweight tags only for temporary or local markers.

---

## 10. GitHub Releases

Create releases from tags to provide binaries, notes, and a clear history.

```bash
gh release create v1.2.0 \
  --title "v1.2.0" \
  --notes-file CHANGELOG.md \
  --latest
```

Or extract only the relevant section:

```bash
gh release create v1.2.0 \
  --title "v1.2.0" \
  --generate-notes
```

---

## 11. Release Process (Step-by-Step)

1. Ensure all changes for the release are merged into `main`.
2. Run the release command: `npm run release` (or let release-please create the PR).
3. Review the generated changelog entry in CHANGELOG.md.
4. Verify version bump matches your intent (use Pre-Merge Readiness Dashboard).
5. Push the version commit and tag: `git push --follow-tags origin main`.
6. Create a GitHub Release from the tag with changelog excerpt.
7. Deploy the tagged version to production (via CI/CD pipeline).

---

## 12. Quick Reference

| Concern                    | Recommendation                                              |
|----------------------------|-------------------------------------------------------------|
| Commit message format      | `type(scope): subject` (Conventional Commits)               |
| Commit atomicity           | One logical change per commit (bisectable, revertable)      |
| Branch naming              | `type/ticket-id-short-description` (lowercase, hyphens)     |
| PR size                    | Under 400 lines of meaningful changes                       |
| PR title format            | `type(scope): description` (conventional commits)           |
| PR template                | Summary, Changes, Test Plan, Screenshots, Issues            |
| Self-review               | Complete checklist before requesting review                 |
| Reviewers                 | 1-2 assigned, use CODEOWNERS for auto-assignment            |
| Issue linking             | `Closes #N` for automatic closure on merge                  |
| Draft PRs                 | Use for WIP and early feedback                              |
| Pre-push validation       | Type check, lint, tests, no conflicts, no secrets           |
| Force push                | Use `--force-with-lease` only on own branches, never main   |
| Changelog format          | Keep a Changelog with Added/Changed/Fixed sections          |
| Versioning                | Semantic Versioning (MAJOR.MINOR.PATCH)                     |
| Commit to version         | feat=MINOR, fix=PATCH, BREAKING CHANGE=MAJOR                |
| Automation                | standard-version or release-please                          |
| Tags                      | Annotated, prefixed with `v`                                |
| Secrets in git            | NEVER. Use .env, environment variables, vault               |

---

## 13. Anti-Patterns & Recovery

### Commits to Avoid

- "WIP", "misc changes", "stuff", "fix build", "linting" — commit messages that add no value.
- Mixing refactoring, formatting, and feature work in one commit.
- Breaking commits followed by "fix" commits (test first, commit once).
- Committing secrets, debug code, or generated files.

### Common Mistakes & Recovery

| Mistake                              | Recovery                                 |
|--------------------------------------|------------------------------------------|
| Committed secrets                    | See "Emergency: Pushed Secrets" above    |
| Force-pushed main by accident         | Contact team immediately, restore backup |
| Committed to main instead of branch  | Reset, cherry-pick onto proper branch    |
| Merge conflict with main             | `git rebase origin/main`, resolve, test  |
| Forgot to link an issue in PR        | Edit PR body to add `Closes #N`          |
| PR too large (>800 lines)            | Split into multiple PRs, one per concern |
| Old reviews (>7 days stale)          | Request re-review from reviewers         |


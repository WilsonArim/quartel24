---
name: testing
phase: 5
always_active: false
absorbs: test-driven-development, e2e-testing-patterns
description: "Complete testing pyramid — unit, integration, e2e, QA loops with evidence-based verification and self-regulation"
keywords: [teste, TDD, unit test, coverage, e2e, Playwright, Cypress, integracao, QA, screenshot, health-scoring]
---

# Testing

> Phase 5 — From unit tests to end-to-end QA. Evidence-based, self-regulating, pyramid-structured.

## 1. TDD Cycle: Red-Green-Refactor

TDD follows a strict three-step cycle that must be respected in order:

1. **RED** — Write a failing test that describes the desired behavior. The test must fail for the right reason. Do not write implementation code before the test exists.
2. **GREEN** — Write the minimum amount of production code necessary to make the failing test pass. Do not optimize. Do not handle edge cases not yet covered by tests. Just make it green.
3. **REFACTOR** — Clean up both the test and the production code. Remove duplication, improve naming, extract functions. All tests must remain green after refactoring.

Each cycle should take between 1 and 10 minutes. If a cycle takes longer, the step is too large — break it down.

### Practical TDD Workflow

```
1. Pick the next behavior to implement
2. Write the simplest failing test for that behavior
3. Run the test — confirm it fails (RED)
4. Write the simplest code to pass the test
5. Run all tests — confirm they pass (GREEN)
6. Refactor production and test code
7. Run all tests — confirm they still pass (REFACTOR)
8. Commit (one commit per cycle)
9. Repeat
```

Commit after every successful Red-Green-Refactor cycle to maintain a clean, revertible history.

## 2. When (Not) to Use TDD

TDD is highly effective for:
- Business logic and domain rules
- Data transformations and parsing
- Utility functions and helpers
- API endpoint handlers
- State machines and workflows
- Bug fixes (write a test that reproduces the bug first)
- Critical paths (payment, auth, data mutation)

TDD may not be the best fit for:
- Exploratory prototyping (spike and stabilize instead)
- UI layout and styling (use visual regression tests)
- Third-party integration wrappers (use integration tests post-hoc)
- One-off scripts with no maintenance expectation

## 3. Testing Pyramid Strategy

Structure your test suite following the pyramid model, from most to fewest tests:

```
        /  E2E  \          ~5%   -- Slow, expensive, high confidence
       /----------\
      / Integration \      ~15%  -- Medium speed, cross-boundary
     /----------------\
    /    Unit Tests     \  ~80%  -- Fast, isolated, focused
   /---------------------\
```

### Test Types and Their Purpose

| Type        | Scope                  | Speed    | Dependencies     | Confidence |
|-------------|------------------------|----------|------------------|------------|
| Unit        | Single function/class  | < 10ms   | All mocked       | Low scope  |
| Integration | Module boundaries      | < 1s     | Some real         | Medium     |
| Contract    | API boundaries         | < 100ms  | Schema-based      | Medium     |
| Snapshot    | UI component output    | < 50ms   | Renderer         | Low-med    |
| E2E         | Full user flow         | < 30s    | All real          | High       |

### Coverage Targets

Coverage is a metric, not a goal. Use it as a safety net, not a badge.

| Metric            | Target  | Notes                                    |
|-------------------|---------|------------------------------------------|
| Line coverage     | > 80%   | Baseline for most projects               |
| Branch coverage   | > 75%   | Catches untested conditional paths       |
| Critical paths    | 100%    | Payment, auth, data mutation             |
| New code          | > 90%   | Enforce on pull requests via CI          |

Do not chase 100% total coverage. Focus coverage effort on:
- Code with high cyclomatic complexity
- Code that handles money, authentication, or user data
- Code that has historically produced bugs

## 4. Unit Test Best Practices

### Naming Convention for Tests

Use descriptive names that read as specifications. Follow this pattern:

```
[unit under test] [scenario] [expected behavior]
```

Examples:
```typescript
// Good — reads as a specification
describe('calculateDiscount', () => {
  it('returns 0 when the cart total is below the minimum threshold', () => {});
  it('applies 10% discount when the user is a premium member', () => {});
  it('throws InvalidCouponError when the coupon code has expired', () => {});
});

// Bad — vague and uninformative
describe('calculateDiscount', () => {
  it('works correctly', () => {});
  it('handles edge case', () => {});
});
```

### The AAA Pattern: Arrange, Act, Assert

Every test should follow three distinct phases, separated by blank lines:

```typescript
it('returns the total price with tax applied', () => {
  // Arrange — set up the test data and dependencies
  const cart = createCart([
    { name: 'Widget', price: 100, quantity: 2 },
  ]);
  const taxRate = 0.08;

  // Act — execute the behavior under test
  const result = calculateTotal(cart, taxRate);

  // Assert — verify the outcome
  expect(result).toBe(216);
});
```

Rules:
- One Act per test. If you need multiple acts, write multiple tests.
- Arrange can be extracted into `beforeEach` only when shared across all tests in a `describe` block.
- Assert should verify one logical concept (multiple `expect` calls are acceptable if they verify the same concept).

### Mocking Strategy

Follow this hierarchy when dealing with dependencies:

1. **Prefer real implementations** when they are fast and deterministic.
2. **Use fakes** (in-memory databases, test doubles) for complex dependencies.
3. **Use stubs** to provide canned responses for external services.
4. **Use mocks** only when you need to verify that a specific interaction occurred.
5. **Use spies** to observe calls without changing behavior.

Guidelines:
- Never mock what you do not own. Wrap third-party libraries in your own interface and mock that.
- Mock at the boundary, not deep inside the module.
- If a test requires more than 3 mocks, the production code likely has too many dependencies — refactor it.

### TDD Anti-Patterns to Avoid

- **The Liar**: Tests that pass but do not actually verify correct behavior.
- **The Giant**: Tests with hundreds of lines that test too many things at once.
- **The Mockery**: Tests that mock so much they only test the mocking framework.
- **The Inspector**: Tests that are tightly coupled to implementation details and break on every refactor.
- **The Slow Poke**: Tests that hit real networks or sleep for fixed durations.

## 5. Playwright Setup & Page Objects

### Installation and Configuration

```bash
npm init playwright@latest
```

Configure `playwright.config.ts` with sensible defaults:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Best Practices for Playwright

- Run tests in parallel by default. Design tests to be independent.
- Use `test.describe` to group related tests logically.
- Enable traces on first retry to debug failures without guessing.
- Keep timeouts reasonable. If a test needs more than 30 seconds, the feature is too slow.
- Never use `page.waitForTimeout()` (hard waits). Use assertions or locator auto-waiting instead.

### Test Structure: Page Object Model

Encapsulate page interactions in page objects to keep tests clean and maintainable.

```typescript
// e2e/pages/login.page.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

```typescript
// e2e/tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login', () => {
  test('redirects to dashboard after successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });
});
```

Rules for page objects:
- One page object per page or significant component.
- Page objects encapsulate locators and actions but never assertions.
- Assertions belong in the test files, not in page objects.
- Page objects return data or other page objects for chaining.

### Selectors Strategy

Use `data-testid` attributes as the primary selector strategy. This decouples tests from CSS structure and visible text.

Priority order for selectors:

1. **`data-testid`** — Most stable. Not affected by styling or text changes.
2. **`getByRole`** — Accessible selectors like `getByRole('button', { name: 'Submit' })`.
3. **`getByText`** — For verifying visible content, not for primary interaction selectors.
4. **`getByLabel`** — For form inputs associated with labels.
5. **Never use**: CSS selectors, XPath, class names, or element IDs (fragile, change often).

```tsx
// In your component
<button data-testid="checkout-submit">Complete Purchase</button>

// In your test
await page.getByTestId('checkout-submit').click();
```

Add a linting rule or convention to ensure `data-testid` attributes are present on all interactive elements.

### Handling Async Operations

Playwright has built-in auto-waiting, but some scenarios need explicit handling.

```typescript
// Wait for navigation after an action
await Promise.all([
  page.waitForURL('/dashboard'),
  page.getByTestId('login-submit').click(),
]);

// Wait for a network request to complete
const responsePromise = page.waitForResponse(
  (resp) => resp.url().includes('/api/users') && resp.status() === 200
);
await page.getByTestId('save-button').click();
await responsePromise;

// Wait for an element to appear after async loading
await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 10_000 });

// Avoid this — never use hard waits
// await page.waitForTimeout(3000);  // BAD
```

### Visual Regression Testing

Use Playwright's built-in screenshot comparison to catch unintended visual changes.

```typescript
test('homepage matches snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.01,
    fullPage: true,
  });
});

test('button states match snapshots', async ({ page }) => {
  await page.goto('/components');
  const button = page.getByTestId('primary-button');
  await expect(button).toHaveScreenshot('button-default.png');
  await button.hover();
  await expect(button).toHaveScreenshot('button-hover.png');
});
```

Guidelines:
- Generate baseline screenshots on a consistent environment (CI, not local machines).
- Use `maxDiffPixelRatio` instead of `maxDiffPixels` for responsive tolerance.
- Store screenshots in version control so changes are visible in PRs.
- Update snapshots deliberately: `npx playwright test --update-snapshots`.

## 6. Test Isolation & CI Integration

### Isolation Strategies

Every test must be independent. No test should depend on another test's state.

- **Database seeding**: Reset or seed the database before each test or test suite. Use API calls or direct database access in `beforeEach`.
- **Authentication**: Use Playwright's `storageState` to save and reuse authentication state without logging in through the UI in every test.
- **Unique data**: Generate unique test data per test run to avoid collisions (e.g., `user+${Date.now()}@test.com`).
- **Cleanup**: Clean up created resources in `afterEach` if they could affect other tests.

```typescript
// Save auth state once, reuse across tests
// e2e/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('admin@test.com');
  await page.getByTestId('login-password').fill('password');
  await page.getByTestId('login-submit').click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: '.auth/admin.json' });
});

// Use in tests
test.use({ storageState: '.auth/admin.json' });
```

### CI Integration: GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

CI guidelines:
- Run with `workers: 1` in CI to avoid resource contention on shared runners.
- Set `retries: 2` in CI to tolerate transient infrastructure issues.
- Upload test reports and traces as artifacts on failure.
- Run E2E tests after unit and integration tests pass (fail fast).
- Consider running E2E only on PRs to main, not on every push.

### Flaky Test Prevention

Flaky tests destroy confidence in the test suite. Prevent them systematically.

Common causes and fixes:

| Cause                        | Fix                                                  |
|------------------------------|------------------------------------------------------|
| Hard-coded waits             | Use Playwright auto-waiting and `expect` assertions  |
| Shared test state            | Isolate each test with fresh data and auth state     |
| Timing-dependent assertions  | Use `toBeVisible()`, `toHaveText()` with retries     |
| Animations interfering       | Disable animations in test mode via CSS or config    |
| External service dependency  | Mock external APIs with `page.route()`               |
| Non-deterministic data       | Use seeded, predictable test data                    |
| Race conditions in UI        | Wait for specific network responses before asserting |

Disabling animations in tests:

```typescript
// In playwright.config.ts or test setup
test.use({
  // Reduce motion for all tests
  contextOptions: {
    reducedMotion: 'reduce',
  },
});
```

Mocking external APIs:

```typescript
test('displays user profile from API', async ({ page }) => {
  await page.route('**/api/user/profile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com' }),
    })
  );

  await page.goto('/profile');
  await expect(page.getByTestId('user-name')).toHaveText('Test User');
});
```

Monitoring flakiness:
- Track flaky test frequency in CI dashboards.
- Quarantine consistently flaky tests: move them to a separate suite and fix within one sprint.
- Never ignore or skip flaky tests permanently. Fix the root cause or delete the test.
- Run `npx playwright test --repeat-each=5` locally to detect flakiness before merging.

## 7. Diff-Aware Test Selection (Gstack-Inspired)

On feature branches, test only affected pages and modules to accelerate feedback loops.

### Implementation Strategy

1. **Detect changed files** from git diff (`git diff main...HEAD --name-only`)
2. **Map files to test suites** — Create a mapping file (`test-map.json`) that correlates source files to their test files
3. **Run targeted tests** — Execute only tests for modified modules

Example `test-map.json`:

```json
{
  "src/components/LoginForm.tsx": ["e2e/tests/login.spec.ts", "src/components/__tests__/LoginForm.test.ts"],
  "src/lib/auth.ts": ["src/lib/__tests__/auth.test.ts", "e2e/tests/auth-flow.spec.ts"],
  "src/pages/dashboard.tsx": ["e2e/tests/dashboard.spec.ts"],
  "src/server/api/users.ts": ["src/server/__tests__/users.test.ts"]
}
```

Script to run diff-aware tests:

```bash
#!/bin/bash
# test-changed.sh

# Get changed files
CHANGED=$(git diff main...HEAD --name-only)

# Build list of tests to run
TESTS=""
for file in $CHANGED; do
  if [ -f "test-map.json" ]; then
    TEST_FILES=$(jq -r ".\"$file\" // empty" test-map.json | tr '\n' ' ')
    TESTS="$TESTS $TEST_FILES"
  fi
done

# Remove duplicates and run
TESTS=$(echo $TESTS | tr ' ' '\n' | sort -u | tr '\n' ' ')
if [ -z "$TESTS" ]; then
  echo "No tests to run"
  exit 0
fi

echo "Running tests for changed files: $TESTS"
npx playwright test $TESTS
```

Usage:
- On feature branches: run only affected tests
- Before merge: run full suite on main
- In PR checks: use diff-aware selection for faster feedback

## 8. QA Loop: Systematic Testing with Fix Triage

Structured QA with evidence collection, fix prioritization, and per-commit granularity.

### QA Loop Protocol

```
1. LOAD TEST PLAN
   └─ Collect all test scenarios (manual + automated)

2. EXECUTE TESTS
   ├─ Run each test case
   ├─ Screenshot evidence for failures (before/after)
   └─ Document findings in QA log

3. TRIAGE BUGS
   ├─ Categorize by severity (critical, high, medium, low)
   ├─ Sort by impact + frequency
   └─ Assign to backlog

4. FIX & VERIFY
   ├─ Fix max 50 issues per session (avoid decision fatigue)
   ├─ One commit per fix (atomic history)
   ├─ Re-run affected tests (diff-aware selection)
   └─ Collect before/after screenshots

5. REGRESSION CHECK
   └─ Re-run full test suite on critical paths

6. DOCUMENT & CLOSE
   └─ Archive evidence, mark session complete
```

### Max Fixes Per Session: 50

Humans lose decision quality after ~50 decisions. Once you hit the limit:
- Stop fixing
- Commit current state
- Save remaining bugs to backlog
- Start fresh session next day (or after break)

This prevents decision fatigue and maintains consistent quality.

### QA Log Structure

```
# QA Session: 2026-03-26 — Login Flow v2

## Passed Tests
- [x] Login with valid credentials
- [x] Logout clears session
- [x] Password reset email sent
- [x] 2FA code validation

## Failed Tests (Triage Order)
1. **CRITICAL** — Login button unresponsive on Safari (screenshot: `login-safari-broken.png`)
   - Fix: Event listener not attaching on WebKit
   - Status: FIXED (commit: abc123)

2. **HIGH** — Error message cut off on mobile (screenshot: `error-mobile-cutoff.png`)
   - Fix: Padding adjustment in mobile breakpoint
   - Status: FIXED (commit: def456)

3. **MEDIUM** — Typo in success message ("Loggin" → "Logging")
   - Fix: Copy update in en.json
   - Status: FIXED (commit: ghi789)

## Fixes This Session: 3/50
## Remaining Backlog: 7 issues
## Decision Quality: High (no fatigue)
```

### Before/After Screenshots

For every visual bug:
1. Take screenshot BEFORE fix (name: `bug-name-before.png`)
2. Apply fix
3. Take screenshot AFTER fix (name: `bug-name-after.png`)
4. Attach both to commit message or QA log

This creates a visual audit trail and prevents regressions.

## 9. Screenshot Evidence (Mandatory for Visual Bugs)

Every visual defect must have supporting screenshots.

### Screenshot Naming Convention

```
[component]-[issue]-[state].png
└─ Example: "header-logo-cutoff-mobile.png"
             "button-hover-state-wrong-color.png"
             "form-error-message-hidden.png"
```

### Capture Protocol

1. **Bug discovery**: Take screenshot of the issue
2. **Reproduction**: If intermittent, capture multiple instances
3. **Context**: Include viewport size, browser, device in metadata
4. **Before/After**: Always capture before and after fix

```typescript
// Playwright helper for systematic screenshots
async function captureEvidence(page: Page, name: string, description: string) {
  const timestamp = new Date().toISOString().split('T')[0];
  const viewport = page.viewportSize();
  const filename = `evidence/${timestamp}-${name}.png`;

  await page.screenshot({ path: filename, fullPage: false });

  console.log(`[EVIDENCE] ${filename}`);
  console.log(`  Description: ${description}`);
  console.log(`  Viewport: ${viewport?.width}x${viewport?.height}`);
}
```

### Screenshot Storage

- Store in `evidence/` directory
- Organize by date: `evidence/2026-03-26/`
- Include in PR/commit when referencing visual bugs
- Archive screenshots for regression baseline

## 10. Health Scoring: Weighted Bug Categorization

Quantify test health with weighted scoring by bug category.

### Scoring Rubric

Calculate a health score (0-100, where 100 is perfect) using weighted categories:

| Category           | Weight | Impact Per Bug |
|--------------------|--------|----------------|
| Console Errors     | 15%    | -3 points      |
| Broken Links       | 10%    | -2 points      |
| Visual Defects     | 20%    | -2 points      |
| Functional Bugs    | 25%    | -4 points      |
| UX Issues          | 15%    | -1.5 points    |
| Performance        | 10%    | -2 points      |
| Content Errors     | 3%     | -1 point       |
| Accessibility      | 2%     | -3 points      |

### Calculation

```
Base Score = 100
Console Errors:    -3 per error × count     × 0.15
Broken Links:      -2 per link  × count     × 0.10
Visual Defects:    -2 per issue × count     × 0.20
Functional Bugs:   -4 per bug   × count     × 0.25
UX Issues:         -1.5 per issue × count   × 0.15
Performance:       -2 per issue × count     × 0.10
Content Errors:    -1 per error × count     × 0.03
Accessibility:     -3 per issue × count     × 0.02

Health Score = max(0, Base Score - Total Deductions)
```

### Example Calculation

```
Base: 100
Console Errors:    5 errors × -3 × 0.15 = -2.25
Broken Links:      2 links  × -2 × 0.10 = -0.4
Visual Defects:    8 issues × -2 × 0.20 = -3.2
Functional Bugs:   3 bugs   × -4 × 0.25 = -3
UX Issues:         2 issues × -1.5 × 0.15 = -0.45
Performance:       1 issue  × -2 × 0.10 = -0.2
Content Errors:    0 × -1 × 0.03 = 0
Accessibility:     0 × -3 × 0.02 = 0

Health Score = 100 - 9.5 = 90.5/100
Status: GOOD (>85)
```

### Health Status Ranges

- **90-100**: Excellent — Ready for production
- **75-89**: Good — Minor issues, ready with caution
- **50-74**: Fair — Significant issues, needs remediation
- **25-49**: Poor — Major blockers, needs comprehensive fix
- **0-24**: Critical — Unreleasable, stop and fix

### QA Health Report

```markdown
# QA Health Report — 2026-03-26

| Category           | Count | Weight | Deduction |
|--------------------|-------|--------|-----------|
| Console Errors     | 2     | 15%    | -0.9      |
| Broken Links       | 1     | 10%    | -0.2      |
| Visual Defects     | 4     | 20%    | -1.6      |
| Functional Bugs    | 1     | 25%    | -1.0      |
| UX Issues          | 3     | 15%    | -0.675    |
| Performance        | 0     | 10%    | 0         |
| Content Errors     | 0     | 3%     | 0         |
| Accessibility      | 0     | 2%     | 0         |

**Total Deductions: 4.375**
**Health Score: 95.6 / 100**
**Status: EXCELLENT ✓**
```

## 11. Self-Regulation: Stop When WTF-Likelihood Exceeds 20%

Monitor decision quality and halt testing when fatigue sets in.

### WTF-Likelihood Indicators

Track these metrics to detect decision fatigue:

| Indicator | Threshold | Action |
|-----------|-----------|--------|
| Fixes without thorough testing | > 3 in a row | PAUSE — Review last 3 fixes |
| Duplicated bug fixes | > 1 per session | PAUSE — Map root causes |
| Triage reversals | > 2 per session | HALT — Decision fatigue detected |
| False positives (not bugs) | > 20% of findings | HALT — Filter quality degraded |
| Time per fix | < 2 minutes avg | CAUTION — Rushing through fixes |
| Time per fix | > 15 minutes avg | HALT — Over-analyzing, decision fatigue |

### WTF-Likelihood Formula

```
WTF = (Reversals + False Positives + Rushed Fixes) / Total Decisions
If WTF > 20%, STOP and resume next session.
```

### Example Scenario

```
Session started at 14:00
Decisions made: 47 (approaching limit of 50)

Last 10 decisions:
- Fix 1: Tested ✓
- Fix 2: Tested ✓
- Fix 3: Not tested (rushed) ✗
- Fix 4: Tested, then reverted (triage reversal) ✗
- Fix 5: Not tested (rushed) ✗
- Fix 6: Tested ✓
- Fix 7: False positive (not actually a bug) ✗
- Fix 8: Tested ✓
- Fix 9: Tested ✓
- Fix 10: Not tested (rushed) ✗

WTF-Likelihood = (1 reversal + 1 false positive + 3 rushed) / 10 = 50%
Status: CRITICAL — HALT IMMEDIATELY
Action: Revert fixes 3, 5, 10 (untested). Verify fix 4 reversal. Resume tomorrow.
```

### Recovery Protocol When WTF > 20%

1. **Stop all fixes immediately**
2. **Revert untested changes** from last session
3. **Review reversals** — Understand why triage was wrong
4. **Archive session notes** — Document decision quality metrics
5. **Resume next day** — Fresh mindset improves decision quality

---

## Summary: Testing Maturity Ladder

```
Level 0: No tests
Level 1: Exploratory manual testing only
Level 2: Unit tests (TDD cycle) + basic CI
Level 3: Integrated test pyramid (unit + integration + E2E)
Level 4: Page objects + isolated tests + visual regression
Level 5: Diff-aware selection + QA loops + health scoring + self-regulation
        ↑ You are here with this skill
```

This skill enables **confident, sustainable, evidence-based testing** at scale.

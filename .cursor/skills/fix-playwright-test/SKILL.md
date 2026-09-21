---
name: fix-playwright-test
description: Diagnoses and fixes a failing or flaky Playwright test in this repo — locator drift, timing, isolation, or assertion bugs — following project conventions. Use when a test is red, flaky, or the user asks to fix, debug, or stabilize a spec, page object, or API client.
---

# Fix a Playwright test

Diagnose before editing. Fix the smallest thing that's actually wrong, per this repo's own rules — not generic Playwright advice.

## Step 1: Reproduce with evidence

If CI left evidence in the workspace (e.g. `self-heal-logs/failed-job.log`, `playwright-report/`), read that first to identify the failing spec and error.

Then run the specific failing spec (not the full suite) and read the actual failure:

```bash
npx playwright test <path/to/spec.ts>
```

Look at the error message, and the trace/report under `playwright-report/` if `--trace on` was used or CI uploaded one. Never guess the cause without seeing the failure output.

## Step 2: Classify the root cause

| Symptom | Likely cause | Rule to check |
|---|---|---|
| Locator times out / not found | Selector drifted from the real page | `qa-playwright-standards.mdc` |
| Intermittent pass/fail | Missing web-first assertion, `page.waitForTimeout`, race on shared state | `playwright-e2e.mdc`, `playwright-fixtures.mdc` |
| Wrong value asserted | Test logic/assertion bug | `playwright-e2e.mdc` |
| Fails only in parallel / CI | Shared BearStore account state (e.g. cart) not serialized | `playwright-fixtures.mdc` (see the lock pattern in `tests/ui/cart-total.spec.ts`) |
| Auth-related failure | Stale/missing `storageState`, login flow changed | `playwright-fixtures.mdc` |

**Before touching code, decide: is the test wrong, or is the app wrong?**

## Step 3a: If the test is wrong — fix it

- Locator drift → update the page object in `pages/` (Playwright-provided locators only, per `qa-playwright-standards.mdc`).
- Flake → replace `page.waitForTimeout`/unwrapped `isVisible()` with a web-first assertion (`toBeVisible`, `toHaveURL`, `toHaveText`). Never paper over flake by adding sleeps, retries, or loosening an assertion.
- Isolation/race → move shared setup into a fixture (`fixtures/`) or serialize shared-state access, per `playwright-fixtures.mdc`. Don't store data on `page` or module-level variables across tests.
- Keep the diff scoped to the fix — don't refactor unrelated specs or page objects (`anti-overengineering.mdc`). Keep TypeScript conventions (`typescript-conventions.mdc`): no `any`, `const` by default, explicit return types.

## Step 3b: If it's a real app bug — don't force a pass

If the app genuinely doesn't do what the spec expects (not a stale locator or bad wait), **stop**. Do not weaken the assertion, add `test.skip`, or otherwise make the test green just to make it green.

Instead:
1. Tell the user what you found.
2. Write a QA bug report using the `qa-bug-report.mdc` template (repro steps, expected vs actual, evidence — cite the spec name and the exact assertion that failed).
3. Ask the user whether the test should stay red, be marked `test.fixme`/skipped with a linked bug reference, or something else — don't decide that unilaterally.

## Step 4: Verify the fix

Rerun the specific spec, then the change-aware check via the `run-playwright-tests` skill:

```bash
npm run test:changed
```

## Step 5: Before push

Per `local-test-before-push.mdc`, three consecutive passing runs of the affected tests are required before `git push`/PR — the `run-playwright-tests` skill covers the exact commands.

## Don't

- Don't touch `playwright.config.ts`, CI workflow, or unrelated fixtures to chase a single test's flake — that needs the full-suite fallback and is a bigger call than "fix this test" (`local-test-before-push.mdc`).
- Don't add a new dependency to work around a flake.
- Don't print real secrets (e.g. `GOREST_TOKEN`) from `.env`/traces while reporting the failure. BearStore username/password are not secrets (`secrets-security.mdc`).

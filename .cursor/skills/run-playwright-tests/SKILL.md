---
name: run-playwright-tests
description: Runs Playwright tests for files affected by the current git changes using --only-changed. Use when validating a commit, before push/PR, after editing specs/page objects/API clients, or when the user asks to run tests.
---

# Run Playwright tests (affected only)

Default to **change-aware** runs. Do not run the full suite unless the fallback conditions below apply.

## Choose the command

| Working tree | Command |
|--------------|---------|
| Uncommitted edits / validating a commit | `npm run test:changed` (or `npx playwright test --only-changed`) |
| Committed branch work vs base | `npm run test:changed:main` (or `npx playwright test --only-changed=main`) |
| Explicit file/path from the user | `npx playwright test <path>` |

`--only-changed` uses git + the suite dependency graph (changed files **and** specs that import them). Git only. Prefer these over `npm test` / `npx playwright test` for day-to-day commit validation.

## Before commit (husky)

`.husky/pre-commit` runs `npm run test:changed` once after typecheck + lint-staged. A failing affected run aborts the commit. Zero selected tests is a pass.

## Before push / PR publish

Follow `.cursor/rules/local-test-before-push.mdc`: **three consecutive** successful affected runs, then publish.

```bash
npm run test:changed:main
npm run test:changed:main
npm run test:changed:main
```

Zero selected tests (docs/agent-only change) counts as success — do not pad with a full suite.

## Full-suite fallback

Run `npx playwright test` (and three passes before push) only when:

- `playwright.config.ts`, `package.json` / lockfile, or `.github/workflows/` changed
- Shared fixtures, global setup/teardown, or auth / `storageState` wiring changed
- The dependency graph is unreliable for the edit (say so in one sentence)

## Do not

- Substitute `--last-failed` or a single `--project=` for the pre-push gate
- Print **real** secrets (e.g. `GOREST_TOKEN`) from `.env` / traces while reporting results
- Treat BearStore username/password as secrets — they are plaintext-safe (see `.cursor/rules/secrets-security.mdc`)

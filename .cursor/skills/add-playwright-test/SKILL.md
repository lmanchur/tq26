---
name: add-playwright-test
description: Writes a new Playwright test (UI or API) in this repo, following the project's Page Object Model, fixtures, and TypeScript conventions. Use when the user asks to add, write, or create a test, cover a new flow or endpoint, or extend test coverage.
---

# Add a Playwright test

Follow this repo's own rules, not generic Playwright advice. Read a rule file with the Read tool if you need the full text; this is a condensed index.

## Step 1: Determine the test type and location

- User-facing flow (login, checkout, navigation, cart) → UI spec in `tests/ui/`.
- HTTP endpoint → API spec in `tests/api/`.
- Check for an existing spec covering the same feature first — extend it (if it still fits ~3–5 focused tests) instead of creating a near-duplicate file.

## Step 2: Reuse or create the page object / API client

- **UI**: look for an existing page object in `pages/`. If one exists, reuse it and only add methods/locators it's missing.
  - If no page object exists for this page, explore the **live** BearStore site with the available browser automation tools (Playwright MCP / Cursor browser tools): navigate to the page, take an accessibility snapshot, and read real roles/names/labels from it. Do not guess selectors from memory.
  - Build the new page object under `pages/` per `qa-playwright-standards.mdc`: Playwright-provided locators only (`getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByAltText`, `getByTitle`, `getByTestId` as last resort); no absolute XPath. Constructor takes `Page`; methods are intent-based and don't assert.
- **API**: look for an existing client in `api/` and DTO in `dtos/` (see `GoRestUser.ts` / `gorest-user.ts`). Follow that same client/DTO split for new endpoints.

## Step 3: Write the spec

Per `playwright-e2e.mdc`:
- Group related cases with `test.describe`; shared navigation/route stubs go in `test.beforeEach`.
- Name tests for the behavior: `should ...`.
- Cover the happy path **and** at least one failure path. Keep the file to ~3–5 focused tests — don't bloat it.
- Use web-first assertions (`toBeVisible`, `toHaveURL`, `toHaveText`). Never `page.waitForTimeout`; never an unwrapped `isVisible()`.
- Use `page.route` only to stub flaky/external APIs, not to dodge the real app. No assertions on colors, fonts, or pixel layout.

Per `playwright-fixtures.mdc`:
- Each test gets its own `page`/context — no shared mutable state or module-level data.
- Authenticated flows import `test`/`expect` from `fixtures/authenticatedPage.ts` (the `authenticatedPage` fixture) — do not copy-paste login steps.
- If a page object is now constructed in several specs, extract a `test.extend` fixture under `fixtures/` instead of newing it ad hoc everywhere.
- If the test mutates shared BearStore account state (e.g. cart), serialize access the way `tests/ui/cart-total.spec.ts` does (file lock) so parallel projects don't race.

Per `typescript-conventions.mdc`:
- `const` by default, `import type` for type-only imports, explicit return types on page/API methods, no `any`, named exports, one page class per file.

## Step 4: Don't over-engineer

Per `anti-overengineering.mdc`: no new test runner/library, no speculative helpers "for later," don't touch `playwright.config.ts` or CI, don't refactor unrelated specs.

## Step 5: If the new test fails against the real app

If the flow doesn't behave the way the test expects and that looks like an actual app bug (not a locator/timing mistake in the new test), stop — don't loosen the assertion to force a pass. Tell the user and offer to write a QA bug report per `qa-bug-report.mdc`.

## Step 6: Validate

Use the `run-playwright-tests` skill to run the change-aware check (`npm run test:changed` for a dirty tree). Don't hand the test back as done until it passes for the right reason.

## Step 7: Commit message (only if asked to commit)

Per `git-commits.mdc`: `test(<scope>): <imperative, lowercase, no trailing period>`, e.g. `test(checkout): cover invalid promo code`.

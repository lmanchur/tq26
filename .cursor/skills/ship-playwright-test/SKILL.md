---
name: ship-playwright-test
description: >-
  End-to-end Playwright QA shipping: add a test, review and auto-fix Critical/Major
  findings, create a PR to main, then watch CI self-heal. Use when the user asks to
  add and ship a test, open a PR for new coverage, or run the full add→review→PR→self-heal
  pipeline.
---

# Ship a Playwright test (add → review/fix → PR → self-heal)

Orchestrate existing project skills and the review agent. Do **not** re-implement their steps — **Read** each skill/agent file and follow it. Never guess; stop and ask on app bugs or anything unclear.

## Progress checklist

```
- [ ] 1. Add test
- [ ] 2. Review + auto-fix Critical/Major
- [ ] 3. Local gate (three affected-test passes)
- [ ] 4. Commit, push, open PR to main
- [ ] 5. Watch CI / self-heal; report outcome
```

## Step 1: Add the test

Read and follow `.cursor/skills/add-playwright-test/SKILL.md`.

Stop the pipeline if that skill stops (e.g. real app bug → offer `qa-bug-report.mdc`). Do not open a PR for an intentionally red product-bug assertion unless the user explicitly asks.

## Step 2: Review and fix

1. Read `.cursor/agents/review-playwright-pr.md` and run its checklist against the **local** working-tree / branch diff (not a remote PR yet).
2. **Override** that agent’s “report only / don’t fix” rule for this pipeline:
   - **Critical** and **Major** → fix immediately (smallest change). Prefer `.cursor/skills/fix-playwright-test/SKILL.md` when the finding is a failing/flaky test.
   - **Minor** / **Nit** → fix only if trivial and in-scope; otherwise note them in the final report.
3. Re-run the review checklist after fixes. Repeat until no Critical/Major remain, or you hit an app bug / ambiguity → stop and ask.
4. Run one change-aware sanity check via `.cursor/skills/run-playwright-tests/SKILL.md` (`npm run test:changed` if dirty).

## Step 3: Local push gate

Follow `.cursor/rules/local-test-before-push.mdc` and `.cursor/skills/run-playwright-tests/SKILL.md`:

- Default: three consecutive `npm run test:changed:main` (or `test:changed` if still dirty before commit).
- Full suite three times only when that skill’s full-suite fallback applies (e.g. CI/workflow/config touched).

Do not push until all three exit 0.

## Step 4: Commit, push, open PR

Only if the user asked to ship/PR (this skill implies that). Follow the user’s git-commit and creating-pull-requests rules plus `git-commits.mdc`:

1. New branch from up-to-date `main` if still on `main`.
2. Stage only relevant files (no `.env`, no `playwright-report/`, no `playwright/.auth/`).
3. Commit with Conventional Commits (usually `test(<scope>): …`).
4. `git push -u origin HEAD` (needs network/`all` as required).
5. `gh pr create` against `main` with Summary + Test plan. Return the PR URL.

## Step 5: Watch CI and self-heal

Self-heal is **CI-owned** (`.github/workflows/playwright.yml` → `self-heal` job). Do not invent a second local heal path.

1. `gh pr checks <number> --watch` (or poll until required checks finish).
2. Outcomes:
   - **lint + test green** → report PR ready; done.
   - **test fails → self-heal runs** → wait for a `fix: self-heal` commit and/or `<!-- self-heal -->` PR comment; then re-check.
   - **self-heal asks / bug-reports** → paste the comment to the user and stop; do not guess.
   - **self-heal skipped (e.g. missing `CURSOR_API_KEY`)** → tell the user; do not bypass by force-pushing speculative fixes.
3. After a heal push, verification may arrive via `workflow_dispatch` (GITHUB_TOKEN pushes don’t retrigger `pull_request`). Watch that run too.
4. Cap: if two heal commits already exist on the PR or HEAD is already a heal commit and checks are still red, stop and ask a human.

## Don’t

- Don’t merge the PR or enable auto-merge unless the user explicitly asks.
- Don’t weaken/skip tests to go green.
- Don’t print real secrets (`GOREST_TOKEN`, `CURSOR_API_KEY`).
- Don’t rewrite CI/workflows as part of shipping a test.

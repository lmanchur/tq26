CI tests failed on this pull request. You have full access to git and `gh`.

Follow the project skill at `.cursor/skills/fix-playwright-test/SKILL.md` end-to-end (including its verify and three consecutive affected-test runs before push). Use `.cursor/skills/run-playwright-tests/SKILL.md` for the exact test commands.

Context:

- Failed job log: `self-heal-logs/failed-job.log` (if present)
- Playwright report: `playwright-report/` (if present)
- Never guess. If anything is unclear, or the app is wrong (skill Step 3b), do not push a speculative fix — comment on the PR with the question or QA bug report and stop.

After a successful push with `GITHUB_TOKEN`, `pull_request` workflows do not re-run automatically. Dispatch verification with:

```bash
gh workflow run playwright.yml --ref <head-branch>
```

Loop limits: at most two `fix: self-heal` commits on this PR. If HEAD is already a self-heal commit, or two already exist since the base branch, comment that a human is needed and stop. Do not rewrite workflows, config, lockfiles, or secrets.

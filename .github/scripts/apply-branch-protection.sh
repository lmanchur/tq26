#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RULESET="$ROOT/.github/rulesets/protect-main.json"
REPO="${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required. Install it, then run: gh auth login" >&2
  exit 1
fi

existing_id="$(
  gh api "repos/${REPO}/rulesets" --jq \
    '.[] | select(.name=="Protect main") | .id' \
    2>/dev/null || true
)"

if [[ -n "${existing_id}" ]]; then
  gh api --method PUT "repos/${REPO}/rulesets/${existing_id}" --input "$RULESET"
  echo "Updated ruleset ${existing_id} on ${REPO}"
else
  gh api --method POST "repos/${REPO}/rulesets" --input "$RULESET"
  echo "Created ruleset on ${REPO}"
fi

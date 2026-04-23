---
name: issue-bot
description: Semi-automated issue squashing workflow. Triages open GitHub issues by automation confidence, auto-fixes safe ones, flags the rest for human review, and creates a draft PR to dev.
---

# issue-bot

Semi-automated batch issue fixer. Triages issues by confidence, fixes the safe ones, skips the rest, and creates a draft PR for review.

## how to use

- `/issue-bot`
  Fix all open issues (excluding `status:in-dev`), max 20.

- `/issue-bot <label>`
  Filter by label before triaging (e.g., `area:frontend`, `priority:high`, `area:accessibility`).

## workflow

Run these steps in order. Stop and report if any step fails.

---

### phase 0 — check for pre-computed triage

Before fetching and classifying issues, check if the scheduled audit has already produced a triage:

```bash
ls -t .agent-reports/issue-bot/*_triage.md 2>/dev/null | head -1
```

If a triage file exists from the last 7 days:
1. Read it and display the triage table to the user
2. Ask: "Pre-computed triage from [date] found. Use this, re-triage from scratch, or adjust and go?"
3. If the user approves the existing triage, skip to **phase 2** (step 4)
4. If the user wants to re-triage or the file is older than 7 days, continue to step 1

This saves tokens by reusing the classification the scheduled audit already computed.

---

### phase 1 — triage

#### step 1: fetch issues

```bash
gh issue list --state open --search "-label:status:in-dev" --limit 20 --json number,title,labels,body
```

If an argument was passed (e.g., `area:frontend`), add `--label "<arg>"` to the query.

If more than 20 results, prioritize: `priority:critical` > `priority:high` > `priority:medium` > `priority:low`, then by issue number ascending.

#### step 2: classify each issue into tiers

Read each issue's title, body, and labels. Apply these rules:

**Auto-fix** (high confidence) — ALL must be true:
- Issue body identifies a specific file and element/line
- Fix is mechanical: token replacement (raw hex → `D.*`), adding/removing a single attribute (ARIA, role, id), deleting dead code/files, removing unused imports
- Change touches 1 file (2 max if the second is a test file)
- Existing test coverage for the affected file, OR change is purely additive/subtractive (adding an ARIA attr, deleting dead code) where breakage is caught by typecheck/lint

Signal words suggesting auto-fix: "hardcode", "missing aria", "unused", "dead file", "raw hex", "redundant", "missing id", "missing role", "token"

**Assisted** (medium confidence) — any of these:
- Fix spans 2-3 files but the issue clearly describes what to change
- Logic fix with existing test coverage (test files exist in `__tests__/` for the module)
- Issue title names a specific component and the scope is bounded

Signal words: "inline style", "deduplication", "filter", "validation", "missing check"

**Manual — skip** (low confidence) — any of these:
- Affects 4+ files or describes a pattern across "all" pages/components
- Requires architectural changes (e.g., converting client → server components)
- Issue body is ambiguous or lacks specific file references
- Involves UI/visual design judgment (layout, animation, spacing, "looks wrong")
- Involves Stripe Elements or third-party iframe behavior
- Labels include `priority:critical` (too risky for automation)
- Fix requires new test files to verify correctness
- Touches database migrations, RLS policies, or Stripe webhook logic

#### step 3: present triage to user — STOP and wait for approval

Display:

```
## Issue Triage

### Auto-fix (N issues)
| # | Title | Reason |
|---|-------|--------|

### Assisted (N issues)
| # | Title | Reason |
|---|-------|--------|

### Manual — will skip (N issues)
| # | Title | Reason |
|---|-------|--------|

You can:
- Move issues between tiers: "move #123 to assisted"
- Skip specific issues: "skip #456"
- Approve and proceed: "go"
```

**Do not proceed until the user says "go" or equivalent.**

---

### phase 2 — fix

#### step 4: create branch

```bash
git checkout dev
git pull origin dev
git checkout -b fix/issue-bot-$(date +%Y-%m-%d)
```

If the branch already exists, append a counter: `-2`, `-3`, etc.

Verify the working tree is clean before starting. If dirty, stop and tell the user.

#### step 5: process auto-fix issues (sequentially)

For each auto-fix issue, in order:

1. **Check issue is still open**: `gh issue view <N> --json state` — skip if closed
2. **Read the issue**: `gh issue view <N> --json body,title`
3. **Read CLAUDE.md "Known Mistakes"** section — check for relevant rules before fixing
4. **Read the target file(s)** in full — understand existing patterns, imports, conventions
5. **Confirm the exact target** matches what the issue describes (per CLAUDE.md "Code Changes" rules)
6. **Apply the fix** — single Write per file, minimal Edits. Get it right the first time.
7. **Run tests**:
   ```bash
   npm test
   ```
   - If tests **fail**: revert with `git checkout -- <changed files>`, move this issue to assisted tier, log it, continue
   - If tests **pass**: proceed to commit
8. **Commit**:
   ```bash
   git add <specific files>
   git commit -m "$(cat <<'EOF'
   fix(<scope>): <short description from issue>

   Closes #N

   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```
9. **Label**: `gh issue edit <N> --add-label "status:in-dev"`

**Circuit breaker**: If 3 consecutive issues fail tests, stop the run — something systemic is wrong. Report what happened.

#### step 6: process assisted issues (sequentially)

Same as step 5, but with additional exploration before fixing:

1. Read the issue body
2. Read the target file(s) in full
3. Also read: related files (imports, callers), existing tests, surrounding context
4. Grep for similar patterns in the codebase that solve the same problem
5. Apply the fix
6. Run `npm test`:
   - If tests fail: revert, try a **different approach** (attempt 2)
   - If second attempt also fails: move to manual tier, log the failure reason
7. If tests pass: commit and label (same format as step 5)

#### step 7: skip manual issues

Do not attempt manual-tier issues. They appear in the PR summary for the user to handle.

---

### phase 3 — verify and PR

#### step 8: run full gate

```bash
npm test && npm run typecheck && npm run lint
```

If any command fails:
- Identify which commit(s) likely caused the failure
- Report the failure details
- **Do NOT create the PR** — the user must decide whether to revert commits or fix forward
- Stop here

#### step 9: create draft PR

```bash
git push -u origin <branch-name>
```

```bash
gh pr create --draft --base dev --title "fix: issue-bot batch — N issues" --body "$(cat <<'EOF'
## Summary

Automated issue-bot run fixing N issues from the open backlog.

## Results

| # | Title | Tier | Status |
|---|-------|------|--------|
| 123 | example issue | auto | fixed |
| 456 | another issue | assisted | fixed |
| 789 | complex issue | manual | skipped |

## Changes per issue

### #123 — <title>
<1-2 sentences: what was changed and why>

### #456 — <title>
<1-2 sentences: what was changed and why>

## Needs human attention

These issues were triaged as manual or failed automated fixing:
- #789 — <title> (reason)

## Gate status
- Tests: PASS (N passed)
- Typecheck: PASS
- Lint: PASS (warnings only)

---
Generated by `/issue-bot` — review each commit individually, revert any bad fixes before merging.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

#### step 10: report to user

```
## issue-bot complete

- Fixed: N issues (N auto-fix, N assisted)
- Skipped: N issues (manual tier)
- Failed: N issues (moved to manual after test failures)

Draft PR: <URL>

Manual issues remaining:
- #789: <title> — <reason skipped>

Review the draft PR. Each fix is its own commit — revert individually if needed.
```

---

## what this skill does NOT do

- Does NOT run `/commit` or `/reviewer` per fix (tests per-fix, full gate once at end)
- Does NOT merge the PR — ever
- Does NOT auto-fix `priority:critical` issues
- Does NOT touch migrations, RLS policies, or Stripe webhook logic
- Does NOT create new test files — if a fix needs new tests, it's manual tier
- Does NOT make UI/visual judgment calls

## stop conditions

| Condition | Action |
|-----------|--------|
| User rejects triage | Stop, report proposed plan |
| Dirty git tree | Stop, tell user to clean up |
| Not on `dev` branch | Stop, tell user to switch |
| 3 consecutive test failures | Stop, report systemic issue |
| Full gate fails | Stop before PR, report failures |
| Zero fixable issues | Report manual list only, no branch/PR |
| Issue closed between triage and fix | Skip it, continue |
| Target file doesn't exist | Move to manual, continue |

## conventional commit scopes

Use the same scopes as `/commit`:

| scope | area |
|-------|------|
| `auth` | authentication, session |
| `billing` | Stripe, plans, subscriptions |
| `upload` | file upload pipeline |
| `data` | user_data, commission records |
| `dashboard` | main app UI |
| `settings` | user settings |
| `preview` | public landing page |
| `api` | API routes |
| `db` | schema, migrations, RLS |
| `a11y` | accessibility fixes |
| `perf` | performance fixes |

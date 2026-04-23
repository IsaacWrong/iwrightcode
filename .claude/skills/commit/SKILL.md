---
name: commit
description: Enforced commit workflow for this project. Runs tests, reviewer, and lint before creating a conventional commit. Use before every commit.
---

# commit

Run the full pre-commit workflow and create a conventional commit.

## how to use

- `/commit`
  Run the full pre-commit checklist and create a commit if everything passes.

- `/commit "<message>"`
  Run the full checklist, then commit with the provided message (must be conventional format).

## workflow

Run these steps in order. Stop and report if any step fails.

### 1. branch check

```bash
git branch --show-current
```
- must NOT be on `main` — commits to `main` are forbidden (use PRs via `dev`)
- warn if on `dev` directly for feature work
- block and stop if on `main`

### 2. run tests

```bash
npm test
```
- all tests must pass before proceeding
- if tests fail: report and stop
- coverage thresholds are enforced by CI on PRs (coverage-report job), not per-commit

### 3. run linter

```bash
npm run lint
```
- all lint errors must be resolved before proceeding
- warnings are acceptable but should be noted

### 4. type check

```bash
npm run typecheck
```
- zero TypeScript errors required before proceeding
- faster than a full build — catches type regressions immediately
- if errors are found: report them and stop

### 5. invoke reviewer

Invoke the `/reviewer` agent and pass the staged diff.
- reviewer must not find critical or high-severity issues before committing
- medium/low issues can proceed with a note in the commit body

### 6. identify closed issues

Before staging, check if any open GitHub issues are resolved by this commit.
Exclude issues already staged in `dev` (labeled `status:in-dev`) — those are fixed but awaiting the weekly release:

```bash
gh issue list --state open --search "-label:status:in-dev" --limit 50 --json number,title,labels
```

Cross-reference against the staged diff and recent `git log`. For each issue that this commit fully resolves, note its number — it will go in the commit message as `Closes #N`.

If the user passed a commit message, check it for `Closes #N` references already. If none are present and you identified resolved issues, add them.

### 7. stage and commit

Stage only the relevant files (avoid `git add .` which may include sensitive files):
```bash
git add <specific files>
```

Commit with conventional format. Include `Closes #N` lines for any issues resolved by this commit:
```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <short description>

[optional body]

Closes #N[, #N2, ...]

Co-Authored-By: <model name from current session> <noreply@anthropic.com>
EOF
)"
```

For the Co-Authored-By line, use the model that is actually running (e.g., "Claude Opus 4.6 (1M context)", "Claude Sonnet 4.6", etc.). Do not hardcode a model name.

GitHub auto-closes referenced issues when the branch merges to `main`. Always include these — it is the primary mechanism for keeping the issue tracker clean.

### 8. label staged issues

After a successful commit, apply `status:in-dev` to every issue referenced in the commit message:

```bash
gh issue edit <N> --add-label "status:in-dev"
```

This marks them as "fixed, pending release" so they stop appearing in active work lists. The label is removed automatically when GitHub closes the issue on merge to `main`.

## conventional commit types

| type | when to use |
|------|-------------|
| `feat` | new feature |
| `fix` | bug fix |
| `refactor` | code change with no behavior change |
| `test` | adding or updating tests |
| `docs` | documentation only |
| `chore` | build, config, dependency updates |
| `perf` | performance improvement |
| `style` | formatting only (no logic change) |

## scopes (project-specific)

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

## branch strategy reminder

- feature branches → merge into `dev`
- `dev` → merge into `main` (weekly release)
- NEVER commit directly to `main`

## stop conditions

- tests failing → stop, report failures
- lint errors → stop, report errors
- typecheck errors → stop, report errors
- reviewer finds critical/high issues → stop, report issues
- on `main` branch → stop immediately

## issue closing convention

Always use `Closes #N` in commit messages when a commit resolves a GitHub issue. GitHub auto-closes the issue when the branch merges to `main`. This is the canonical way to keep the tracker clean — do not close issues manually unless the fix was already committed without a reference.

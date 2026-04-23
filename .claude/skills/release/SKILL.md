---
name: release
description: Weekly release workflow for Palm Commissions. Runs pre-flight checks, builds a changelog, creates the dev→main PR, then tags and publishes the GitHub release after merge.
---

# release

Run the full weekly release workflow.

## how to use

- `/release`
  Run pre-flight checks, build changelog, and create the dev→main PR.

- `/release patch|minor|major`
  Same as above but override the version bump type.

## workflow

Run these steps in order. Stop and report if any step fails.

### 1. pre-flight checks

```bash
git branch --show-current   # must be on dev
git status                  # must be clean
npm test                    # all tests must pass
npm run lint                # no errors (warnings ok)
```

Block if on any branch other than `dev`. Block if working tree is dirty.

### 2. review what's shipping

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

If no previous tag exists:
```bash
git log --oneline | head -20
```

Summarize the commits into categories:
- **Features** (`feat:`)
- **Fixes** (`fix:`)
- **Performance** (`perf:`)
- **Other** (`chore:`, `refactor:`, `docs:`, etc.)

### 3. check for release blockers

```bash
gh issue list --label "priority:critical" --state open
gh issue list --label "priority:high" --state open
```

Flag any open critical or high issues — ask the user to confirm before proceeding if any exist.

### 4. determine version bump

Current version from `package.json`. Suggest bump based on commits:
- Any `feat:` → at least **minor**
- Breaking change in body → **major**
- Only `fix:`, `perf:`, `chore:` → **patch**

Ask user to confirm or override before proceeding.

### 5. bump version

```bash
npm version patch|minor|major --no-git-tag-version
```

Stage and commit:
```bash
git add package.json package-lock.json
git commit -m "chore(release): bump version to vX.Y.Z

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### 6. create PR dev → main

```bash
gh pr create \
  --base main \
  --head dev \
  --title "release: vX.Y.Z" \
  --body "$(cat <<'EOF'
## Release vX.Y.Z

### What's shipping
[categorized changelog from step 2]

### Pre-flight
- [ ] Tests passing
- [ ] Lint clean
- [ ] No blocking issues

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

Return the PR URL. **Stop here.** The merge is a human decision.

### 7. after PR is merged (run separately)

Once the PR is merged, run the post-merge steps:

```bash
git checkout main && git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

Create the GitHub release:
```bash
gh release create vX.Y.Z \
  --title "vX.Y.Z" \
  --notes "[same changelog from step 2]"
```

Then return to dev:
```bash
git checkout dev
```

### 8. verify lighthouse smoke check

After merging, the `Lighthouse Perf Smoke Check` workflow runs automatically on `main`.
It waits ~3.5 minutes for Vercel to deploy, then audits `/preview` against these thresholds:

| Metric | Threshold |
|--------|-----------|
| Score  | >= 82     |
| TBT    | <= 600ms  |
| TTI    | <= 7.0s   |
| FCP    | <= 3.0s   |
| LCP    | <= 4.0s   |

Check it passed before calling the release done:
```bash
gh run list --workflow=lighthouse.yml --limit=1
```

If it fails, a perf regression was introduced — investigate before the next release.

## version bump reference

| type | when |
|------|------|
| `patch` | bug fixes, chores, performance — no new features |
| `minor` | new features, backwards-compatible |
| `major` | breaking changes, major redesigns |

## stop conditions

- not on `dev` → stop immediately
- dirty working tree → stop, commit or stash first
- tests failing → stop, fix before releasing
- open critical/high issues → pause, ask user to confirm

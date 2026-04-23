---
name: housekeeping
description: Weekly maintenance workflow — prunes stale reports, trims bloated memories, syncs MEMORY.md index, normalizes report directories, scans for secrets, and generates a cleanup digest. Use weekly or when agent reports/memory feel bloated.
---

# housekeeping

Run the weekly agent report and memory cleanup workflow.

## how to use

- `/housekeeping`
  Run the full cleanup workflow (all steps below in order).

## workflow

Run these steps in order. Report results at the end.

### 1. prune stale reports

- Check all directories in `.agent-reports/*/` (except `memory/`)
- Delete report files older than 7 days (based on `YYYY-MM-DD` in filename)
- **Keep** non-dated files (e.g., `designer/COLOR_REFERENCE.md`, `designer/AUDIT_INDEX.md`) — these are living documentation
- **Keep** `scout/session-context.md` (always current)
- Log what was deleted

### 2. normalize report directories

- Check that each agent's report directory name matches its agent definition file name
- If a misnamed directory exists alongside the correct one, merge contents into the correct directory and delete the misnamed one
- If only the misnamed directory exists, rename it

### 3. trim bloated agent memories

Agent memory files store **patterns and decisions**, not session logs.

- **Target**: Each `agent_*.md` file should be under ~150 lines
- **Over limit**: Read the file and remove session-specific detail. Keep: recurring patterns, decision frameworks, architectural gotchas, project-specific conventions.
- **Over 300 lines**: Trim aggressively — extract the 10-15 most important patterns and rebuild around those.
- Preserve frontmatter and file structure.

### 4. graduate report patterns to memory

Before deleting a report in step 1, scan it for patterns not already in the agent's memory:

- A finding that appeared in 2+ reports from the same agent → should be in memory
- A workaround or convention the agent discovered → should be in memory
- A one-time issue already filed as a GitHub Issue → does NOT need to be in memory

If worth preserving, append to the agent's memory file before deleting the report.

### 5. sync MEMORY.md index

- List all `*.md` files in `.agent-reports/memory/` (excluding `MEMORY.md` and `README.md`)
- Compare against entries in `MEMORY.md`
- **Add** entries for files that exist on disk but aren't indexed
- **Remove** entries for files referenced in the index but missing from disk
- Keep entries concise (under 150 characters each)
- Keep the index organized by section

### 6. sensitive data scan

Scan all files in `.agent-reports/` for potential secrets or PII:
- API keys (`sk-`, `sk_live_`, `re_`, `ghp_`, `AKIA`)
- JWT tokens (`eyJ...`)
- Email addresses (except in meta like "Last updated by")
- Hardcoded passwords

Flag any findings for immediate removal.

### 7. generate digest

Write a cleanup report to `.agent-reports/housekeeping/YYYY-MM-DD_housekeeping.md`:

```markdown
# Housekeeping Report — [date]

## Reports Pruned
- Deleted X files across Y agent directories
- [list of deleted files, grouped by agent]

## Directory Normalization
- [any renames/merges performed, or "No issues found"]

## Memory Trimming
| Agent Memory | Lines Before | Lines After | Action |
|---|---|---|---|
| agent_reviewer.md | 2420 | 120 | Trimmed — kept 12 core patterns |

## Patterns Graduated (report → memory)
- [agent]: [pattern description] (from report [filename])
- Or "No new patterns found"

## MEMORY.md Sync
- Added X entries, removed Y entries

## Sensitive Data Scan
- [clean / findings listed]

## System Health
| Metric | Value |
|---|---|
| Total report files | X |
| Total memory files | Y |
| Largest memory file | agent_X.md (N lines) |
| MEMORY.md entries | Z |
```

### 8. stage changes

```bash
git add .agent-reports/
```

Agent reports and memory are tracked in git. Stage all changes so they persist in the next commit.

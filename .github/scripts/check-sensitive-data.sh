#!/usr/bin/env bash
# check-sensitive-data.sh — Scans staged files in .agent-reports/ for
# accidentally committed secrets, API keys, PII, or tokens.
# Called by the pre-commit hook via Claude Code settings.

set -euo pipefail

# Only check agent report files that are staged
STAGED_REPORTS=$(git diff --cached --name-only -- '.agent-reports/' 2>/dev/null || true)

if [ -z "$STAGED_REPORTS" ]; then
  exit 0
fi

VIOLATIONS=0

# Patterns to flag (case-insensitive)
PATTERNS=(
  'sk-[a-zA-Z0-9]{20,}'          # OpenAI / Stripe secret keys
  'sk_live_[a-zA-Z0-9]+'         # Stripe live key
  'sk_test_[a-zA-Z0-9]+'         # Stripe test key
  're_[a-zA-Z0-9]{20,}'          # Resend API key
  'ghp_[a-zA-Z0-9]{36}'          # GitHub personal access token
  'eyJ[a-zA-Z0-9_-]{50,}'        # JWT tokens
  'AKIA[A-Z0-9]{16}'             # AWS access key
  'supabase_service_role'         # Service role key mention
  'SUPABASE_SERVICE_ROLE_KEY'     # Env var name with value
  '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'  # Email addresses
  'password\s*[:=]\s*\S+'        # Hardcoded passwords
)

for file in $STAGED_REPORTS; do
  if [ ! -f "$file" ]; then
    continue
  fi

  for pattern in "${PATTERNS[@]}"; do
    matches=$(grep -inE "$pattern" "$file" 2>/dev/null || true)
    if [ -n "$matches" ]; then
      # Allow placeholder emails only (example.com, test, demo domains)
      if [[ "$pattern" == *"@"* ]]; then
        real_matches=$(echo "$matches" | grep -ivE '@(example\.com|test\.|demo\.|placeholder\.)' || true)
        if [ -z "$real_matches" ]; then
          continue
        fi
        matches="$real_matches"
      fi
      echo "⚠ Sensitive data detected in $file:"
      echo "$matches" | head -3
      echo ""
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done
done

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "Found $VIOLATIONS potential sensitive data issue(s) in agent reports."
  echo "Review the files above and remove any secrets/PII before committing."
  echo "If these are false positives, you can bypass with --no-verify."
  exit 1
fi

exit 0

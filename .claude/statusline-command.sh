#!/usr/bin/env bash
# Claude Code statusLine command
# Displays context usage percentage and granular token breakdown

# Ensure jq is findable in non-interactive shells
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

input=$(cat)

# Guard: if jq is unavailable, show a clear error rather than silent --
if ! command -v jq &>/dev/null; then
  printf "ctx:jq-missing"
  exit 0
fi

# Extract context window fields
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
input_tokens=$(echo "$input" | jq -r '.context_window.current_usage.input_tokens // empty')
output_tokens=$(echo "$input" | jq -r '.context_window.current_usage.output_tokens // empty')
cache_write=$(echo "$input" | jq -r '.context_window.current_usage.cache_creation_input_tokens // empty')
cache_read=$(echo "$input" | jq -r '.context_window.current_usage.cache_read_input_tokens // empty')

# Build context percentage segment (always shown)
if [ -n "$used_pct" ]; then
  ctx_display=$(printf "ctx:%.0f%%" "$used_pct")
else
  ctx_display="ctx:--"
fi

# Build token breakdown segment (only shown after first API response)
token_display=""
if [ -n "$input_tokens" ] && [ -n "$output_tokens" ]; then
  token_display="in:${input_tokens} out:${output_tokens}"
  if [ -n "$cache_write" ] && [ "$cache_write" -gt 0 ] 2>/dev/null; then
    token_display="${token_display} cw:${cache_write}"
  fi
  if [ -n "$cache_read" ] && [ "$cache_read" -gt 0 ] 2>/dev/null; then
    token_display="${token_display} cr:${cache_read}"
  fi
fi

# Compose final output
if [ -n "$token_display" ]; then
  printf "%s | %s" "$ctx_display" "$token_display"
else
  printf "%s" "$ctx_display"
fi

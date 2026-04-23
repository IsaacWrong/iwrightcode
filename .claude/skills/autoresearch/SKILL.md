---
name: autoresearch
description: Launches the autoresearch agent to autonomously optimize the column mapper. Runs in the background on Sonnet. Use /autoresearch or /autoresearch N for N iterations.
---

# autoresearch

Launches the **autoresearch agent** to run the autonomous column-mapper optimization loop.

## how to use

- `/autoresearch` — Run 5 iterations (default)
- `/autoresearch N` — Run N iterations (e.g. `/autoresearch 10`)

## what to do

1. Parse the iteration count from the args (default 5).
2. Launch the `autoresearch` agent using the Agent tool with:
   - `subagent_type`: the agent name won't work here — use the general-purpose agent type and include the full agent instructions in the prompt. BUT since the agent file exists at `.claude/agents/autoresearch.md`, the system should pick it up. Just spawn it.
   - `run_in_background: true` — the loop takes a while, let it run
   - `model: "sonnet"` — use Sonnet for cost/speed
   - Prompt: Tell it the iteration count and that it should follow the workflow in its agent definition

3. Tell the user:
   - The agent is running in the background on Sonnet
   - They can open `dev/autoresearch.html` to watch accuracy update live
   - They'll be notified when it completes

## prompt template

```
Run the autoresearch optimization loop for {N} iterations.

Follow the workflow defined in your agent instructions:
0. Capture baseline with `npx tsx scripts/autoresearch-bench.ts --save`
1. Read the full mapper source at `src/lib/aiAgentService.ts`
2. For each iteration: analyze failures → make ONE surgical edit → measure → keep or revert
3. After all iterations: output the final report summary
4. Run `npx jest src/lib/__tests__/autoresearch.test.ts --no-coverage` to verify thresholds

The HTML dashboard at dev/autoresearch.html auto-refreshes from data/autoresearch-live.js every 3 seconds — each `--save` call updates it.
```

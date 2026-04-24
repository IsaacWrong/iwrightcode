<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Production server
npm run start
```

There is no test suite in this project yet — no `npm test`. If you add one, update this section and the `/commit` skill.

## Code Changes

- Read `node_modules/next/dist/docs/` before calling any Next.js API you're not 100% sure about. This is Next.js 16 + React 19 + Tailwind v4.
- Default to editing existing files. Creating a new component should be the exception.
- One write per file. Get it right the first time — don't Write, read the diff, Write again.

## Known Mistakes — Do Not Repeat

### UI / Design — Full-bleed terminal aesthetic

- **Never wrap sections in a centered `max-w-[N]px mx-auto w-full` page column.** That pattern is deprecated here. Sections render edge-to-edge.
- Every `<section>`, `<nav>`, and `<footer>` uses the shared gutter: `px-6 md:px-10 lg:px-16`. Match padding across Nav, Hero, Work, About, Contact, and Footer so left/right gutters line up vertically.
- Cap text reading width on the **text element itself** with `style={{ maxWidth: 640 }}` (or similar), not on a wrapping container.
- No boxy design — no sharp-cornered cards, thick borders, or grid-of-boxes.
- No Tailwind gray defaults (`text-gray-*`, `bg-gray-*`). Use the palette tokens defined in `app/globals.css`.

### Next.js 16 / React 19

- Route handler params are async in Next.js 16 — `params: Promise<{ slug: string }>` and you must `await` them.
- Server Components are the default; only add `"use client"` when a component actually needs interactivity.
- Don't add `sentry.client.config` / `sentry.server.config` files if you ever wire Sentry — v10 uses `instrumentation.ts` only.

### Git / Workflow

- Don't commit directly to `main` — use a feature branch and PR.
- Don't commit `.env.local` or anything under `.next/`, `coverage/`, `node_modules/`.
- Run `/commit` (not raw `git commit`) so lint + reviewer checks fire.

## Architecture

```
app/          Next.js App Router — layout, page, not-found, api/
components/   Section components (Hero, Work, About, Contact, …) + UI pieces
lib/          Shared utilities
public/       Static assets
```

Sections composed in `app/page.tsx`: Nav → Hero → Work → Activity → About → Contact → Footer.

### Pinned versions

- Next.js 16.2.4
- React 19.2.4
- Tailwind v4 (`@tailwindcss/postcss`)
- Framer Motion 12.x
- TypeScript 5

Check `package.json` before upgrading any of these.

## Agent Team

Core agents live under `.claude/agents/` and are auto-delegated for routine work:

| Agent       | Use for                                                         |
| ----------- | --------------------------------------------------------------- |
| `planner`   | Break features/fixes into steps, identify affected files        |
| `reviewer`  | Code review on diffs — correctness, security, maintainability   |
| `tester`    | Write/run unit tests, flag failures                             |
| `debugger`  | Investigate errors, trace root causes                           |
| `guardian`  | Backend validation, data integrity (thin here — no DB yet)      |
| `catchup`   | Session bootstrapping — summarize recent git + agent activity   |
| `tasks`     | GitHub Issue triage and management                              |

Specialist agents (engineering, design, product, support, testing) live in subfolders. Prefer the core set first; reach for specialists when the scope genuinely matches.

## Available Skills

Project-local slash commands (`.claude/skills/`):

| Skill                   | What it does                                                 |
| ----------------------- | ------------------------------------------------------------ |
| `/commit`               | Enforced pre-commit workflow (lint + reviewer + commit)      |
| `/release`              | Release workflow (pre-flight → changelog → dev→main PR → tag) |
| `/audit`                | Full-project issue discovery across specialists              |
| `/housekeeping`         | Weekly maintenance — prune reports, trim memory, secret scan |
| `/issue-bot`            | Semi-automated GitHub issue triage + auto-fix                |
| `/fixing-accessibility` | WCAG audit + fixes                                           |
| `/fixing-metadata`      | Title/description/OG/canonical/JSON-LD audit                 |
| `/baseline-ui`          | Enforce typography scale + animation standards               |
| `/nextjs-app-router`    | Next.js App Router patterns + best practices                 |

User-level skills (`~/.claude/skills/`) are available everywhere — notably the `/caveman*` family for compressed communication, plus `/compress`, `/simplify`, `/schedule`, `/loop`.

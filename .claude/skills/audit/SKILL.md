---
name: audit
description: Full-project issue discovery workflow. Runs all specialist agents in three sequential waves to surface and file GitHub Issues across security, data, API, compliance, code quality, accessibility, brand, and performance — wave model prevents duplicate filing.
---

# audit

Run a full-project issue discovery audit across all specialist domains.

## how to use

- `/audit`
  Run the complete 3-wave audit across all domains.

- `/audit backend`
  Run Wave 1 only (security + guardian). Use when you've just changed auth, RLS, or API routes.

- `/audit functional`
  Run Wave 2 only (api tester + compliance + code reviewer). Assumes Wave 1 is already clean.

- `/audit experience`
  Run Wave 3 only (accessibility + brand + performance). Use after UI-only changes.

- `/audit security`
  Run the security engineer agent only.

- `/audit rls`
  Run the guardian agent only.

## wave model

Agents run in parallel **within** a wave but waves run **sequentially**. This prevents duplicate issues: structural findings (Wave 1) are filed first, functional agents (Wave 2) check for existing issues before filing, and experience agents (Wave 3) do the same. Each wave's agents are told what domains the prior wave covered.

```
Wave 1 — Structural
  ├── guardian          (RLS, data integrity, Supabase queries, backend auth patterns)
  └── security engineer (OWASP Top 10, auth hardening, API threat surface, secrets)

Wave 2 — Functional                         [runs after Wave 1 is complete]
  ├── api tester        (endpoint contract, auth coverage, edge cases)
  ├── legal compliance  (billing disclosure, GDPR, consent, data handling)
  └── reviewer          (code quality, patterns, maintainability)

Wave 3 — Experience                         [runs after Wave 2 is complete]
  ├── accessibility     (WCAG 2.1 AA, ARIA, keyboard nav, screen reader)
  ├── brand guardian    (color tokens, visual consistency, typography)
  └── performance       (Core Web Vitals, DB query perf, bundle size)
```

## workflow

Run these steps in order. Do not proceed to the next wave until all agents in the current wave have returned.

---

### step 0 — read session context

Before launching any agents, read `.agent-reports/scout/session-context.md` if it exists. Note any in-progress work or known issues to pass as context to agents.

---

### step 1 — wave 1: structural (parallel)

Launch both agents **in the same message** using the Agent tool with `run_in_background: true`. Wait for both to complete before proceeding.

**Guardian handoff:**
```
## Handoff
**Goal**: Full backend audit — flag all RLS gaps, data integrity issues, Supabase query problems, and backend auth pattern violations.
**Relevant context**: This is a scheduled full-project audit. No specific files changed — review the entire backend surface.
**Specific ask**: Audit all tables for RLS completeness, check all API routes for auth pattern compliance (supabase.auth.getUser()), review service layer queries for N+1, missing filters, and silent failure modes. Check supabaseAdmin is only used in the Stripe webhook. File a GitHub Issue for every finding.

## Project Workflow
**Memory**: Read `.agent-reports/memory/agent_guardian.md` before starting. Update it at the end of your session.
**Session context**: Read `.agent-reports/scout/session-context.md` if it exists.
**Issues**: For every issue found, create a GitHub Issue:
  gh issue create --title "<title>" --body "<body>" \
    --label "agent:guardian,priority:<critical|high|medium|low>,area:<frontend|backend|data|auth|billing|accessibility|testing>"
Before creating, check for duplicates: gh issue list --search "<keywords>"
**Reports**: Write report to `.agent-reports/guardian/YYYY-MM-DD_audit.md`. Flag issues — do NOT auto-fix.
```

**Security Engineer handoff:**
```
## Handoff
**Goal**: Full security audit — surface OWASP Top 10 vulnerabilities, auth weaknesses, exposed secrets, and API threat surface issues across the entire codebase.
**Relevant context**: This is a scheduled full-project audit. Stack is Next.js 15 App Router, Supabase Auth (JWT), Stripe webhooks, Resend email. The only public API endpoint that intentionally bypasses auth is /api/stripe/webhook (signature-verified). supabaseAdmin bypasses RLS — its use must be restricted to that webhook only.
**Specific ask**: Review all API routes for auth enforcement, check for injection risks (SQL, command, header), review the Stripe webhook signature verification, check for secrets in client-side code or env var exposure, assess CSP/security headers, and flag any IDOR or privilege escalation risks. File a GitHub Issue for every finding.

## Project Workflow
**Memory**: Read `.agent-reports/memory/agent_security_engineer.md` before starting (create if missing). Update it at the end of your session.
**Session context**: Read `.agent-reports/scout/session-context.md` if it exists.
**Issues**: For every issue found, create a GitHub Issue:
  gh issue create --title "<title>" --body "<body>" \
    --label "agent:security-engineer,priority:<critical|high|medium|low>,area:<frontend|backend|data|auth|billing|accessibility|testing>"
Before creating, check for duplicates: gh issue list --search "<keywords>"
**Reports**: Write report to `.agent-reports/security-engineer/YYYY-MM-DD_audit.md`. Flag issues — do NOT auto-fix.
```

---

### step 2 — wave 2: functional (parallel)

After Wave 1 completes, launch all three agents **in the same message** with `run_in_background: true`. Wait for all three to complete.

Tell each agent: "Wave 1 (security engineer + guardian) has already filed issues covering RLS, data integrity, auth route patterns, OWASP vulnerabilities, and secrets. Check for those issues before filing to avoid duplicates: `gh issue list --state open --limit 100`"

**API Tester handoff:**
```
## Handoff
**Goal**: Audit all API endpoints for contract correctness, auth enforcement, edge case handling, and missing coverage.
**Relevant context**: This is Wave 2 of a full-project audit. Wave 1 already filed security and RLS issues — check existing issues before filing to avoid duplicates. API routes are in src/app/api/. All routes require supabase.auth.getUser() except /api/stripe/webhook.
**Specific ask**: Review every API route file. For each route: verify auth is enforced, check input validation, verify correct HTTP status codes, check error response shapes are consistent, and flag any missing edge case handling (empty body, malformed input, missing required fields). File a GitHub Issue for every finding.

## Project Workflow
**Memory**: Read `.agent-reports/memory/agent_api_tester.md` before starting (create if missing). Update it at the end.
**Session context**: Read `.agent-reports/scout/session-context.md` if it exists.
**Issues**: For every issue found, create a GitHub Issue:
  gh issue create --title "<title>" --body "<body>" \
    --label "agent:api-tester,priority:<critical|high|medium|low>,area:<backend|auth|billing|data>"
Before creating, check for duplicates: gh issue list --search "<keywords>"
**Reports**: Write report to `.agent-reports/api-tester/YYYY-MM-DD_audit.md`. Flag issues — do NOT auto-fix.
```

**Legal Compliance handoff:**
```
## Handoff
**Goal**: Audit the app for legal and compliance gaps — billing disclosure, GDPR/privacy, consent flows, data handling, and marketing opt-out.
**Relevant context**: This is Wave 2 of a full-project audit. Wave 1 already filed security issues. This is a SaaS app for independent contractors tracking commissions. It has Stripe subscriptions, email via Resend, and stores commission/financial data. Recent work added account deletion, data export, and marketing email opt-out.
**Specific ask**: Review signup flow for consent handling, billing pages for required disclosures (price, renewal terms, cancellation), privacy policy and terms links, data export and deletion functionality completeness, and marketing email opt-out effectiveness. Flag any gaps. File a GitHub Issue for every finding.

## Project Workflow
**Memory**: Read `.agent-reports/memory/agent_legal_compliance_checker.md` before starting (create if missing). Update it at the end.
**Session context**: Read `.agent-reports/scout/session-context.md` if it exists.
**Issues**: For every issue found, create a GitHub Issue:
  gh issue create --title "<title>" --body "<body>" \
    --label "agent:legal-compliance,priority:<critical|high|medium|low>,area:<billing|auth|frontend|backend>"
Before creating, check for duplicates: gh issue list --search "<keywords>"
**Reports**: Write report to `.agent-reports/legal-compliance/YYYY-MM-DD_audit.md`. Flag issues — do NOT auto-fix.
```

**Reviewer handoff:**
```
## Handoff
**Goal**: Audit the codebase for code quality issues — patterns, maintainability, dead code, incorrect error handling, and TypeScript correctness.
**Relevant context**: This is Wave 2 of a full-project audit. Wave 1 already filed security, RLS, and backend auth issues — skip those areas to avoid duplicates. Stack is Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase JS. No ORM.
**Specific ask**: Review src/lib/ (service layer), src/app/api/ (API routes), src/components/ (components), and src/contexts/ (contexts). Flag: dead code, missing error boundaries, incorrect use of server vs client components, unsafe type assertions, prop drilling that should use context, and any logic that belongs in the service layer but lives in components. File a GitHub Issue for every finding.

## Project Workflow
**Memory**: Read `.agent-reports/memory/agent_reviewer.md` before starting. Update it at the end.
**Session context**: Read `.agent-reports/scout/session-context.md` if it exists.
**Issues**: For every issue found, create a GitHub Issue:
  gh issue create --title "<title>" --body "<body>" \
    --label "agent:reviewer,priority:<critical|high|medium|low>,area:<frontend|backend|data|auth>"
Before creating, check for duplicates: gh issue list --search "<keywords>"
**Reports**: Write report to `.agent-reports/reviewer/YYYY-MM-DD_audit.md`. Flag issues — do NOT auto-fix.
```

---

### step 3 — wave 3: experience (parallel)

After Wave 2 completes, launch all three agents **in the same message** with `run_in_background: true`. Wait for all three to complete.

Tell each agent: "Waves 1 and 2 have already filed issues covering security, RLS, data integrity, API contracts, compliance, and code quality. Check for those issues before filing to avoid duplicates: `gh issue list --state open --limit 100`"

**Accessibility Auditor handoff:**
```
## Handoff
**Goal**: Full WCAG 2.1 AA accessibility audit across all pages and interactive components.
**Relevant context**: This is Wave 3 of a full-project audit. Waves 1-2 already filed structural and functional issues. App is Next.js 15 with Tailwind CSS 4 (minimal), React 19. Key pages: / (public landing), /demo, /legal/*, /auth/signin, /auth/signup, /auth/user/dashboard, /auth/user/settings, /auth/user/upload, /auth/user/tracking, /auth/user/history, /billing/ pages.
**Specific ask**: Audit all pages and components for: missing ARIA labels and roles, keyboard navigation gaps (focus order, tab traps, missing focus indicators), color contrast failures, form error handling and labeling, screen reader compatibility, and missing skip navigation links. File a GitHub Issue for every finding.

## Project Workflow
**Memory**: Read `.agent-reports/memory/agent_accessibility_auditor.md` before starting (create if missing). Update it at the end.
**Session context**: Read `.agent-reports/scout/session-context.md` if it exists.
**Issues**: For every issue found, create a GitHub Issue:
  gh issue create --title "<title>" --body "<body>" \
    --label "agent:accessibility-auditor,priority:<critical|high|medium|low>,area:accessibility"
Before creating, check for duplicates: gh issue list --search "<keywords>"
**Reports**: Write report to `.agent-reports/accessibility-auditor/YYYY-MM-DD_audit.md`. Flag issues — do NOT auto-fix.
```

**Brand Guardian handoff:**
```
## Handoff
**Goal**: Audit the entire app for brand and visual consistency issues — color token misuse, typography inconsistencies, spacing violations, and dark/light theme boundary violations.
**Relevant context**: This is Wave 3 of a full-project audit. Key rule: the app is a single-theme Coast / Golden Hour editorial system across every surface — cream paper (`#f6f2e9`), ink (`#0b110c`), grove (`#2c6b45`), clay (`#c97a3b`). Fraunces display, Source Serif body, Inter UI, JetBrains Mono for mono-labels. Tokens live in `src/lib/colors.ts` (`D.*`) and CSS vars in `globals.css`. No dark mode, no theme toggle, no gradients, no drop shadows. Waves 1-2 already filed structural and functional issues.
**Specific ask**: Review all pages for color token consistency (no raw hex, no Tailwind gray/white, no `rgba(255,255,255,…)` on paper), typography scale adherence (`.display-xl/lg/md/sm`, `.serif`, `.mono-label`), spacing system, and primitive reuse (`.pill-dark`, `.pill-ghost`, `.pill-danger`, `.link-danger`, `EmptyState`). Flag legacy `D.text`/`D.textSoft`/`D.green` usage where Coast canonical `D.ink`/`D.grove`/`D.clay` should be preferred. File a GitHub Issue for every finding.

## Project Workflow
**Memory**: Read `.agent-reports/memory/agent_brand_guardian.md` before starting. Update it at the end.
**Session context**: Read `.agent-reports/scout/session-context.md` if it exists.
**Issues**: For every issue found, create a GitHub Issue:
  gh issue create --title "<title>" --body "<body>" \
    --label "agent:brand-guardian,priority:<critical|high|medium|low>,area:frontend"
Before creating, check for duplicates: gh issue list --search "<keywords>"
**Reports**: Write report to `.agent-reports/brand-guardian/YYYY-MM-DD_audit.md`. Flag issues — do NOT auto-fix.
```

**Performance Benchmarker handoff:**
```
## Handoff
**Goal**: Audit the app for performance issues — Core Web Vitals regressions, slow DB queries, bundle size issues, and rendering anti-patterns.
**Relevant context**: This is Wave 3 of a full-project audit. Stack is Next.js 15 (App Router, Turbopack), React 19, Supabase PostgreSQL with RLS. A Lighthouse CI workflow runs on main after each release with thresholds: score ≥82, TBT ≤600ms, TTI ≤7s, FCP ≤3s, LCP ≤4s. Waves 1-2 already filed structural and functional issues.
**Specific ask**: Review client components for unnecessary re-renders and missing memoization, check API routes for N+1 query patterns and missing pagination, look for missing `loading.tsx` suspense boundaries, check image optimization (next/image usage), and review the upload pipeline for large file handling efficiency. File a GitHub Issue for every finding.

## Project Workflow
**Memory**: Read `.agent-reports/memory/agent_performance_benchmarker.md` before starting (create if missing). Update it at the end.
**Session context**: Read `.agent-reports/scout/session-context.md` if it exists.
**Issues**: For every issue found, create a GitHub Issue:
  gh issue create --title "<title>" --body "<body>" \
    --label "agent:performance-benchmarker,priority:<critical|high|medium|low>,area:<frontend|backend|data>"
Before creating, check for duplicates: gh issue list --search "<keywords>"
**Reports**: Write report to `.agent-reports/performance-benchmarker/YYYY-MM-DD_audit.md`. Flag issues — do NOT auto-fix.
```

---

### step 4 — summarize

After all three waves complete, run:

```bash
gh issue list --state open --limit 100 --json number,title,labels \
  --jq '[.[] | select(.labels[].name | test("^agent:"))] | group_by(.labels[].name | select(test("^priority:"))) | .[] | {priority: .[0].labels[].name, count: length, issues: [.[].number]}'
```

Report to the user:
- Total issues filed this audit run (filter by `agent:*` labels created today)
- Breakdown by priority (critical / high / medium / low)
- Breakdown by area (backend / frontend / auth / billing / data / accessibility / testing)
- Any wave that produced zero findings (call out explicitly — either the domain is clean or the agent found nothing worth filing)
- Direct link pattern: `gh issue list --label "priority:critical" --state open`

## scope variants (partial runs)

When running a partial scope, use the same handoff prompts above but skip the wave sequencing:

| scope | agents to run | wave block to include |
|-------|--------------|----------------------|
| `backend` | guardian + security engineer | Wave 1 only |
| `functional` | api tester + legal compliance + code reviewer | Wave 2 only (skip wave 1 context) |
| `experience` | accessibility + brand guardian + performance | Wave 3 only (skip wave 1-2 context) |
| `security` | security engineer only | Standalone |
| `rls` | guardian only | Standalone |

For standalone runs, remove the "Wave N already filed..." deduplication context from the handoff — it won't apply.

## stop conditions

- If any Wave 1 agent returns a `priority:critical` finding: pause and surface it to the user before proceeding to Wave 2. Ask whether to continue.
- Do not auto-fix any findings — agents flag only.
- If an agent fails to complete (error or timeout): note the failure, continue the wave with remaining agents, flag the gap in the summary.

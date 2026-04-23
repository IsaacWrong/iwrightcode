---
name: nextjs-app-router
description: Next.js 15 App Router patterns and best practices. Use when building components, API routes, server actions, or reviewing caching and rendering strategies.
---

# nextjs-app-router

Next.js 15 App Router patterns for this project.

## stack context

- Next.js 15 with Turbopack
- React 19
- TypeScript
- App Router (not Pages Router)
- Supabase for auth and data

## how to use

- `/nextjs-app-router`
  Apply these constraints to any Next.js work in this conversation.

- `/nextjs-app-router <file>`
  Review the file against these rules and report violations with concrete fixes.

## rule categories by priority

| priority | category | impact |
|----------|----------|--------|
| 1 | Server vs Client boundary | critical |
| 2 | Data fetching patterns | critical |
| 3 | Auth in server components | critical |
| 4 | Caching and revalidation | high |
| 5 | Metadata API | medium |
| 6 | Error and loading states | medium |
| 7 | Route handlers vs server actions | medium |
| 8 | React 19 patterns | low-medium |

## rules

### 1. Server vs Client boundary (critical)

- default to server components — add `'use client'` only when necessary
- `'use client'` is required for: `useState`, `useEffect`, `useContext`, event handlers, browser APIs
- `'use client'` is NOT required for: async data fetching, reading cookies, accessing Supabase
- push `'use client'` to leaf components — keep parent components on the server
- never put `'use client'` in a layout unless the entire layout needs interactivity

### 2. Data fetching patterns (critical)

- fetch data in server components by default — do not use `useEffect` + fetch for initial data
- use `async/await` directly in server components:
  ```tsx
  // correct — server component
  export default async function Page() {
    const data = await fetchData()
    return <Component data={data} />
  }
  ```
- client-side fetching is appropriate for: real-time data, user-triggered refreshes, optimistic updates
- fetch in parallel with `Promise.all` to avoid waterfalls

### 3. Auth in server components (critical)

- use `createSupabaseServerClient()` in server components and route handlers
- use `supabaseBrowser` only in client components
- always validate the session server-side for protected routes — never rely on client-side auth checks for access control
- pattern for protected server component:
  ```tsx
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')
  ```

### 4. Caching and revalidation (high)

- Next.js 15 defaults: fetch requests are NOT cached by default (changed from 13/14)
- to cache: use `{ cache: 'force-cache' }` or `{ next: { revalidate: N } }`
- after mutation: call `revalidatePath('/path')` or `revalidateTag('tag')` in server actions/route handlers
- do not mutate then immediately read without revalidating — stale data will be returned
- Supabase queries are NOT cached by Next.js (they use the Supabase client, not fetch directly)

### 5. Metadata API (medium)

- use the `metadata` export for static metadata:
  ```tsx
  export const metadata: Metadata = { title: '...', description: '...' }
  ```
- use `generateMetadata` for dynamic metadata (based on params or fetched data)
- do not use `<head>` tags directly in App Router — use the Metadata API
- set `openGraph` and `twitter` properties for public-facing pages (especially `/preview`)

### 6. Error and loading states (medium)

- use `error.tsx` for error boundaries at the route segment level
- use `loading.tsx` for streaming loading UI
- `error.tsx` must be a client component (`'use client'`)
- for component-level loading, use `<Suspense>` with a fallback
- do not show raw error messages to users in production

### 7. Route handlers vs server actions (medium)

- prefer **server actions** for form submissions and mutations triggered from the UI
- use **route handlers** (`route.ts`) for: webhooks, external API consumption, file uploads, non-browser clients
- Stripe webhook must remain a route handler (`/api/stripe/webhook`)
- do not use route handlers when a server action would suffice — it adds an extra HTTP round-trip

### 8. React 19 patterns (low-medium)

- `use(promise)` can unwrap a promise in a client component (replaces some useEffect patterns)
- server actions can be passed as props to client components
- `useFormStatus` and `useActionState` are available for form state management
- avoid mixing React 18 and React 19 patterns in the same component

## common anti-patterns

```tsx
// WRONG: useEffect for initial data in a component that could be a server component
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => { fetch('/api/data').then(r => r.json()).then(setData) }, [])
}

// CORRECT: server component with direct async fetch
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}

// WRONG: 'use client' on a layout that doesn't need it
'use client'
export default function Layout({ children }) { return <div>{children}</div> }

// CORRECT: server layout (no directive needed)
export default function Layout({ children }) { return <div>{children}</div> }
```

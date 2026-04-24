# iwrightcode

Personal portfolio site for Isaac Wright — [iwright.codes](https://iwright.codes).

Terminal-flavored, full-bleed layout built with Next.js 16 and Tailwind v4.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- React 19
- Tailwind CSS v4
- Framer Motion
- TypeScript

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Purpose                     |
| --------------- | --------------------------- |
| `npm run dev`   | Start the dev server        |
| `npm run build` | Production build            |
| `npm run start` | Serve the production build  |
| `npm run lint`  | Run ESLint                  |

## Layout conventions

Sections render edge-to-edge. Every `<section>`, `<nav>`, and `<footer>` uses the shared gutter: `px-6 md:px-10 lg:px-16`. Text blocks cap their own reading width inline (e.g. `style={{ maxWidth: 640 }}`) rather than wrapping content in a centered page column. See `AGENTS.md` for the full design note.

## Structure

```
app/          Next.js App Router entry — layout, page, not-found, API routes
components/   Section components (Hero, Work, About, Contact, …) and UI pieces
lib/          Shared utilities
public/       Static assets
```

## License

[MIT](./LICENSE) © Isaac Wright

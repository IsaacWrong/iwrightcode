<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Design standard: full-bleed

All page sections render edge-to-edge. Do **not** wrap section content in a centered `max-w-[NNNpx] mx-auto w-full` page column — that pattern is deprecated in this codebase.

- Use viewport-scaled gutter padding on every `<section>`, `<nav>`, and `<footer>`: `px-6 md:px-10 lg:px-16`.
- Structural containers (grids, card rows, terminal) fill the available width between gutters.
- Individual text blocks may still cap their own reading width with inline `style={{ maxWidth: 640 }}` (or similar) so paragraphs stay readable on wide screens — but apply that to the text element itself, not to a wrapping page column.
- Match padding between Nav, Hero, Work, About, Contact, and Footer so the left/right gutters line up vertically down the page.

const stack = [
  {
    label: "frontend",
    value: "next.js · typescript · tailwind · react",
  },
  {
    label: "backend",
    value: "node · supabase · postgres · inngest",
  },
  {
    label: "ai",
    value: "claude · vercel ai sdk · anthropic api · mcp",
  },
  {
    label: "tooling",
    value: "vercel · github · cursor · claude code",
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-[1100px] mx-auto w-full">
        <p className="font-mono text-[11px] text-muted">{"// about"}</p>
        <h2
          className="font-mono font-medium text-[28px] text-fg mt-2"
          style={{ lineHeight: 1.3 }}
        >
          about
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mt-10">
          <div
            className="md:col-span-3 font-sans text-[15px] text-fg space-y-6"
            style={{ lineHeight: 1.7 }}
          >
            <p>
              I&apos;m Isaac — a financial advisor by trade, now building at the
              intersection of finance and AI. Based in Lexington, KY, I spend my
              days writing code for the same industry I came up in. The perspective
              shapes the product.
            </p>
            <p>
              My focus is vertical SaaS for financial services, fintech tooling,
              and AI-native applications. Clients are independent agencies, small
              practices, and early-stage founders who need production code — not
              prototypes, not slideware. Domain fluency is part of the deliverable.
            </p>
            <p>
              I ship small, ship often. TypeScript everywhere. Heavy bias toward
              Claude-assisted development and agentic workflows. Available for
              contract work and fractional technical leadership.
            </p>
          </div>
          <aside
            className="md:col-span-2"
            style={{
              background: "#0F141B",
              border: "0.5px solid var(--border)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <p className="font-mono text-[11px] text-muted">{"// stack"}</p>
            <dl className="mt-6 space-y-5">
              {stack.map((row) => (
                <div key={row.label}>
                  <dt className="font-mono text-[12px] text-muted">
                    {row.label}
                  </dt>
                  <dd
                    className="font-mono text-[12px] text-fg mt-1"
                    style={{ marginLeft: 16 }}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

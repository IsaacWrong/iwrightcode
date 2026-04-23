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
    <section id="about" className="py-24 px-6 md:px-10 lg:px-16">
      <p className="font-mono text-[11px] text-muted">{"// about"}</p>
      <h2
        className="font-mono font-medium text-[28px] text-fg mt-2"
        style={{ lineHeight: 1.3 }}
      >
        who am i?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mt-10">
        <div
          className="md:col-span-3 font-sans text-[15px] text-fg space-y-6"
          style={{ lineHeight: 1.7, maxWidth: 680 }}
        >
          <p>
            I&apos;m Isaac — financial advisor by day, AI-driven developer by
            night. The two halves feed each other: every product I build is
            shaped by client calls earlier that afternoon, and every engagement
            is informed by the domain I live in.
          </p>
          <p>
            My focus is vertical SaaS for financial services, fintech tooling,
            and AI-native applications. Clients are independent agencies, small
            practices, and early-stage founders who need production code — not
            prototypes, not slideware. Domain fluency is part of the deliverable.
          </p>
          <p>
            Agentic development isn&apos;t a buzzword on my resume — it&apos;s
            the operating model. Claude Code, custom subagents, and MCP servers
            ship the bulk of production code while I architect, review, and
            decide. Lightning-fast implementations, TypeScript everywhere, and
            a shorter path from idea to production than a small team can usually
            manage. Available for contract work and fractional technical
            leadership.
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
    </section>
  );
}

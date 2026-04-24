import SectionHeading from "./SectionHeading";

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
      <SectionHeading caption="// about" title="A bit about me" />
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
            My focus is custom software that drives real revenue — for
            financial services firms, independent agencies, small practices,
            and early-stage founders. Clients come to me for production code,
            not prototypes or slideware. Domain fluency is part of the
            deliverable.
          </p>
          <p>
            AI isn&apos;t a checkbox on my resume — it&apos;s the operating
            model. Claude Code, custom subagents, and MCP servers ship the bulk
            of production code while I architect, review, and decide. The
            result: fast delivery, rock-solid code, and a shorter path from
            idea to revenue than a small team can usually manage. Available
            for contract work and fractional technical leadership.
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

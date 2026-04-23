import Terminal from "./Terminal";

export default function Hero() {
  return (
    <section
      id="top"
      className="flex flex-col justify-center py-24 px-6"
      style={{
        minHeight: "80vh",
        borderBottom: "1.5px solid var(--border)",
      }}
    >
      <div className="max-w-[1100px] mx-auto w-full">
        <p
          className="font-mono text-[11px] text-muted"
          style={{ letterSpacing: "0.5px" }}
        >
          {"// portfolio · v2026.1"}
        </p>
        <h1
          className="font-mono font-medium mt-6 text-[28px] md:text-[40px]"
          style={{
            letterSpacing: "-0.5px",
            lineHeight: 1.3,
            maxWidth: 600,
          }}
        >
          I build software that actually ships.
        </h1>
        <p
          className="font-sans text-[15px] text-muted mt-6"
          style={{ lineHeight: 1.6, maxWidth: 520 }}
        >
          Full-stack developer specializing in vertical SaaS, fintech, and
          AI-native applications. Lexington, KY.
        </p>
        <div className="mt-10">
          <Terminal />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-10">
          <a
            href="#contact"
            className="font-mono font-medium text-[13px] bg-fg text-bg hover:opacity-90 transition-opacity"
            style={{ padding: "10px 18px", borderRadius: 6 }}
          >
            ./start-project
          </a>
          <a
            href="#work"
            className="font-mono text-[13px] text-fg hover:bg-white/5 transition-colors"
            style={{
              padding: "10px 18px",
              borderRadius: 6,
              border: "0.5px solid var(--border)",
            }}
          >
            view work
          </a>
        </div>
      </div>
    </section>
  );
}

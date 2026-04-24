import Terminal from "./Terminal";
import SpotlightGrid from "./SpotlightGrid";
import CurrentlyLine from "./CurrentlyLine";
import PipeDiagram from "./PipeDiagram";
import { fetchActivity } from "@/lib/github";

export default async function Hero() {
  const activity = await fetchActivity(8);

  return (
    <section
      id="top"
      className="relative isolate flex flex-col justify-center pt-20 pb-24 md:pt-24 px-6 md:px-10 lg:px-16 overflow-hidden"
      style={{
        minHeight: "92vh",
        borderBottom: "1.5px solid var(--border)",
      }}
    >
      <SpotlightGrid />

      <p
        className="font-mono text-[11px] text-muted relative"
        style={{ letterSpacing: "0.5px" }}
      >
        {"// portfolio · v2026.1"}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mt-6 relative">
        <div className="lg:col-span-5 flex flex-col">
          <h1
            className="font-mono font-medium text-[28px] md:text-[36px] lg:text-[40px]"
            style={{
              letterSpacing: "-0.5px",
              lineHeight: 1.25,
              maxWidth: 520,
            }}
          >
            I build software that actually ships.
          </h1>
          <p
            className="font-sans text-[15px] text-muted mt-5"
            style={{ lineHeight: 1.6, maxWidth: 480 }}
          >
            Full-stack developer specializing in vertical SaaS, fintech, and
            AI-native applications.
          </p>

          <div className="mt-5">
            <CurrentlyLine />
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-8">
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

          <div className="mt-10 hidden md:block">
            <PipeDiagram />
          </div>
        </div>

        <div className="lg:col-span-7 w-full">
          <Terminal activity={activity} />
        </div>
      </div>
    </section>
  );
}

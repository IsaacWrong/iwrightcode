import { fetchActivity, relativeTime, type ActivityItem } from "@/lib/github";
import SectionHeading from "./SectionHeading";

function toneClass(tone: ActivityItem["tone"]): string {
  switch (tone) {
    case "push":
    case "create":
      return "text-[#7ee787]";
    case "merge":
      return "text-[#D2A8FF]";
    case "release":
    case "star":
      return "text-[#FEBC2E]";
    case "delete":
      return "text-[#FF7B72]";
    case "issue":
      return "text-[#79C0FF]";
    default:
      return "text-muted";
  }
}

export default async function Activity() {
  const items = await fetchActivity(8);
  const now = new Date();

  return (
    <section id="activity" className="py-24 px-6 md:px-10 lg:px-16">
      <SectionHeading
        caption="// activity"
        command="gh activity --user IsaacWrong"
      />
      <div className="mt-10">
        <div
          className="font-mono text-[12px] md:text-[13px] overflow-x-auto"
          style={{
            background: "#010409",
            border: "0.5px solid var(--border)",
            borderRadius: 12,
            padding: 22,
          }}
        >
          {items.length === 0 ? (
            <div className="text-muted">
              <span className="text-[#FF7B72] mr-2">!</span>
              github api unavailable — try again later.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="grid grid-cols-[3rem_1.25rem_1fr] gap-x-3 items-baseline"
                >
                  <span className="text-muted tabular-nums">
                    {relativeTime(it.when, now)}
                  </span>
                  <span className={`${toneClass(it.tone)} text-center select-none`}>
                    {it.prefix}
                  </span>
                  {it.href ? (
                    <a
                      href={it.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg hover:underline underline-offset-4 truncate"
                    >
                      {it.text}
                    </a>
                  ) : (
                    <span className="text-fg truncate">{it.text}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="text-muted mt-4 text-[11px] select-none">
            <span className="opacity-60">{"// "}</span>
            cached for 1h · public events only
          </p>
        </div>
      </div>
    </section>
  );
}

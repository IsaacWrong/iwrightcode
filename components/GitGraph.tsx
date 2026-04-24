type Entry = {
  hash: string;
  ref?: string;
  message: string;
  date: string;
};

const log: Entry[] = [
  {
    hash: "0a1b2c3",
    ref: "HEAD -> main, origin/main",
    message: "ship palm-commissions billing flow",
    date: "2026-04",
  },
  {
    hash: "9f8e7d6",
    message: "ship exitedge-ai marketing site + lead engine",
    date: "2026-03",
  },
  {
    hash: "4d5e6f7",
    message: "ship bookcheckr desktop (electron + claude)",
    date: "2026-02",
  },
  {
    hash: "c0ffee1",
    message: "ship autoform: docusign + make.com pipeline",
    date: "2026-01",
  },
  {
    hash: "deadbee",
    message: "go all-in on agentic dev (claude code + mcp)",
    date: "2025",
  },
  {
    hash: "feedfa2",
    ref: "tag: licensed",
    message: "earn financial advisor license",
    date: "2024",
  },
  {
    hash: "1nit1al",
    ref: "tag: origin",
    message: "git init iwrightcode",
    date: "2018",
  },
];

export default function GitGraph() {
  return (
    <div
      className="font-mono text-[12px] overflow-x-auto"
      role="img"
      aria-label="Career timeline rendered as a git log"
      style={{
        background: "#010409",
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p className="text-muted mb-3 select-none">
        $ git log --oneline --graph
      </p>
      <ul className="space-y-1.5">
        {log.map((e, i) => (
          <li key={e.hash} className="flex items-baseline gap-2">
            <span className="text-[#FEBC2E] select-none">*</span>
            <span className="text-[#FEBC2E]">{e.hash}</span>
            {e.ref ? (
              <span className="text-muted">
                (<span className="text-[#7ee787]">{e.ref}</span>)
              </span>
            ) : null}
            <span className="text-fg">{e.message}</span>
            <span className="text-muted ml-auto pl-4 hidden sm:inline">
              {e.date}
            </span>
            {i < log.length - 1 ? null : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

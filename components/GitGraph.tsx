type Entry = {
  hash: string;
  ref?: string;
  message: string;
  date: string;
  meta?: string;
};

const log: Entry[] = [
  {
    hash: "4ba1633",
    ref: "HEAD -> main",
    message: "ship iwrightcode portfolio (next.js 16)",
    date: "2026-04-23",
    meta: "this site",
  },
  {
    hash: "93472cf",
    message: "init bluegrass-home-services (lead pipeline)",
    date: "2026-04-22",
    meta: "65 commits",
  },
  {
    hash: "bc51582",
    message: "init autoform (docusign + make.com pipeline)",
    date: "2026-04-14",
    meta: "18 commits",
  },
  {
    hash: "7e0d8b7",
    message: "init exit-edge-ai marketing site",
    date: "2026-04-11",
    meta: "87 commits",
  },
  {
    hash: "85ba6dd",
    message: "init rectorfolio (ai social investing)",
    date: "2026-04-09",
    meta: "27 commits",
  },
  {
    hash: "6050663",
    message: "init bookcheckr desktop (electron + claude)",
    date: "2026-03-17",
    meta: "156 commits",
  },
  {
    hash: "2bc65ea",
    message: "init palm-commissions (next.js + supabase)",
    date: "2025-08-19",
    meta: "748 commits · still shipping",
  },
  {
    hash: "0000000",
    ref: "tag: origin",
    message: "iwrightcode — concept",
    date: "2015",
    meta: "the idea",
  },
];

export default function GitGraph() {
  return (
    <div
      className="font-mono text-[12px] overflow-x-auto"
      role="img"
      aria-label="Career timeline rendered as a git log of real first commits across projects"
      style={{
        background: "#010409",
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p className="text-muted mb-3 select-none">
        $ git log --oneline --graph --all
      </p>
      <ul className="space-y-1.5">
        {log.map((e) => (
          <li key={e.hash} className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[#FEBC2E] select-none">*</span>
            <span className="text-[#FEBC2E]">{e.hash}</span>
            {e.ref ? (
              <span className="text-muted">
                (<span className="text-[#7ee787]">{e.ref}</span>)
              </span>
            ) : null}
            <span className="text-fg">{e.message}</span>
            <span className="ml-auto pl-4 flex items-baseline gap-3">
              {e.meta ? (
                <span className="text-muted text-[11px] hidden sm:inline">
                  {e.meta}
                </span>
              ) : null}
              <span className="text-muted">{e.date}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

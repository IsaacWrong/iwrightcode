export type ActivityItem = {
  id: string;
  when: Date;
  prefix: string;
  tone: "push" | "merge" | "create" | "star" | "release" | "issue" | "delete" | "other";
  text: string;
  href?: string;
};

const GH_USER = "IsaacWrong";

type RawEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string; url: string };
  payload: Record<string, unknown>;
};

function token(): string | undefined {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

export async function fetchActivity(limit = 8): Promise<ActivityItem[]> {
  const t = token();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "iwrightcode-portfolio",
  };
  if (t) headers.Authorization = `Bearer ${t}`;

  let res: Response;
  try {
    res = await fetch(
      `https://api.github.com/users/${GH_USER}/events/public?per_page=30`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    );
  } catch {
    return [];
  }

  if (!res.ok) return [];

  let raw: RawEvent[];
  try {
    raw = (await res.json()) as RawEvent[];
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];

  const items: ActivityItem[] = [];
  for (const ev of raw) {
    const formatted = formatEvent(ev);
    if (formatted) items.push(formatted);
    if (items.length >= limit) break;
  }
  return items;
}

function formatEvent(ev: RawEvent): ActivityItem | null {
  const repo = ev.repo?.name ?? "?";
  const repoShort = repo.split("/").slice(-1)[0] ?? repo;
  const repoHref = `https://github.com/${repo}`;
  const when = new Date(ev.created_at);

  switch (ev.type) {
    case "PushEvent": {
      const commits = (ev.payload.commits as unknown[] | undefined)?.length ?? 0;
      const ref = String(ev.payload.ref ?? "").replace("refs/heads/", "");
      if (commits === 0) return null;
      const branch = ref ? `/${ref}` : "";
      return {
        id: ev.id,
        when,
        prefix: "↑",
        tone: "push",
        text: `pushed ${commits} commit${commits === 1 ? "" : "s"} to ${repoShort}${branch}`,
        href: repoHref,
      };
    }
    case "PullRequestEvent": {
      const action = String(ev.payload.action ?? "");
      const pr = ev.payload.pull_request as { number?: number; merged?: boolean; html_url?: string } | undefined;
      const num = pr?.number;
      let verb = action;
      let prefix = "·";
      let tone: ActivityItem["tone"] = "other";
      if (action === "opened") {
        verb = "opened";
        prefix = "+";
        tone = "create";
      } else if (action === "closed" && pr?.merged) {
        verb = "merged";
        prefix = "✓";
        tone = "merge";
      } else if (action === "closed") {
        verb = "closed";
        prefix = "·";
      } else if (action === "reopened") {
        verb = "reopened";
        prefix = "+";
      } else {
        return null;
      }
      return {
        id: ev.id,
        when,
        prefix,
        tone,
        text: `${verb} pull/${num} in ${repoShort}`,
        href: pr?.html_url ?? repoHref,
      };
    }
    case "IssuesEvent": {
      const action = String(ev.payload.action ?? "");
      const issue = ev.payload.issue as { number?: number; html_url?: string } | undefined;
      if (action !== "opened" && action !== "closed") return null;
      return {
        id: ev.id,
        when,
        prefix: action === "opened" ? "+" : "·",
        tone: "issue",
        text: `${action} issue/${issue?.number} in ${repoShort}`,
        href: issue?.html_url ?? repoHref,
      };
    }
    case "CreateEvent": {
      const refType = String(ev.payload.ref_type ?? "");
      const ref = String(ev.payload.ref ?? "");
      if (refType === "repository") {
        return {
          id: ev.id,
          when,
          prefix: "+",
          tone: "create",
          text: `created repo ${repoShort}`,
          href: repoHref,
        };
      }
      if (refType === "branch" || refType === "tag") {
        return {
          id: ev.id,
          when,
          prefix: "+",
          tone: "create",
          text: `created ${refType} ${ref} in ${repoShort}`,
          href: repoHref,
        };
      }
      return null;
    }
    case "DeleteEvent": {
      const refType = String(ev.payload.ref_type ?? "");
      const ref = String(ev.payload.ref ?? "");
      if (refType !== "branch" && refType !== "tag") return null;
      return {
        id: ev.id,
        when,
        prefix: "-",
        tone: "delete",
        text: `deleted ${refType} ${ref} in ${repoShort}`,
        href: repoHref,
      };
    }
    case "ReleaseEvent": {
      const action = String(ev.payload.action ?? "");
      if (action !== "published") return null;
      const release = ev.payload.release as { tag_name?: string; html_url?: string } | undefined;
      return {
        id: ev.id,
        when,
        prefix: "★",
        tone: "release",
        text: `released ${release?.tag_name ?? ""} of ${repoShort}`,
        href: release?.html_url ?? repoHref,
      };
    }
    case "WatchEvent": {
      // GitHub uses WatchEvent for stars (legacy naming).
      return {
        id: ev.id,
        when,
        prefix: "★",
        tone: "star",
        text: `starred ${repo}`,
        href: repoHref,
      };
    }
    case "ForkEvent": {
      return {
        id: ev.id,
        when,
        prefix: "⑂",
        tone: "create",
        text: `forked ${repo}`,
        href: repoHref,
      };
    }
    case "PullRequestReviewEvent": {
      const action = String(ev.payload.action ?? "");
      if (action !== "created") return null;
      const review = ev.payload.review as { state?: string; html_url?: string } | undefined;
      const pr = ev.payload.pull_request as { number?: number } | undefined;
      const state = review?.state ?? "reviewed";
      return {
        id: ev.id,
        when,
        prefix: "·",
        tone: "other",
        text: `${state} pull/${pr?.number} in ${repoShort}`,
        href: review?.html_url ?? repoHref,
      };
    }
    default:
      return null;
  }
}

export function relativeTime(d: Date, now: Date = new Date()): string {
  const diff = Math.max(0, now.getTime() - d.getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  const w = Math.floor(days / 7);
  if (w < 5) return `${w}w`;
  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo`;
  const y = Math.floor(days / 365);
  return `${y}y`;
}

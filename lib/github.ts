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

const FETCH_TIMEOUT_MS = 5000;

async function ghFetch(
  url: string,
  init: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<Response | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (err) {
    const reason =
      err instanceof Error && err.name === "AbortError" ? "timeout" : "network";
    console.warn(`[github] ${reason} on ${url}`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchActivity(limit = 8): Promise<ActivityItem[]> {
  const t = token();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "iwrightcode-portfolio",
  };
  if (t) headers.Authorization = `Bearer ${t}`;

  const url = `https://api.github.com/users/${GH_USER}/events/public?per_page=30`;
  const res = await ghFetch(url, { headers, next: { revalidate: 3600 } });
  if (!res) return [];

  if (!res.ok) {
    console.warn(`[github] fetchActivity status ${res.status}`);
    return [];
  }

  let raw: unknown;
  try {
    raw = await res.json();
  } catch (err) {
    console.warn("[github] fetchActivity JSON parse failed", err);
    return [];
  }
  if (!Array.isArray(raw)) {
    console.warn("[github] fetchActivity unexpected shape (not array)", raw);
    return [];
  }

  const items: ActivityItem[] = [];
  for (const ev of raw as RawEvent[]) {
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
  if (Number.isNaN(when.getTime())) return null;

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

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type Contributions = {
  weeks: ContributionDay[][];
  totalYear: number;
  total30: number;
  activeDays30: number;
  currentStreak: number;
};

const CONTRIB_LEVEL: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

type ContribGraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: Array<{
            contributionDays?: Array<{
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }>;
          }>;
        };
      };
    };
  };
};

export async function fetchContributions(): Promise<Contributions | null> {
  const t = token();
  if (!t) return null;

  const query = `
    query($user: String!) {
      user(login: $user) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const res = await ghFetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      "User-Agent": "iwrightcode-portfolio",
    },
    body: JSON.stringify({
      query,
      variables: { user: GH_USER },
    }),
    next: { revalidate: 3600 },
  });
  if (!res) return null;

  if (!res.ok) {
    console.warn(`[github] fetchContributions status ${res.status}`);
    return null;
  }

  let body: ContribGraphQLResponse;
  try {
    body = (await res.json()) as ContribGraphQLResponse;
  } catch (err) {
    console.warn("[github] fetchContributions JSON parse failed", err);
    return null;
  }

  const calendar = body.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return null;

  const rawWeeks = calendar.weeks ?? [];
  const weeks: ContributionDay[][] = rawWeeks.map((w) =>
    (w.contributionDays ?? []).map((d) => ({
      date: d.date,
      count: d.contributionCount ?? 0,
      level: CONTRIB_LEVEL[d.contributionLevel] ?? 0,
    }))
  );

  const flat = weeks.flat();
  const last30 = flat.slice(-30);
  const total30 = last30.reduce((s, d) => s + d.count, 0);
  const activeDays30 = last30.filter((d) => d.count > 0).length;

  let currentStreak = 0;
  let i = flat.length - 1;
  if (i >= 0 && flat[i].count === 0) i--;
  while (i >= 0 && flat[i].count > 0) {
    currentStreak++;
    i--;
  }

  return {
    weeks,
    totalYear: calendar.totalContributions ?? 0,
    total30,
    activeDays30,
    currentStreak,
  };
}

export function relativeTime(d: Date, now: Date = new Date()): string {
  const t = d.getTime();
  if (Number.isNaN(t)) return "?";
  const diff = Math.max(0, now.getTime() - t);
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

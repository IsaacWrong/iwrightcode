export type ActivityItem = {
  id: string;
  when: Date;
  prefix: string;
  tone: "push" | "merge" | "create" | "star" | "release" | "issue" | "delete" | "other";
  text: string;
  href?: string;
  isPrivate?: boolean;
};

const GH_USER = "IsaacWrong";

type RawEvent = {
  id: string;
  type: string;
  created_at: string;
  public?: boolean;
  repo: { name: string; url: string };
  payload: Record<string, unknown>;
};

function token(): string | undefined {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

const FETCH_TIMEOUT_MS = 10000;
const COMMIT_COUNT_TIMEOUT_MS = 3000;
const ACTIVITY_REVALIDATE_S = 600;
const COMMIT_COUNT_REVALIDATE_S = 86400;

async function ghFetch(
  url: string,
  init: RequestInit & { next?: { revalidate?: number }; timeoutMs?: number } = {}
): Promise<Response | null> {
  const { timeoutMs = FETCH_TIMEOUT_MS, ...rest } = init;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: ctrl.signal });
  } catch (err) {
    const reason =
      err instanceof Error && err.name === "AbortError" ? "timeout" : "network";
    console.warn(`[github] ${reason} on ${url}`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function ghHeaders(): Record<string, string> {
  const t = token();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "iwrightcode-portfolio",
  };
  if (t) headers.Authorization = `Bearer ${t}`;
  return headers;
}

export async function fetchActivity(
  limit = 8
): Promise<ActivityItem[] | null> {
  const url = `https://api.github.com/users/${GH_USER}/events?per_page=30`;
  const res = await ghFetch(url, {
    headers: ghHeaders(),
    next: { revalidate: ACTIVITY_REVALIDATE_S },
  });
  if (!res) return null;

  if (!res.ok) {
    console.warn(`[github] fetchActivity status ${res.status}`);
    return null;
  }

  let raw: unknown;
  try {
    raw = await res.json();
  } catch (err) {
    console.warn("[github] fetchActivity JSON parse failed", err);
    return null;
  }
  if (!Array.isArray(raw)) {
    console.warn("[github] fetchActivity unexpected shape (not array)", raw);
    return null;
  }

  const items: ActivityItem[] = [];
  for (const ev of raw as unknown[]) {
    if (typeof ev !== "object" || ev === null) {
      console.warn("[github] fetchActivity skipping non-object element", typeof ev);
      continue;
    }
    const evt = ev as RawEvent;
    if (evt.public !== true) {
      const redacted = redactPrivateEvent(evt);
      if (redacted) items.push(redacted);
    } else {
      const formatted = formatEvent(evt);
      if (formatted) items.push(formatted);
    }
    if (items.length >= limit) break;
  }
  return items;
}

const PRIVATE_TIMESTAMP_ROUND_MS = 60 * 60 * 1000;

function redactPrivateEvent(ev: RawEvent): ActivityItem | null {
  const raw = new Date(ev.created_at).getTime();
  if (Number.isNaN(raw)) return null;
  const when = new Date(Math.floor(raw / PRIVATE_TIMESTAMP_ROUND_MS) * PRIVATE_TIMESTAMP_ROUND_MS);
  const verb = privateVerbForType(ev.type);
  return {
    id: ev.id,
    when,
    prefix: "·",
    tone: "other",
    text: `${verb} in private repo`,
    isPrivate: true,
  };
}

function privateVerbForType(type: string): string {
  switch (type) {
    case "PushEvent":
      return "pushed commits";
    case "PullRequestEvent":
      return "worked on a PR";
    case "PullRequestReviewEvent":
      return "reviewed a PR";
    case "IssuesEvent":
      return "worked on an issue";
    case "ReleaseEvent":
      return "shipped a release";
    case "CreateEvent":
      return "created branch/tag";
    case "DeleteEvent":
      return "deleted branch/tag";
    default:
      return "committed";
  }
}

export async function fetchRepoCommitCount(
  owner: string,
  repo: string
): Promise<number | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
  const res = await ghFetch(url, {
    headers: ghHeaders(),
    next: { revalidate: COMMIT_COUNT_REVALIDATE_S },
    timeoutMs: COMMIT_COUNT_TIMEOUT_MS,
  });
  if (!res) return null;

  if (!res.ok) {
    console.warn(`[github] fetchRepoCommitCount ${owner}/${repo} status ${res.status}`);
    return null;
  }

  const link = res.headers.get("Link") ?? "";
  const lastMatch = link.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  if (lastMatch) {
    const n = Number.parseInt(lastMatch[1], 10);
    if (Number.isFinite(n) && n > 0) return n;
  }

  try {
    const body = await res.json();
    return Array.isArray(body) ? body.length : 0;
  } catch (err) {
    console.warn(`[github] fetchRepoCommitCount ${owner}/${repo} JSON parse failed`, err);
    return null;
  }
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
  activeDaysYear: number;
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
  errors?: Array<{ message?: string; type?: string }>;
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
    next: { revalidate: ACTIVITY_REVALIDATE_S },
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

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    console.warn(
      "[github] fetchContributions GraphQL errors",
      body.errors.map((e) => e.message ?? e.type ?? "unknown").slice(0, 5)
    );
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

  const activeDaysYear = weeks.flat().filter((d) => d.count > 0).length;

  return {
    weeks,
    totalYear: calendar.totalContributions ?? 0,
    activeDaysYear,
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

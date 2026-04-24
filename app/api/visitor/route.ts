import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTIFY_TO = "iwrightcode@gmail.com";
const FROM = "iwrightcode <noreply@iwrightcode.com>";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

// Persistent limiter — activates when UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN are set. On Vercel's serverless runtime
// the in-memory fallback below is best-effort only (each cold start
// gets a fresh Map) so Upstash is the real enforcement in prod.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const upstashLimiter =
  redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(RATE_MAX, "10 m"),
        prefix: "visitor",
        analytics: false,
      })
    : null;

const hits = new Map<string, number[]>();

function rateLimitedLocal(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

async function rateLimited(ip: string): Promise<boolean> {
  if (upstashLimiter) {
    try {
      const { success } = await upstashLimiter.limit(ip);
      return !success;
    } catch (err) {
      // Fail open: the local map would double-count across invocations
      // the Upstash call may have already recorded, and doesn't persist
      // across cold starts anyway.
      console.error("[visitor] upstash ratelimit failed, allowing request", err);
      return false;
    }
  }
  return rateLimitedLocal(ip);
}

function sanitize(v: string, max = 200): string {
  return v.replace(/[\x00-\x1f\x7f]/g, " ").slice(0, max);
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { ok: false, error: "unsupported media type" },
      { status: 415 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "?";

  if (await rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const email =
    typeof body === "object" && body && "email" in body
      ? String((body as { email: unknown }).email ?? "").trim()
      : "";

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid email" },
      { status: 400 }
    );
  }

  const safeIp = sanitize(ip, 64);
  const safeUa = sanitize(req.headers.get("user-agent") ?? "?", 256);
  const safeRef = sanitize(req.headers.get("referer") ?? "?", 256);

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to: [NOTIFY_TO],
          reply_to: email,
          subject: `new terminal session — ${email}`,
          text: [
            `email: ${email}`,
            `ip:    ${safeIp}`,
            `ref:   ${safeRef}`,
            `ua:    ${safeUa}`,
            `time:  ${new Date().toISOString()}`,
          ].join("\n"),
        }),
      });
      if (!res.ok) {
        console.error(`[visitor] resend status ${res.status}`);
      }
    } catch (err) {
      console.error("[visitor] resend failed", err);
    } finally {
      clearTimeout(timeout);
    }
  } else {
    console.log(`[visitor] ${email} (ip=${safeIp}) — no RESEND_API_KEY set`);
  }

  return NextResponse.json({ ok: true });
}

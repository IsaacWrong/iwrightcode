import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTIFY_TO = "iwrightcode@gmail.com";
const FROM = "iwrightcode <noreply@iwrightcode.com>";

export async function POST(req: Request) {
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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "?";
  const ua = req.headers.get("user-agent") ?? "?";
  const ref = req.headers.get("referer") ?? "?";

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
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
            `ip:    ${ip}`,
            `ref:   ${ref}`,
            `ua:    ${ua}`,
            `time:  ${new Date().toISOString()}`,
          ].join("\n"),
        }),
      });
    } catch (err) {
      console.error("[visitor] resend failed", err);
    }
  } else {
    console.log(`[visitor] ${email} (ip=${ip}) — no RESEND_API_KEY set`);
  }

  return NextResponse.json({ ok: true });
}

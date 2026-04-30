import { ImageResponse } from "next/og";

export const alt =
  "iwrightcode_ — Isaac Wright, full-stack developer building AI-driven software that ships";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const JETBRAINS_MONO_400 =
  "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf";
const JETBRAINS_MONO_500 =
  "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-500-normal.ttf";

async function loadFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [regular, medium] = await Promise.all([
    loadFont(JETBRAINS_MONO_400),
    loadFont(JETBRAINS_MONO_500),
  ]);

  const fonts =
    regular && medium
      ? [
          {
            name: "JetBrains Mono",
            data: regular,
            style: "normal" as const,
            weight: 400 as const,
          },
          {
            name: "JetBrains Mono",
            data: medium,
            style: "normal" as const,
            weight: 500 as const,
          },
        ]
      : undefined;

  const fontFamily = fonts ? "JetBrains Mono" : "monospace";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0D1117",
          color: "#E6EDF3",
          fontFamily,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#7D8590",
            fontSize: 22,
            letterSpacing: 0.5,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#7ee787",
            }}
          />
          <span>iwrightcode.com · open to work</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 30,
              color: "#7D8590",
              letterSpacing: 0.5,
            }}
          >
            {"// portfolio · v2026.1"}
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: -1,
              maxWidth: 980,
            }}
          >
            I build software that actually ships.
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#7D8590",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Using AI to drive revenue-multiplying outcomes for founders and
            small teams.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 28,
            borderTop: "1px solid #30363D",
            color: "#7D8590",
            fontSize: 22,
          }}
        >
          <span style={{ color: "#E6EDF3" }}>Isaac Wright</span>
          <span>next.js · typescript · claude · supabase</span>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

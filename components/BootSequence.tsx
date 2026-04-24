"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const subscribe = () => () => {};

const STORAGE_KEY = "iwc-booted";

const LINES: { text: string; ms: number; tone?: "ok" | "info" | "ready" }[] = [
  { text: "booting iwrightcode_…", ms: 90, tone: "info" },
  { text: "[ ok ] mounting components", ms: 120, tone: "ok" },
  { text: "[ ok ] hydrating routes", ms: 110, tone: "ok" },
  { text: "[ ok ] fetching context", ms: 110, tone: "ok" },
  { text: "[ ok ] establishing socket", ms: 110, tone: "ok" },
  { text: "ready.", ms: 180, tone: "ready" },
];

export default function BootSequence() {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const [active, setActive] = useState(false);
  const [shownCount, setShownCount] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    let shouldRun = false;
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        shouldRun = true;
      }
    } catch {
      /* ignore */
    }
    if (!shouldRun) return;
    const t = setTimeout(() => {
      if (!cancelled) setActive(true);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!active) return;
    if (shownCount >= LINES.length) {
      const t = setTimeout(() => setFading(true), 280);
      const t2 = setTimeout(() => setActive(false), 700);
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }
    const t = setTimeout(
      () => setShownCount((n) => n + 1),
      shownCount === 0 ? 60 : LINES[shownCount - 1].ms
    );
    return () => clearTimeout(t);
  }, [active, shownCount]);

  if (!mounted || !active || reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "var(--bg)", pointerEvents: fading ? "none" : "auto" }}
    >
      <div
        className="font-mono text-[13px] md:text-[14px] w-full max-w-[520px] px-6"
        style={{ lineHeight: 1.8 }}
      >
        {LINES.slice(0, shownCount).map((l, i) => {
          const tone =
            l.tone === "ok"
              ? "text-[#7ee787]"
              : l.tone === "ready"
                ? "text-fg"
                : "text-muted";
          return (
            <div key={i} className={tone}>
              {l.text}
            </div>
          );
        })}
        {shownCount < LINES.length ? (
          <div className="inline-flex items-center text-muted">
            <span className="mr-2">$</span>
            <span
              className="inline-block bg-fg animate-blink"
              style={{ width: 8, height: 14 }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

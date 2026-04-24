"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};

const CURRENT = "shipping vertical SaaS for RIAs";
const LOCATION = "lexington, ky";

function formatTime(d: Date) {
  const tz =
    Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "short",
    })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? "ET";
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .toLowerCase();
  return `${time} ${tz}`;
}

export default function CurrentlyLine() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const [time, setTime] = useState("--:-- et");

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="font-mono text-[12px] text-muted" style={{ lineHeight: 1.7 }}>
      <span className="opacity-60">{"// "}</span>
      currently: <span className="text-fg">{CURRENT}</span>
      <span className="opacity-60"> · </span>
      {LOCATION}
      <span className="opacity-60"> · </span>
      <span suppressHydrationWarning>{mounted ? time : "--:-- et"}</span>
    </p>
  );
}

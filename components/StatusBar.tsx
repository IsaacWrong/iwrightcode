"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};

function formatTime(d: Date) {
  const tz = Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName")?.value ?? "ET";
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${time} ${tz}`;
}

export default function StatusBar() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const [time, setTime] = useState<string>("--:-- ET");
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    update();
    const id = setInterval(update, 30_000);

    const on = () => setOnline(true);
    const off = () => setOnline(false);
    if (typeof navigator !== "undefined" && "onLine" in navigator) {
      on();
      if (!navigator.onLine) off();
    }
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    return () => {
      clearInterval(id);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div
      className="hidden md:flex items-center gap-3 font-mono text-[11px] text-muted select-none"
      aria-hidden="true"
    >
      <span className="flex items-center gap-1.5">
        <span className="text-fg">git:</span>
        <span>main</span>
      </span>
      <span className="opacity-40">·</span>
      <span>{mounted ? time : "--:-- ET"}</span>
      <span className="opacity-40">·</span>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block rounded-full"
          style={{
            width: 7,
            height: 7,
            background: mounted && !online ? "#FF5F57" : "#28C840",
            boxShadow: mounted && online ? "0 0 6px #28C84066" : "none",
          }}
        />
        <span>{mounted && !online ? "offline" : "online"}</span>
      </span>
    </div>
  );
}

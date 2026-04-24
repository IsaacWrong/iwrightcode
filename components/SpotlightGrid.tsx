"use client";

import { useEffect, useRef } from "react";

export default function SpotlightGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let pendingX = 50;
    let pendingY = 50;

    const apply = () => {
      raf = 0;
      node.style.setProperty("--mx", `${pendingX}%`);
      node.style.setProperty("--my", `${pendingY}%`);
    };

    const onMove = (e: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      pendingX = ((e.clientX - rect.left) / rect.width) * 100;
      pendingY = ((e.clientY - rect.top) / rect.height) * 100;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      pendingX = -50;
      pendingY = -50;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="spotlight-grid pointer-events-none absolute inset-0 -z-10"
    />
  );
}

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
    let listening = false;

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

    const attach = () => {
      if (listening) return;
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      listening = true;
    };
    const detach = () => {
      if (!listening) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      listening = false;
    };

    // Only listen while the spotlight's host is in the viewport — no
    // point tracking the pointer once the hero has scrolled away.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? attach() : detach()),
      { threshold: 0 }
    );
    io.observe(node);

    return () => {
      io.disconnect();
      detach();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <div className="spotlight-dots-base absolute inset-0" />
      <div ref={ref} className="spotlight-dots-lift absolute inset-0" />
    </div>
  );
}

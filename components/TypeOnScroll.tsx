"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  charMs?: number;
  startDelay?: number;
  showCursor?: boolean;
  threshold?: number;
};

export default function TypeOnScroll({
  text,
  className,
  charMs = 28,
  startDelay = 80,
  showCursor = true,
  threshold = 0.4,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const node = ref.current;
    if (!node) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const start = () => {
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          setDone(true);
          return;
        }
        timer = setTimeout(tick, charMs);
      };
      timer = setTimeout(tick, startDelay);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          obs.disconnect();
          start();
        }
      },
      { threshold }
    );
    obs.observe(node);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      obs.disconnect();
    };
  }, [text, charMs, startDelay, threshold, reduceMotion]);

  if (reduceMotion) {
    return (
      <span ref={ref} className={className}>
        {text}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{shown}</span>
      {showCursor && !done ? (
        <span
          className="inline-block bg-current animate-blink"
          style={{
            width: "0.55em",
            height: "1em",
            marginLeft: 2,
            verticalAlign: "-0.12em",
          }}
          aria-hidden="true"
        />
      ) : null}
      <span className="sr-only">{text}</span>
    </span>
  );
}

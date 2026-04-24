"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Line = {
  prompt: boolean;
  text: string;
  mutedOutput?: boolean;
  cursor?: boolean;
};

const SCRIPT: Line[] = [
  { prompt: true, text: "whoami" },
  { prompt: false, text: "isaac.wright — developer", mutedOutput: true },
  { prompt: true, text: "ls ./projects" },
  {
    prompt: false,
    text: "autoform/         bluegrass-home-services/   bookcheckr/",
    mutedOutput: false,
  },
  {
    prompt: false,
    text: "exit-edge-ai/     palm-commissions/          rectorfolio/",
    mutedOutput: false,
  },
  { prompt: true, text: "cat contact.txt" },
  { prompt: false, text: "let's build something →", mutedOutput: true },
  { prompt: true, text: "", cursor: true },
];

const CHAR_MS = 14;
const LINE_PAUSE_MS = 180;

export default function Terminal() {
  const reduceMotion = useReducedMotion();
  const [lineIdx, setLineIdx] = useState(reduceMotion ? SCRIPT.length : 0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    if (lineIdx >= SCRIPT.length) return;

    const line = SCRIPT[lineIdx];

    if (line.cursor) return;

    if (charIdx < line.text.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), CHAR_MS);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setCharIdx(0);
      setLineIdx((i) => i + 1);
    }, LINE_PAUSE_MS);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx, reduceMotion]);

  const renderLine = (line: Line, i: number, isTyping: boolean) => {
    const shown = isTyping ? line.text.slice(0, charIdx) : line.text;
    const key = `${i}-${line.text}`;

    const filledCursor = (
      <span
        className="inline-block bg-fg align-baseline ml-[1px]"
        style={{ width: 8, height: 15, verticalAlign: "-2px" }}
        aria-hidden="true"
      />
    );

    if (line.cursor) {
      return (
        <div key={key} className="flex items-center">
          <span className="text-fg mr-2">$</span>
          <span
            className="inline-block"
            style={{
              width: 8,
              height: 15,
              border: "1px solid var(--fg)",
            }}
            aria-hidden="true"
          />
        </div>
      );
    }

    if (line.prompt) {
      return (
        <div key={key}>
          <span className="text-fg mr-2">$</span>
          <span className="text-fg">{shown}</span>
          {isTyping ? filledCursor : null}
        </div>
      );
    }

    return (
      <div key={key} className={line.mutedOutput ? "text-muted" : "text-fg"}>
        {shown}
        {isTyping ? filledCursor : null}
      </div>
    );
  };

  const visible = reduceMotion ? SCRIPT : SCRIPT.slice(0, lineIdx + 1);

  return (
    <div
      className="w-full max-w-[720px] overflow-hidden"
      style={{
        background: "#010409",
        border: "0.5px solid var(--border)",
        borderRadius: 10,
      }}
      role="img"
      aria-label="Terminal showing: whoami returns isaac.wright — developer; ls ./projects lists autoform, bluegrass-home-services, bookcheckr, exit-edge-ai, palm-commissions, and rectorfolio; cat contact.txt says let's build something."
    >
      <div
        className="flex items-center py-[10px] px-[14px] bg-bg"
        style={{ borderBottom: "0.5px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-[6px]" aria-hidden="true">
          <span
            className="inline-block rounded-full"
            style={{ width: 11, height: 11, background: "#FF5F57" }}
          />
          <span
            className="inline-block rounded-full"
            style={{ width: 11, height: 11, background: "#FEBC2E" }}
          />
          <span
            className="inline-block rounded-full"
            style={{ width: 11, height: 11, background: "#28C840" }}
          />
        </div>
        <span className="flex-1 text-center font-mono text-[11px] text-muted">
          ~/iwrightcode — zsh
        </span>
        <span className="w-[42px]" aria-hidden="true" />
      </div>
      <div
        className="font-mono text-[14px]"
        style={{ padding: "22px 20px", lineHeight: 1.75 }}
      >
        {visible.map((line, i) => {
          const isTyping = !reduceMotion && i === lineIdx && !line.cursor;
          return renderLine(line, i, isTyping);
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

const EMAIL = "iwrightcode@gmail.com";

type Social = {
  label: string;
  handle: string;
  href: string;
};

const socials: Social[] = [
  { label: "github", handle: "IsaacWrong", href: "https://github.com/IsaacWrong" },
  {
    label: "linkedin",
    handle: "iwrightcode",
    href: "https://www.linkedin.com/company/iwrightcode",
  },
];

export default function ContactObject() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <p
          className="font-mono text-[11px] text-muted"
          style={{ letterSpacing: "0.5px" }}
        >
          {"// email"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center font-mono font-medium text-[13px] bg-fg text-bg hover:-translate-y-[1px] transition-transform duration-150"
            style={{ padding: "10px 18px", borderRadius: 6 }}
          >
            Email me
            <span className="ml-2">→</span>
          </a>
          <span className="font-mono text-[13px] text-muted select-all break-all">
            {EMAIL}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="font-mono text-[11px] text-muted hairline px-2 py-1 rounded hover:text-fg transition-colors"
            aria-label="Copy email address"
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p
          className="font-mono text-[11px] text-muted"
          style={{ letterSpacing: "0.5px" }}
        >
          {"// elsewhere"}
        </p>
        <ul className="flex flex-col">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-baseline gap-4 py-2 font-mono text-[14px] text-fg hover:text-fg transition-colors"
              >
                <span
                  className="text-muted inline-block"
                  style={{ width: 88 }}
                >
                  {s.label}
                </span>
                <span className="underline-offset-4 group-hover:underline">
                  {s.handle}
                </span>
                <span
                  className="text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px] text-muted">
        <span className="inline-flex items-center gap-2">
          <span
            className="relative inline-flex w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent-add)" }}
          >
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "var(--accent-add)", opacity: 0.5 }}
            />
          </span>
          open to work
        </span>
        <span>remote · ET</span>
      </div>
    </div>
  );
}

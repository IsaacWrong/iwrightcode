"use client";

import { useState } from "react";

const EMAIL = "iwrightcode@gmail.com";

type Field = {
  key: string;
  value: string;
  href?: string;
  copy?: boolean;
  external?: boolean;
};

const fields: Field[] = [
  { key: "email", value: EMAIL, href: `mailto:${EMAIL}`, copy: true },
  {
    key: "github",
    value: "IsaacWrong",
    href: "https://github.com/IsaacWrong",
    external: true,
  },
  {
    key: "linkedin",
    value: "iwrightcode",
    href: "https://www.linkedin.com/company/iwrightcode",
    external: true,
  },
  { key: "location", value: "remote · ET" },
  { key: "status", value: "open to work" },
];

export default function ContactObject() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied((c) => (c === value ? null : c)), 1400);
    } catch {
      /* noop */
    }
  };

  const maxKey = Math.max(...fields.map((f) => f.key.length));

  return (
    <pre
      className="font-mono text-[13px] md:text-[14px] overflow-x-auto"
      style={{
        background: "#010409",
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        padding: "20px 22px",
        lineHeight: 1.7,
      }}
    >
      <code>
        <span className="syntax-keyword">const</span>{" "}
        <span className="syntax-var">isaac</span>
        <span className="syntax-punct">: </span>
        <span className="syntax-type">Developer</span>
        <span className="syntax-punct"> = </span>
        <span className="syntax-punct">{"{"}</span>
        {"\n"}
        {fields.map((f) => {
          const padding = " ".repeat(maxKey - f.key.length);
          const valueNode = f.href ? (
            <a
              href={f.href}
              target={f.external ? "_blank" : undefined}
              rel={f.external ? "noopener noreferrer" : undefined}
              className="syntax-string underline-offset-2 hover:underline"
            >
              &quot;{f.value}&quot;
            </a>
          ) : (
            <span className="syntax-string">&quot;{f.value}&quot;</span>
          );

          return (
            <span key={f.key}>
              {"  "}
              <span className="syntax-key">{f.key}</span>
              <span className="syntax-punct">:{padding} </span>
              {valueNode}
              <span className="syntax-punct">,</span>
              {f.copy ? (
                <>
                  {"  "}
                  <button
                    type="button"
                    onClick={() => handleCopy(f.value)}
                    className="font-mono text-[10px] text-muted hairline px-1.5 py-0.5 rounded hover:text-fg align-middle"
                    aria-label={`Copy ${f.key}`}
                  >
                    {copied === f.value ? "copied" : "copy"}
                  </button>
                </>
              ) : null}
              {"\n"}
            </span>
          );
        })}
        <span className="syntax-punct">{"}"}</span>
        <span className="syntax-punct">;</span>
      </code>
    </pre>
  );
}

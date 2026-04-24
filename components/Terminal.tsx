"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import { projects } from "@/lib/projects";
import type { ActivityItem } from "@/lib/github";
import { relativeTime } from "@/lib/github";

type DemoLine = {
  prompt: boolean;
  text: string;
  mutedOutput?: boolean;
};

const DEMO: DemoLine[] = [
  { prompt: true, text: "whoami" },
  { prompt: false, text: "isaac.wright — developer", mutedOutput: true },
  { prompt: true, text: "ls ./projects" },
  {
    prompt: false,
    text: "autoform/         bluegrass-home-services/   bookcheckr/",
  },
  {
    prompt: false,
    text: "exit-edge-ai/     palm-commissions/          rectorfolio/",
  },
  { prompt: true, text: "cat contact.txt" },
  { prompt: false, text: "let's build something →", mutedOutput: true },
];

const CHAR_MS = 14;
const LINE_PAUSE_MS = 180;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = "demo" | "ready" | "auth" | "shell";

type ShellBlock =
  | { kind: "command"; user: string; text: string }
  | { kind: "output"; tone?: "muted" | "ok" | "warn" | "err"; lines: string[] }
  | { kind: "html"; node: React.ReactNode };

type Props = {
  activity?: ActivityItem[];
};

const SUBAGENTS = [
  "agents-orchestrator",
  "backend-architect",
  "code-reviewer",
  "debugger",
  "explore",
  "frontend-developer",
  "guardian",
  "plan",
  "reviewer",
  "tester",
  "tracking-measurement",
  "ux-architect",
  "ui-designer",
  "whimsy-injector",
  "zk-steward",
];

export default function Terminal({ activity = [] }: Props) {
  const reduceMotion = useReducedMotion();

  // demo state
  const [lineIdx, setLineIdx] = useState(reduceMotion ? DEMO.length : 0);
  const [charIdx, setCharIdx] = useState(0);

  // phase
  const [phase, setPhase] = useState<Phase>(
    reduceMotion ? "ready" : "demo"
  );
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState(0);
  const [userEmail, setUserEmail] = useState<string>("");

  // shell state
  const [blocks, setBlocks] = useState<ShellBlock[]>([]);
  const [shellInput, setShellInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const historyIdxRef = useRef<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // typing engine
  useEffect(() => {
    if (reduceMotion) return;
    if (phase !== "demo") return;
    if (lineIdx >= DEMO.length) {
      const t = setTimeout(() => setPhase("ready"), 220);
      return () => clearTimeout(t);
    }
    const line = DEMO[lineIdx];
    if (charIdx < line.text.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), CHAR_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setCharIdx(0);
      setLineIdx((i) => i + 1);
    }, LINE_PAUSE_MS);
    return () => clearTimeout(t);
  }, [phase, lineIdx, charIdx, reduceMotion]);

  // auth animation
  useEffect(() => {
    if (phase !== "auth") return;
    if (authStep >= 3) {
      const t = setTimeout(() => setPhase("shell"), 220);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setAuthStep((s) => s + 1), 320);
    return () => clearTimeout(t);
  }, [phase, authStep]);

  // focus input when needed
  useEffect(() => {
    if (phase === "ready" || phase === "shell") {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [phase, blocks.length]);

  // auto-scroll terminal to bottom on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [blocks, phase, authStep, lineIdx]);

  const submitEmail = useCallback(async () => {
    const email = emailInput.trim();
    if (!EMAIL_RE.test(email)) {
      setEmailError("invalid email — try again");
      return;
    }
    setEmailError(null);
    setUserEmail(email);
    setAuthStep(0);
    setPhase("auth");
    fetch("/api/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {
      /* swallow — UX continues regardless */
    });
  }, [emailInput]);

  const username = useMemo(() => {
    if (!userEmail) return "guest";
    const local = userEmail.split("@")[0] ?? "guest";
    return local.toLowerCase().slice(0, 16);
  }, [userEmail]);

  const promptPrefix = (
    <>
      <span className="text-[#7ee787]">{username}</span>
      <span className="text-muted">@iwrightcode</span>
      <span className="text-muted">:</span>
      <span className="text-[#79C0FF]">~</span>
      <span className="text-muted mr-2">$</span>
    </>
  );

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      const next: ShellBlock[] = [
        { kind: "command", user: username, text: cmd },
      ];
      if (cmd.length === 0) {
        setBlocks((b) => [...b, ...next]);
        return;
      }

      const [head, ...rest] = cmd.split(/\s+/);
      const arg = rest.join(" ");

      switch (head) {
        case "help": {
          next.push({
            kind: "output",
            lines: [
              "available commands:",
              "  help                this list",
              "  whoami              who you're talking to",
              "  ls [projects]       list projects",
              "  cat <file>          about | contact | stack",
              "  stack               tools i actually use",
              "  git log [-N]        recent github activity",
              "  agents              installed claude code subagents",
              "  date                server time",
              "  pwd                 you are here",
              "  echo <text>         echo back",
              "  coffee              ☕",
              "  sudo hire-me        what it sounds like",
              "  clear               clear the screen",
              "  exit                end session",
            ],
          });
          break;
        }
        case "whoami":
          next.push({
            kind: "output",
            tone: "muted",
            lines: ["isaac.wright — full-stack developer · fintech · ai-native"],
          });
          break;
        case "ls": {
          if (!arg || arg === "projects" || arg === "./projects") {
            const cols = projects.map((p) => `${p.slug}/`);
            next.push({ kind: "output", lines: chunkRows(cols, 3) });
          } else {
            next.push({
              kind: "output",
              tone: "err",
              lines: [`ls: ${arg}: no such directory`],
            });
          }
          break;
        }
        case "cat": {
          const target = arg.replace(/\.\w+$/, "").toLowerCase();
          if (target === "about" || target === "") {
            next.push({
              kind: "output",
              lines: [
                "isaac wright — financial advisor by day, ai-driven dev by night.",
                "vertical saas for fintech, internal tooling, agentic systems.",
                "claude code + custom subagents ship the bulk of production code.",
              ],
            });
          } else if (target === "contact") {
            next.push({
              kind: "output",
              lines: [
                "email:    iwrightcode@gmail.com",
                "github:   IsaacWrong",
                "linkedin: iwrightcode",
                "status:   open to work",
              ],
            });
          } else if (target === "stack") {
            next.push({
              kind: "output",
              lines: stackLines(),
            });
          } else {
            next.push({
              kind: "output",
              tone: "err",
              lines: [`cat: ${arg}: no such file`],
            });
          }
          break;
        }
        case "stack":
          next.push({ kind: "output", lines: stackLines() });
          break;
        case "contact":
          next.push({
            kind: "output",
            lines: [
              "email:    iwrightcode@gmail.com",
              "github:   IsaacWrong",
              "linkedin: iwrightcode",
            ],
          });
          break;
        case "git": {
          if (rest[0] === "log") {
            const limitArg = rest.find((r) => /^-\d+$/.test(r));
            const limit = limitArg ? parseInt(limitArg.slice(1), 10) : 5;
            const items = activity.slice(0, Math.max(1, Math.min(20, limit)));
            if (items.length === 0) {
              next.push({
                kind: "output",
                tone: "warn",
                lines: ["no public events available."],
              });
            } else {
              const now = new Date();
              next.push({
                kind: "output",
                lines: items.map(
                  (it) =>
                    `${relativeTime(it.when, now).padEnd(4)} ${it.prefix} ${it.text}`
                ),
              });
            }
          } else {
            next.push({
              kind: "output",
              tone: "err",
              lines: [`git: '${rest.join(" ")}' is not a known command`],
            });
          }
          break;
        }
        case "agents":
          next.push({
            kind: "output",
            lines: [
              `${SUBAGENTS.length}+ installed · sample:`,
              ...chunkRows(SUBAGENTS, 3),
            ],
          });
          break;
        case "date":
          next.push({
            kind: "output",
            tone: "muted",
            lines: [new Date().toString()],
          });
          break;
        case "pwd":
          next.push({
            kind: "output",
            tone: "muted",
            lines: ["/home/" + username + "/iwrightcode"],
          });
          break;
        case "echo":
          next.push({ kind: "output", lines: [arg] });
          break;
        case "coffee":
          next.push({
            kind: "output",
            tone: "muted",
            lines: ["☕  brewing… (1 cup, black, 4am)"],
          });
          break;
        case "sudo": {
          if (rest.join(" ") === "hire-me") {
            next.push({
              kind: "html",
              node: (
                <span>
                  <span className="text-[#7ee787]">access granted.</span>{" "}
                  <a
                    href="mailto:iwrightcode@gmail.com?subject=let%27s%20build%20something"
                    className="text-fg underline underline-offset-4 hover:opacity-80"
                  >
                    opening mail.app →
                  </a>
                </span>
              ),
            });
          } else {
            next.push({
              kind: "output",
              tone: "err",
              lines: [`sudo: ${rest.join(" ") || "<empty>"}: command not found`],
            });
          }
          break;
        }
        case "clear":
          setBlocks([]);
          return;
        case "exit":
        case "logout":
          next.push({
            kind: "output",
            tone: "muted",
            lines: ["session closed. logging out…"],
          });
          setBlocks((b) => [...b, ...next]);
          setTimeout(() => {
            setBlocks([]);
            setUserEmail("");
            setEmailInput("");
            setPhase("ready");
          }, 600);
          return;
        case "vim":
        case "nano":
        case "emacs":
          next.push({
            kind: "output",
            tone: "warn",
            lines: ["really? in a webpage terminal?"],
          });
          break;
        case "rm":
          next.push({
            kind: "output",
            tone: "err",
            lines: ["rm: nice try."],
          });
          break;
        default:
          next.push({
            kind: "output",
            tone: "err",
            lines: [
              `${head}: command not found — try \`help\``,
            ],
          });
      }
      setBlocks((b) => [...b, ...next]);
    },
    [activity, username]
  );

  const onShellKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = shellInput;
      setShellInput("");
      if (value.trim().length > 0) {
        setHistory((h) => [...h, value]);
      }
      historyIdxRef.current = -1;
      runCommand(value);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next =
        historyIdxRef.current < 0
          ? history.length - 1
          : Math.max(0, historyIdxRef.current - 1);
      historyIdxRef.current = next;
      setShellInput(history[next] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIdxRef.current + 1;
      if (next >= history.length) {
        historyIdxRef.current = -1;
        setShellInput("");
      } else {
        historyIdxRef.current = next;
        setShellInput(history[next] ?? "");
      }
      return;
    }
    if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setBlocks([]);
    }
  };

  const onEmailKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitEmail();
    }
  };

  const renderDemoLine = (line: DemoLine, i: number, isTyping: boolean) => {
    const shown = isTyping ? line.text.slice(0, charIdx) : line.text;
    const filledCursor = (
      <span
        className="inline-block bg-fg align-baseline ml-[1px]"
        style={{ width: 8, height: 15, verticalAlign: "-2px" }}
        aria-hidden="true"
      />
    );
    if (line.prompt) {
      return (
        <div key={i}>
          <span className="text-fg mr-2">$</span>
          <span className="text-fg">{shown}</span>
          {isTyping ? filledCursor : null}
        </div>
      );
    }
    return (
      <div key={i} className={line.mutedOutput ? "text-muted" : "text-fg"}>
        {shown}
        {isTyping ? filledCursor : null}
      </div>
    );
  };

  const demoVisible = reduceMotion
    ? DEMO
    : DEMO.slice(0, Math.min(lineIdx + 1, DEMO.length));

  return (
    <div
      className="w-full overflow-hidden flex flex-col h-[440px] md:h-[500px] lg:h-[560px]"
      style={{
        background: "#010409",
        border: "0.5px solid var(--border)",
        borderRadius: 10,
      }}
      onClick={() => {
        if (phase === "ready" || phase === "shell") {
          inputRef.current?.focus({ preventScroll: true });
        }
      }}
    >
      <div
        className="flex items-center py-[10px] px-[14px] bg-bg shrink-0"
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
          {phase === "shell"
            ? `${username}@iwrightcode — zsh`
            : "~/iwrightcode — zsh"}
        </span>
        <span className="w-[42px]" aria-hidden="true" />
      </div>

      <div
        ref={scrollRef}
        className="font-mono text-[13px] md:text-[14px] flex-1 overflow-y-auto"
        style={{ padding: "20px 20px", lineHeight: 1.75 }}
      >
        {/* demo preamble (always visible once demo is past it) */}
        {demoVisible.map((l, i) =>
          renderDemoLine(l, i, !reduceMotion && i === lineIdx && phase === "demo")
        )}

        {/* email gate */}
        {phase === "ready" || phase === "auth" ? (
          <div className="mt-3">
            <div className="text-muted">
              {"// session ended. log in to continue."}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitEmail();
              }}
              className="flex items-center mt-1"
            >
              <span className="text-fg mr-2">$</span>
              <span className="text-fg mr-1">login</span>
              <span className="text-muted mr-2">--email</span>
              <input
                ref={phase === "ready" ? inputRef : undefined}
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailError(null);
                }}
                onKeyDown={onEmailKey}
                disabled={phase === "auth"}
                spellCheck={false}
                autoComplete="email"
                inputMode="email"
                placeholder="you@domain.com"
                aria-label="email"
                className="flex-1 min-w-0 bg-transparent outline-none text-fg placeholder:text-muted/60 caret-transparent font-mono"
              />
            </form>
            {emailError ? (
              <div className="text-[#FF7B72] mt-1">{emailError}</div>
            ) : null}
          </div>
        ) : null}

        {phase === "auth" ? (
          <div className="mt-2">
            {authStep >= 1 ? (
              <div className="text-muted">authenticating…</div>
            ) : null}
            {authStep >= 2 ? (
              <div className="text-muted">verifying domain…</div>
            ) : null}
            {authStep >= 3 ? (
              <div className="text-[#7ee787]">
                ✓ welcome, {username}. type `help` to begin.
              </div>
            ) : null}
          </div>
        ) : null}

        {/* shell history */}
        {phase === "shell" ? (
          <>
            {blocks.map((b, i) => (
              <ShellRow key={i} block={b} />
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const value = shellInput;
                setShellInput("");
                if (value.trim().length > 0) setHistory((h) => [...h, value]);
                historyIdxRef.current = -1;
                runCommand(value);
              }}
              className="flex items-center"
            >
              {promptPrefix}
              <input
                ref={inputRef}
                value={shellInput}
                onChange={(e) => setShellInput(e.target.value)}
                onKeyDown={onShellKey}
                spellCheck={false}
                autoComplete="off"
                aria-label="shell"
                className="flex-1 min-w-0 bg-transparent outline-none text-fg caret-fg font-mono"
              />
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ShellRow({ block }: { block: ShellBlock }) {
  if (block.kind === "command") {
    return (
      <div>
        <span className="text-[#7ee787]">{block.user}</span>
        <span className="text-muted">@iwrightcode</span>
        <span className="text-muted">:</span>
        <span className="text-[#79C0FF]">~</span>
        <span className="text-muted mr-2">$</span>
        <span className="text-fg">{block.text}</span>
      </div>
    );
  }
  if (block.kind === "html") {
    return <div>{block.node}</div>;
  }
  const tone =
    block.tone === "muted"
      ? "text-muted"
      : block.tone === "ok"
        ? "text-[#7ee787]"
        : block.tone === "warn"
          ? "text-[#FEBC2E]"
          : block.tone === "err"
            ? "text-[#FF7B72]"
            : "text-fg";
  return (
    <div className={tone}>
      {block.lines.map((l, i) => (
        <div key={i}>{l.length === 0 ? " " : l}</div>
      ))}
    </div>
  );
}

function chunkRows(items: string[], perRow: number): string[] {
  if (items.length === 0) return [];
  const colW = Math.max(...items.map((s) => s.length)) + 2;
  const rows: string[] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(
      items
        .slice(i, i + perRow)
        .map((s) => s.padEnd(colW))
        .join("")
        .trimEnd()
    );
  }
  return rows;
}

function stackLines(): string[] {
  return [
    "frontend:  next.js · typescript · tailwind · react",
    "backend:   node · supabase · postgres · inngest",
    "ai:        claude · vercel ai sdk · anthropic api · mcp",
    "tooling:   vercel · github · cursor · claude code",
  ];
}

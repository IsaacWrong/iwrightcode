"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/lib/projects";

type Action = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  keywords?: string;
  run: () => void;
};

const EMAIL = "iwrightcode@gmail.com";
const GH = "https://github.com/IsaacWrong";
const LI = "https://www.linkedin.com/company/iwrightcode";

function jump(hash: string) {
  if (typeof window === "undefined") return;
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  } else {
    window.location.hash = hash;
  }
}

function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (t.isContentEditable) return true;
  return false;
}

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "⌘ K", label: "open command palette" },
  { keys: "/", label: "open command palette" },
  { keys: "g h", label: "go to top" },
  { keys: "g w", label: "go to work" },
  { keys: "g a", label: "go to about" },
  { keys: "g c", label: "go to contact" },
  { keys: "?", label: "show this cheatsheet" },
  { keys: "esc", label: "close any overlay" },
];

export default function CommandLayer() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 1600);
  }, []);

  const closeAll = useCallback(() => {
    setPaletteOpen(false);
    setShortcutsOpen(false);
  }, []);

  const actions: Action[] = useMemo(() => {
    const a: Action[] = [
      {
        id: "go-top",
        label: "go to top",
        hint: "g h",
        group: "navigate",
        keywords: "home hero",
        run: () => jump("#top"),
      },
      {
        id: "go-work",
        label: "go to work",
        hint: "g w",
        group: "navigate",
        keywords: "projects portfolio",
        run: () => jump("#work"),
      },
      {
        id: "go-about",
        label: "go to about",
        hint: "g a",
        group: "navigate",
        keywords: "bio who",
        run: () => jump("#about"),
      },
      {
        id: "go-contact",
        label: "go to contact",
        hint: "g c",
        group: "navigate",
        keywords: "email reach hire",
        run: () => jump("#contact"),
      },
      {
        id: "copy-email",
        label: `copy email — ${EMAIL}`,
        group: "actions",
        keywords: "mail clipboard",
        run: async () => {
          try {
            await navigator.clipboard.writeText(EMAIL);
            showToast("email copied to clipboard");
          } catch {
            window.location.href = `mailto:${EMAIL}`;
          }
        },
      },
      {
        id: "mailto",
        label: "compose email",
        group: "actions",
        keywords: "mail send",
        run: () => {
          window.location.href = `mailto:${EMAIL}`;
        },
      },
      {
        id: "open-github",
        label: "open github · IsaacWrong",
        group: "actions",
        run: () => window.open(GH, "_blank", "noopener,noreferrer"),
      },
      {
        id: "open-linkedin",
        label: "open linkedin · iwrightcode",
        group: "actions",
        run: () => window.open(LI, "_blank", "noopener,noreferrer"),
      },
      {
        id: "show-shortcuts",
        label: "show keyboard shortcuts",
        hint: "?",
        group: "actions",
        keywords: "keys help cheatsheet",
        run: () => {
          setShortcutsOpen(true);
        },
      },
    ];

    for (const p of projects) {
      a.push({
        id: `project-${p.slug}`,
        label: `${p.href ? "open" : "view"} ${p.name}`,
        hint: p.href ? "↗" : `[${p.status}]`,
        group: "projects",
        keywords: `${p.slug} ${p.stack.join(" ")}`,
        run: () => {
          if (p.href) {
            const ext = /^https?:\/\//.test(p.href);
            if (ext) window.open(p.href, "_blank", "noopener,noreferrer");
            else window.location.href = p.href;
          } else {
            jump("#work");
          }
        },
      });
    }
    return a;
  }, [showToast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) =>
      `${a.label} ${a.group} ${a.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [actions, query]);

  // Adjust derived state during render (React docs pattern) so we don't
  // call setState synchronously inside an effect.
  const [lastReset, setLastReset] = useState({ query, open: paletteOpen });
  if (lastReset.query !== query || lastReset.open !== paletteOpen) {
    const closing = lastReset.open && !paletteOpen;
    const nextQuery = closing ? "" : query;
    setLastReset({ query: nextQuery, open: paletteOpen });
    setActive(0);
    if (closing) setQuery("");
  }

  useEffect(() => {
    if (paletteOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [paletteOpen]);

  // global key handler
  useEffect(() => {
    let goPending = false;
    let goTimer: ReturnType<typeof setTimeout> | undefined;

    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShortcutsOpen(false);
        setPaletteOpen((v) => !v);
        return;
      }

      if (e.key === "Escape") {
        if (paletteOpen || shortcutsOpen) {
          e.preventDefault();
          closeAll();
        }
        return;
      }

      if (paletteOpen || shortcutsOpen) return;
      if (isTypingTarget(e.target)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === "/") {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (goPending) {
        goPending = false;
        if (goTimer) clearTimeout(goTimer);
        const map: Record<string, string> = {
          h: "#top",
          t: "#top",
          w: "#work",
          a: "#about",
          c: "#contact",
        };
        const target = map[e.key.toLowerCase()];
        if (target) {
          e.preventDefault();
          jump(target);
        }
        return;
      }

      if (e.key.toLowerCase() === "g") {
        goPending = true;
        goTimer = setTimeout(() => {
          goPending = false;
        }, 900);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (goTimer) clearTimeout(goTimer);
    };
  }, [paletteOpen, shortcutsOpen, closeAll]);

  // lock body scroll when overlays open
  useEffect(() => {
    if (paletteOpen || shortcutsOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [paletteOpen, shortcutsOpen]);

  const onPaletteKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[active];
      if (item) {
        item.run();
        if (item.id !== "show-shortcuts") setPaletteOpen(false);
      }
    }
  };

  // group filtered items in display order
  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Action[]>();
    for (const a of filtered) {
      if (!map.has(a.group)) {
        map.set(a.group, []);
        order.push(a.group);
      }
      map.get(a.group)!.push(a);
    }
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [filtered]);

  return (
    <>
      {paletteOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh] px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPaletteOpen(false);
          }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <div
            className="relative w-full max-w-[560px] overflow-hidden"
            style={{
              background: "#010409",
              border: "0.5px solid var(--border)",
              borderRadius: 12,
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="flex items-center gap-2 px-4"
              style={{ borderBottom: "0.5px solid var(--border-subtle)" }}
            >
              <span className="font-mono text-[13px] text-muted select-none">
                ❯
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onPaletteKey}
                placeholder="type a command…"
                spellCheck={false}
                autoComplete="off"
                className="flex-1 bg-transparent outline-none font-mono text-[14px] text-fg placeholder:text-muted"
                style={{ padding: "14px 0" }}
              />
              <span className="font-mono text-[10px] text-muted hairline px-1.5 py-0.5 rounded">
                esc
              </span>
            </div>
            <ul
              className="max-h-[55vh] overflow-y-auto py-2"
              role="listbox"
              aria-label="Commands"
            >
              {grouped.length === 0 ? (
                <li className="px-4 py-3 font-mono text-[13px] text-muted">
                  no matches.
                </li>
              ) : (
                grouped.map(({ group, items }) => (
                  <li key={group}>
                    <p className="px-4 pt-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-muted/70">
                      {group}
                    </p>
                    <ul>
                      {items.map((item) => {
                        const idx = filtered.indexOf(item);
                        const isActive = idx === active;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              onMouseEnter={() => setActive(idx)}
                              onClick={() => {
                                item.run();
                                if (item.id !== "show-shortcuts")
                                  setPaletteOpen(false);
                              }}
                              className={`w-full text-left flex items-center justify-between px-4 py-2 font-mono text-[13px] ${
                                isActive
                                  ? "bg-white/[0.06] text-fg"
                                  : "text-fg/90"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`select-none ${
                                    isActive ? "text-fg" : "text-muted"
                                  }`}
                                >
                                  {isActive ? "›" : " "}
                                </span>
                                <span>{item.label}</span>
                              </span>
                              {item.hint ? (
                                <span className="font-mono text-[11px] text-muted">
                                  {item.hint}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))
              )}
            </ul>
            <div
              className="flex items-center justify-between px-4 py-2 font-mono text-[10px] text-muted"
              style={{ borderTop: "0.5px solid var(--border-subtle)" }}
            >
              <span>↑ ↓ navigate · ↵ run</span>
              <span>{filtered.length} match{filtered.length === 1 ? "" : "es"}</span>
            </div>
          </div>
        </div>
      ) : null}

      {shortcutsOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShortcutsOpen(false);
          }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <div
            className="relative w-full max-w-[420px]"
            style={{
              background: "#010409",
              border: "0.5px solid var(--border)",
              borderRadius: 12,
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "0.5px solid var(--border-subtle)" }}
            >
              <span className="font-mono text-[12px] text-muted">
                {"// keyboard shortcuts"}
              </span>
              <button
                type="button"
                onClick={() => setShortcutsOpen(false)}
                className="font-mono text-[10px] text-muted hairline px-1.5 py-0.5 rounded hover:text-fg"
                aria-label="Close"
              >
                esc
              </button>
            </div>
            <ul className="px-4 py-3 space-y-2">
              {SHORTCUTS.map((s) => (
                <li
                  key={s.keys + s.label}
                  className="flex items-center justify-between font-mono text-[13px]"
                >
                  <span className="text-fg">{s.label}</span>
                  <kbd
                    className="font-mono text-[11px] text-muted hairline px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    {s.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed z-[110] bottom-6 left-1/2 -translate-x-1/2 font-mono text-[12px] text-fg hairline px-3 py-1.5 rounded"
          style={{ background: "#010409" }}
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}

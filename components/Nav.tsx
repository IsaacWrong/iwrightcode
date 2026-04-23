import Link from "next/link";
import Wordmark from "./Wordmark";

const links = [
  { href: "#work", label: "work" },
  { href: "#about", label: "about" },
  { href: "#contact", label: "contact" },
];

export default function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 w-full backdrop-blur-md bg-bg/80"
      style={{ borderBottom: "0.5px solid var(--border-subtle)" }}
    >
      <div className="flex items-center justify-between py-4 px-6">
        <Link href="#top" className="text-[14px] hover:opacity-80 transition-opacity">
          <Wordmark blink />
        </Link>
        <ul className="flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-mono text-[13px] text-muted hover:text-fg transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

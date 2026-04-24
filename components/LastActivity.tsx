import { relativeTime, type ActivityItem } from "@/lib/github";

export default function LastActivity({ items }: { items: ActivityItem[] }) {
  const latest = items[0];
  if (!latest) return null;
  const when = relativeTime(latest.when);
  const inner = (
    <p
      className="font-mono text-[12px] text-muted"
      style={{ lineHeight: 1.6 }}
    >
      <span className="opacity-60">{"// "}</span>
      last push:{" "}
      <span className="text-fg">{when}</span>
      <span className="opacity-60"> · </span>
      <span className="text-fg">{latest.text}</span>
    </p>
  );
  if (latest.href) {
    return (
      <a
        href={latest.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block hover:opacity-80 transition-opacity"
        aria-label={`Latest activity: ${latest.text}`}
      >
        {inner}
      </a>
    );
  }
  return inner;
}

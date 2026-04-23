export default function Footer() {
  return (
    <footer
      className="mt-auto w-full"
      style={{ borderTop: "0.5px solid var(--border-subtle)" }}
    >
      <div className="flex items-center justify-between py-8 px-6">
        <span className="font-mono text-[11px] text-muted">
          © 2026 iwrightcode_
        </span>
        <span className="font-mono text-[11px] text-muted">
          {"// built with claude code"}
        </span>
      </div>
    </footer>
  );
}

type IconProps = { size?: number };

function TwitterIcon({ size = 14 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ size = 14 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 14 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const socials = [
  {
    label: "@iwrightcode",
    href: "https://x.com/iwrightcode",
    Icon: TwitterIcon,
  },
  {
    label: "github.com/iwrightcode",
    href: "https://github.com/iwrightcode",
    Icon: GithubIcon,
  },
  {
    label: "linkedin.com/in/iwrightcode",
    href: "https://linkedin.com/in/iwrightcode",
    Icon: LinkedinIcon,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-[560px] mx-auto w-full">
        <p className="font-mono text-[11px] text-muted">
          {"// get in touch"}
        </p>
        <h2
          className="font-mono font-medium text-[32px] text-fg mt-2"
          style={{ lineHeight: 1.3, letterSpacing: "-0.5px" }}
        >
          let&apos;s build something.
        </h2>
        <p
          className="font-sans text-[15px] text-muted mt-4"
          style={{ lineHeight: 1.6, maxWidth: 480 }}
        >
          Open to full-stack contracts, fintech projects, and AI-native builds.
          Lexington, KY — remote friendly.
        </p>
        <div className="mt-8">
          <a
            href="mailto:isaac@iwrightcode.com"
            className="inline-block font-mono font-medium text-[13px] bg-fg text-bg hover:opacity-90 transition-opacity"
            style={{ padding: "10px 18px", borderRadius: 6 }}
          >
            isaac@iwrightcode.com
          </a>
        </div>
        <ul className="flex flex-wrap gap-6 mt-8">
          {socials.map(({ label, href, Icon }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[12px] text-muted hover:text-fg transition-colors"
              >
                <Icon size={14} />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

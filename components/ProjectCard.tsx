import Link from "next/link";
import type { Project } from "@/lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  const inner = (
    <article
      className="project-card bg-bg"
      style={{ borderRadius: 12, padding: 24 }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted">
          [{project.status}]
          {!project.href ? (
            <span className="ml-2 text-muted">· private</span>
          ) : null}
        </span>
        <span className="font-mono text-[11px] text-muted">
          ./{project.slug}
        </span>
      </div>
      <h3
        className="font-mono font-medium text-[20px] text-fg mt-4"
        style={{ lineHeight: 1.3 }}
      >
        {project.name}
      </h3>
      <p
        className="font-sans text-[14px] text-muted mt-2"
        style={{ lineHeight: 1.6 }}
      >
        {project.tagline}
      </p>
      <ul className="flex flex-wrap gap-2 mt-5">
        {project.stack.map((s) => (
          <li
            key={s}
            className="font-mono text-[10px] text-muted hairline"
            style={{ padding: "2px 8px", borderRadius: 4 }}
          >
            {s}
          </li>
        ))}
      </ul>
    </article>
  );

  if (!project.href) {
    return <div>{inner}</div>;
  }

  const isExternal = /^https?:\/\//.test(project.href);
  if (isExternal) {
    return (
      <a
        href={project.href}
        className="project-card-wrap block"
        aria-label={project.name}
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={project.href}
      className="project-card-wrap block"
      aria-label={project.name}
    >
      {inner}
    </Link>
  );
}

import { projects, type Project } from "@/lib/projects";
import ProjectCard from "./ProjectCard";
import SectionHeading from "./SectionHeading";

export default function Work() {
  const featured = projects.filter((p) => Boolean(p.href));
  const building = projects.filter((p) => !p.href);

  return (
    <section id="work" className="py-24 px-6 md:px-10 lg:px-16">
      <SectionHeading caption="// selected work" title="Recent projects" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {featured.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>

      {building.length > 0 ? (
        <div className="mt-16">
          <SectionHeading
            caption="// in the workshop"
            title="Workshop"
            size="md"
            as="h3"
          />
          <ul className="mt-6 flex flex-col">
            {building.map((p) => (
              <BuildingRow key={p.slug} project={p} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function BuildingRow({ project }: { project: Project }) {
  const line = project.summary ?? project.tagline;
  const statusLabel = project.href
    ? `[${project.status}]`
    : `[${project.status} · private]`;

  const content = (
    <div
      className="flex flex-col md:flex-row md:items-center md:gap-6 py-4 hairline-subtle-t"
      style={{ minHeight: 56 }}
    >
      <span className="font-mono text-[13px] text-fg md:w-[240px] md:shrink-0">
        {project.slug}/
      </span>
      <span
        className="font-sans text-[14px] text-muted md:flex-1 mt-1 md:mt-0"
        style={{ lineHeight: 1.5 }}
      >
        {line}
      </span>
      <span className="font-mono text-[11px] text-muted mt-2 md:mt-0">
        {statusLabel}
      </span>
    </div>
  );

  if (project.href) {
    const isExternal = /^https?:\/\//.test(project.href);
    return (
      <li>
        <a
          href={project.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="block hover:bg-white/[0.02] transition-colors"
          aria-label={`${project.name} — ${line}`}
        >
          {content}
        </a>
      </li>
    );
  }

  return <li>{content}</li>;
}

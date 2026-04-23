import { projects } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

export default function Work() {
  return (
    <section id="work" className="py-24 px-6">
      <div className="max-w-[1100px] mx-auto w-full">
        <p className="font-mono text-[11px] text-muted">
          {"// selected work"}
        </p>
        <h2
          className="font-mono font-medium text-[28px] text-fg mt-2"
          style={{ lineHeight: 1.3 }}
        >
          work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

import { COMPOSITIONS } from "@/components/work/visuals";
import type { Project } from "@/data/projects";

/**
 * The visual slot for a project.
 *
 * Until a real asset exists, each project gets an abstract composition drawn
 * from its own domain — a coordinate field, a scan block, a movement trace, a
 * property plate, a film frame — rather than five identical browser mockups.
 * Setting `image` on the project retires the placeholder with no other change,
 * and the container holds its aspect ratio either way so nothing shifts when
 * that swap happens.
 */

export function ProjectVisual({ project }: { project: Project }) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={`${project.name} — product visual`}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
    );
  }

  const Composition = COMPOSITIONS[project.visual];

  return (
    <>
      {/* A single accent wash so each project reads as its own environment
          without leaving the portfolio's palette. */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          background: `radial-gradient(60% 60% at 70% 30%, ${project.accent}, transparent 70%)`,
        }}
      />
      <span className="absolute inset-0 text-paper">
        <Composition accent={project.accent} />
      </span>
      <span className="label absolute bottom-3 left-4 text-faint">
        Visual / placeholder
      </span>
    </>
  );
}

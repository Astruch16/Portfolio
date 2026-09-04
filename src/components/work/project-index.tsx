"use client";

import { projects } from "@/data/projects";
import { useActiveIndex } from "@/hooks/use-active-index";

/**
 * The active-project readout: a stack of indices pinned to the right gutter,
 * with the current one lit. Desktop only — on smaller screens it would compete
 * with the content it is meant to annotate, and the section reads fine without
 * it.
 */
export function ProjectIndex() {
  const active = useActiveIndex();

  return (
    <div
      aria-hidden
      className="pointer-events-none sticky top-1/2 z-20 float-right hidden -translate-y-1/2 flex-col items-end gap-2 pr-[calc(var(--gutter)/2)] lg:flex"
    >
      {projects.map((project, index) => {
        const current = index === active;
        return (
          <span key={project.slug} className="flex items-center gap-2">
            <span
              className="block h-px transition-all duration-500 ease-[var(--ease-out-expo)]"
              style={{
                width: current ? 18 : 6,
                backgroundColor: current ? project.accent : "currentColor",
                opacity: current ? 1 : 0.25,
              }}
            />
            <span
              className="label transition-colors duration-500"
              style={{ color: current ? "var(--surface-fg)" : "var(--surface-faint)" }}
            >
              {project.index}
            </span>
          </span>
        );
      })}
    </div>
  );
}

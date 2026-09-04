import type { CSSProperties } from "react";

import type { Project } from "@/data/projects";

/**
 * Props for rendering a project's name in its own wordmark gradient.
 *
 * Returns null when the project has no gradient defined, so each call site can
 * apply its own fallback — white on the work index, the flat accent on a case
 * study — rather than this making that choice for them.
 *
 * The `.wordmark` class carries the clip and a solid fallback colour; see
 * globals.css for why the fallback cannot live inline.
 */
export function wordmarkProps(
  project: Project,
): { className: string; style: CSSProperties } | null {
  if (!project.accentGradient) return null;

  return {
    className: "wordmark",
    style: {
      "--wordmark-from": project.accentGradient[0],
      "--wordmark-to": project.accentGradient[1],
    } as CSSProperties,
  };
}

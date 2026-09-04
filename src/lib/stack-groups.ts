import type { Project, ProjectStack } from "@/data/projects";

/**
 * Reading order and colour-coding for the three stack layers.
 *
 * Same reasoning as the case-study spec sheet: at one uniform grey the layer
 * headings read as a single block, so each gets its own tone from the palette
 * already in use across the case studies — desaturated and at similar
 * luminance, a legend rather than a rainbow.
 */
const GROUPS: readonly { key: keyof ProjectStack; label: string; tone: string }[] = [
  { key: "frontend", label: "Frontend", tone: "#7fb4c9" },
  { key: "backend", label: "Backend", tone: "#8ad9b0" },
  { key: "infrastructure", label: "Infrastructure", tone: "#e0a94f" },
];

export type StackGroup = {
  key: keyof ProjectStack;
  label: string;
  tone: string;
  items: string[];
};

/** The project's populated layers, in order. Empty layers are dropped. */
export function stackGroups(project: Project): StackGroup[] {
  return GROUPS.map((group) => ({ ...group, items: project.stack[group.key] })).filter(
    (group) => group.items.length > 0,
  );
}

import { ProductExhibit, isExhibit } from "@/components/case/product-exhibit";
import { COMPOSITIONS } from "@/components/work/visuals";
import type { CaseVisual } from "@/data/case-studies";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * A visual slot.
 *
 * With a real screenshot it becomes a product exhibit, which keeps the screen's
 * own proportions; without one it falls back to the project's abstract
 * composition at a fixed ratio. Adding `src` and its intrinsic size to the
 * visual is the whole migration — no call site changes.
 */
export function CaseVisualFrame({
  visual,
  project,
  className,
  priority,
}: {
  visual: CaseVisual;
  project: Project;
  className?: string;
  priority?: boolean;
}) {
  if (isExhibit(visual)) {
    return (
      <ProductExhibit
        visual={visual}
        accent={project.accent}
        priority={priority}
        className={className}
      />
    );
  }

  const Composition = COMPOSITIONS[visual.composition ?? project.visual];
  const ratio = (visual.aspect ?? "16/9").replace("/", " / ");

  return (
    <figure className={cn("relative", className)}>
      <div
        className="relative overflow-hidden border border-hairline bg-void/40"
        style={{ aspectRatio: ratio }}
      >
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
      </div>

      {visual.caption ? (
        <figcaption className="label mt-3 text-faint">{visual.caption}</figcaption>
      ) : null}
    </figure>
  );
}

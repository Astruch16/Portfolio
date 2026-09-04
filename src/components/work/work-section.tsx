import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { ProjectIndex } from "@/components/work/project-index";
import { ProjectRow } from "@/components/work/project-row";
import { projects } from "@/data/projects";

/**
 * Selected work.
 *
 * This section is also the hero's seam: it carries `data-surface="dark"` and
 * rides over the pinned hero on wide screens, so the page changes environment
 * rather than simply scrolling to a new colour, and the navigation inverts off
 * the same attribute with no extra wiring.
 */
export function WorkSection() {
  return (
    <section
      data-surface="dark"
      aria-labelledby="work-heading"
      className="relative z-20 bg-bg text-fg"
    >
      <DrawLine onView className="absolute inset-x-0 top-0" />

      <ProjectIndex />

      <div className="shell pt-[clamp(4rem,12vh,9rem)] pb-[clamp(3rem,8vh,6rem)]">
        <Lift onView as="p" className="label text-muted">
          <span className="text-faint">01 / </span>Selected work
        </Lift>

        <h2
          id="work-heading"
          className="display mt-[clamp(1.5rem,4vh,2.75rem)] text-section text-fg"
        >
          <MaskReveal onView delay={0.06}>Currently</MaskReveal>
          <MaskReveal onView delay={0.14}>
            <span className="text-accent">Building.</span>
          </MaskReveal>
        </h2>

        <Lift onView delay={0.24} as="p" className="label mt-[clamp(1.5rem,4vh,2.5rem)] text-muted">
          Real products <span className="text-faint">/</span> Real users{" "}
          <span className="text-faint">/</span> Always shipping
        </Lift>
      </div>

      {projects.map((project, index) => (
        <ProjectRow key={project.slug} project={project} position={index} />
      ))}
    </section>
  );
}

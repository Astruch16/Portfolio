import { AnnotatedExhibit } from "@/components/case/annotated-exhibit";
import { ArrowSequence } from "@/components/case/arrow-sequence";
import { CaseBlockRenderer } from "@/components/case/case-blocks";
import { ProductExhibit, isExhibit } from "@/components/case/product-exhibit";
import { sequenceTone } from "@/components/case/sequence-tones";
import { Pending } from "@/components/case/pending";
import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import type { CaseSection } from "@/data/case-studies";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * One chapter, or one pacing break.
 *
 * A chapter keeps the rail the page is built on — numbered label left, content
 * offset right — and simply stacks whatever blocks it was given. A break drops
 * the rail entirely and runs full width, which is what makes it read as a
 * change of gear rather than another numbered section. An exhibit does the
 * same for a product screen: no rail, no measure, just the plate.
 */

function Interlude({
  section,
  accent,
}: {
  section: Extract<CaseSection, { kind: "interlude" }>;
  accent: string;
}) {
  return (
    <section className="relative">
      <DrawLine onView className="absolute inset-x-0 top-0" />

      <div className="shell py-[clamp(5rem,15vh,10rem)]">
        <p className="display text-[clamp(1.9rem,5.2vw,4.25rem)] leading-[0.98] text-fg">
          {section.lines.map((line, i) => (
            <MaskReveal key={line} onView delay={i * 0.08}>
              {line}
            </MaskReveal>
          ))}
        </p>

        <div className="mt-[clamp(2rem,5vh,3.25rem)]">
          <ArrowSequence items={section.note} accent={accent} underline={false} />
        </div>
      </div>
    </section>
  );
}

/**
 * A product screen between chapters.
 *
 * `bleed` deliberately escapes both the shell's max-width and most of its
 * gutter, so the screen runs nearly edge to edge — that width is the whole
 * point of giving a signature feature its own section instead of a slot inside
 * one. `shell` keeps the page's normal margin.
 */
function Exhibit({
  section,
  accent,
}: {
  section: Extract<CaseSection, { kind: "exhibit" }>;
  accent: string;
}) {
  // A visual without a real screenshot has no exhibit to show; it is a data
  // error rather than a state worth rendering a placeholder for.
  if (!isExhibit(section.visual)) return null;

  const bleed = section.scale === "bleed";

  return (
    // `overflow-x-clip` rather than `hidden`: the plate's glow and grid extend
    // past the section's own width by design, and clipping them at the edge is
    // what keeps that from putting a horizontal scrollbar on the page. `clip`
    // leaves overflow-y visible, so nothing else about the page changes.
    <section id={section.id} className="relative overflow-x-clip">
      <DrawLine onView className="absolute inset-x-0 top-0" />

      <div
        className={cn(
          "py-[clamp(4rem,11vh,8rem)]",
          bleed ? "px-[calc(var(--gutter)/2)]" : "shell",
        )}
      >
        <Lift onView className={section.scale === "inset" ? "max-w-[52rem]" : undefined}>
          <ProductExhibit visual={section.visual} accent={accent} bleed={bleed} />
        </Lift>
      </div>
    </section>
  );
}

export function CaseSectionBlock({
  section,
  project,
}: {
  section: CaseSection;
  project: Project;
}) {
  if (section.kind === "interlude") {
    return <Interlude section={section} accent={project.accent} />;
  }

  if (section.kind === "exhibit") {
    return <Exhibit section={section} accent={project.accent} />;
  }

  if (section.kind === "aside") {
    return <AnnotatedExhibit section={section} accent={project.accent} />;
  }

  return (
    <section id={section.id} className="relative">
      <DrawLine onView className="absolute inset-x-0 top-0" />

      <div className="shell shell-grid gap-y-8 py-[clamp(3.5rem,10vh,7rem)]">
        {/* The index carries its own colour so the chapters can be counted at
            a glance down the rail; the label stays muted so the rail as a whole
            remains quiet. */}
        <Lift onView as="p" className="label col-span-12 text-muted lg:col-span-3">
          <span style={{ color: sequenceTone(Number(section.index) - 1, project.accent) }}>
            {section.index}
          </span>
          <span className="text-faint"> / </span>
          {section.label}
        </Lift>

        <div className="col-span-12 flex flex-col gap-[clamp(2.5rem,6vh,4rem)] lg:col-span-8 lg:col-start-5">
          {section.headline ? (
            <h2 className="display text-statement text-fg">
              <MaskReveal onView delay={0.06}>{section.headline}</MaskReveal>
            </h2>
          ) : null}

          {section.blocks.length ? (
            section.blocks.map((block, i) => (
              <CaseBlockRenderer key={i} block={block} project={project} />
            ))
          ) : (
            <Pending prompt={section.prompt} />
          )}
        </div>
      </div>
    </section>
  );
}

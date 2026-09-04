import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { ProjectVisual } from "@/components/work/project-visual";
import type { Project } from "@/data/projects";
import { stackGroups } from "@/lib/stack-groups";
import { cn } from "@/lib/utils";
import { wordmarkProps } from "@/lib/wordmark";

/**
 * One project, presented as an editorial case-study preview rather than a card.
 *
 * A server component: every reveal is handled by the shared motion primitives
 * and every hover state is CSS on the row's `group`, so nothing here needs to
 * ship as a client bundle. The whole row is a single link — one tab stop, one
 * accessible name — with `VIEW PROJECT` acting as its affordance rather than a
 * second competing link.
 */

/** Reveal offsets within a row: index, then title, then metadata, then visual. */
const CUE = { index: 0, title: 0.08, meta: 0.16, visual: 0.26 } as const;

function Pending({ label }: { label: string }) {
  return (
    <span className="label text-faint" title="Awaiting real content">
      [ {label} pending ]
    </span>
  );
}

export function ProjectRow({ project, position }: { project: Project; position: number }) {
  const full = project.layout === "full";
  // Projects without a wordmark gradient stay white, keeping the row of five
  // consistent until each one has its own brand colour.
  const wordmark = wordmarkProps(project);
  const stack = stackGroups(project);

  return (
    <article data-project-index={position} className="relative">
      <DrawLine onView className="absolute inset-x-0 top-0" />

      <Link
        href={`/work/${project.slug}`}
        className="group block py-[clamp(3.5rem,9vh,7rem)]"
      >
        <div className="shell">
          {/* Index and status share the top rail. */}
          <Lift onView delay={CUE.index} className="flex items-baseline justify-between gap-6">
            <span className="label text-muted">
              <span style={{ color: project.accent }}>{project.index}</span>
              <span className="text-faint"> / </span>
              {project.kind}
            </span>
            <span className="label text-faint">
              {project.status ?? "[ status pending ]"}
            </span>
          </Lift>

          <div
            className={cn(
              "mt-[clamp(1.75rem,4vh,3rem)] grid gap-[clamp(2rem,4vw,4rem)]",
              full ? "lg:grid-cols-1" : "lg:grid-cols-12",
            )}
          >
            {/* --- Type ---------------------------------------------------- */}
            <div
              className={cn(
                "flex flex-col",
                full && "order-2",
                !full && "lg:col-span-5",
                !full && project.layout === "left" && "lg:order-2 lg:col-start-8",
              )}
            >
              <h3 className="display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.86] text-fg">
                <MaskReveal onView delay={CUE.title}>
                  <span {...wordmark}>{project.name}</span>
                </MaskReveal>
              </h3>

              <Lift onView delay={CUE.meta} as="p" className="label mt-4 text-muted">
                {project.discipline}
              </Lift>

              <Lift onView delay={CUE.meta + 0.04} className="mt-8 max-w-[42ch]">
                {project.statement ? (
                  <p className="text-lead text-muted">{project.statement}</p>
                ) : (
                  <Pending label="Positioning statement" />
                )}
              </Lift>

              {/* The stack runs down the page in its three layers rather than
                  across in one wrapping line: the row has height to spare here,
                  and a flat run of eight names reads as a single string. */}
              <Lift onView delay={CUE.meta + 0.08} className="mt-8">
                <p className="label border-t border-hairline pt-2.5 text-faint">
                  Stack
                </p>

                {stack.length ? (
                  <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
                    {stack.map((group) => (
                      <div key={group.key}>
                        <p
                          className="label border-b border-hairline pb-2 text-[0.625rem]"
                          style={{ color: group.tone }}
                        >
                          {group.label}
                        </p>
                        <ul className="mt-3 flex flex-col gap-2">
                          {group.items.map((item) => (
                            <li key={item} className="label text-muted">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4">
                    <Pending label="Stack" />
                  </p>
                )}
              </Lift>

              {/* The row's affordance — not a nested link. */}
              <Lift onView delay={CUE.meta + 0.12} className="mt-10">
                <span className="label relative inline-flex items-center gap-3 text-fg">
                  <span className="relative block overflow-hidden">
                    <span className="block transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">
                      View project
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-0 block translate-y-full transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0"
                      style={{ color: project.accent }}
                    >
                      View project
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="block transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
                  >
                    &rarr;
                  </span>
                  <span
                    aria-hidden
                    className="absolute -bottom-2 left-0 block h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
                    style={{ backgroundColor: project.accent }}
                  />
                </span>
              </Lift>
            </div>

            {/* --- Visual -------------------------------------------------- */}
            <Lift
              onView
              delay={CUE.visual}
              className={cn(
                "relative",
                full ? "order-1" : "lg:col-span-6",
                !full && project.layout === "left" && "lg:order-1 lg:col-start-1",
                !full && project.layout === "right" && "lg:col-start-7",
              )}
            >
              <div
                className={cn(
                  "relative overflow-hidden border border-hairline bg-void/40",
                  full ? "aspect-[16/7]" : "aspect-4/3",
                )}
              >
                <ProjectVisual project={project} />

                {/* Hover-only, and only ever supplementary: the whole row is
                    already the link. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 hidden place-items-center bg-void/45 opacity-0 transition-opacity duration-300 ease-[var(--ease-out-quart)] group-hover:opacity-100 lg:grid"
                >
                  <span className="label flex items-center gap-2 text-fg">
                    Open case study
                    <ArrowUpRight className="size-3" strokeWidth={1.5} />
                  </span>
                </span>
              </div>
            </Lift>
          </div>
        </div>
      </Link>
    </article>
  );
}

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import type { Project } from "@/data/projects";

/**
 * The way out: back to the index, and straight into the next project. Same
 * two-copy hover the rest of the site uses.
 */
export function CaseFooter({ next }: { next: Project }) {
  return (
    <section className="relative">
      <DrawLine onView className="absolute inset-x-0 top-0" />

      <div className="shell flex flex-col gap-[clamp(2.5rem,7vh,4.5rem)] py-[clamp(3.5rem,10vh,7rem)]">
        <Lift onView>
          <Link
            href="/#work-heading"
            className="group label inline-flex items-center gap-3 text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft
              aria-hidden
              strokeWidth={1.5}
              className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-x-1"
            />
            All selected work
          </Link>
        </Lift>

        <Lift onView delay={0.08}>
          <Link href={`/work/${next.slug}`} className="group block">
            <p className="label text-faint">
              Next <span style={{ color: next.accent }}>{next.index}</span>
            </p>

            <h2 className="display mt-4 text-section text-fg">
              <MaskReveal onView delay={0.12}>{next.name}</MaskReveal>
            </h2>

            <span className="label mt-6 inline-flex items-center gap-3 text-muted transition-colors group-hover:text-fg">
              <span className="relative block overflow-hidden">
                <span className="block transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">
                  {next.discipline}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 block translate-y-full transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0"
                  style={{ color: next.accent }}
                >
                  View project
                </span>
              </span>
              <ArrowRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
              />
            </span>
          </Link>
        </Lift>
      </div>
    </section>
  );
}

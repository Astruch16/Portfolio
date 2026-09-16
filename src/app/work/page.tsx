import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { SignalField } from "@/components/visuals/signal-field";
import { Archive, type ArchiveItem } from "@/components/work/archive";
import { caseStudyBySlug } from "@/data/case-studies";
import { projects } from "@/data/projects";
import type { CaseImage } from "@/lib/case-image";
import { stackList } from "@/data/projects";

/**
 * The complete archive.
 *
 * A server component around one island: the header, the readings and the way
 * out are static, and the set itself is interactive — filtered, read as an
 * index or as plates, with the screenshots riding the cursor. The case-study
 * data the screenshots come from stays on the server; only the handful of image
 * records the archive draws are passed down.
 *
 * Every number on this page is counted from `projects.ts`, and every project
 * without real content keeps its marked placeholder.
 */

export const metadata: Metadata = {
  title: "Work",
  description:
    "The complete archive — products, platforms and experiments designed, built and shipped.",
  alternates: { canonical: "/work" },
};

function shotFor(slug: string): CaseImage | undefined {
  const hero = caseStudyBySlug(slug)?.hero;
  if (!hero?.src || !hero.width || !hero.height) return undefined;
  return {
    src: hero.src,
    width: hero.width,
    height: hero.height,
    alt: hero.alt ?? "",
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function WorkPage() {
  const items: ArchiveItem[] = projects.map((project) => ({
    project,
    shot: shotFor(project.slug),
  }));

  // Read from the data rather than written as copy: a claim on this page would
  // go stale the moment a project changes.
  const technologies = new Set(projects.flatMap((p) => stackList(p.stack)));
  const readings = [
    { value: pad(projects.length), label: "Projects" },
    {
      value: pad(projects.filter((p) => p.status).length),
      label: "With a status",
    },
    { value: pad(technologies.size), label: "Technologies" },
    {
      value: pad(projects.filter((p) => shotFor(p.slug)).length),
      label: "Case studies",
    },
  ];

  return (
    <main
      data-surface="dark"
      className="relative isolate overflow-x-clip bg-bg pb-[clamp(2rem,6vh,4rem)] text-fg"
    >
      {/* --- Background ------------------------------------------------------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(50rem,110svh)]"
      >
        <SignalField
          strength={0.26}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,#000_45%,transparent)]"
        />
        <div className="absolute -top-[12%] -right-[8%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgb(114_87_255/0.2),transparent_65%)] blur-2xl" />
      </div>

      {/* --- Header ------------------------------------------------------------ */}
      <header className="shell grid gap-y-10 pt-[calc(var(--nav-h)+clamp(2.5rem,7vh,4.5rem))] pb-[clamp(2rem,6vh,3.5rem)] lg:grid-cols-12 lg:items-end lg:gap-x-[clamp(2rem,4vw,4.5rem)]">
        <div className="lg:col-span-7">
          <Lift as="p" className="label text-muted">
            <span className="text-accent">02</span>
            <span className="text-faint"> / </span>
            Work
          </Lift>

          <h1 className="display mt-[clamp(1.25rem,3.5vh,2.25rem)] text-section">
            <MaskReveal delay={0.06}>Selected</MaskReveal>
            <MaskReveal delay={0.12}>Projects.</MaskReveal>
          </h1>

          <Lift
            delay={0.18}
            className="mt-[clamp(1.25rem,3vh,2rem)] max-w-[46rem]"
          >
            <p className="text-lead text-muted">
              Products, platforms and experiments I&rsquo;ve designed, built and
              shipped. Narrow the set, or read it either way &mdash; as an index
              or as plates.
            </p>
          </Lift>
        </div>

        <Lift
          delay={0.24}
          className="grid grid-cols-2 gap-px self-end border border-hairline bg-hairline sm:grid-cols-4 lg:col-span-5 lg:grid-cols-2"
        >
          {readings.map((reading) => (
            <div key={reading.label} className="bg-bg px-5 py-4">
              <p className="font-mono text-[clamp(1.5rem,2.4vw,2.25rem)] leading-none tracking-[-0.04em] text-fg tabular-nums">
                {reading.value}
              </p>
              <p className="label mt-2.5 text-faint">{reading.label}</p>
            </div>
          ))}
        </Lift>
      </header>

      <Archive items={items} />

      {/* --- Transition into the rest of the portfolio -------------------------- */}
      <section className="relative overflow-x-clip">
        <DrawLine onView className="absolute inset-x-0 top-0" />
        <div className="shell py-[clamp(4rem,10vh,7rem)]">
          <p className="display text-[clamp(1.75rem,4.5vw,3.25rem)] leading-[1.02] text-fg">
            <MaskReveal onView>More than case studies.</MaskReveal>
          </p>
          <Lift onView delay={0.08} className="mt-4 max-w-[42rem]">
            <p className="text-lead text-muted">
              See what I&rsquo;m building, testing and learning.
            </p>
          </Lift>
          <Lift onView delay={0.14} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/build-log"
              className="group/b label inline-flex items-center gap-3 border border-hairline-strong px-5 py-3 text-fg transition-colors hover:bg-fg hover:text-bg"
            >
              Build log
              <ArrowRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/b:translate-x-1"
              />
            </Link>
            <Link
              href="/contact"
              className="group/c label inline-flex items-center gap-3 border border-hairline-strong px-5 py-3 text-fg transition-colors hover:bg-fg hover:text-bg"
            >
              Start a conversation
              <ArrowRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/c:translate-x-1"
              />
            </Link>
          </Lift>
        </div>
      </section>
    </main>
  );
}

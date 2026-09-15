import { ArrowDownRight } from "lucide-react";

import { SignalField } from "@/components/home/signal-field";
import { WorkShowcase, type ShowcaseItem } from "@/components/home/work-showcase";
import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { caseStudyBySlug } from "@/data/case-studies";
import { projects } from "@/data/projects";
import { caseImage, type CaseImage } from "@/lib/case-image";

/**
 * 01 — Selected work.
 *
 * A server component, so the case-study data the screenshots are read from
 * never reaches the client: only the handful of image records the stage needs
 * are passed down.
 *
 * It is also the hero's seam — dark, and riding over the pinned hero on wide
 * screens, so the navigation inverts off the same `data-surface` attribute.
 */

/**
 * The second, smaller screenshot on each project's stage: a product view,
 * against the case study's hero. Each must be an image that case study already
 * uses — its alt text and size come from there.
 */
const SECOND_SHOT: Record<string, string> = {
  expird: "/work/expird/map-view.png",
  "my-local-loop": "/work/my-local-loop/consumer-dashboard.png",
  mintlytics: "/work/mintlytics/dashboard.png",
};

function shotsFor(slug: string): CaseImage[] {
  const hero = caseStudyBySlug(slug)?.hero;
  const shots: CaseImage[] = [];
  if (hero?.src && hero.width && hero.height) {
    shots.push({ src: hero.src, width: hero.width, height: hero.height, alt: hero.alt ?? "" });
  }
  const second = SECOND_SHOT[slug] ? caseImage(slug, SECOND_SHOT[slug]) : undefined;
  if (shots.length && second) shots.push(second);
  return shots;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function WorkChapter() {
  const items: ShowcaseItem[] = projects.map((project) => ({ project, shots: shotsFor(project.slug) }));

  // Counts, read straight from the data rather than written as copy.
  const facts = [
    { value: pad(projects.length), label: "Projects" },
    {
      value: pad(projects.filter((p) => p.status === "Closed beta").length),
      label: "In closed beta",
    },
    { value: pad(projects.filter((p) => p.kind === "Client").length), label: "Client build" },
  ];

  return (
    <section
      id="work"
      data-surface="dark"
      data-chapter="01"
      aria-labelledby="work-heading"
      className="relative isolate z-20 overflow-x-clip bg-bg text-fg"
    >
      <DrawLine onView className="absolute inset-x-0 top-0" />

      {/* --- Background ------------------------------------------------------ */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(62rem,120svh)]">
        <SignalField strength={0.3} className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,#000_40%,transparent)]" />
        <div className="absolute -top-[10%] -right-[8%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgb(114_87_255/0.22),transparent_65%)] blur-2xl" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 [mask-image:linear-gradient(to_bottom,transparent,#000_20%,#000_80%,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.025) 1px, transparent 1px)",
          backgroundSize: "calc((100% - 2 * var(--gutter)) / 12) 100%",
          backgroundPosition: "var(--gutter) 0",
        }}
      />

      {/* --- Opening -------------------------------------------------------- */}
      <header className="shell grid gap-y-12 pt-[clamp(5rem,14vh,10rem)] pb-[clamp(3rem,8vh,6rem)] lg:grid-cols-12 lg:gap-x-[clamp(2rem,4vw,4.5rem)]">
        <div className="lg:col-span-7">
          <Lift onView as="p" className="label text-muted">
            <span className="text-accent">01</span>
            <span className="text-faint"> / </span>Selected work
          </Lift>

          <h2 id="work-heading" className="display mt-[clamp(1.5rem,4vh,2.75rem)] text-section text-fg">
            <MaskReveal onView delay={0.06}>Currently</MaskReveal>
            <MaskReveal onView delay={0.14}>
              <span className="text-accent">Building.</span>
            </MaskReveal>
          </h2>

          <Lift onView delay={0.24} as="p" className="label mt-[clamp(1.5rem,4vh,2.5rem)] text-muted">
            Real products <span className="text-faint">/</span> Real users{" "}
            <span className="text-faint">/</span> Always shipping
          </Lift>

          <Lift onView delay={0.3} className="mt-10 grid max-w-[34rem] grid-cols-3 border-t border-hairline">
            {facts.map((fact) => (
              <div key={fact.label} className="border-r border-hairline pt-4 pr-4 last:border-r-0 [&:not(:first-child)]:pl-4">
                <p className="font-mono text-[clamp(1.75rem,3vw,2.5rem)] leading-none tracking-[-0.04em] text-fg tabular-nums">
                  {fact.value}
                </p>
                <p className="label mt-2 text-faint">{fact.label}</p>
              </div>
            ))}
          </Lift>
        </div>

        {/* An index of everything below, each line a jump to its project. */}
        <nav aria-label="Project index" className="self-end lg:col-span-5">
          <Lift onView delay={0.2} as="p" className="label border-b border-hairline pb-3 text-faint">
            Index
          </Lift>
          <ol>
            {projects.map((project, i) => (
              <Lift key={project.slug} as="li" onView delay={0.24 + i * 0.05}>
                <a
                  href={`#project-${project.slug}`}
                  className="group/row relative grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-hairline py-4"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-white/[0.03] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/row:scale-x-100"
                  />
                  <span className="label relative" style={{ color: project.accent }}>
                    {project.index}
                  </span>
                  <span className="relative min-w-0">
                    <span className="block truncate text-[1.0625rem] tracking-[-0.01em] text-fg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/row:translate-x-1.5">
                      {project.name}
                    </span>
                    <span className="label mt-1 block truncate text-faint">{project.discipline}</span>
                  </span>
                  <span className="label relative flex items-center gap-2 text-faint transition-colors group-hover/row:text-fg">
                    <span className="hidden sm:inline">{project.status ?? project.kind}</span>
                    <ArrowDownRight
                      aria-hidden
                      className="size-3.5 transition-transform duration-300 group-hover/row:translate-x-0.5 group-hover/row:translate-y-0.5"
                      strokeWidth={1.5}
                    />
                  </span>
                </a>
              </Lift>
            ))}
          </ol>
        </nav>
      </header>

      <WorkShowcase items={items} />

      <div className="h-[clamp(3rem,10vh,7rem)]" />
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Lift, MaskReveal } from "@/components/motion/reveal";
import { COMPOSITIONS } from "@/components/work/visuals";
import { isComingSoon, type Project } from "@/data/projects";
import type { CaseImage } from "@/lib/case-image";
import { stackGroups } from "@/lib/stack-groups";
import { cn } from "@/lib/utils";
import { wordmarkProps } from "@/lib/wordmark";

/**
 * Selected work, as a pinned stage beside a scrolling index of projects.
 *
 * On a wide screen the left of the section holds still while the projects
 * scroll past on the right. Whichever project holds the middle of the viewport
 * owns the stage: its real screenshots wipe in over the last project's, drift
 * against each other as the page moves, and the light behind them takes its
 * colour. A counter and a segmented bar say where you are; the numbered buttons
 * under the stage jump straight to any project.
 *
 * Projects without screenshots yet keep their marked placeholder composition.
 * On smaller screens there's no stage — each project carries its own visual
 * inline, above its text.
 */

export type ShowcaseItem = {
  project: Project;
  /** Real screenshots, primary first. Empty until the project has any. */
  shots: CaseImage[];
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Widths of the two plates, as fractions of the group's width. */
const FIRST_W = 0.88;
const SECOND_W = 0.52;
/** Where the second plate's top edge sits, as a fraction of the first's height. */
const SECOND_TOP = 0.58;

const ratio = (shot: CaseImage) => shot.height / shot.width;

/** How far the second plate hangs below the first, as a fraction of the group's width. */
function overhang(shots: CaseImage[]) {
  const first = FIRST_W * ratio(shots[0]);
  const second = shots[1] ? SECOND_W * ratio(shots[1]) : 0;
  return Math.max(0, first * SECOND_TOP + second - first);
}

/** The group's total height, as a percentage of its width, plus room to drift. */
function groupHeight(shots: CaseImage[]) {
  return (FIRST_W * ratio(shots[0]) + overhang(shots)) * 100 + 14;
}

/* --- Stage ------------------------------------------------------------------ */

function Corners({ color }: { color: string }) {
  return (
    <>
      {[
        "-top-px -left-px border-t border-l",
        "-top-px -right-px border-t border-r",
        "-bottom-px -left-px border-b border-l",
        "-right-px -bottom-px border-r border-b",
      ].map((edge) => (
        <span
          key={edge}
          aria-hidden
          className={cn("absolute block size-3", edge)}
          style={{ borderColor: color }}
        />
      ))}
    </>
  );
}

function Plate({
  shot,
  project,
  className,
  sizes,
  priority,
}: {
  shot: CaseImage;
  project: Project;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative border border-hairline-strong bg-void", className)}>
      <Corners color={project.accent} />
      <div className="relative overflow-hidden" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

function Placeholder({ project }: { project: Project }) {
  const Composition = COMPOSITIONS[project.visual];
  return (
    <div className="relative aspect-4/3 overflow-hidden border border-hairline bg-void/60">
      <Corners color={project.accent} />
      <span className="absolute inset-0 text-paper">
        <Composition accent={project.accent} />
      </span>
      <span className="label absolute bottom-3 left-4 text-faint">Visual / placeholder</span>
    </div>
  );
}

function Frame({
  item,
  index,
  active,
  count,
  progress,
}: {
  item: ShowcaseItem;
  index: number;
  active: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const { project, shots } = item;
  const on = index === active;
  const span: [number, number] = [index / count, (index + 1) / count];
  const back = useTransform(progress, span, [28, -28]);
  const front = useTransform(progress, span, [64, -64]);

  // Wipes up out of the bottom to arrive, and away through the top to leave,
  // so scrolling down always reads as the next frame rising into place.
  const clip = on ? "inset(0% 0% 0% 0%)" : index < active ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)";

  return (
    <div
      aria-hidden={!on}
      className="absolute inset-0 transition-[clip-path,opacity,transform] duration-[1000ms] ease-[var(--ease-out-expo)]"
      style={{ clipPath: clip, opacity: on ? 1 : 0.4, transform: on ? "none" : "scale(0.985)" }}
    >
      {shots.length ? (
        // The pair as one group: the product view overlaps the lower right of
        // the hero shot, and the group is sized to the stage's height as well
        // as its width, so it never overflows a short screen.
        <div className="absolute inset-0 flex items-center justify-center [container-type:size]">
          <div
            className="relative w-[min(100%,var(--fit))]"
            style={
              {
                // The width at which the group is exactly as tall as the stage.
                "--fit": `${(10000 / groupHeight(shots)).toFixed(0)}cqh`,
                paddingBottom: shots[1] ? `${(overhang(shots) * 100).toFixed(2)}%` : undefined,
              } as React.CSSProperties
            }
          >
            <motion.div style={{ y: back }} className="relative w-[88%]">
              <Plate
                shot={shots[0]}
                project={project}
                sizes="(min-width: 1024px) 50vw, 1px"
                priority={index === 0}
              />
            </motion.div>
            {shots[1] ? (
              <motion.div
                style={{ y: front, top: `${(SECOND_TOP * 100).toFixed(0)}%` }}
                className="absolute right-0 w-[52%] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]"
              >
                <Plate shot={shots[1]} project={project} sizes="(min-width: 1024px) 28vw, 1px" />
              </motion.div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center [container-type:size]">
          <motion.div style={{ y: back }} className="w-[min(92%,120cqh)]">
            <Placeholder project={project} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* --- One project's text ------------------------------------------------------ */

function StatusPill({ status }: { status: Project["status"] }) {
  if (!status) {
    return (
      <span className="label text-faint" title="Awaiting real content">
        [ status pending ]
      </span>
    );
  }
  // Something that is running gets the live signal; something still to come
  // gets the amber the rest of the site marks waiting with, and doesn't pulse.
  const soon = status === "Coming soon";
  return (
    <span
      className="label inline-flex items-center gap-2 border px-2.5 py-1"
      style={{
        color: soon ? "#e0a94f" : "var(--surface-muted)",
        borderColor: soon ? "#e0a94f55" : "var(--surface-hairline)",
      }}
    >
      <span className="relative flex size-1.5">
        {soon ? null : (
          <span className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60" />
        )}
        <span
          className="relative block size-1.5 rounded-full"
          style={{ backgroundColor: soon ? "#e0a94f" : "var(--color-signal)" }}
        />
      </span>
      {status}
    </span>
  );
}

function Chapter({ item, index }: { item: ShowcaseItem; index: number }) {
  const { project, shots } = item;
  const wordmark = wordmarkProps(project);
  const stack = stackGroups(project);

  return (
    <article
      id={`project-${project.slug}`}
      data-showcase-index={index}
      className="flex scroll-mt-[calc(var(--nav-h)+1rem)] flex-col justify-center py-[clamp(3.5rem,9vh,6rem)] lg:min-h-[78svh] lg:py-16"
    >
      {/* Below lg there's no stage, so each project brings its own visual. */}
      <Lift onView className="mb-10 lg:hidden">
        {shots.length ? (
          <Plate shot={shots[0]} project={project} sizes="100vw" />
        ) : (
          <Placeholder project={project} />
        )}
      </Lift>

      <Lift onView className="flex flex-wrap items-center justify-between gap-4">
        <span className="label text-muted">
          <span style={{ color: project.accent }}>{project.index}</span>
          <span className="text-faint"> / </span>
          {project.kind}
        </span>
        <StatusPill status={project.status} />
      </Lift>

      <h3 className="display mt-6 text-[clamp(2.75rem,5.4vw,5.25rem)] leading-[0.86] text-fg">
        <MaskReveal onView delay={0.06}>
          <span {...wordmark}>{project.name}</span>
        </MaskReveal>
      </h3>

      <Lift onView delay={0.12} as="p" className="label mt-4 text-muted">
        {project.discipline}
      </Lift>

      <Lift onView delay={0.16} className="mt-7 max-w-[44ch]">
        {project.statement ? (
          <p className="text-lead text-muted">{project.statement}</p>
        ) : isComingSoon(project) ? (
          <p className="text-lead text-muted">
            In the works &mdash; there&rsquo;ll be more to show here soon.
          </p>
        ) : (
          <p className="label text-faint" title="Awaiting real content">
            [ Positioning statement pending ]
          </p>
        )}
      </Lift>

      <Lift onView delay={0.2} className="mt-8">
        {stack.length ? (
          <ul className="flex flex-wrap gap-1.5" aria-label={`${project.name} stack`}>
            {stack.flatMap((group) =>
              group.items.map((name) => (
                <li
                  key={`${group.key}-${name}`}
                  className="inline-flex items-center gap-2 border border-hairline bg-white/[0.02] px-2.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.04em] text-muted"
                >
                  <span aria-hidden className="block size-1 rounded-full" style={{ backgroundColor: group.tone }} />
                  {name}
                </li>
              )),
            )}
          </ul>
        ) : isComingSoon(project) ? null : (
          <p className="label text-faint" title="Awaiting real content">
            [ Stack pending ]
          </p>
        )}
      </Lift>

      <Lift onView delay={0.24} className="mt-10">
        <Link
          href={`/work/${project.slug}`}
          className="group/open label inline-flex items-center gap-4 text-fg"
        >
          <span
            className="relative grid size-11 place-items-center rounded-full border border-hairline-strong transition-[background-color,border-color] duration-300 group-hover/open:border-transparent"
            style={{ "--tone": project.accent } as React.CSSProperties}
          >
            <span
              aria-hidden
              className="absolute inset-0 scale-0 rounded-full bg-(--tone) transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/open:scale-100"
            />
            <span aria-hidden className="relative transition-transform duration-300 group-hover/open:translate-x-0.5">
              &rarr;
            </span>
          </span>
          <span>
            Open case study<span className="sr-only">: {project.name}</span>
          </span>
        </Link>
      </Lift>
    </article>
  );
}

/* --- Showcase --------------------------------------------------------------- */

export function WorkShowcase({ items }: { items: ShowcaseItem[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = items.length;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start center", "end center"],
  });

  // Same band as the rest of the site's scroll chapters: whichever project
  // crosses the middle of the viewport owns the stage.
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number(entry.target.getAttribute("data-showcase-index")));
          }
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    root.querySelectorAll("[data-showcase-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const current = items[active].project;

  return (
    <div ref={container} className="shell relative lg:grid lg:grid-cols-12 lg:gap-x-[clamp(2rem,4vw,4.5rem)]">
      {/* --- The stage --------------------------------------------------- */}
      <div className="hidden lg:col-span-7 lg:block">
        <div className="sticky top-[calc(var(--nav-h)+1.5rem)] flex h-[calc(100svh-var(--nav-h)-3rem)] flex-col">
          <div className="flex items-baseline justify-between gap-6 border-b border-hairline pb-3">
            <p className="label text-muted" aria-live="polite">
              <span className="text-faint">Fig. </span>
              <span style={{ color: current.accent }}>{current.index}</span>
              <span className="text-faint"> / </span>
              {current.name}
            </p>
            <p aria-hidden className="label font-mono text-faint tabular-nums">
              <span className="text-fg">{pad(active + 1)}</span> / {pad(count)}
            </p>
          </div>

          <div className="relative mt-6 flex-1">
            {/* The light the screenshots sit in, in the current project's colour. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[-12%] transition-[background-color] duration-[1200ms]"
              style={{
                backgroundColor: current.accent,
                opacity: 0.16,
                maskImage: "radial-gradient(closest-side, #000, transparent)",
                WebkitMaskImage: "radial-gradient(closest-side, #000, transparent)",
              }}
            />
            {items.map((item, i) => (
              <Frame
                key={item.project.slug}
                item={item}
                index={i}
                active={active}
                count={count}
                progress={scrollYProgress}
              />
            ))}
          </div>

          {/* Segments that fill as you move through each project, and a jump
              to any of them. */}
          <nav aria-label="Projects" className="mt-6 grid gap-2 border-t border-hairline pt-3" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
            {items.map(({ project }, i) => (
              <Segment
                key={project.slug}
                project={project}
                index={i}
                count={count}
                active={i === active}
                progress={scrollYProgress}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* --- The projects ---------------------------------------------------- */}
      <div className="lg:col-span-5">
        {items.map((item, i) => (
          <Chapter key={item.project.slug} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

/** One project's place in the stage's progress bar, and a jump to it. */
function Segment({
  project,
  index,
  count,
  active,
  progress,
}: {
  project: Project;
  index: number;
  count: number;
  active: boolean;
  progress: MotionValue<number>;
}) {
  // How far through this project the page is, 0 to 1.
  const fill = useTransform(progress, [index / count, (index + 1) / count], [0, 1], { clamp: true });
  return (
    <a
      href={`#project-${project.slug}`}
      aria-current={active ? "true" : undefined}
      className="group/seg block min-w-0"
    >
      <span className="relative block h-px overflow-hidden bg-hairline-strong">
        <motion.span
          className="absolute inset-0 block origin-left"
          style={{ backgroundColor: project.accent, scaleX: fill }}
        />
      </span>
      <span
        className={cn(
          "label mt-2.5 block truncate transition-colors",
          active ? "text-fg" : "text-faint group-hover/seg:text-muted",
        )}
      >
        {project.index} {project.name}
      </span>
    </a>
  );
}

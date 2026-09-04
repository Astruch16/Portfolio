import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { COMPOSITIONS } from "@/components/work/visuals";
import { caseStudyBySlug } from "@/data/case-studies";
import { projects, stackList, type Project } from "@/data/projects";
import { cn } from "@/lib/utils";
import { wordmarkProps } from "@/lib/wordmark";

/**
 * The complete project archive.
 *
 * Deliberately not the homepage's Selected Work rows: a scannable index built
 * for recruiters, with one featured anchor and compact editorial blocks for the
 * rest. Each project keeps the shared grid and type but takes its own accent, so
 * the page reads as one system with five distinct products. Data-driven and
 * server-rendered; the only motion is the shared reveal + CSS hover, the sticky
 * index is pure CSS, and nothing here invents a value that isn't in the data.
 */

export const metadata: Metadata = {
  title: "Work",
  description:
    "The complete archive — products, platforms and experiments designed, built and shipped.",
  alternates: { canonical: "/work" },
};

/** The project given the featured, full-width treatment at the top. */
const FEATURED_SLUG = "expird";

/** Corner registration brackets, drawn in the project's accent. */
const CORNERS = [
  "-left-px -top-px border-l-2 border-t-2",
  "-right-px -top-px border-r-2 border-t-2",
  "-left-px -bottom-px border-l-2 border-b-2",
  "-right-px -bottom-px border-r-2 border-b-2",
] as const;

/** Clears both the fixed nav and the sticky project index on anchor jumps. */
const SCROLL_MT = "scroll-mt-[calc(var(--nav-h)+3.5rem)]";

function ProjectPlate({
  project,
  priority = false,
  sizes,
}: {
  project: Project;
  priority?: boolean;
  sizes: string;
}) {
  const hero = caseStudyBySlug(project.slug)?.hero;
  const hasImage = Boolean(hero?.src && hero.width && hero.height);
  const Composition = COMPOSITIONS[project.visual];
  const accent = project.accent;

  return (
    <div className="group/plate relative isolate">
      {/* accent glow — brightens a touch on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-[7%] -inset-y-[13%] -z-10 opacity-50 blur-2xl transition-opacity duration-500 group-hover/plate:opacity-80"
        style={{
          background: `radial-gradient(ellipse at center, ${accent}26 0%, transparent 70%)`,
        }}
      />
      {CORNERS.map((corner) => (
        <span
          key={corner}
          aria-hidden
          className={cn("absolute z-10 block size-3", corner)}
          style={{ borderColor: accent }}
        />
      ))}

      <div className="relative overflow-hidden border border-hairline-strong bg-void">
        {hasImage ? (
          <Image
            src={hero!.src!}
            alt={hero!.alt ?? `${project.name} — primary screen`}
            width={hero!.width!}
            height={hero!.height!}
            quality={90}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={sizes}
            className="h-auto w-full"
          />
        ) : (
          <div className="aspect-[16/10]">
            <Composition accent={accent} />
          </div>
        )}
        {/* subtle accent veil on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/plate:opacity-100"
          style={{ background: `linear-gradient(to top, ${accent}1f, transparent 55%)` }}
        />
      </div>
    </div>
  );
}

function ProjectMeta({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const wordmark = wordmarkProps(project);
  const stack = stackList(project.stack);

  return (
    <div>
      <p className="label text-muted">
        <span style={{ color: project.accent }}>
          {featured ? "Featured" : project.index}
        </span>
        <span className="text-faint"> / </span>
        {featured ? `${project.index} · ${project.kind}` : project.kind}
      </p>

      <h2
        className={cn(
          "display mt-4 leading-[0.9]",
          featured
            ? "text-[clamp(2.5rem,7vw,5rem)]"
            : "text-[clamp(2rem,4.5vw,3.25rem)]",
        )}
      >
        <Link
          href={`/work/${project.slug}`}
          className="group/name inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <span
            className={cn(
              "inline-block transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/name:translate-x-1",
              wordmark?.className,
            )}
            style={wordmark?.style ?? { color: project.accent }}
          >
            {project.name}
          </span>
        </Link>
      </h2>

      <p className="label mt-4 text-muted">{project.discipline}</p>

      <p className="label mt-3">
        <span className="text-faint">Status </span>
        {project.status ? (
          <span style={{ color: project.accent }}>{project.status}</span>
        ) : (
          <span className="text-faint">[ pending ]</span>
        )}
      </p>

      <div className="mt-5 max-w-[46ch]">
        {project.statement ? (
          <p className="text-lead text-muted">{project.statement}</p>
        ) : (
          <p className="label text-faint">[ positioning pending ]</p>
        )}
      </div>

      <div className="mt-6">
        <p className="label text-faint">Stack</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {stack.length ? (
            stack.map((item) => (
              <span
                key={item}
                className="label rounded-sm border border-hairline px-2 py-1 text-muted"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="label text-faint">[ stack pending ]</span>
          )}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
        <Link
          href={`/work/${project.slug}`}
          className="group/cta label inline-flex items-center gap-2.5 text-fg transition-colors hover:text-fg"
        >
          View case study
          <ArrowRight
            aria-hidden
            strokeWidth={1.5}
            className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-1"
            style={{ color: project.accent }}
          />
        </Link>
        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="group/live label inline-flex items-center gap-2 text-muted transition-colors hover:text-fg"
          >
            Live site
            <ArrowUpRight aria-hidden strokeWidth={1.5} className="size-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function FeaturedBlock({ project }: { project: Project }) {
  return (
    <section id={project.slug} className={cn("relative overflow-x-clip", SCROLL_MT)}>
      <DrawLine onView className="absolute inset-x-0 top-0" />
      <div className="shell py-[clamp(4.5rem,11vh,8rem)]">
        <Lift onView className="max-w-3xl">
          <ProjectMeta project={project} featured />
        </Lift>
        <Lift onView delay={0.1} className="mt-[clamp(2.5rem,6vh,4rem)]">
          <ProjectPlate
            project={project}
            priority
            sizes="(min-width: 1024px) 88vw, 92vw"
          />
        </Lift>
      </div>
    </section>
  );
}

function ProjectBlock({
  project,
  reversed,
}: {
  project: Project;
  reversed: boolean;
}) {
  return (
    <section id={project.slug} className={cn("relative overflow-x-clip", SCROLL_MT)}>
      <DrawLine onView className="absolute inset-x-0 top-0" />
      <div className="shell shell-grid gap-y-8 py-[clamp(3rem,7vh,5.5rem)] lg:items-center">
        <Lift
          onView
          className={cn(
            "col-span-12 lg:col-span-5",
            reversed ? "lg:col-start-8" : "lg:col-start-1",
          )}
        >
          <ProjectMeta project={project} />
        </Lift>
        <Lift
          onView
          delay={0.08}
          className={cn(
            "col-span-12 lg:col-span-7",
            reversed ? "lg:col-start-1" : "lg:col-start-6",
          )}
        >
          <ProjectPlate
            project={project}
            sizes="(min-width: 1024px) 56vw, 92vw"
          />
        </Lift>
      </div>
    </section>
  );
}

export default function WorkPage() {
  const featured = projects.find((p) => p.slug === FEATURED_SLUG);
  const rest = projects.filter((p) => p.slug !== FEATURED_SLUG);

  return (
    <main data-surface="dark" className="bg-bg pb-[clamp(2rem,6vh,4rem)] text-fg">
      {/* --- Hero: short, gets you into the work fast --------------------- */}
      <header className="shell overflow-x-clip pt-[calc(var(--nav-h)+clamp(2.5rem,7vh,4.5rem))] pb-[clamp(2rem,5vh,3.25rem)]">
        <Lift as="p" className="label text-muted">
          <span className="text-accent">02</span>
          <span className="text-faint"> / </span>
          Work
        </Lift>

        <h1 className="display mt-[clamp(1.25rem,3.5vh,2.25rem)] text-section">
          <MaskReveal delay={0.06}>Selected</MaskReveal>
          <MaskReveal delay={0.12}>Projects.</MaskReveal>
        </h1>

        <Lift delay={0.18} className="mt-[clamp(1.25rem,3vh,2rem)] max-w-[46rem]">
          <p className="text-lead text-muted">
            Products, platforms and experiments I&rsquo;ve designed, built and
            shipped.
          </p>
        </Lift>

        <Lift
          delay={0.24}
          as="div"
          className="mt-[clamp(1.75rem,4.5vh,2.75rem)] flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-hairline pt-5"
        >
          <span className="label text-fg">{projects.length} Projects</span>
          <span className="label text-faint">
            Full-stack / Product / Design engineering
          </span>
        </Lift>
      </header>

      {/* --- Project index: sticky on desktop, horizontal rail on mobile --- */}
      <nav
        aria-label="Project index"
        className="sticky top-[var(--nav-h)] z-30 border-y border-hairline bg-bg/85 backdrop-blur-md"
      >
        <ul className="shell flex gap-x-6 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((project) => (
            <li key={project.slug} className="shrink-0">
              <a
                href={`#${project.slug}`}
                className="label whitespace-nowrap text-muted transition-colors hover:text-fg"
              >
                <span style={{ color: project.accent }}>{project.index}</span>
                <span className="ml-2">{project.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- Featured anchor --------------------------------------------- */}
      {featured ? <FeaturedBlock project={featured} /> : null}

      {/* --- The rest, alternating split blocks -------------------------- */}
      {rest.map((project, i) => (
        <ProjectBlock key={project.slug} project={project} reversed={i % 2 === 1} />
      ))}

      {/* --- Transition into the rest of the portfolio ------------------- */}
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
              href="/playground"
              className="group/p label inline-flex items-center gap-3 border border-hairline-strong px-5 py-3 text-fg transition-colors hover:bg-fg hover:text-bg"
            >
              Playground
              <ArrowRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/p:translate-x-1"
              />
            </Link>
          </Lift>
        </div>
      </section>
    </main>
  );
}

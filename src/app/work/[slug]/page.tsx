import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { CaseFooter } from "@/components/case/case-footer";
import { CaseHero } from "@/components/case/case-hero";
import { CaseSectionBlock } from "@/components/case/case-section";
import { DrawLine } from "@/components/motion/reveal";
import { caseStudyBySlug } from "@/data/case-studies";
import { projectBySlug, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = projectBySlug(slug);
  if (!project) return {};

  const study = caseStudyBySlug(slug);

  return {
    title: project.name,
    description: study?.summary ?? `${project.name} — ${project.discipline}.`,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const study = caseStudyBySlug(slug);
  const next =
    projects[(projects.findIndex((p) => p.slug === slug) + 1) % projects.length];

  // Most case studies run on the dark technical surface. Two are deliberate
  // exceptions, both defined additively in globals.css: My Local Loop on a warm
  // cream ground, Mintlytics on a midnight-navy market-terminal ground.
  const surface =
    project.slug === "my-local-loop"
      ? "warm"
      : project.slug === "mintlytics"
        ? "terminal"
        : "dark";

  // Projects without a written case study keep the deliberate holding page
  // rather than an empty shell of section headings.
  if (!study) {
    return (
      <article
        data-surface={surface}
        className="relative flex min-h-svh flex-col justify-end bg-bg pb-[clamp(3rem,10vh,7rem)] text-fg"
      >
        <div className="shell">
          <p className="label text-muted">
            <span style={{ color: project.accent }}>{project.index}</span>
            <span className="text-faint"> / </span>
            {project.kind}
          </p>
          <h1 className="display mt-6 text-section">{project.name}</h1>
          <p className="label mt-5 text-muted">{project.discipline}</p>
          <DrawLine className="mt-12 mb-6" />
          <p className="label text-faint">Case study in progress</p>
          <Link
            href="/#work-heading"
            className="group label mt-10 inline-flex items-center gap-3 text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft
              aria-hidden
              strokeWidth={1.5}
              className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-x-1"
            />
            Back to selected work
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article data-surface={surface} className="bg-bg pb-[clamp(2rem,6vh,4rem)] text-fg">
      <CaseHero project={project} study={study} />

      <div className="mt-[clamp(3rem,9vh,6rem)]">
        {study.sections.map((section) => (
          <CaseSectionBlock key={section.id} section={section} project={project} />
        ))}
      </div>

      <CaseFooter next={next} />
    </article>
  );
}

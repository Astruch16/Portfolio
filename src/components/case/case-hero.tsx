import { CaseHeroBoot } from "@/components/case/case-hero-boot";
import { CaseVisualFrame } from "@/components/case/case-visual";
import { Lift } from "@/components/motion/reveal";
import type { CaseStudy } from "@/data/case-studies";
import { stackList, type Project } from "@/data/projects";
import { wordmarkProps } from "@/lib/wordmark";

/**
 * The case study's opening: identification, one line of summary, the spec
 * sheet, then a wide plate. Same rail-and-hairline language as the work index,
 * scaled up — this is the same portfolio, one level deeper in.
 */

/**
 * Field colours for the spec sheet.
 *
 * At one uniform dim grey the five labels read as a single block and the eye
 * has nothing to catch on. Colour-coding them the way a technical drawing
 * codes its fields makes the sheet scannable — kept desaturated and at similar
 * luminance so it reads as a legend rather than a rainbow, and anchored on the
 * palette already in use: the project accent for its stack, and the site's
 * status lime for status.
 */
const FIELD_TONE: Record<string, string> = {
  Role: "#e6e6ea",
  Status: "#b6e53b",
  Timeline: "#7fb4c9",
  Live: "#e0a94f",
};

function Spec({
  label,
  tone,
  children,
}: {
  label: string;
  /** Stack takes the project's own colour; the rest come from FIELD_TONE. */
  tone?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5 border-t border-hairline py-3">
      <span
        className="label w-20 shrink-0"
        style={{ color: tone ?? FIELD_TONE[label] ?? "var(--surface-faint)" }}
      >
        {label}
      </span>
      <span className="label text-muted">{children}</span>
    </div>
  );
}

const PENDING = <span className="label text-faint">[ pending ]</span>;

export function CaseHero({ project, study }: { project: Project; study: CaseStudy }) {
  // The spec sheet gives each field one line, so the layers run together here.
  const stack = stackList(project.stack);

  return (
    // Clipped for the same reason as an exhibit section: the opening plate's
    // glow reaches past the shell and would otherwise scroll the page sideways.
    <header className="shell overflow-x-clip pt-[calc(var(--nav-h)+clamp(3rem,9vh,6rem))]">
      {/* Identifier → title → discipline → summary, assembled like a terminal
          booting (see CaseHeroBoot). The spec sheet and plate below arrive
          after the sequence settles. */}
      <CaseHeroBoot
        slug={project.slug}
        index={project.index}
        kind={project.kind}
        accent={project.accent}
        name={project.name}
        wordmark={wordmarkProps(project)}
        discipline={project.discipline}
        summary={study.summary}
      />

      <Lift delay={1.35} className="mt-[clamp(3rem,8vh,5rem)] max-w-[34rem]">
        <Spec label="Role">
          {study.role.length ? study.role.join("  /  ") : PENDING}
        </Spec>
        <Spec label="Stack" tone={project.accent}>
          {stack.length ? stack.join("  /  ") : PENDING}
        </Spec>
        <Spec label="Status">{project.status ?? PENDING}</Spec>
        <Spec label="Timeline">{study.timeline ?? PENDING}</Spec>
        <Spec label="Live">
          {study.live ? (
            // A URL becomes a link; anything else — "Private beta" — is a
            // status and stays plain text.
            study.live.startsWith("http") ? (
              <a
                href={study.live}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                {study.live.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              study.live
            )
          ) : (
            PENDING
          )}
        </Spec>
      </Lift>

      <Lift delay={1.5} className="mt-[clamp(3rem,8vh,6rem)]">
        <CaseVisualFrame visual={study.hero} project={project} priority />
      </Lift>
    </header>
  );
}

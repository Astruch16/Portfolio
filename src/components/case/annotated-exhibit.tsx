import { ProductExhibit, isExhibit } from "@/components/case/product-exhibit";
import { DrawLine, Lift } from "@/components/motion/reveal";
import type { CaseSection } from "@/data/case-studies";

/**
 * A product screen paired with a margin-note column.
 *
 * For a screen that only warrants inset width, the right half of the page would
 * otherwise sit empty. Here that space earns its keep: a small ledger of
 * annotations that read the screen — what each part is, and why a Local cares —
 * on a vertical accent spine, so the panel feels marked up rather than captioned.
 * Stacks under the screen on narrow viewports.
 */
export function AnnotatedExhibit({
  section,
  accent,
}: {
  section: Extract<CaseSection, { kind: "aside" }>;
  accent: string;
}) {
  if (!isExhibit(section.visual)) return null;

  return (
    <section id={section.id} className="relative overflow-x-clip">
      <DrawLine onView className="absolute inset-x-0 top-0" />

      <div className="shell grid gap-x-10 gap-y-10 py-[clamp(4rem,11vh,8rem)] lg:grid-cols-12">
        <Lift onView className="lg:col-span-8">
          <ProductExhibit visual={section.visual} accent={accent} />
        </Lift>

        <aside className="lg:col-span-4 lg:self-center">
          {/* perforated header — a quiet receipt edge for the savings ledger */}
          <p className="label border-b border-dashed border-hairline-strong pb-3 text-faint">
            {section.heading}
          </p>

          <ul className="relative mt-6">
            <span
              aria-hidden
              className="absolute bottom-5 left-[3px] top-5 block w-px bg-hairline-strong"
            />
            {section.notes.map((note, i) => (
              <Lift
                key={note.label}
                onView
                delay={i * 0.06}
                as="li"
                className="relative border-t border-hairline py-4 pl-7 first:border-t-0"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-[1.4rem] block size-[7px] rounded-full"
                  style={{
                    backgroundColor: accent,
                    // faint accent halo, matching the exhibit's glow language
                    boxShadow: `0 0 0 4px color-mix(in srgb, ${accent} 14%, transparent)`,
                  }}
                />
                <p className="label text-fg">{note.label}</p>
                <p className="mt-1.5 text-base text-muted">{note.body}</p>
              </Lift>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

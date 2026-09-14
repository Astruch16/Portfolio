import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Disciplines } from "@/components/about/disciplines";
import { PathStory } from "@/components/about/path-story";
import { AboutHero } from "@/components/about/about-hero";
import { ArrowSequence } from "@/components/case/arrow-sequence";
import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { about } from "@/data/about";

/**
 * The about page — a narrative, not a résumé.
 *
 * Rebuilt around the problem the old version had: five sections in a row all
 * shaped the same way, a numbered label on the left and a block of content on
 * the right. Every part was individually fine and the page as a whole had one
 * rhythm, so it read as a list of sections rather than as an argument.
 *
 * What changes here is structure, never a word of the copy:
 *
 * - It opens dark. The hero at / already owns the cream opening; leading with
 *   the same one made this page read as a lesser version of it.
 * - The story and the route are one scrolling chapter sequence: the prose
 *   plays out on the right while a panel on the left fills in the route and
 *   draws each place as the story reaches it.
 * - The three disciplines are a list set at reading size beside a diagram of
 *   where they overlap, each in its own colour — the capabilities were tiny
 *   grey labels, the one part a reader wants to scan and could barely see.
 * - The toolkit is a ruled index; it was a row of bordered pills, the one
 *   genuinely generic component on the site.
 * - The process reuses the arrow sequence the case studies already use, so
 *   Think → Ship reads as a sequence instead of five separate headings.
 */

export const metadata: Metadata = {
  title: "About",
  description:
    "I didn't start in software — I got here by building things I needed. Design engineering and full-stack product development.",
  alternates: { canonical: "/about" },
};

/** The rail label every section hangs off. */
function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <Lift onView as="p" className="label text-muted">
      <span className="text-accent">{index}</span>
      <span className="text-faint"> / </span>
      {children}
    </Lift>
  );
}

export default function AboutPage() {
  return (
    <main>
      <AboutHero />

      {/* === The path in — light ======================================== */}
      <div data-surface="light" className="bg-bg">
        <section className="relative overflow-x-clip">
          <div className="shell py-[clamp(3rem,8vh,5rem)]">
            <PathStory headline={about.path.headline} stops={about.path.stops} beats={about.path.beats} />
          </div>
        </section>
      </div>

      {/* === What I do — dark =========================================== */}
      <section data-surface="dark" className="relative overflow-x-clip bg-bg">
        <DrawLine onView className="absolute inset-x-0 top-0" />
        <div className="shell py-[clamp(4rem,11vh,8rem)]">
          <h2 className="display max-w-[18ch] text-statement text-fg">
            <MaskReveal onView>{about.areasHeadline}</MaskReveal>
          </h2>

          <div className="mt-[clamp(3rem,8vh,5.5rem)]">
            <Disciplines areas={about.areas} />
          </div>
        </div>
      </section>

      {/* === Toolkit, process, outside — light ========================== */}
      <div data-surface="light" className="bg-bg">
        <section className="relative overflow-x-clip">
          <div className="shell py-[clamp(4rem,11vh,8rem)]">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
              <SectionLabel index="02">The toolkit</SectionLabel>
              <Lift onView as="p" className="label max-w-[44ch] text-faint">
                {about.toolkitNote}
              </Lift>
            </div>

            {/* A ruled index. The previous row of bordered pills was the one
                genuinely generic component on the site. */}
            <ul className="mt-[clamp(2rem,5vh,3rem)] grid sm:grid-cols-2 lg:grid-cols-4">
              {about.toolkit.map((tool, i) => (
                <Lift
                  key={tool}
                  onView
                  delay={0.02 * i}
                  as="li"
                  className="flex items-baseline gap-4 border-t border-hairline py-4"
                >
                  <span className="label shrink-0 text-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.9375rem] tracking-[0.01em] text-fg">
                    {tool}
                  </span>
                </Lift>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative">
          <DrawLine onView className="absolute inset-x-0 top-0" />
          <div className="shell py-[clamp(4rem,11vh,8rem)]">
            <SectionLabel index="03">How I work</SectionLabel>

            {/* The same arrow sequence the case studies use, so five steps read
                as one movement instead of five separate headings. */}
            <div className="mt-[clamp(2rem,5vh,3rem)]">
              <ArrowSequence
                items={about.process.map((step) => step.word)}
                accent="var(--color-accent)"
              />
            </div>

            <ol className="mt-[clamp(2rem,5vh,3rem)] grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
              {about.process.map((step, i) => (
                <Lift key={step.word} onView delay={i * 0.06} as="li">
                  <p className="label text-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </Lift>
              ))}
            </ol>
          </div>
        </section>

        <section className="relative">
          <DrawLine onView className="absolute inset-x-0 top-0" />
          <div className="shell py-[clamp(3rem,8vh,5rem)]">
            <SectionLabel index="04">Outside the terminal</SectionLabel>
            {/* Four faint words on one line read as a footnote. Given the page's
                own type they read as part of the person. */}
            <ul className="mt-7 flex flex-wrap gap-x-[clamp(1.5rem,4vw,3.5rem)] gap-y-4">
              {about.outside.map((item, i) => (
                <Lift
                  key={item}
                  onView
                  delay={i * 0.06}
                  as="li"
                  className="display text-[clamp(1.15rem,2.4vw,1.85rem)] leading-none text-muted"
                >
                  {item}
                </Lift>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* === Closing — dark ============================================= */}
      <section
        data-surface="dark"
        className="relative overflow-x-clip bg-bg pb-[clamp(3rem,10vh,7rem)]"
      >
        <DrawLine onView className="absolute inset-x-0 top-0" />
        <div className="shell py-[clamp(4rem,11vh,8rem)]">
          <p className="label text-muted">
            <span className="text-accent">Next</span>
            <span className="text-faint"> / </span>
            Career direction
          </p>
          <h2 className="display mt-6 text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] text-fg">
            {about.closing.headline.map((line, i) => (
              <MaskReveal key={line} onView delay={i * 0.08}>
                {line}
              </MaskReveal>
            ))}
          </h2>
          <Lift onView delay={0.16} className="mt-6 max-w-[52ch]">
            <p className="text-lead text-muted">{about.closing.body}</p>
          </Lift>
          <Lift onView delay={0.22} className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="group/c label inline-flex items-center gap-3 bg-fg px-6 py-3.5 text-bg transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
            >
              Get in touch
              <ArrowRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/c:translate-x-1"
              />
            </Link>
            <Link
              href="/work"
              className="group/w label inline-flex items-center gap-3 border border-hairline-strong px-6 py-3.5 text-fg transition-colors hover:bg-fg hover:text-bg"
            >
              View work
              <ArrowRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/w:translate-x-1"
              />
            </Link>
          </Lift>
        </div>
      </section>
    </main>
  );
}

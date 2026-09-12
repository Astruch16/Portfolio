import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Progression } from "@/components/about/progression";
import { PortraitPlate } from "@/components/about/portrait-plate";
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
 * - The story is set as a spread — the first line pulled out at statement
 *   size, the rest in a proper measure beside it — instead of one column.
 * - The route in gets its own rail rather than borrowing the case studies'
 *   architecture diagram, which draws a data pipeline.
 * - The three disciplines run as full-width rows rather than three columns of
 *   bullets, which is what made them read as a skills list.
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
      {/* === Opening — dark ============================================== */}
      {/* `text-fg` belongs on the section, not on `main`: the token resolves
          against whichever surface the element sits in, and inheriting a colour
          computed under the light surface would paint the headline black on
          black. */}
      <section
        data-surface="dark"
        className="relative isolate overflow-x-clip bg-bg text-fg"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(255 255 255 / 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.02) 1px, transparent 1px)",
              backgroundSize: "clamp(64px, 7vw, 104px) clamp(64px, 7vw, 104px)",
              maskImage:
                "radial-gradient(ellipse 90% 60% at 40% 0%, #000 30%, transparent 100%)",
            }}
          />
          <div
            className="absolute -top-[10%] right-[6%] h-[34rem] w-[34rem] rounded-full opacity-40 blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgb(114 87 255 / 0.32) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="shell shell-grid items-end gap-y-[clamp(3rem,7vh,4.5rem)] pt-[calc(var(--nav-h)+clamp(3rem,9vh,6rem))] pb-[clamp(3.5rem,10vh,7rem)]">
          <div className="col-span-12 lg:col-span-7">
            <SectionLabel index="03">{about.eyebrow}</SectionLabel>

            <h1 className="display mt-[clamp(1.5rem,4vh,2.5rem)] text-[clamp(2.75rem,7.6vw,6rem)] leading-[0.9] text-fg">
              {about.headline.map((line, i) => (
                <MaskReveal key={line} delay={0.06 + i * 0.08}>
                  {line}
                </MaskReveal>
              ))}
            </h1>

            <Lift delay={0.24} className="mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[38ch]">
              <p className="text-lead text-muted">{about.lead}</p>
            </Lift>
          </div>

          {/* Held back to five columns and hung off the baseline, so the plate
              counterweights the headline instead of competing with it. */}
          {/* Capped rather than filling its columns: at full width the plate
              stood taller than the headline block and opened a void above it. */}
          <Lift delay={0.18} className="col-span-12 sm:col-span-7 lg:col-span-4 lg:col-start-9">
            <PortraitPlate className="max-w-[20rem] sm:ml-auto" />
          </Lift>
        </div>
      </section>

      {/* === The path in + the route — light ============================= */}
      <div data-surface="light" className="bg-bg">
        <section className="relative">
          <div className="shell py-[clamp(4rem,11vh,8rem)]">
            <SectionLabel index="01">The path in</SectionLabel>

            {/* A spread rather than a column: the opening line carries the
                weight and the rest sits beside it at a readable measure. */}
            <div className="mt-[clamp(2rem,5vh,3.5rem)] grid gap-x-[clamp(2rem,5vw,5rem)] gap-y-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                {/* One sentence, not the paragraph: a full paragraph set in
                    heavy uppercase display is a wall, not an opening line. */}
                <p className="display text-statement leading-[1.08] text-fg">
                  <MaskReveal onView>{about.storyLead}</MaskReveal>
                </p>
              </div>

              <Lift
                onView
                delay={0.12}
                className="flex flex-col gap-6 lg:col-span-5 lg:col-start-8 lg:pt-2"
              >
                {about.story.map((paragraph) => (
                  <p key={paragraph} className="text-lead text-muted">
                    {paragraph}
                  </p>
                ))}
              </Lift>
            </div>
          </div>
        </section>

        <section className="relative">
          <DrawLine onView className="absolute inset-x-0 top-0" />
          <div className="shell py-[clamp(4rem,11vh,8rem)]">
            <SectionLabel index="02">The route</SectionLabel>
            <div className="mt-[clamp(2.5rem,6vh,4rem)]">
              <Progression stops={about.progression} />
            </div>
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

          {/* Rows, not columns. Three short bullet lists side by side read as a
              skills grid; given the full width each discipline reads as a
              statement with its scope written out beside it. */}
          <ul className="mt-[clamp(2.5rem,7vh,4.5rem)]">
            {about.areas.map((area, i) => (
              <Lift
                key={area.title}
                onView
                delay={i * 0.08}
                as="li"
                className="grid gap-x-[clamp(2rem,5vw,5rem)] gap-y-5 border-t border-hairline py-[clamp(1.75rem,4vh,2.75rem)] last:border-b lg:grid-cols-12"
              >
                <div className="lg:col-span-4">
                  <p className="label text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="display mt-3 text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[0.95] text-fg">
                    {area.title}
                  </p>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <ul className="flex flex-wrap gap-x-6 gap-y-3">
                    {area.items.map((item) => (
                      <li key={item} className="label text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Lift>
            ))}
          </ul>
        </div>
      </section>

      {/* === Toolkit, process, outside — light ========================== */}
      <div data-surface="light" className="bg-bg">
        <section className="relative overflow-x-clip">
          <div className="shell py-[clamp(4rem,11vh,8rem)]">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
              <SectionLabel index="03">The toolkit</SectionLabel>
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
            <SectionLabel index="04">How I work</SectionLabel>

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
            <SectionLabel index="05">Outside the terminal</SectionLabel>
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

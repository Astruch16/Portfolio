import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ArchitectureDiagram } from "@/components/case/architecture-diagram";
import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * The about page — a narrative, not a résumé.
 *
 * Four surface regions give it rhythm rather than one long cream canvas: a light
 * hero + story + timeline, a dark "what I do", a light toolkit + process +
 * personal strip, and a dark closing. The nav inverts with each region via the
 * surface observer. Server-rendered; the only motion is the shared reveal
 * primitives and the timeline's one-time line draw, all reduced-motion aware.
 *
 * The portrait is a deliberate placeholder — swap the marked block for a
 * <next/image> when the real photo exists; nothing else needs to change.
 */

export const metadata: Metadata = {
  title: "About",
  description:
    "I didn't start in software — I got here by building things I needed. Design engineering and full-stack product development.",
  alternates: { canonical: "/about" },
};

/** Data-driven so each list stays easy to edit. */
const AREAS = [
  {
    title: "Design",
    items: [
      "Product thinking",
      "UI / UX",
      "Interaction design",
      "Design systems",
      "Prototyping",
    ],
  },
  {
    title: "Engineering",
    items: [
      "Full-stack development",
      "Frontend systems",
      "APIs",
      "Databases",
      "Authentication",
      "Performance",
    ],
  },
  {
    title: "Product",
    items: [
      "Problem discovery",
      "User feedback",
      "Iteration",
      "Shipping",
      "Analytics",
      "Growth thinking",
    ],
  },
] as const;

/** A working toolkit — never a skills-with-percentages list. */
const STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "PostgreSQL",
  "Neon",
  "Prisma",
  "Clerk",
  "NextAuth",
  "Vercel",
  "Git",
] as const;

const PROCESS = [
  { word: "Think", body: "Understand the problem before building the solution." },
  { word: "Design", body: "Make the experience clear before adding complexity." },
  {
    word: "Build",
    body: "Use the simplest architecture that can scale with the product.",
  },
  { word: "Test", body: "Put the product in front of real users and listen." },
  { word: "Ship", body: "Finish the thing, learn from it, and improve it." },
] as const;

const OUTSIDE = [
  "Real estate",
  "Pokémon",
  "Golf",
  "Building businesses",
] as const;

/** Corner registration brackets for the portrait frame. */
const CORNERS = [
  "-left-px -top-px border-l-2 border-t-2",
  "-right-px -top-px border-r-2 border-t-2",
  "-left-px -bottom-px border-l-2 border-b-2",
  "-right-px -bottom-px border-r-2 border-b-2",
] as const;

function PortraitPlaceholder() {
  return (
    <div className="group/portrait relative isolate aspect-[4/5] w-full max-w-[26rem] lg:ml-auto">
      {CORNERS.map((corner) => (
        <span
          key={corner}
          aria-hidden
          className={cn("absolute z-10 block size-3.5", corner)}
          style={{ borderColor: "var(--color-accent)" }}
        />
      ))}

      {/* Replace this block with:
          <Image src="/about/portrait.jpg" alt="…" fill sizes="(min-width:1024px) 26rem, 92vw" className="object-cover" />
          inside a `relative` wrapper — the frame and ratio already fit. */}
      <div
        className="absolute inset-0 border border-hairline-strong"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(17 17 17 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(17 17 17 / 0.05) 1px, transparent 1px)",
          backgroundSize: "clamp(28px, 4vw, 44px) clamp(28px, 4vw, 44px)",
        }}
      >
        <span className="label absolute left-3 top-3 text-faint tabular-nums">
          4 : 5
        </span>
        <span className="label absolute right-3 top-3 text-faint">
          IMG_001
        </span>
        <div className="absolute inset-0 grid place-items-center">
          <p className="label text-center text-muted">
            <span style={{ color: "var(--color-accent)" }}>Portrait</span>
            <span className="text-faint"> / </span>
            Pending
          </p>
        </div>
        <span className="label absolute bottom-3 left-3 text-faint">
          Replace &rarr; next/image
        </span>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="text-fg">
      {/* === Region 1 — light: hero, story, timeline ===================== */}
      <div data-surface="light" className="bg-bg">
        {/* Hero */}
        <header className="shell overflow-x-clip pt-[calc(var(--nav-h)+clamp(2.5rem,7vh,4.5rem))] pb-[clamp(2.5rem,6vh,4rem)]">
          <div className="shell-grid gap-y-12">
            <div className="col-span-12 lg:col-span-7">
              <Lift as="p" className="label text-muted">
                <span className="text-accent">03</span>
                <span className="text-faint"> / </span>
                About
              </Lift>

              <h1 className="display mt-[clamp(1.25rem,3.5vh,2.25rem)] text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.92]">
                <MaskReveal delay={0.06}>I didn&rsquo;t start</MaskReveal>
                <MaskReveal delay={0.12}>in software.</MaskReveal>
              </h1>

              <Lift delay={0.2} className="mt-[clamp(1.25rem,3vh,2rem)] max-w-[42rem]">
                <p className="text-lead text-muted">
                  I got here by building things I needed.
                </p>
              </Lift>
            </div>

            <Lift
              delay={0.16}
              className="col-span-12 lg:col-span-5 lg:col-start-8"
            >
              <PortraitPlaceholder />
            </Lift>
          </div>
        </header>

        {/* Story */}
        <section className="relative">
          <DrawLine onView className="absolute inset-x-0 top-0" />
          <div className="shell shell-grid gap-y-8 py-[clamp(3.5rem,9vh,6rem)]">
            <Lift onView as="p" className="label col-span-12 text-muted lg:col-span-3">
              <span className="text-accent">01</span>
              <span className="text-faint"> / </span>
              The path in
            </Lift>
            <div className="col-span-12 lg:col-span-8 lg:col-start-5">
              <Lift onView className="flex max-w-[62ch] flex-col gap-6">
                <p className="text-lead text-muted">
                  I came into software from a completely different path. My
                  background is in earth science and real estate, but over time I
                  became increasingly interested in building software to solve
                  problems I was experiencing myself.
                </p>
                <p className="text-lead text-muted">
                  What started as learning how to build simple tools gradually
                  turned into full products used by real people.
                </p>
                <p className="text-lead text-muted">
                  The part I enjoyed most wasn&rsquo;t only writing code. It was
                  taking an idea, understanding the problem, designing the
                  experience, building the system and turning it into something
                  people could actually use — which is what pushed me toward
                  design engineering and full-stack product development.
                </p>
              </Lift>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="relative">
          <DrawLine onView className="absolute inset-x-0 top-0" />
          <div className="shell shell-grid gap-y-8 py-[clamp(3.5rem,9vh,6rem)]">
            <Lift onView as="p" className="label col-span-12 text-muted lg:col-span-3">
              <span className="text-accent">02</span>
              <span className="text-faint"> / </span>
              The progression
            </Lift>
            <div className="col-span-12 lg:col-span-8 lg:col-start-5">
              <ArchitectureDiagram
                accent="var(--color-accent)"
                nodes={[
                  { label: "Earth science", note: "where I started" },
                  { label: "Real estate", note: "the problems I lived" },
                  { label: "Building internal tools", note: "solving my own" },
                  { label: "Shipping products", note: "used by real people" },
                  {
                    label: "Design engineering / software",
                    note: "design × build × product",
                  },
                ]}
              />
            </div>
          </div>
        </section>
      </div>

      {/* === Region 2 — dark: what I do ================================== */}
      <section data-surface="dark" className="relative overflow-x-clip bg-bg">
        <DrawLine onView className="absolute inset-x-0 top-0" />
        <div className="shell py-[clamp(4rem,11vh,8rem)]">
          <h2 className="display max-w-[20ch] text-statement text-fg">
            <MaskReveal onView>I like working across the whole product.</MaskReveal>
          </h2>

          <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-x-10 gap-y-12 md:grid-cols-3">
            {AREAS.map((area, i) => (
              <Lift key={area.title} onView delay={i * 0.08}>
                <p className="label text-accent">
                  <span className="text-faint">
                    {String(i + 1).padStart(2, "0")} /{" "}
                  </span>
                  {area.title}
                </p>
                <ul className="mt-4">
                  {area.items.map((item) => (
                    <li
                      key={item}
                      className="label border-t border-hairline py-2.5 text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Lift>
            ))}
          </div>
        </div>
      </section>

      {/* === Region 3 — light: toolkit, process, personal =============== */}
      <div data-surface="light" className="bg-bg">
        {/* Toolkit */}
        <section className="relative overflow-x-clip">
          <div className="shell shell-grid gap-y-8 py-[clamp(3.5rem,9vh,6rem)]">
            <Lift onView as="p" className="label col-span-12 text-muted lg:col-span-3">
              <span className="text-accent">03</span>
              <span className="text-faint"> / </span>
              The toolkit
            </Lift>
            <div className="col-span-12 lg:col-span-9 lg:col-start-4">
              <Lift onView>
                <p className="text-lead max-w-[46ch] text-muted">
                  A working set of tools I reach for, not a scoreboard.
                </p>
              </Lift>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {STACK.map((tool, i) => (
                  <Lift
                    key={tool}
                    onView
                    delay={i * 0.03}
                    as="span"
                    className="label rounded-sm border border-hairline px-3 py-2 text-muted"
                  >
                    {tool}
                  </Lift>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="relative">
          <DrawLine onView className="absolute inset-x-0 top-0" />
          <div className="shell py-[clamp(3.5rem,9vh,6rem)]">
            <Lift onView as="p" className="label text-muted">
              <span className="text-accent">04</span>
              <span className="text-faint"> / </span>
              How I work
            </Lift>
            <ol className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
              {PROCESS.map((step, i) => (
                <Lift key={step.word} onView delay={i * 0.06} as="li">
                  <p className="label text-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="display mt-2 text-[clamp(1.35rem,2.2vw,1.75rem)] leading-none text-fg">
                    {step.word}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </Lift>
              ))}
            </ol>
          </div>
        </section>

        {/* Personal — small, secondary */}
        <section className="relative">
          <DrawLine onView className="absolute inset-x-0 top-0" />
          <div className="shell flex flex-wrap items-baseline gap-x-8 gap-y-4 py-[clamp(2.5rem,6vh,4rem)]">
            <p className="label text-muted">
              <span className="text-accent">05</span>
              <span className="text-faint"> / </span>
              Outside the terminal
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-2">
              {OUTSIDE.map((item) => (
                <li key={item} className="label text-faint">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* === Region 4 — dark: closing =================================== */}
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
            <MaskReveal onView>Looking for</MaskReveal>
            <MaskReveal onView delay={0.08}>the right team.</MaskReveal>
          </h2>
          <Lift onView delay={0.16} className="mt-6 max-w-[52ch]">
            <p className="text-lead text-muted">
              I&rsquo;m interested in roles where design, engineering and product
              overlap — especially teams building ambitious software where I can
              stay close to both the user experience and the code.
            </p>
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

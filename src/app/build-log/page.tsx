import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BuildLogFeed } from "@/components/build-log/build-log-feed";
import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { buildLog, currentlyBuilding, currentlyLearning } from "@/data/build-log";

/**
 * The build log — a public engineering journal / changelog.
 *
 * Server-rendered around one small client island (the filterable feed). A dark,
 * utilitarian-terminal surface with a faint oversized grid, sparse registration
 * marks and one restrained purple glow — no matrix rain, no moving tickers, no
 * particles. Every entry is real work; nothing here is fabricated.
 */

export const metadata: Metadata = {
  title: "Build Log",
  description:
    "A running record of what I'm building, fixing and learning along the way.",
  alternates: { canonical: "/build-log" },
};

export default function BuildLogPage() {
  return (
    <main
      data-surface="dark"
      className="relative isolate overflow-x-clip bg-bg pb-[clamp(2rem,6vh,4rem)] text-fg"
    >
      {/* --- Background: faint grid + one purple glow + corner marks ----- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(255 255 255 / 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.02) 1px, transparent 1px)",
            backgroundSize: "clamp(64px, 7vw, 104px) clamp(64px, 7vw, 104px)",
            maskImage:
              "radial-gradient(ellipse 90% 60% at 50% 0%, #000 30%, transparent 100%)",
          }}
        />
        <div
          className="absolute -right-[10%] -top-[6%] h-[36rem] w-[36rem] rounded-full opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgb(114 87 255 / 0.35) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* --- Hero -------------------------------------------------------- */}
      <header className="shell pt-[calc(var(--nav-h)+clamp(2.5rem,7vh,4.5rem))] pb-[clamp(2rem,5vh,3.25rem)]">
        <Lift as="p" className="label text-muted">
          <span className="text-accent">04</span>
          <span className="text-faint"> / </span>
          Build Log
        </Lift>

        <h1 className="display mt-[clamp(1.25rem,3.5vh,2.25rem)] text-[clamp(2.5rem,7vw,5rem)] leading-[0.92]">
          <MaskReveal delay={0.04}>Building.</MaskReveal>
          <MaskReveal delay={0.09}>Breaking.</MaskReveal>
          <MaskReveal delay={0.14}>Learning.</MaskReveal>
          <MaskReveal delay={0.19}>
            <span className="text-accent">Shipping.</span>
          </MaskReveal>
        </h1>

        <Lift delay={0.24} className="mt-[clamp(1.25rem,3vh,2rem)] max-w-[46rem]">
          <p className="text-lead text-muted">
            A running record of what I&rsquo;m building, fixing and learning along
            the way.
          </p>
        </Lift>

        <Lift
          delay={0.3}
          as="div"
          className="mt-[clamp(1.75rem,4.5vh,2.75rem)] flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hairline pt-5"
        >
          <span className="label inline-flex items-center gap-2 text-fg">
            <span aria-hidden className="signal-dot" />
            Status / Active
          </span>
          <span className="label text-faint">Updated / Manually</span>
        </Lift>
      </header>

      {/* --- Currently building ----------------------------------------- */}
      <section className="relative">
        <DrawLine onView className="absolute inset-x-0 top-0" />
        <div className="shell py-[clamp(3rem,7vh,5rem)]">
          <p className="label text-muted">
            <span className="text-accent">Now</span>
            <span className="text-faint"> / </span>
            Currently building
          </p>
          <ul className="mt-6 border-t border-hairline">
            {currentlyBuilding.map((item, i) => (
              <Lift
                key={item.name}
                onView
                delay={i * 0.05}
                as="li"
                className="grid grid-cols-1 gap-x-6 gap-y-2 border-b border-hairline py-5 sm:grid-cols-[12rem_1fr_auto] sm:items-baseline"
              >
                <span className="display text-[clamp(1.15rem,2vw,1.5rem)] leading-none text-fg">
                  {item.slug ? (
                    <Link
                      href={`/work/${item.slug}`}
                      className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    item.name
                  )}
                </span>
                <span className="flex flex-wrap gap-x-2 gap-y-1">
                  {item.focus.map((f, j) => (
                    <span key={f} className="label text-muted">
                      {f}
                      {j < item.focus.length - 1 ? (
                        <span className="text-faint"> ·</span>
                      ) : null}
                    </span>
                  ))}
                </span>
                <span className="label inline-flex items-center gap-2 text-signal">
                  <span aria-hidden className="signal-dot" />
                  {item.status}
                </span>
              </Lift>
            ))}
          </ul>
        </div>
      </section>

      {/* --- The log ----------------------------------------------------- */}
      <section className="relative" aria-label="Log entries">
        <DrawLine onView className="absolute inset-x-0 top-0" />
        <div className="shell py-[clamp(3.5rem,9vh,6rem)]">
          <p className="label text-muted">
            <span className="text-accent">Log</span>
            <span className="text-faint"> / </span>
            Entries
          </p>
          <div className="mt-8">
            <BuildLogFeed entries={buildLog} />
          </div>
        </div>
      </section>

      {/* --- Currently learning ----------------------------------------- */}
      <section className="relative">
        <DrawLine onView className="absolute inset-x-0 top-0" />
        <div className="shell flex flex-wrap items-baseline gap-x-8 gap-y-4 py-[clamp(2.5rem,6vh,4rem)]">
          <p className="label text-muted">
            <span className="text-accent">Learning</span>
            <span className="text-faint"> / </span>
            Currently
          </p>
          <ul className="flex flex-wrap gap-2">
            {currentlyLearning.map((topic) => (
              <li
                key={topic}
                className="label rounded-sm border border-hairline px-3 py-1.5 text-muted"
              >
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Philosophy interlude --------------------------------------- */}
      <section className="relative overflow-x-clip">
        <DrawLine onView className="absolute inset-x-0 top-0" />
        <div className="shell py-[clamp(4rem,12vh,9rem)]">
          <p className="display text-[clamp(1.9rem,6vw,4.5rem)] leading-[1.0] text-fg">
            <MaskReveal onView>Ship it.</MaskReveal>
            <MaskReveal onView delay={0.06}>Watch it break.</MaskReveal>
            <MaskReveal onView delay={0.12}>Learn why.</MaskReveal>
            <MaskReveal onView delay={0.18}>
              <span className="text-accent">Fix it.</span>
            </MaskReveal>
          </p>
        </div>
      </section>

      {/* --- CTA --------------------------------------------------------- */}
      <section className="relative">
        <DrawLine onView className="absolute inset-x-0 top-0" />
        <div className="shell py-[clamp(4rem,10vh,7rem)]">
          <p className="label text-muted">Want the polished version?</p>
          <h2 className="display mt-5 text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] text-fg">
            <MaskReveal onView>View the work.</MaskReveal>
          </h2>
          <Lift onView delay={0.14} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/work"
              className="group/w label inline-flex items-center gap-3 bg-fg px-6 py-3.5 text-bg transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
            >
              Selected work
              <ArrowRight
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/w:translate-x-1"
              />
            </Link>
            <Link
              href="/playground"
              className="group/p label inline-flex items-center gap-3 border border-hairline-strong px-6 py-3.5 text-fg transition-colors hover:bg-fg hover:text-bg"
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

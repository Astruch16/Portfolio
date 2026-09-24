import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { BuildLogFeed } from "@/components/build-log/build-log-feed";
import { SignalField } from "@/components/visuals/signal-field";
import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import {
  buildLog,
  currentlyBuilding,
  currentlyLearning,
} from "@/data/build-log";

/**
 * The build log — a public engineering journal / changelog.
 *
 * Server-rendered around one client island: the log itself, which is searched,
 * filtered and opened entry by entry in the browser, since the dataset is tiny.
 * A dark, utilitarian-terminal surface with a faint oversized grid and one
 * restrained purple glow. The readings under the headline are counted from the
 * entries — every entry is real work, and nothing here is fabricated.
 */

export const metadata: Metadata = {
  title: "Build Log",
  description:
    "A running record of what I'm building, fixing and learning along the way.",
  alternates: { canonical: "/build-log" },
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function BuildLogPage() {
  // Counted from the entries themselves, so the page can't claim a number the
  // log doesn't back up.
  const dates = buildLog.map((entry) => entry.date).sort();
  const newest = [...buildLog].sort((a, b) => b.date.localeCompare(a.date))[0];
  const latest = dates[dates.length - 1].replaceAll("-", ".");
  const readings = [
    { value: pad(buildLog.length), label: "Entries" },
    { value: pad(new Set(dates).size), label: "Active days" },
    {
      value: pad(
        new Set(buildLog.map((entry) => entry.project).filter(Boolean)).size,
      ),
      label: "Projects",
    },
    {
      value: pad(
        new Set(buildLog.flatMap((entry) => entry.technologies ?? [])).size,
      ),
      label: "Technologies",
    },
  ];

  return (
    <main
      data-surface="dark"
      className="relative isolate overflow-x-clip bg-bg pb-[clamp(2rem,6vh,4rem)] text-fg"
    >
      {/* --- Background: faint grid + one purple glow + corner marks ----- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* The drifting field the site's other dark openings carry. */}
        <SignalField
          strength={0.22}
          className="absolute inset-x-0 top-0 h-[min(46rem,105svh)] w-full [mask-image:linear-gradient(to_bottom,#000_45%,transparent)]"
        />
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

      {/* --- Hero --------------------------------------------------------
          Two columns rather than one: the headline had the width of the page
          and used a third of it. The log's own readings and its newest entry
          hold the other side now — which is also the fastest way in for
          anyone who came to see what changed. */}
      <header className="shell grid gap-x-[clamp(2rem,4vw,4.5rem)] gap-y-12 pt-[calc(var(--nav-h)+clamp(2.5rem,8vh,5.5rem))] pb-[clamp(2.5rem,7vh,4.5rem)] lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Lift as="p" className="label text-muted">
            <span className="text-accent">04</span>
            <span className="text-faint"> / </span>
            Build Log
          </Lift>

          {/* Four heavy lines at the display face's own leading read as one
              block of ink. Opened up, and the three that set up the last one
              held a tone back, so the line that matters carries. */}
          <h1 className="display mt-[clamp(1.5rem,4vh,2.5rem)] text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.06]">
            <MaskReveal delay={0.04}>
              <span className="text-fg/70">Building.</span>
            </MaskReveal>
            <MaskReveal delay={0.09}>
              <span className="text-fg/80">Breaking.</span>
            </MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="text-fg/90">Learning.</span>
            </MaskReveal>
            <MaskReveal delay={0.19}>
              <span className="text-accent">Shipping</span>
            </MaskReveal>
          </h1>

          <Lift delay={0.24} className="mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[42rem]">
            <p className="text-lead text-muted">
              A running record of what I&rsquo;m building, fixing and learning
              along the way.
            </p>
          </Lift>

          <Lift
            delay={0.3}
            as="p"
            className="label mt-7 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-fg"
          >
            <span aria-hidden className="signal-dot" />
            Status / Active
            <span className="text-faint">
              · Updated manually · Latest {latest}
            </span>
          </Lift>
        </div>

        {/* --- What the log adds up to, and the newest thing in it ------- */}
        <div className="lg:col-span-5">
          <Lift
            delay={0.2}
            as="div"
            className="grid grid-cols-2 gap-px border border-hairline bg-hairline"
          >
            {readings.map((reading) => (
              <div key={reading.label} className="bg-bg px-5 py-5">
                <p className="font-mono text-[clamp(1.75rem,2.6vw,2.5rem)] leading-none tracking-[-0.04em] text-fg tabular-nums">
                  {reading.value}
                </p>
                <p className="label mt-2.5 text-faint">{reading.label}</p>
              </div>
            ))}
          </Lift>

          <Lift delay={0.28} className="mt-5">
            <Link
              href={`#${newest.id}`}
              className="group/new relative isolate block overflow-hidden border border-hairline-strong p-6 transition-colors duration-500 hover:border-accent"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[linear-gradient(to_top,rgb(114_87_255/0.16),transparent)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/new:scale-y-100"
              />
              <span className="label flex items-center justify-between gap-4 text-faint">
                <span>
                  <span className="text-accent">Newest</span>
                  <span className="text-faint/60"> / </span>
                  <span className="tabular-nums">
                    {newest.date.replaceAll("-", ".")}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-4 text-muted transition-all duration-300 ease-[var(--ease-out-expo)] group-hover/new:-translate-y-0.5 group-hover/new:translate-x-0.5 group-hover/new:text-fg"
                />
              </span>

              <span className="mt-4 block text-[clamp(1.2rem,1.9vw,1.6rem)] leading-[1.15] tracking-[-0.02em] text-fg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/new:translate-x-1.5">
                {newest.title}
              </span>
              <span className="mt-3 block text-muted">{newest.summary}</span>
            </Link>
          </Lift>
        </div>
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
            <MaskReveal onView delay={0.06}>
              Watch it break.
            </MaskReveal>
            <MaskReveal onView delay={0.12}>
              Learn why.
            </MaskReveal>
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

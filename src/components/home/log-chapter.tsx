"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { buildLog, type BuildLogType } from "@/data/build-log";
import { TYPE_META } from "@/lib/build-log-types";
import { cn } from "@/lib/utils";

/**
 * 03 — From the build log.
 *
 * The newest entries, on a timeline whose line fills as the page scrolls past
 * it, each node lighting in its entry's colour as the line reaches it. The
 * heading side stays pinned beside them on a wide screen, with a tally of the
 * whole log by kind — counted from the data — and the way into the full log.
 *
 * Every entry here is an entry in `build-log.ts`, shown as written.
 */

const SHOWN = 4;
const formatDate = (date: string) => date.replaceAll("-", ".");

export function LogChapter() {
  const timeline = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: timeline, offset: ["start 70%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  const sorted = [...buildLog].sort((a, b) => (a.date < b.date ? 1 : -1));
  const latest = sorted.slice(0, SHOWN);
  const tally = (Object.keys(TYPE_META) as BuildLogType[])
    .map((type) => ({ type, count: buildLog.filter((e) => e.type === type).length }))
    .filter((t) => t.count > 0);

  return (
    <section
      id="build-log"
      data-surface="dark"
      data-chapter="03"
      aria-labelledby="log-heading"
      className="relative isolate z-20 overflow-hidden bg-bg py-[clamp(5rem,14vh,10rem)] text-fg"
    >
      {/* --- Background: a dot grid, a slow scan line, one glow -------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_50%,#000,transparent)]"
          style={{
            backgroundImage: "radial-gradient(rgb(255 255 255 / 0.09) 1px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="log-scan absolute inset-x-0 h-40 bg-[linear-gradient(to_bottom,transparent,rgb(114_87_255/0.07),transparent)]" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgb(114_87_255/0.18),transparent_65%)] blur-2xl" />
      </div>
      <DrawLine onView className="absolute inset-x-0 top-0" />

      <div className="shell grid gap-y-14 lg:grid-cols-12 lg:gap-x-[clamp(2rem,4vw,4.5rem)]">
        {/* --- Heading side --------------------------------------------------- */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)]">
            <Lift onView as="p" className="label text-muted">
              <span className="text-accent">03</span>
              <span className="text-faint"> / </span>Build log
            </Lift>
            <h2 id="log-heading" className="display mt-[clamp(1.5rem,4vh,2.5rem)] text-[clamp(2.5rem,5vw,4.75rem)] leading-[0.9]">
              <MaskReveal onView delay={0.05}>Building.</MaskReveal>
              <MaskReveal onView delay={0.1}>Breaking.</MaskReveal>
              <MaskReveal onView delay={0.15}>Learning.</MaskReveal>
              <MaskReveal onView delay={0.2}>
                <span className="text-accent">Shipping.</span>
              </MaskReveal>
            </h2>
            <Lift onView delay={0.25} as="p" className="mt-6 max-w-[34ch] text-muted">
              A running record of what I&rsquo;m building, fixing and learning along the way.
            </Lift>

            <Lift onView delay={0.3} className="mt-10 border-t border-hairline pt-4">
              <p className="label text-faint">
                <span className="text-fg tabular-nums">{String(buildLog.length).padStart(2, "0")}</span> entries
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {tally.map(({ type, count }) => (
                  <li key={type} className="label flex items-center gap-2 text-muted">
                    <span aria-hidden className="block size-1.5 rounded-full" style={{ backgroundColor: TYPE_META[type].color }} />
                    {TYPE_META[type].filter}
                    <span className="text-faint tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            </Lift>

            <Lift onView delay={0.36} className="mt-10">
              <Link
                href="/build-log"
                className="group/log label inline-flex items-center gap-4 border border-hairline-strong px-5 py-3.5 text-fg transition-colors hover:border-accent"
              >
                Read the full log
                <span aria-hidden className="transition-transform duration-300 group-hover/log:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </Lift>
          </div>
        </div>

        {/* --- Timeline ----------------------------------------------------------- */}
        <ol ref={timeline} className="relative lg:col-span-8" aria-label="Latest build log entries">
          <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-hairline" />
          <motion.span
            aria-hidden
            className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-[linear-gradient(to_bottom,#7257ff,#b6e53b)]"
            style={{ scaleY: fill }}
          />

          {latest.map((entry, i) => {
            const meta = TYPE_META[entry.type];
            return (
              <li key={entry.id} className="relative pb-[clamp(2.5rem,6vh,4rem)] pl-10 last:pb-0">
                <motion.span
                  aria-hidden
                  className="absolute top-1.5 left-0 block size-[11px] rounded-full border border-hairline-strong bg-bg"
                  initial={{ scale: 0.6, backgroundColor: "#0b0b0b" }}
                  whileInView={{ scale: 1, backgroundColor: meta.color, boxShadow: `0 0 0 6px ${meta.color}22` }}
                  viewport={{ once: true, margin: "0px 0px -45% 0px" }}
                  transition={{ duration: 0.5 }}
                />

                <Lift onView delay={0.04}>
                  <Link href="/build-log" className="group/entry block">
                    <p className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-faint">
                      <time className="tabular-nums" dateTime={entry.date}>
                        {formatDate(entry.date)}
                      </time>
                      <span
                        className="border px-1.5 py-0.5"
                        style={{ color: meta.color, borderColor: `${meta.color}55` }}
                      >
                        {meta.badge}
                      </span>
                      {entry.project ? <span>{entry.project}</span> : null}
                    </p>
                    <h3
                      className={cn(
                        "mt-3 text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.1] tracking-[-0.025em] text-fg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/entry:translate-x-1.5",
                        i === 0 && "text-[clamp(1.6rem,3vw,2.5rem)]",
                      )}
                    >
                      {entry.title}
                      <span aria-hidden className="ml-2 inline-block text-accent opacity-0 transition-opacity group-hover/entry:opacity-100">
                        &rarr;
                      </span>
                    </h3>
                    <p className="mt-3 max-w-[60ch] text-muted">{entry.summary}</p>
                    {entry.technologies?.length ? (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {entry.technologies.map((tech) => (
                          <li key={tech} className="border border-hairline px-2 py-1 font-mono text-[0.6875rem] text-faint">
                            {tech}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Link>
                </Lift>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

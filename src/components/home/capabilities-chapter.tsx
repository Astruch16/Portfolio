"use client";

import Link from "next/link";
import { useState } from "react";

import { sequenceToneLight } from "@/components/case/sequence-tones";
import { DrawLine, Lift, MaskReveal } from "@/components/motion/reveal";
import { about } from "@/data/about";
import { cn } from "@/lib/utils";

/**
 * 02 — What I do.
 *
 * The about page's three disciplines as a row of panels. One is always open —
 * the first, until the visitor points at or tabs into another — and the open
 * panel turns to ink, widens, draws its figure and lists what that discipline
 * covers. The closed ones stay narrow and cream, with their title and count, so
 * all three are always readable and one is always being read.
 *
 * Under them, the toolkit runs past in two bands moving opposite ways. Every
 * word here is from `about.ts`.
 */

const ACCENT = "#7257ff";
const pad = (i: number) => String(i + 1).padStart(2, "0");

/* --- Figures: one line drawing per discipline ------------------------------- */

const FIGURES: React.ReactNode[] = [
  // Design — a pen path with its anchors and one handle pulled out.
  <>
    <path d="M14 96 C 44 20, 92 20, 118 64 S 176 118, 206 40" />
    <path d="M118 64 L 150 30" strokeDasharray="3 4" />
    <rect x="10" y="92" width="8" height="8" />
    <rect x="114" y="60" width="8" height="8" />
    <rect x="202" y="36" width="8" height="8" />
    <circle cx="150" cy="30" r="4" />
  </>,
  // Engineering — a system in layers, joined.
  <>
    <path d="M110 14 L 196 42 L 110 70 L 24 42 Z" />
    <path d="M24 64 L 110 92 L 196 64" />
    <path d="M24 86 L 110 114 L 196 86" />
    <path
      d="M24 42 L 24 86 M 196 42 L 196 86 M 110 70 L 110 114"
      strokeDasharray="3 4"
    />
  </>,
  // Product — the loop: ship, learn, change, again.
  <>
    <path d="M60 64 A 50 44 0 1 1 110 108" />
    <path d="M110 108 L 100 100 M 110 108 L 100 116" />
    <circle cx="160" cy="64" r="4" />
    <circle cx="110" cy="20" r="4" />
    <circle cx="60" cy="64" r="4" />
    <path d="M150 64 L 206 64" strokeDasharray="3 4" />
  </>,
];

function Figure({
  index,
  on,
  tone,
}: {
  index: number;
  on: boolean;
  tone: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 128"
      className="h-auto w-full max-w-[16rem] overflow-visible"
      fill="none"
      stroke={on ? tone : "currentColor"}
      strokeWidth="1.5"
      style={{ transition: "stroke 500ms var(--ease-out-quart)" }}
    >
      {/* Keyed on `on`, so the drawing replays each time the panel opens. */}
      <g
        key={on ? "on" : "off"}
        className={on ? "capability-draw" : "opacity-40"}
      >
        {FIGURES[index]}
      </g>
    </svg>
  );
}

/* --- Toolkit bands ----------------------------------------------------------- */

function Band({
  items,
  reverse = false,
}: {
  items: readonly string[];
  reverse?: boolean;
}) {
  // Two copies side by side, so the loop is seamless at -50%.
  const run = [...items, ...items];
  return (
    <div className="group/band flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
      <ul
        className={cn(
          "marquee flex shrink-0 items-center gap-[clamp(1.5rem,3vw,3rem)] pr-[clamp(1.5rem,3vw,3rem)] group-hover/band:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {run.map((item, i) => (
          <li
            key={`${item}-${i}`}
            aria-hidden={i >= items.length}
            className="flex items-center gap-[clamp(1.5rem,3vw,3rem)] whitespace-nowrap"
          >
            <span
              className={cn(
                "display text-[clamp(2rem,5vw,4.5rem)] leading-none",
                i % 2
                  ? "text-transparent [-webkit-text-stroke:1px_var(--surface-fg)]"
                  : "text-fg",
              )}
            >
              {item}
            </span>
            <span
              aria-hidden
              className="font-mono text-[clamp(1rem,2vw,1.5rem)] text-accent"
            >
              {["{ }", "</>", "=>", "&&"][i % 4]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --- Chapter ------------------------------------------------------------------ */

export function CapabilitiesChapter() {
  const [open, setOpen] = useState(0);

  return (
    <section
      id="capabilities"
      data-surface="light"
      data-chapter="02"
      aria-labelledby="capabilities-heading"
      className="relative isolate z-20 overflow-hidden bg-bg py-[clamp(5rem,14vh,10rem)] text-fg"
    >
      {/* --- Background: the hero's paper grid, and a slow purple spill ------ */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000,transparent)]" />
        <div className="capability-spill absolute top-[-20%] left-[-10%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(circle,rgb(114_87_255/0.14),transparent_65%)]" />
      </div>

      <div className="shell">
        <div className="grid gap-y-8 lg:grid-cols-12 lg:items-end lg:gap-x-[clamp(2rem,4vw,4.5rem)]">
          <div className="lg:col-span-8">
            <Lift onView as="p" className="label text-muted">
              <span className="text-accent">02</span>
              <span className="text-faint"> / </span>What I do
            </Lift>
            <h2
              id="capabilities-heading"
              className="display mt-[clamp(1.5rem,4vh,2.5rem)] text-[clamp(2.5rem,6.2vw,6rem)] leading-[0.9]"
            >
              <MaskReveal onView delay={0.06}>
                {about.areasHeadline}
              </MaskReveal>
            </h2>
          </div>
          <Lift
            onView
            delay={0.2}
            className="lg:col-span-4 lg:justify-self-end"
          >
            <Link
              href="/about"
              className="group/more label inline-flex items-center gap-3 text-fg"
            >
              <span className="relative">
                The longer story
                <span className="absolute -bottom-1.5 left-0 block h-px w-full origin-left bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/more:scale-x-0" />
              </span>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover/more:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </Lift>
        </div>

        {/* --- The panels ---------------------------------------------------- */}
        <DrawLine onView className="mt-[clamp(2.5rem,6vh,4rem)]" />
        <ol className="flex flex-col lg:h-[clamp(27rem,64vh,38rem)] lg:flex-row">
          {about.areas.map((area, i) => {
            const on = i === open;
            const tone = i === 0 ? ACCENT : sequenceToneLight(i, ACCENT);
            return (
              <li
                key={area.title}
                onPointerEnter={() => setOpen(i)}
                onFocusCapture={() => setOpen(i)}
                className={cn(
                  "relative isolate flex min-w-0 flex-col overflow-hidden border-b border-hairline transition-[flex-grow,background-color,color] duration-700 ease-[var(--ease-out-expo)] lg:border-r lg:border-b-0 lg:last:border-r-0",
                  // Sized by growth only on a wide screen: stacked, each panel
                  // is as tall as its own content.
                  "lg:basis-0",
                  on ? "bg-ink text-paper lg:grow-[2.4]" : "lg:grow",
                )}
              >
                {/* The open panel's own light, in its colour. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1/4 -bottom-1/3 -z-10 size-[28rem] rounded-full blur-3xl transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(circle, ${tone}55, transparent 65%)`,
                    opacity: on ? 1 : 0,
                  }}
                />

                {/* A real control, so the panels open from the keyboard too. */}
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`capability-${i}`}
                  onClick={() => setOpen(i)}
                  className="flex w-full items-baseline justify-between gap-4 p-[clamp(1.25rem,2.4vw,2rem)] text-left"
                >
                  <span
                    className="label"
                    style={{ color: on ? tone : undefined }}
                  >
                    {pad(i)}
                  </span>
                  <span
                    className={cn(
                      "label transition-colors",
                      on ? "text-paper/50" : "text-faint",
                    )}
                  >
                    {area.items.length} areas
                  </span>
                </button>

                <div className="flex flex-1 flex-col px-[clamp(1.25rem,2.4vw,2rem)] pb-[clamp(1.25rem,2.4vw,2rem)]">
                  {/* The figure sits above the title and only while the panel is
                      open; a closed panel is too narrow to hold a drawing. */}
                  <div
                    className={cn(
                      "flex min-h-0 flex-1 items-center transition-opacity duration-500 max-lg:hidden",
                      on ? "opacity-100 delay-200" : "opacity-0",
                    )}
                    style={{ color: on ? undefined : "transparent" }}
                  >
                    {on ? <Figure index={i} on={on} tone={tone} /> : null}
                  </div>

                  {/* Closed, a panel is too narrow for its title across — so it
                      reads up the panel instead, the way a spine does. */}
                  <h3
                    className={cn(
                      "display leading-[0.9]",
                      on
                        ? "text-[clamp(2.25rem,3.8vw,3.5rem)]"
                        : "text-[clamp(1.5rem,2.2vw,2rem)] lg:mt-auto lg:max-h-full lg:rotate-180 lg:[writing-mode:vertical-rl]",
                    )}
                  >
                    {area.title}
                  </h3>

                  <ul
                    id={`capability-${i}`}
                    className={cn(
                      "grid gap-x-8 overflow-hidden transition-[opacity,max-height,margin] duration-700 ease-[var(--ease-out-expo)] sm:grid-cols-2",
                      on
                        ? "mt-6 max-h-96 opacity-100"
                        : "mt-6 max-lg:max-h-96 lg:mt-0 lg:max-h-0 lg:opacity-0",
                    )}
                  >
                    {area.items.map((item, j) => (
                      <li
                        key={item}
                        className={cn(
                          "flex items-center gap-3 border-t py-2 text-[0.875rem] tracking-[-0.005em]",
                          on ? "border-paper/15" : "border-hairline",
                        )}
                        style={
                          on
                            ? {
                                animation: `capability-item 600ms var(--ease-out-expo) ${120 + j * 45}ms both`,
                              }
                            : undefined
                        }
                      >
                        <span
                          aria-hidden
                          className="block h-px w-3 shrink-0"
                          style={{ backgroundColor: tone }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
        <DrawLine onView />
      </div>

      {/* --- Toolkit ------------------------------------------------------------ */}
      <div className="mt-[clamp(4rem,10vh,7rem)]">
        <div className="shell flex items-baseline justify-between gap-6">
          <Lift onView as="p" className="label text-muted">
            Toolkit
          </Lift>
          <Lift onView delay={0.08} as="p" className="label text-faint">
            {about.toolkitNote}
          </Lift>
        </div>
        <p className="sr-only">{about.toolkit.join(", ")}</p>
        <div
          aria-hidden
          className="mt-8 flex flex-col gap-[clamp(0.75rem,2vh,1.5rem)]"
        >
          <Band items={about.toolkit.slice(0, 6)} />
          <Band items={about.toolkit.slice(6)} reverse />
        </div>
      </div>
    </section>
  );
}

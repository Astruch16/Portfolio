"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

import { FIGURE_META, PathFigure, type FigureKind } from "@/components/about/path-figures";
import { PathMoments, type Moment } from "@/components/about/path-moments";
import { sequenceToneLight } from "@/components/case/sequence-tones";
import { cn } from "@/lib/utils";

/**
 * The route into software, told as a scroll.
 *
 * This used to be two quiet sections — the story as a spread, then the route
 * as a separate rail underneath — so the reader met the same journey twice and
 * neither half had any pull. Here they are one thing: the prose plays out as
 * chapters on the right, and a panel on the left stays with the reader, filling
 * in the route and drawing each place as the story reaches it.
 *
 * The chapter being read is tracked with a single IntersectionObserver over a
 * band in the middle of the viewport — whichever chapter crosses the band is
 * the current one. One observer, one state value, no scroll listener.
 *
 * On a wide viewport the chapters that aren't being read step back, so the eye
 * lands on the current one; on a narrow one everything stays at full contrast,
 * because there is no panel to follow and dimmed text on a phone is just harder
 * to read.
 */

type Stop = { label: string; note: string };
type Beat = {
  stops: readonly number[];
  figure: FigureKind;
  text: string;
  /** What happened at this stop, played out by scroll under the paragraph. */
  moments?: readonly Moment[];
};

const ACCENT = "var(--color-accent)";
const index = (i: number) => String(i + 1).padStart(2, "0");

/** The chapter's place on the route, written as its stops. */
function Kicker({ beat, stops }: { beat: Beat; stops: readonly Stop[] }) {
  return (
    <p className="label flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      {beat.stops.map((s, i) => (
        <span key={s} className="inline-flex items-baseline gap-2.5">
          {i > 0 ? <span className="text-faint">&rarr;</span> : null}
          <span style={{ color: sequenceToneLight(s, ACCENT) }}>{index(s)}</span>
          <span className="text-muted">{stops[s].label}</span>
        </span>
      ))}
    </p>
  );
}

/** A legend key, drawn at the size of the text beside it. */
function Key({ swatch, tone }: { swatch: string; tone?: string }) {
  const color = tone ?? "var(--surface-fg)";
  const faded = tone ? 1 : 0.55;
  switch (swatch) {
    case "line":
      return <span aria-hidden className="block h-px w-3.5" style={{ backgroundColor: color, opacity: faded * 0.7 }} />;
    case "heavy":
      return <span aria-hidden className="block h-[2px] w-3.5" style={{ backgroundColor: color, opacity: faded }} />;
    case "dash":
      return <span aria-hidden className="block w-3.5 border-t border-dashed" style={{ borderColor: color, opacity: faded }} />;
    case "dot":
      return <span aria-hidden className="block size-1.5 rounded-full" style={{ backgroundColor: color, opacity: faded }} />;
    case "ring":
      return <span aria-hidden className="block size-2 rounded-full border" style={{ borderColor: color, opacity: faded }} />;
    default:
      return (
        <span
          aria-hidden
          className="block size-2 border"
          style={{ borderColor: color, backgroundColor: tone ? `color-mix(in srgb, ${tone} 18%, transparent)` : undefined, opacity: faded }}
        />
      );
  }
}

/**
 * A figure set as a sheet: a rail with its figure and sheet number, the drawing
 * in its neatline, and a title block underneath — which stop it belongs to,
 * its scale, and a legend for what's drawn. The plate used to be a single
 * motif in an empty frame and read as unfinished; the title block is what a
 * drawing sheet actually carries, and it gives each figure something to say.
 */
function Plate({
  beat,
  stops,
  active,
  sheet,
  sheets,
  className,
  drawOnView = false,
}: {
  beat: Beat;
  stops: readonly Stop[];
  active: boolean;
  sheet: number;
  sheets: number;
  className?: string;
  /** Draw when the plate itself arrives rather than when its chapter is
   *  current — which is what the reader sees where each chapter carries its
   *  own plate at the end, far below the band that decides "current". */
  drawOnView?: boolean;
}) {
  const figure = useRef<HTMLElement>(null);
  const seen = useInView(figure, { margin: "0px 0px -18% 0px" });
  const drawn = drawOnView ? seen : active;
  const first = beat.stops[0];
  const tone = sequenceToneLight(beat.stops[beat.stops.length - 1], ACCENT);
  const meta = FIGURE_META[beat.figure];

  return (
    <figure ref={figure} className={className}>
      <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2.5">
        <p className="label min-w-0 truncate text-fg">
          <span style={{ color: sequenceToneLight(first, ACCENT) }}>
            Fig. {index(first)}
          </span>
          <span className="text-faint"> / </span>
          {beat.stops.map((s) => stops[s].note).join(" → ")}
        </p>
        <span className="label shrink-0 text-faint tabular-nums">
          Sheet {index(sheet)}/{index(sheets - 1)}
        </span>
      </div>

      <div className="relative mt-3">
        {["-top-1.5 -left-1.5", "-top-1.5 -right-1.5", "-bottom-1.5 -left-1.5", "-bottom-1.5 -right-1.5"].map(
          (corner) => (
            <span key={corner} aria-hidden className={cn("hero-mark absolute z-10 block size-3", corner)} />
          ),
        )}

        <div className="border border-hairline-strong">
          <div className="aspect-[44/31] px-1 pt-1">
            <PathFigure kind={beat.figure} active={drawn} tone={tone} />
          </div>

          {/* Title block. Stop and scale share a row; the legend gets the full
              width underneath, which is the only arrangement where every key
              fits on one line in a panel this narrow. */}
          <dl className="grid grid-cols-[minmax(0,1fr)_auto] border-t border-hairline-strong">
            <div className="min-w-0 px-3 py-2.5">
              <dt className="font-mono text-[0.5625rem] tracking-[0.18em] text-faint uppercase">Stop</dt>
              <dd className="mt-1.5 min-h-[2.7em] font-mono text-[0.5625rem] leading-[1.35] tracking-[0.06em] text-fg uppercase">
                {beat.stops.map((s, i) => (
                  <span key={s} className="block truncate">
                    {i > 0 ? <span className="text-faint">→ </span> : null}
                    <span style={{ color: sequenceToneLight(s, ACCENT) }}>{index(s)}</span>{" "}
                    {stops[s].label}
                  </span>
                ))}
              </dd>
            </div>

            <div className="border-l border-hairline-strong px-3 py-2.5">
              <dt className="font-mono text-[0.5625rem] tracking-[0.18em] text-faint uppercase">Scale</dt>
              <dd className="mt-2">
                {meta.scaled ? (
                  <span aria-label="Graphic scale" className="flex h-[5px] w-[4.5rem] border border-fg/50">
                    {[0, 1, 2, 3].map((k) => (
                      <span key={k} className={cn("block h-full flex-1", k % 2 === 0 && "bg-fg/55")} />
                    ))}
                  </span>
                ) : (
                  <span className="block w-[4.5rem] font-mono text-[0.625rem] tracking-[0.08em] text-fg">N.T.S.</span>
                )}
              </dd>
            </div>

            <div className="col-span-2 flex items-baseline gap-x-4 border-t border-hairline-strong px-3 py-2.5">
              <dt className="shrink-0 font-mono text-[0.5625rem] tracking-[0.18em] text-faint uppercase">Legend</dt>
              <dd className="flex flex-wrap gap-x-4 gap-y-1.5">
                {meta.legend.map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1.5 font-mono text-[0.5625rem] tracking-[0.08em] whitespace-nowrap text-muted uppercase">
                    <Key swatch={item.swatch} tone={item.toned ? tone : undefined} />
                    {item.label}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </figure>
  );
}

export function PathStory({
  headline,
  stops,
  beats,
}: {
  headline: string;
  stops: readonly Stop[];
  beats: readonly Beat[];
}) {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const chapters = root.querySelectorAll<HTMLElement>("[data-beat]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number(entry.target.getAttribute("data-beat")));
        }
      },
      // A thin band just above the middle of the viewport: a chapter becomes
      // current as its text reaches eye level, not when its top edge enters.
      { rootMargin: "-42% 0px -52% 0px" },
    );

    chapters.forEach((chapter) => observer.observe(chapter));
    return () => observer.disconnect();
  }, []);

  // Everything up to and including the current chapter has been reached.
  const reached = Math.max(...beats[active].stops);
  const current = new Set(beats[active].stops);

  return (
    <div
      ref={container}
      className="relative grid gap-x-[clamp(2rem,5vw,5rem)] lg:grid-cols-12"
      // How far down the panel its figure starts: label line, the route's
      // top margin, five 3.5rem stops, and the figure's top margin. The first
      // chapter is pushed down by exactly this much so its kicker lands level
      // with the top of the figure. Keep in step with mt-7 / h-14 / mt-9 below.
      style={
        {
          "--figure-offset":
            "calc(var(--text-2xs) * 1.1 + 1.75rem + 5 * 3.5rem + 2.25rem)",
        } as React.CSSProperties
      }
    >
      {/* --- The panel that stays with the reader (wide only) ------------- */}
      <aside className="hidden min-w-0 lg:col-span-4 lg:block">
        <div className="sticky top-[calc(var(--nav-h)+2.25rem)] pb-10">
          <p className="label text-muted">
            <span className="text-accent">01</span>
            <span className="text-faint"> / </span>
            The path in
          </p>

          {/* The route. The fill runs dot to dot, so it always stops exactly on
              the place the story has reached. */}
          <ol className="relative mt-7">
            <span
              aria-hidden
              className="absolute top-7 bottom-7 left-[4.5px] block w-px bg-hairline-strong"
            />
            <span
              aria-hidden
              className="absolute top-7 bottom-7 left-[4.5px] block w-px origin-top bg-accent transition-transform duration-700 ease-[var(--ease-out-expo)]"
              style={{ transform: `scaleY(${reached / (stops.length - 1)})` }}
            />
            {stops.map((stop, i) => {
              const tone = sequenceToneLight(i, ACCENT);
              const isReached = i <= reached;
              const isCurrent = current.has(i);

              return (
                <li key={stop.label} className="relative flex h-14 items-center pl-8">
                  <span
                    aria-hidden
                    className="absolute top-1/2 left-0 block size-2.5 -translate-y-1/2 rounded-full border transition-all duration-500 ease-[var(--ease-out-expo)]"
                    style={{
                      backgroundColor: isReached ? tone : "var(--surface-bg)",
                      borderColor: isReached ? tone : "var(--surface-hairline-strong)",
                      transform: `translateY(-50%) scale(${isCurrent ? 1.45 : 1})`,
                    }}
                  />
                  <div>
                    <p
                      className={cn(
                        "display text-[1.05rem] leading-none transition-colors duration-500",
                        isCurrent ? "text-fg" : isReached ? "text-muted" : "text-faint",
                      )}
                    >
                      {stop.label}
                    </p>
                    <p
                      className={cn(
                        "label mt-1.5 transition-colors duration-500",
                        isCurrent ? "text-muted" : "text-faint",
                      )}
                    >
                      {stop.note}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* One plate per chapter, stacked; only the current one is shown and
              drawn. Hidden on short screens, where it would push the panel past
              the bottom of the viewport. */}
          <div className="relative mt-9 [@media(max-height:880px)]:hidden">
            {beats.map((beat, i) => (
              <div
                key={i}
                className={cn(
                  "transition-opacity duration-500",
                  i === 0 ? "relative" : "absolute inset-0",
                  i === active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <Plate beat={beat} stops={stops} active={i === active} sheet={i} sheets={beats.length} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* --- The chapters ------------------------------------------------- */}
      {/* Bottom runway: the panel is pinned only while this column is still
          running, so without it the last chapter is read with the panel already
          sliding up under the nav. */}
      <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:pb-[16vh]">
        <p className="label text-muted lg:hidden">
          <span className="text-accent">01</span>
          <span className="text-faint"> / </span>
          The path in
        </p>

        {/* The section's headline, level with the panel's label. Its block is
            held to the panel's figure offset so the first chapter below starts
            level with the first figure.

            Observed as part of chapter one. It now fills the tracking band at
            the top of the section, so without this, scrolling back up from
            further down never passed a chapter and the panel stayed on the last
            one read. */}
        <div data-beat={0} className="mt-6 lg:mt-0 lg:min-h-[var(--figure-offset)]">
          <h3 className="display text-[clamp(2rem,4.4vw,3.75rem)] leading-[0.98] text-fg">
            {headline}
          </h3>
        </div>

        {beats.map((beat, i) => (
          <article
            key={i}
            id={`path-chapter-${i}`}
            data-beat={i}
            data-current={i === active}
            className={cn(
              "flex flex-col justify-center py-[clamp(2.25rem,8vh,5rem)] transition-opacity duration-500 ease-[var(--ease-out-quart)] lg:min-h-[52vh]",
              "lg:data-[current=false]:opacity-30",
              // The first chapter starts straight after the headline block, so
              // its kicker sits level with the top of the panel's figure
              // instead of floating down the middle of its own block.
              "lg:first-of-type:justify-start lg:first-of-type:pt-0",
            )}
          >
            <Kicker beat={beat} stops={stops} />

            {/* Full column width, so every description runs to the same right
                edge as the headline above rather than stopping short of it. */}
            <p className="mt-6 text-[clamp(1.3rem,2vw,1.85rem)] leading-[1.42] tracking-[-0.01em] text-fg">
              {beat.text}
            </p>

            {beat.moments?.length ? (
              // Three photo slots per chapter, all of them still placeholders,
              // took a phone's whole screen each and said nothing. They stay
              // where there's a row to put them in.
              <PathMoments
                moments={beat.moments}
                tone={sequenceToneLight(beat.stops[beat.stops.length - 1], ACCENT)}
                className="mt-[clamp(2.5rem,6vh,4rem)] hidden sm:block"
              />
            ) : null}

            {/* Below lg there is no panel, so each chapter carries its own. */}
            <Plate
              beat={beat}
              stops={stops}
              active={i === active}
              drawOnView
              sheet={i}
              sheets={beats.length}
              className="mt-9 max-w-[32rem] lg:hidden"
            />
          </article>
        ))}
      </div>
    </div>
  );
}

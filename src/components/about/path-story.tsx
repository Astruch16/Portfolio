"use client";

import { useEffect, useRef, useState } from "react";

import { PathFigure, type FigureKind } from "@/components/about/path-figures";
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
  lead: boolean;
  text: string;
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

/** A figure in its plate, captioned with the stop's own note. */
function Plate({
  beat,
  stops,
  active,
  className,
}: {
  beat: Beat;
  stops: readonly Stop[];
  active: boolean;
  className?: string;
}) {
  const first = beat.stops[0];
  const tone = sequenceToneLight(beat.stops[beat.stops.length - 1], ACCENT);

  return (
    <figure className={className}>
      <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2.5">
        <p className="label text-fg">
          <span style={{ color: sequenceToneLight(first, ACCENT) }}>
            Fig. {index(first)}
          </span>
          <span className="text-faint"> / </span>
          {beat.stops.map((s) => stops[s].note).join(" → ")}
        </p>
      </div>
      <div className="relative mt-3">
        {["-top-1.5 -left-1.5", "-top-1.5 -right-1.5", "-bottom-1.5 -left-1.5", "-bottom-1.5 -right-1.5"].map(
          (corner) => (
            <span key={corner} aria-hidden className={cn("hero-mark absolute block size-3", corner)} />
          ),
        )}
        <div className="aspect-[10/7] border border-hairline-strong px-2 py-3">
          <PathFigure kind={beat.figure} active={active} tone={tone} />
        </div>
      </div>
    </figure>
  );
}

export function PathStory({
  stops,
  beats,
}: {
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
    <div ref={container} className="relative grid gap-x-[clamp(2rem,5vw,5rem)] lg:grid-cols-12">
      {/* --- The panel that stays with the reader (wide only) ------------- */}
      <aside className="hidden lg:col-span-4 lg:block">
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
          <div className="relative mt-9 [@media(max-height:760px)]:hidden">
            {beats.map((beat, i) => (
              <div
                key={i}
                className={cn(
                  "transition-opacity duration-500",
                  i === 0 ? "relative" : "absolute inset-0",
                  i === active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <Plate beat={beat} stops={stops} active={i === active} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* --- The chapters ------------------------------------------------- */}
      {/* Bottom runway: the panel is pinned only while this column is still
          running, so without it the last chapter is read with the panel already
          sliding up under the nav. */}
      <div className="lg:col-span-7 lg:col-start-6 lg:pb-[16vh]">
        <p className="label text-muted lg:hidden">
          <span className="text-accent">01</span>
          <span className="text-faint"> / </span>
          The path in
        </p>

        {beats.map((beat, i) => (
          <article
            key={i}
            data-beat={i}
            data-current={i === active}
            className={cn(
              "flex flex-col justify-center py-[clamp(3rem,8vh,5rem)] transition-opacity duration-500 ease-[var(--ease-out-quart)] lg:min-h-[52vh]",
              "lg:data-[current=false]:opacity-30",
            )}
          >
            <Kicker beat={beat} stops={stops} />

            {beat.lead ? (
              <p className="display mt-6 text-[clamp(2rem,4.4vw,3.75rem)] leading-[0.98] text-fg">
                {beat.text}
              </p>
            ) : (
              <p className="mt-6 max-w-[34ch] text-[clamp(1.3rem,2vw,1.85rem)] leading-[1.42] tracking-[-0.01em] text-fg">
                {beat.text}
              </p>
            )}

            {/* Below lg there is no panel, so each chapter carries its own. */}
            <Plate
              beat={beat}
              stops={stops}
              active={i === active}
              className="mt-10 max-w-[30rem] lg:hidden"
            />
          </article>
        ))}
      </div>
    </div>
  );
}

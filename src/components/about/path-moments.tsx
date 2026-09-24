"use client";

import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";

import { MomentArt, type MomentArtKind } from "@/components/about/moment-art";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * The moments under a chapter, played out by scroll.
 *
 * A chapter's paragraph says where the story is; these say what happened
 * there. Three beats hang off a rail that fills as the reader scrolls through
 * them, and each one develops as the fill reaches it — its photo wipes up out
 * of the paper, then its heading and note rise into place. Scrubbed, not
 * triggered: scroll back and the rail empties and the moments recede, so the
 * strip always shows exactly how far through this part of the story you are.
 *
 * Horizontal from `sm` up, where three fit side by side; a vertical rail below
 * that. With reduced motion everything is simply shown, fully developed.
 */

export type Moment = {
  title: string;
  note: string;
  /** A file in /public. Takes the slot over from a drawing when one exists. */
  image?: string;
  /** A drawn plate, for a moment no photograph was ever taken of. */
  art?: MomentArtKind;
  /** Marks template copy that has not been written yet. */
  placeholder?: boolean;
};

const CORNERS = [
  "-top-1.5 -left-1.5",
  "-top-1.5 -right-1.5",
  "-bottom-1.5 -left-1.5",
  "-bottom-1.5 -right-1.5",
] as const;

const pad = (i: number) => String(i + 1).padStart(2, "0");

/** What each drawing is, stamped on its plate the way a sheet carries a title. */
const ART_LABEL: Record<MomentArtKind, string> = {
  "cross-section": "Section",
  "field-sheet": "Readings",
  crossover: "Crossing",
};

function MomentItem({
  moment,
  index,
  count,
  progress,
  tone,
  still,
}: {
  moment: Moment;
  index: number;
  count: number;
  progress: MotionValue<number>;
  tone: string;
  still: boolean;
}) {
  // Each moment develops over its own slice of the strip's scroll, starting
  // when the rail's fill reaches it.
  const start = (index / count) * 0.78;
  const reveal = useTransform(progress, [start, start + 0.24], [0, 1]);
  const clipPath = useTransform(reveal, (v) => `inset(${((1 - v) * 100).toFixed(1)}% 0 0 0)`);
  const rise = useTransform(reveal, [0, 1], [18, 0]);
  const dot = useTransform(reveal, [0, 0.35], [0.4, 1]);
  // The drawing waits for its plate to arrive, then draws itself in.
  const [played, setPlayed] = useState(false);
  useMotionValueEvent(reveal, "change", (value) => {
    if (value > 0.35 && !played) setPlayed(true);
  });
  const dotFill = useTransform(reveal, (v) => (v > 0.02 ? tone : "var(--surface-bg)"));

  return (
    <li className="relative pt-9">
      <motion.span
        aria-hidden
        className="absolute top-0 left-0 block size-3 rounded-full border"
        style={{
          scale: still ? 1 : dot,
          backgroundColor: still ? tone : dotFill,
          borderColor: tone,
        }}
      />

      {/* The photo slot. */}
      <div className="relative">
        {CORNERS.map((corner) => (
          <span key={corner} aria-hidden className={cn("hero-mark absolute z-10 block size-3", corner)} />
        ))}
        <motion.div
          className="relative aspect-4/3 overflow-hidden border border-hairline-strong"
          style={{ clipPath: still ? "none" : clipPath }}
        >
          {moment.image ? (
            <Image
              src={moment.image}
              alt={moment.title}
              fill
              sizes="(min-width: 1024px) 18rem, (min-width: 640px) 30vw, 88vw"
              className="object-cover"
            />
          ) : (
            <>
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgb(20 20 20 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(20 20 20 / 0.05) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                  backgroundColor: `color-mix(in srgb, ${tone} 6%, transparent)`,
                }}
              />
              {moment.art ? (
                <>
                  {/* Drawn rather than photographed: the plate develops in
                      place as the moment does, on the same scrubbed reveal. */}
                  <MomentArt kind={moment.art} tone={tone} play={still || played} />
                  <span className="label absolute top-2.5 left-3 text-faint">
                    Fig. {pad(index)}
                  </span>
                  <span className="label absolute right-3 bottom-2.5 text-faint">
                    {ART_LABEL[moment.art]}
                  </span>
                </>
              ) : (
                <>
                  <span className="label absolute top-2.5 left-3 text-faint">
                    Photo {pad(index)}
                  </span>
                  <span className="label absolute right-3 bottom-2.5 text-faint">Pending</span>
                </>
              )}
            </>
          )}
        </motion.div>
      </div>

      <motion.div
        className="mt-5"
        style={{ opacity: still ? 1 : reveal, y: still ? 0 : rise }}
      >
        <p className="label flex items-center gap-2.5">
          <span style={{ color: tone }}>{pad(index)}</span>
          {moment.placeholder ? (
            <span className="border border-hairline-strong px-1.5 py-0.5 text-[0.5625rem] text-faint">
              Placeholder
            </span>
          ) : null}
        </p>
        <p className="display mt-3 text-[clamp(1.05rem,1.35vw,1.3rem)] leading-[1.05] text-fg">
          {moment.title}
        </p>
        <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted">{moment.note}</p>
      </motion.div>
    </li>
  );
}

export function PathMoments({
  moments,
  tone,
  className,
}: {
  moments: readonly Moment[];
  tone: string;
  className?: string;
}) {
  const strip = useRef<HTMLOListElement>(null);
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");

  // From the strip's top entering low in the viewport to its bottom passing
  // just below the middle — long enough to feel scrubbed, short enough that
  // the last moment has developed before the reader moves on.
  const { scrollYProgress } = useScroll({
    target: strip,
    offset: ["start 88%", "end 60%"],
  });

  return (
    <div className={cn("relative", className)}>
      {/* The rail the moments hang from, scrubbed by the page's own scroll. */}
      <span aria-hidden className="absolute top-[5px] right-0 left-0 h-px bg-hairline-strong" />
      <motion.span
        aria-hidden
        className="absolute top-[5px] right-0 left-0 h-px origin-left"
        style={{ backgroundColor: tone, scaleX: still ? 1 : scrollYProgress }}
      />

      <ol ref={strip} className="relative grid gap-x-6 gap-y-12 sm:grid-cols-3">
        {moments.map((moment, i) => (
          <MomentItem
            key={i}
            moment={moment}
            index={i}
            count={moments.length}
            progress={scrollYProgress}
            tone={tone}
            still={still}
          />
        ))}
      </ol>
    </div>
  );
}

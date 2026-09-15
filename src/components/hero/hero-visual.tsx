"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { SculptureStatic } from "@/components/hero/sculpture-static";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cue, easing } from "@/lib/motion";
import { FORMS } from "@/lib/sculpture-forms";
import { sculpture } from "@/lib/sculpture-state";
import { cn } from "@/lib/utils";

/**
 * The right-hand side of the hero: the sculpture, and the instrument around it.
 *
 * three.js is loaded only when it will actually be used — a wide viewport, no
 * reduced-motion preference, after hydration. Everyone else gets the same forms
 * drawn flat, and never downloads the chunk. As before, the chunk is warmed
 * during a quiet moment of the boot and the set only fades in once the renderer
 * has really drawn a frame, so it never pops in over an empty box.
 *
 * Under the canvas, in the site's drawing language: a caption naming the form
 * being held and a hint for what the pointer does. Choosing a form happens in
 * the statement's rail, beside it, and the session's answers print in the
 * terminal. Nothing sits above it: the identity module owns that corner of the
 * hero.
 */

const SculptureScene = dynamic(
  () => import("@/components/hero/sculpture-scene").then((m) => m.SculptureScene),
  { ssr: false },
);

const WARM_DELAY = 600;
const MOUNT_DELAY = 1400;
const REVEAL_FLOOR = cue.scene * 1000;
const REVEAL_TIMEOUT = 7000;

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Fitting the forms into the room they actually have.
 *
 * The box is a fixed 4:3 anchored to the rule, so how much of it is free
 * depends on the screen: on a short one the identity module reaches well down
 * into it, on a tall one barely at all. One fixed placement left the forms
 * pressed against the module at 1280 and sitting on the rule at 1920. Instead,
 * the space between the module and the caption is measured, and the forms are
 * scaled to fit it and centred in it.
 *
 * The extents are the tallest top and lowest bottom across all six forms, in
 * scene units at scale 1, measured from renders — so every form fits, not just
 * the one on screen.
 */
const FORMS_TOP = 1.12;
const FORMS_BOTTOM = -1.25;
/** Scene units visible top to bottom at the origin: 2 · 5.1 · tan(19°). */
const VIEW_UNITS = 3.51;
/** Px kept clear under the module, and above the caption's label. */
const CLEAR_TOP = 34;
const CLEAR_BOTTOM = 84;

export function HeroVisual({
  className,
  style,
  cycling,
  ceiling,
}: {
  className?: string;
  style?: React.CSSProperties;
  cycling: boolean;
  /** Where the identity module ends, in the same coordinates as this box's offsetTop. */
  ceiling?: number | null;
}) {
  const wide = useMediaQuery("(min-width: 1024px)");
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");
  const container = useRef<HTMLDivElement>(null);

  const { form } = useSyncExternalStore(sculpture.subscribe, sculpture.getSnapshot, sculpture.getServerSnapshot);

  const [inView, setInView] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [floorPassed, setFloorPassed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [box, setBox] = useState({ top: 0, height: 0 });

  const use3D = wide && !still;

  useEffect(() => {
    if (!use3D) return;
    const warm = setTimeout(() => void import("@/components/hero/sculpture-scene"), WARM_DELAY);
    const mount = setTimeout(() => setMounted(true), MOUNT_DELAY);
    return () => {
      clearTimeout(warm);
      clearTimeout(mount);
    };
  }, [use3D]);

  useEffect(() => {
    const floor = setTimeout(() => setFloorPassed(true), REVEAL_FLOOR);
    const bail = setTimeout(() => setTimedOut(true), REVEAL_TIMEOUT);
    return () => {
      clearTimeout(floor);
      clearTimeout(bail);
    };
  }, []);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "120px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setBox({ top: el.offsetTop, height: el.clientHeight }));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ceiling]);

  const placement = (() => {
    // Off to the right where the name reaches in under the box's left side;
    // centred when the box has a row of its own.
    const shift = ceiling == null ? 0 : 0.42;
    if (!box.height) return { fit: 1, lift: -0.12, shift };
    const unit = box.height / VIEW_UNITS;
    const top = Math.max(0, (ceiling ?? box.top) - box.top) + CLEAR_TOP;
    const bottom = box.height - CLEAR_BOTTOM;
    const fit = Math.max(0.6, Math.min(1, (bottom - top) / ((FORMS_TOP - FORMS_BOTTOM) * unit)));
    // Scene y is up from the box's centre; put the forms' middle on the room's.
    const middle = (top + bottom) / 2;
    const lift = (box.height / 2 - middle) / unit - ((FORMS_TOP + FORMS_BOTTOM) / 2) * fit;
    return { fit, lift, shift };
  })();

  // Once the boot is done, the cycle moves on whenever the held form's dwell is
  // up — the same numbers the statement's rail draws its bar from.
  useEffect(() => {
    if (!cycling || still) return;
    const timer = setInterval(() => sculpture.tick(), 200);
    return () => clearInterval(timer);
  }, [cycling, still]);

  const onFirstFrame = useCallback(() => setDrawn(true), []);
  const revealed = floorPassed && (!use3D || drawn || timedOut);

  return (
    <motion.div
      ref={container}
      className={cn("relative", className)}
      style={style}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
      transition={{ duration: 1.2, ease: easing.outQuart }}
    >
      {/* A soft purple pool under the sculpture, the way the plinth used to cast one. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[12%] top-[26%] bottom-[18%] rounded-[50%] blur-[70px]"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(114,87,255,0.2), rgba(114,87,255,0))" }}
      />

      <div className="absolute inset-0">
        {use3D ? (
          mounted ? <SculptureScene active={inView} {...placement} onFirstFrame={onFirstFrame} /> : null
        ) : (
          <SculptureStatic {...placement} />
        )}
      </div>

      {/* --- Caption ------------------------------------------------------
          The form rail lives in the statement now; this just names the figure
          and says what the pointer does. */}
      {/* Label above the rule, like the statement's rail, so the rule is the
          visual's bottom edge and lines up with the rail across the hero. */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex items-baseline justify-between gap-4 border-b border-hairline pb-2">
        <p className="label text-fg">
          <span className="text-accent">Fig. {pad(form)}</span>
          <span className="text-faint"> / </span>
          {FORMS[form]}
        </p>
        <p className="label hidden text-faint [@media(hover:hover)]:block" aria-hidden>
          Drag to turn · click to scatter
        </p>
      </div>
    </motion.div>
  );
}

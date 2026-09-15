"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { SculptureStatic } from "@/components/hero/sculpture-static";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cue, easing } from "@/lib/motion";
import { FORMS } from "@/lib/sculpture-forms";
import { sculpture } from "@/lib/sculpture-state";
import { terminalSession, type Tone } from "@/lib/terminal-session";
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
 * being held, a hint for what the pointer does, and — once a visitor has used
 * the prompt — the last lines of their session. Choosing a form happens in the
 * statement's rail, beside it. Nothing sits
 * above it: the identity module owns that corner of the hero.
 */

const SculptureScene = dynamic(
  () => import("@/components/hero/sculpture-scene").then((m) => m.SculptureScene),
  { ssr: false },
);

const WARM_DELAY = 600;
const MOUNT_DELAY = 1400;
const REVEAL_FLOOR = cue.scene * 1000;
const REVEAL_TIMEOUT = 7000;
const LOG_ROWS = 6;

const TONE: Record<Tone, string> = {
  text: "text-fg",
  muted: "text-faint",
  accent: "text-accent",
  success: "text-[#5f8a12]",
  prompt: "text-accent",
};

const pad = (i: number) => String(i + 1).padStart(2, "0");

export function HeroVisual({ className, cycling }: { className?: string; cycling: boolean }) {
  const wide = useMediaQuery("(min-width: 1024px)");
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");
  const container = useRef<HTMLDivElement>(null);

  const { form } = useSyncExternalStore(sculpture.subscribe, sculpture.getSnapshot, sculpture.getServerSnapshot);
  const session = useSyncExternalStore(
    terminalSession.subscribe,
    terminalSession.getSnapshot,
    terminalSession.getServerSnapshot,
  );

  const [inView, setInView] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [floorPassed, setFloorPassed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

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

  // Once the boot is done, the cycle moves on whenever the held form's dwell is
  // up — the same numbers the statement's rail draws its bar from.
  useEffect(() => {
    if (!cycling || still) return;
    const timer = setInterval(() => sculpture.tick(), 200);
    return () => clearInterval(timer);
  }, [cycling, still]);

  const onFirstFrame = useCallback(() => setDrawn(true), []);
  const revealed = floorPassed && (!use3D || drawn || timedOut);
  const log = session.history.filter((row) => row.length).slice(-LOG_ROWS);

  return (
    <motion.div
      ref={container}
      className={cn("relative", className)}
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
          mounted ? <SculptureScene active={inView} onFirstFrame={onFirstFrame} /> : null
        ) : (
          <SculptureStatic />
        )}
      </div>

      {/* --- Session log ---------------------------------------------------- */}
      {log.length ? (
        <div className="pointer-events-none absolute bottom-10 left-0 max-w-[62%] font-mono text-[0.6875rem] leading-[1.55]" aria-hidden>
          {log.map((row, i) => (
            <p key={`${session.history.length}-${i}`} className="truncate whitespace-pre">
              {row.map((segment, j) => (
                <span key={j} className={TONE[segment.tone ?? "text"]}>
                  {segment.text}
                </span>
              ))}
            </p>
          ))}
        </div>
      ) : null}

      {/* --- Caption ------------------------------------------------------
          The form rail lives in the statement now; this just names the figure
          and says what the pointer does. */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex items-baseline justify-between gap-4 border-t border-hairline pt-2.5">
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

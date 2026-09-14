"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { SculptureStatic } from "@/components/hero/sculpture-static";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cue, easing } from "@/lib/motion";
import { FORMS, type FormIndex } from "@/lib/sculpture-forms";
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
 * Under the canvas, in the site's drawing language: tabs for the six forms —
 * the one being held written out, the rest as numbers so all six and the hint
 * fit on one line — a hint for what the pointer does, and — once a
 * visitor has used the prompt — the last lines of their session. Nothing sits
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
/** How often the idle cycle moves on once the boot is done. */
const CYCLE_MS = 6500;
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

  // Once the boot has walked the statement's three forms, carry on through all
  // six — `suggest` stands aside for a while whenever the visitor has chosen one.
  useEffect(() => {
    if (!cycling || still) return;
    const timer = setInterval(() => {
      sculpture.suggest(((sculpture.getSnapshot().form + 1) % FORMS.length) as FormIndex);
    }, CYCLE_MS);
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
        <div className="pointer-events-none absolute bottom-12 left-0 max-w-[62%] font-mono text-[0.6875rem] leading-[1.55]" aria-hidden>
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

      {/* --- Form tabs ------------------------------------------------------ */}
      <div
        role="tablist"
        aria-label="Sculpture form"
        className="absolute right-0 bottom-0 left-0 flex items-center gap-0.5 border-t border-hairline pt-2"
      >
        {FORMS.map((name, i) => {
          const on = i === form;
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={on}
              title={name}
              onClick={() => sculpture.choose(i as FormIndex)}
              className={cn(
                "group/tab relative shrink-0 px-2 py-1.5 font-mono text-[0.6875rem] tracking-[0.14em] uppercase transition-colors",
                on ? "text-fg" : "text-faint hover:text-muted",
              )}
            >
              <span className={on ? "text-accent" : undefined}>{pad(i)}</span>
              {/* The held form is written out; the rest stay numbers, named for
                  screen readers and on hover. */}
              <span className={on ? "ml-1.5" : "sr-only"}>{name}</span>
              <span
                aria-hidden
                className="absolute inset-x-2 -bottom-px block h-px origin-left bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)]"
                style={{ transform: `scaleX(${on ? 1 : 0})` }}
              />
            </button>
          );
        })}
        <p className="label ml-auto hidden text-faint [@media(hover:hover)]:block" aria-hidden>
          Drag to turn · click to scatter
        </p>
      </div>
    </motion.div>
  );
}

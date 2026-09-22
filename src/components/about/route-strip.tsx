"use client";

import { useEffect, useRef } from "react";

/**
 * Carries the route along by itself on a phone.
 *
 * The five stops don't fit across a narrow screen, and a row that has to be
 * swiped hides three of them behind an edge most people never touch. So the
 * strip travels: it eases to the far end, waits, eases back, and goes again —
 * slowly enough to read, and stopping the moment anyone takes hold of it.
 *
 * Only on a phone, and only with motion allowed. At sm and up the stops are a
 * grid with nothing to scroll, and under reduced motion the strip stays where
 * it is and can still be swiped.
 */

/** Px per second the strip travels. About a word a second. */
const SPEED = 22;
/** How long it rests at each end. */
const PAUSE_MS = 1400;
/** How long after a touch before it takes over again. */
const RESUME_MS = 3200;

export function RouteStrip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const port = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = port.current;
    if (!el) return;

    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const narrow = window.matchMedia("(max-width: 639px)");

    let frame = 0;
    let last = 0;
    let restUntil = 0;
    let heldUntil = 0;
    let direction = 1;
    let visible = false;
    // Its own idea of where it is: reading scrollLeft back each frame loses
    // the fraction of a pixel a slow travel moves in 16ms, and it never starts.
    let at = 0;

    const travel = (time: number) => {
      frame = requestAnimationFrame(travel);
      const span = el.scrollWidth - el.clientWidth;
      if (span <= 1) return;

      const dt = last ? Math.min(0.05, (time - last) / 1000) : 0;
      last = time;

      // Whoever touched it last is in charge until they've been done a while.
      if (time < heldUntil) {
        at = el.scrollLeft;
        return;
      }
      if (time < restUntil) return;

      at += SPEED * dt * direction;
      if (at >= span) {
        at = span;
        direction = -1;
        restUntil = time + PAUSE_MS;
      } else if (at <= 0) {
        at = 0;
        direction = 1;
        restUntil = time + PAUSE_MS;
      }
      el.scrollLeft = at;
    };

    const start = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!narrow.matches || !motionOk.matches || !visible || document.hidden) return;
      frame = requestAnimationFrame(travel);
    };

    const hold = () => {
      heldUntil = performance.now() + RESUME_MS;
    };

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    viewObserver.observe(el);

    el.addEventListener("pointerdown", hold, { passive: true });
    el.addEventListener("wheel", hold, { passive: true });
    el.addEventListener("touchmove", hold, { passive: true });
    document.addEventListener("visibilitychange", start);
    narrow.addEventListener("change", start);
    motionOk.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(frame);
      viewObserver.disconnect();
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("wheel", hold);
      el.removeEventListener("touchmove", hold);
      document.removeEventListener("visibilitychange", start);
      narrow.removeEventListener("change", start);
      motionOk.removeEventListener("change", start);
    };
  }, []);

  return (
    <div ref={port} className={className}>
      {children}
    </div>
  );
}

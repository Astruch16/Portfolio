"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The plate's scroll window on narrow viewports.
 *
 * A desktop UI shrunk to phone width is unreadable, so below `md` the plate
 * keeps the screenshot at a legible height and becomes a window that pans
 * across it. Nothing is cropped away — it is all still there to the left and
 * right.
 *
 * Which part of the screen is worth opening on differs per screenshot: an app
 * shell wants its sidebar, a centred marketing or onboarding layout wants its
 * middle. Left is the browser's own default, so only `center` needs any work,
 * and it is done here rather than in CSS because centring an overflowing
 * scroller with `justify-content` makes the left overflow unreachable.
 */
export function ExhibitPan({
  focus = "left",
  className,
  children,
}: {
  focus?: "left" | "center";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || focus !== "center") return;

    // Re-centres while the visitor hasn't taken over, and stops for good once
    // they have — otherwise a resize would yank the plate back under them.
    let owned = false;
    const centre = () => {
      if (owned) return;
      const overflow = el.scrollWidth - el.clientWidth;
      if (overflow > 0) el.scrollLeft = overflow / 2;
    };

    const release = () => {
      owned = true;
    };

    // One frame later: the reserved box exists at layout, but the scroll
    // position has to be written after the browser has done that layout.
    const frame = requestAnimationFrame(centre);
    const observer = new ResizeObserver(centre);
    observer.observe(el);
    el.addEventListener("pointerdown", release, { passive: true });
    el.addEventListener("wheel", release, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("pointerdown", release);
      el.removeEventListener("wheel", release);
    };
  }, [focus]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

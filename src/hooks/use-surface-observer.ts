"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type Surface = "light" | "dark";

/**
 * Reports which `[data-surface]` section currently sits under the navigation
 * band, so the nav can invert with the page instead of hard-coding a colour or
 * doing scroll-position maths on every frame.
 *
 * A thin observer band near the top of the viewport keeps the browser doing the
 * work. Sections can overlap there — a pinned hero stays under the band while
 * the next section rides over it — so when several intersect we take the last
 * one in document order, which is the one painting on top.
 */
export function useSurfaceObserver(initial: Surface = "light"): Surface {
  const [surface, setSurface] = useState<Surface>(initial);
  // Re-observe on route change: the nav persists across client-side navigations,
  // so without this the observer keeps watching the previous page's (unmounted)
  // sections and the bar carries the old page's colour onto the new one.
  const pathname = usePathname();

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-surface]"),
    ).filter((el) => el !== document.documentElement);

    if (!sections.length) return;

    const visible = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(el);
          else visible.delete(el);
        }

        for (let i = sections.length - 1; i >= 0; i -= 1) {
          if (!visible.has(sections[i])) continue;
          const next = sections[i].getAttribute("data-surface");
          if (next === "light" || next === "dark") setSurface(next);
          // "warm" (My Local Loop's cream) is a light ground; "terminal"
          // (Mintlytics' midnight navy) is a dark one. Map each to the nav
          // treatment that reads over it.
          else if (next === "warm") setSurface("light");
          else if (next === "terminal") setSurface("dark");
          return;
        }
      },
      { rootMargin: "-36px 0px -94% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return surface;
}

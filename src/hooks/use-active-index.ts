"use client";

import { useEffect, useState } from "react";

/**
 * Reports which `[data-project-index]` section currently holds the middle of
 * the viewport.
 *
 * An IntersectionObserver with a thin central band rather than a scroll
 * listener: the browser does the work, and state changes only when the active
 * project actually changes — five times across the whole section, not once per
 * frame.
 */
export function useActiveIndex(): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-project-index]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number(entry.target.getAttribute("data-project-index"));
          if (!Number.isNaN(index)) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

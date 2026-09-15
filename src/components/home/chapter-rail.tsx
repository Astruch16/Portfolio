"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The homepage's chapter index: a column of marks pinned to the left gutter,
 * one per chapter, with the current one drawn long and named.
 *
 * It stays out of the hero and appears once the first chapter arrives. Each
 * mark is a link to its chapter, and pointing at the rail names all of them, so
 * it's a way around the page as well as a readout of where you are. Drawn with
 * `mix-blend-mode: difference`, so the same white marks read on the cream
 * chapters and the dark ones without having to track which is underneath.
 */

export type Chapter = { id: string; index: string; label: string };

export function ChapterRail({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const inBand = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        // Chapters sit end to end, so at most one crosses the band — except in
        // the moment of a hand-over, when the later one wins.
        const current = chapters.findLast((c) => inBand.has(c.id));
        setActive(current?.id ?? null);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav
      aria-label="Chapters"
      className={cn(
        "group/rail fixed top-1/2 left-[calc(var(--gutter)/2-0.375rem)] z-40 hidden -translate-y-1/2 text-white mix-blend-difference transition-opacity duration-500 lg:block",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <ol className="flex flex-col gap-3.5">
        {chapters.map((chapter) => {
          const on = chapter.id === active;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={on ? "true" : undefined}
                className="flex items-center gap-3 py-1"
              >
                <span
                  aria-hidden
                  className={cn(
                    "block h-px bg-current transition-[width,opacity] duration-500 ease-[var(--ease-out-expo)]",
                    on ? "w-6 opacity-100" : "w-2.5 opacity-50",
                  )}
                />
                <span
                  className={cn(
                    "label whitespace-nowrap transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]",
                    on
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-1 opacity-0 group-hover/rail:translate-x-0 group-hover/rail:opacity-60 group-focus-within/rail:translate-x-0 group-focus-within/rail:opacity-60",
                  )}
                >
                  {chapter.index} {chapter.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

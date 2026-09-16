"use client";

import { ArrowUp } from "lucide-react";

/** Back to the top of the page, smoothly unless the visitor prefers otherwise. */
export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
      }}
      className="group/top label inline-flex items-center gap-3 text-muted transition-colors hover:text-fg"
    >
      Back to top
      <span className="grid size-9 place-items-center rounded-full border border-hairline-strong transition-colors group-hover/top:border-accent">
        <ArrowUp
          aria-hidden
          className="size-3.5 transition-transform duration-300 group-hover/top:-translate-y-0.5"
          strokeWidth={1.5}
        />
      </span>
    </button>
  );
}

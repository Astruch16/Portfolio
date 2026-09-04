"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

/**
 * Text that writes itself out one character at a time.
 *
 * The whole string is in the document from the first byte — each character is
 * simply held at zero opacity and released on a CSS `transition-delay`. That
 * means one class toggle drives an entire line, nothing re-renders per
 * character, and a busy main thread cannot make the stagger stutter. It also
 * keeps the glyphs on their final positions throughout, so nothing reflows and
 * the spacing never shifts as it types.
 *
 * With `enabled` false — reduced motion — no attribute is written and the line
 * is simply visible.
 */
export function TypeLine({
  text,
  typed,
  enabled,
  charMs = 34,
  startIndex = 0,
  className,
}: {
  text: string;
  typed: boolean;
  enabled: boolean;
  /** Milliseconds between characters. */
  charMs?: number;
  /** Continues the stagger from an earlier line in the same block. */
  startIndex?: number;
  className?: string;
}) {
  const characters = useMemo(() => Array.from(text), [text]);

  return (
    <span
      className={cn("type-line", className)}
      data-typed={enabled ? (typed ? "running" : "pending") : undefined}
    >
      {characters.map((character, index) => (
        <span
          key={index}
          style={{ transitionDelay: `${(startIndex + index) * charMs}ms` }}
        >
          {character}
        </span>
      ))}
    </span>
  );
}

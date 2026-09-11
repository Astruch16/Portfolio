"use client";

import { useMemo } from "react";

import type { MosaicLine } from "@/data/name-mosaic";
import { cn } from "@/lib/utils";

/**
 * One line of the name, rebuilt out of code symbols.
 *
 * The letterforms are the real display face — sampled offline by
 * `scripts/generate-name-mosaic.mjs`, which renders the word to a canvas and
 * records which cells of a grid the glyphs actually cover. So the shape carries
 * the same typeface, kerning and letter-spacing as the rest of the site; only
 * the material changes.
 *
 * Vertical placement is not guessed: the generator records the line box and
 * where the ink sits inside it, taken from the font's own metrics, so the two
 * lines stack on exactly the leading the solid type used.
 *
 * Two details keep it cheap:
 *
 * Symbols are chosen deterministically from their own index, never at random,
 * so the server and the client draw the same name.
 *
 * Cells are dealt into a handful of groups and it is the *groups* that float,
 * not the cells — eight animated layers instead of nine hundred. Neighbouring
 * cells land in different groups, so the drift still reads as each symbol
 * moving on its own.
 */

/** Symbols with enough ink to read at this size. No thin punctuation. */
const GLYPHS = Array.from("{}[]<>/\\|;=+*&^%$#@!?~");

/** How many independently drifting layers the cells are dealt into. */
const GROUPS = 8;

/**
 * Extra leading, in em, over what the solid type uses.
 *
 * The display face is set on almost no leading — cap height is about 98% of the
 * line box — which is fine for solid caps but not for a mosaic: every symbol
 * overhangs its own sample point by half its width, so the bottom row of one
 * line lands in the top row of the next. This is the smallest amount that
 * separates them, and it is small enough not to disturb the composition.
 */
const EXTRA_LEADING = 0.07;

export function NameMosaic({
  line,
  typed,
  enabled,
  charMs,
  startIndex = 0,
  className,
}: {
  line: MosaicLine;
  typed: boolean;
  enabled: boolean;
  /** Milliseconds between characters — the same cadence `TypeLine` uses. */
  charMs: number;
  /** Continues the stagger from an earlier line. */
  startIndex?: number;
  className?: string;
}) {
  const groups = useMemo(() => {
    const dealt: {
      x: number;
      y: number;
      glyph: string;
      delay: number;
    }[][] = Array.from({ length: GROUPS }, () => []);

    line.cells.forEach(([x, y, character], i) => {
      dealt[i % GROUPS].push({
        // Percent of the line box, not em: `left` in em would resolve against
        // the cell's own font-size — which is a fraction of the display size —
        // and collapse the whole name into a corner.
        x: (x / line.width) * 100,
        y: (y / line.height) * 100,
        glyph: GLYPHS[(i * 7) % GLYPHS.length],
        // The character's own beat, plus a small deterministic scatter so a
        // letter assembles out of its symbols rather than snapping on whole.
        delay: (startIndex + character) * charMs + ((i * 37) % 9) * 26,
      });
    });

    return dealt;
  }, [line, charMs, startIndex]);

  return (
    // Two boxes on purpose. The outer one is a real line box, so the two lines
    // stack on the display face's own leading exactly as the solid type did.
    // The inner one is the glyphs' ink, centred inside it — the sampled
    // coordinates are relative to the ink, not to the line.
    <span
      className={cn("mosaic block", className)}
      data-typed={enabled ? (typed ? "running" : "pending") : undefined}
      style={{
        width: `${line.width}em`,
        height: `${line.lineHeight + EXTRA_LEADING}em`,
      }}
    >
      <span
        className="mosaic-ink"
        style={{
          height: `${line.height}em`,
          top: `${line.inkTop + EXTRA_LEADING / 2}em`,
        }}
      >
        {groups.map((cells, group) => (
          <span
            key={group}
            className="mosaic-group"
            style={
              {
                "--float-dur": `${5.2 + group * 0.63}s`,
                "--float-delay": `${-group * 0.71}s`,
                "--fx": `${(group % 2 ? 1 : -1) * 0.009}em`,
                "--fy": `${(group % 3 ? -1 : 1) * 0.013}em`,
              } as React.CSSProperties
            }
          >
            {cells.map((cell, i) => (
              <span
                key={i}
                className="mosaic-cell"
                style={{
                  left: `${cell.x.toFixed(3)}%`,
                  top: `${cell.y.toFixed(3)}%`,
                  transitionDelay: `${cell.delay}ms`,
                }}
              >
                {cell.glyph}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}


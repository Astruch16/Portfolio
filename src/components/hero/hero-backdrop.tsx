/**
 * The hero's paper.
 *
 * Warm cream, an oversized editorial grid, a handful of print registration
 * marks, sparse drawing annotations, and a soft purple spill where light from
 * the plinth's cavity falls on the page. Every layer is decorative and inert —
 * the whole thing is hidden from assistive technology and cannot be hit by a
 * pointer, so it never interferes with the hero it sits behind.
 *
 * Layer order, bottom up: cream (the section's own background) → purple spill →
 * grid → marks → annotations. Grain is the page-wide `.grain` overlay in the
 * root layout rather than a second one here.
 */

/**
 * Grid coordinates, not pixels — see `--grid-w` / `--grid-h` in globals.css.
 *
 * Deliberately uneven. Columns past the viewport are simply clipped, so a wide
 * screen picks up an extra mark or two and a phone is left with one, without
 * any of it needing a breakpoint.
 */
const MARKS: { column: number; row: number }[] = [
  { column: 1, row: 1 },
  { column: 4, row: 2 },
  { column: 2, row: 3 },
  { column: 5, row: 1 },
  { column: 3, row: 4 },
];

export function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="hero-backdrop pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Purple environmental light, anchored under the plinth. */}
      <div className="hero-spill absolute right-[-14%] bottom-[-22%] h-[78%] w-[76%]" />

      <div className="hero-grid absolute inset-0" />

      {MARKS.map(({ column, row }) => (
        <span
          key={`${column}-${row}`}
          className="hero-mark absolute block size-3"
          style={{
            left: `calc(var(--gutter) + ${column} * var(--grid-w))`,
            top: `calc(${row} * var(--grid-h))`,
          }}
        />
      ))}

      {/* Drawing metadata. Desktop only — on smaller screens these read as
          clutter rather than as annotation. */}
      <span className="hero-note absolute top-[38%] left-[calc(var(--gutter)/2-0.4rem)] hidden [writing-mode:vertical-rl] lg:block">
        00 / Hero
      </span>
      <span className="hero-note absolute bottom-[6%] left-[38%] hidden lg:block">
        Grid 8&times;
      </span>
      <span className="hero-note absolute top-[calc(var(--nav-h)+1.75rem)] right-[calc(var(--gutter)/2-0.4rem)] hidden [writing-mode:vertical-rl] lg:block">
        X 0842 &middot; Y 0317
      </span>
    </div>
  );
}

import Image from "next/image";

import { ExhibitPan } from "@/components/case/exhibit-pan";
import type { CaseVisual } from "@/data/case-studies";
import { cn } from "@/lib/utils";

/**
 * A real product screen, presented as a technical exhibit.
 *
 * Deliberately not a device mockup. The screen is a flat plate inside the same
 * drawing system as the rest of the page — hairline border, mono rail, corner
 * registration marks, a faint grid and a contained purple spill behind it — so
 * the software is allowed to be the subject and the frame only identifies it.
 *
 * Nothing crops the image. On a wide viewport the plate holds the screenshot's
 * own aspect ratio at full width. Below `md` the same screenshot would shrink
 * to unreadable, so instead it keeps a fixed, legible height and the plate
 * becomes a pannable window onto it — the whole UI is still there, just walked
 * across rather than squinted at.
 */

/** A visual that has been given a real screenshot. */
export type ExhibitVisual = CaseVisual & {
  src: string;
  width: number;
  height: number;
};

export function isExhibit(visual: CaseVisual): visual is ExhibitVisual {
  return Boolean(visual.src && visual.width && visual.height);
}

/** Centred on each corner of the plate rather than tucked inside it. */
const CORNERS = [
  "-top-1.5 -left-1.5",
  "-top-1.5 -right-1.5",
  "-bottom-1.5 -left-1.5",
  "-bottom-1.5 -right-1.5",
] as const;

export function ProductExhibit({
  visual,
  accent,
  priority,
  /** Widths the plate is rendered at, for `sizes`. */
  bleed = false,
  className,
}: {
  visual: ExhibitVisual;
  accent: string;
  priority?: boolean;
  bleed?: boolean;
  className?: string;
}) {
  const [family, screen] = visual.rail ?? ["Product", "Screen"];

  return (
    // `isolate` matters: the glow and grid sit at -z-10, and without a stacking
    // context here they fall behind the page's own background and never paint.
    <figure className={cn("relative isolate", className)}>
      <span
        aria-hidden
        className="exhibit-glow pointer-events-none absolute -inset-x-[7%] -inset-y-[14%] -z-10"
      />
      <span
        aria-hidden
        className="exhibit-grid pointer-events-none absolute -inset-x-[5%] -inset-y-[10%] -z-10"
      />

      {/* --- Rail ------------------------------------------------------------
          Identification, not a caption: what the screen is on the left, and the
          plate's own measurements on the right, the way a drawing is stamped. */}
      <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2.5">
        <p className="label text-fg">
          <span style={{ color: accent }}>{family}</span>
          <span className="text-faint"> / </span>
          {screen}
        </p>
        <span className="label shrink-0 text-faint">
          <span className="md:hidden">&#8596; Drag</span>
          <span className="hidden md:inline tabular-nums">
            {visual.width} &times; {visual.height}
          </span>
        </span>
      </div>

      {/* --- Plate ----------------------------------------------------------- */}
      <div className="relative mt-4">
        {CORNERS.map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={cn("exhibit-mark absolute z-10 block size-3", corner)}
          />
        ))}

        <ExhibitPan
          focus={visual.focus}
          className="overflow-x-auto overscroll-x-contain border border-hairline-strong bg-void md:overflow-x-visible"
        >
          <Image
            src={visual.src}
            alt={visual.alt ?? `${screen} — ${family.toLowerCase()} screen`}
            width={visual.width}
            height={visual.height}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            // Product UI is dense; the default quality softens 11px labels
            // enough to read as a blurry screenshot on a large display.
            quality={90}
            sizes={
              bleed
                ? "(min-width: 768px) 100vw, 220vw"
                : "(min-width: 768px) 92vw, 220vw"
            }
            className="h-[clamp(16rem,52svh,26rem)] w-auto max-w-none md:h-auto md:w-full"
          />
        </ExhibitPan>
      </div>

      {visual.caption ? (
        <figcaption className="mt-4 max-w-[62ch] font-mono text-[0.6875rem] leading-[1.7] text-muted">
          {visual.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

import { cn } from "@/lib/utils";

/**
 * The portrait slot, held as a marked placeholder.
 *
 * Presented as an exhibit plate rather than as a grey box: the same mono rail,
 * registration crosshairs and hairline frame the case-study screens use, so an
 * empty slot still reads as part of the drawing set instead of as something
 * missing.
 *
 * To retire it, replace the marked block with a <next/image fill> inside the
 * same frame — the rail, ratio and marks all stay.
 */

const CORNERS = [
  "-top-1.5 -left-1.5",
  "-top-1.5 -right-1.5",
  "-bottom-1.5 -left-1.5",
  "-bottom-1.5 -right-1.5",
] as const;

export function PortraitPlate({ className }: { className?: string }) {
  return (
    <figure className={cn("relative", className)}>
      <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2.5">
        <p className="label text-fg">
          <span className="text-accent">Portrait</span>
          <span className="text-faint"> / </span>
          Pending
        </p>
        <span className="label shrink-0 text-faint tabular-nums">4 : 5</span>
      </div>

      <div className="relative mt-4">
        {CORNERS.map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={cn("exhibit-mark absolute z-10 block size-3", corner)}
          />
        ))}

        <div className="relative aspect-4/5 overflow-hidden border border-hairline-strong">
          <span
            aria-hidden
            className="absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(255 255 255 / 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.045) 1px, transparent 1px)",
              backgroundSize: "clamp(26px, 3.4vw, 40px) clamp(26px, 3.4vw, 40px)",
            }}
          />
          <span className="label absolute bottom-3 left-3 text-faint">
            Replace &rarr; next/image
          </span>
        </div>
      </div>
    </figure>
  );
}

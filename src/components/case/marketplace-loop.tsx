import { Lift } from "@/components/motion/reveal";

/**
 * The marketplace flywheel — the signature visual of this case study.
 *
 * Seven stages arranged on a ring, a single accent traveller orbiting it, and a
 * quiet hub at the centre. It says what the product name only implies: value
 * enters, is discovered, is redeemed, and the act of redeeming gives the partner
 * a reason to create the next offer — so the ring never actually stops. On a
 * narrow viewport the ring would collapse into an unreadable knot, so it becomes
 * a vertical run that closes back on itself instead.
 *
 * Built from the page's own tokens — hairlines, mono labels, the accent — so it
 * reads as another drawing in the set rather than an imported diagram.
 */

type Stage = { label: string; note: string };

/** Percent of the square the ring sits at, measured from centre. */
const RADIUS = 34;

export function MarketplaceLoop({
  hub,
  stages,
  accent,
}: {
  hub: string;
  stages: Stage[];
  accent: string;
}) {
  return (
    <Lift onView className="w-full">
      {/* --- Ring (md and up) --------------------------------------------- */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[30rem] overflow-hidden md:block">
        {/* guide ring */}
        <div className="absolute inset-[16%] rounded-full border border-dashed border-hairline-strong" />

        {/* orbiting traveller */}
        <div className="mll-orbit absolute inset-0" aria-hidden>
          <span
            className="absolute left-1/2 top-[16%] size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 0 4px color-mix(in srgb, ${accent} 20%, transparent)` }}
          />
        </div>

        {/* hub */}
        <div className="absolute left-1/2 top-1/2 grid size-[26%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-hairline text-center">
          <span
            className="absolute inset-2 rounded-full border border-dashed"
            style={{ borderColor: `color-mix(in srgb, ${accent} 40%, transparent)` }}
            aria-hidden
          />
          <span className="label leading-[1.4] text-fg">{hub}</span>
        </div>

        {/* stage nodes */}
        {stages.map((stage, i) => {
          const angle = (-90 + (i * 360) / stages.length) * (Math.PI / 180);
          const left = 50 + RADIUS * Math.cos(angle);
          const top = 50 + RADIUS * Math.sin(angle);
          return (
            <div
              key={stage.label}
              className="absolute w-[7.5rem] -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <span
                className="mx-auto block size-2 rounded-full"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <span className="label mt-2 block px-1 text-fg">{stage.label}</span>
              <span className="label mt-1 block text-faint">{stage.note}</span>
            </div>
          );
        })}
      </div>

      {/* --- Vertical run (below md) -------------------------------------- */}
      <ol className="relative mx-auto max-w-[22rem] md:hidden">
        <span
          aria-hidden
          className="absolute bottom-4 left-[5px] top-3 block w-px bg-hairline-strong"
        />
        {stages.map((stage, i) => (
          <li key={stage.label} className="flex items-start gap-5 border-t border-hairline py-4 first:border-t-0">
            <span
              className="relative mt-1 block size-[11px] shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span className="flex-1">
              <span className="label block text-fg">{stage.label}</span>
              <span className="label mt-1 block text-faint">{stage.note}</span>
            </span>
            <span className="label shrink-0 text-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-5 border-t border-hairline pt-4">
          <span className="grid size-[11px] shrink-0 place-items-center text-faint" aria-hidden>
            &#8635;
          </span>
          <span className="label" style={{ color: accent }}>
            {hub} &mdash; the loop continues
          </span>
        </li>
      </ol>
    </Lift>
  );
}

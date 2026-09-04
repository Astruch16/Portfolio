import { Lift } from "@/components/motion/reveal";

/**
 * The Mintlytics data terminal — the case study's signature visual.
 *
 * Many external signals on the left resolve into one normalized data layer in
 * the middle, which powers the platform's surfaces on the right. It reads like a
 * market-data ingestion board: source rows with status lights, a central layer
 * node, and a grid of feature readouts. Static and restrained — the only motion
 * is a slow breath on the status lights. Collapses to a single column on narrow
 * viewports.
 */

const VIOLET = "#8b5cf6";

type Source = { label: string; note?: string };

function Down() {
  return <span aria-hidden className="mx-auto block h-6 w-px bg-hairline-strong lg:hidden" />;
}

export function DataTerminal({
  hub,
  sources,
  features,
  accent,
}: {
  hub: string;
  sources: Source[];
  features: string[];
  accent: string;
}) {
  return (
    <Lift onView className="w-full">
      <div className="grid items-stretch gap-x-8 gap-y-0 lg:grid-cols-[1fr_auto_1fr]">
        {/* Inbound sources */}
        <div className="rounded-sm border border-hairline p-5">
          <p className="label text-faint">Inbound / sources</p>
          <ul className="mt-4">
            {sources.map((source) => (
              <li
                key={source.label}
                className="flex items-baseline gap-3 border-t border-hairline py-2.5 first:border-t-0"
              >
                <span
                  aria-hidden
                  className="mint-pulse mt-1.5 block size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span className="min-w-0 flex-1">
                  <span className="label block text-fg">{source.label}</span>
                  {source.note ? (
                    <span className="label mt-0.5 block text-faint">{source.note}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Normalized layer */}
        <Down />
        <div className="flex items-center justify-center">
          <div className="relative flex flex-col items-center">
            <span
              aria-hidden
              className="hidden h-10 w-px bg-hairline-strong lg:block"
            />
            <div
              className="rounded-sm border px-4 py-5 text-center"
              style={{ borderColor: `color-mix(in srgb, ${VIOLET} 45%, transparent)` }}
            >
              <span
                aria-hidden
                className="mx-auto mb-2 block size-2 rounded-full"
                style={{ backgroundColor: VIOLET }}
              />
              <span className="label block leading-[1.5] text-fg">{hub}</span>
              <span className="label mt-1 block text-faint">normalize · store</span>
            </div>
            <span
              aria-hidden
              className="hidden h-10 w-px bg-hairline-strong lg:block"
            />
          </div>
        </div>
        <Down />

        {/* Outbound surfaces */}
        <div className="rounded-sm border border-hairline p-5">
          <p className="label text-faint">Outbound / surfaces</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {features.map((feature) => (
              <span
                key={feature}
                className="label rounded-sm border border-hairline px-2.5 py-2 text-center text-muted"
                style={{ borderTopColor: `color-mix(in srgb, ${accent} 40%, transparent)` }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Lift>
  );
}

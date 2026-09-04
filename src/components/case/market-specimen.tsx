import { Lift } from "@/components/motion/reveal";

/**
 * A compact specimen of the Mintlytics visual system, kept inside the case
 * study's editorial language. Four cells — colour, a chart fragment, a ticker
 * label, and card-status tags — as evidence for the "trading terminal that is
 * still unmistakably a Pokémon tool" decision. Deep-navy surfaces, cyan signal,
 * mint gain, amber watch, rose risk, violet accent.
 */

type Swatch = { name: string; value: string };

const CYAN = "#22d3ee";
const MINT = "#34d399";
const AMBER = "#f5b74a";
const ROSE = "#fb7185";
const VIOLET = "#8b5cf6";

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label text-faint">{label}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Tag({ text, tone }: { text: string; tone: string }) {
  return (
    <span
      className="label rounded-sm border px-2 py-1"
      style={{
        color: tone,
        borderColor: `color-mix(in srgb, ${tone} 45%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${tone} 10%, transparent)`,
      }}
    >
      {text}
    </span>
  );
}

export function MarketSpecimen({ swatches }: { swatches: Swatch[] }) {
  return (
    <Lift onView className="border-t border-hairline pt-8">
      <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
        <Cell label="Colour">
          <div className="flex flex-wrap gap-x-5 gap-y-4">
            {swatches.map((swatch) => (
              <div key={swatch.name}>
                <span
                  className="block size-12 rounded-sm border border-hairline"
                  style={{ backgroundColor: swatch.value }}
                  aria-hidden
                />
                <span className="label mt-2 block text-muted">{swatch.name}</span>
                <span className="label mt-0.5 block text-faint tabular-nums">
                  {swatch.value}
                </span>
              </div>
            ))}
          </div>
        </Cell>

        <Cell label="Signal">
          {/* A small chart fragment — a mint price line over a faint grid. */}
          <div className="rounded-sm border border-hairline bg-[#0a0e1a] p-4">
            <svg
              viewBox="0 0 240 72"
              className="h-auto w-full"
              role="img"
              aria-label="A rising price line."
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="mint-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={MINT} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={MINT} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 58 L34 52 L64 56 L96 40 L128 46 L160 26 L196 32 L240 12 L240 72 L0 72 Z"
                fill="url(#mint-area)"
              />
              <path
                d="M0 58 L34 52 L64 56 L96 40 L128 46 L160 26 L196 32 L240 12"
                fill="none"
                stroke={MINT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="240" cy="12" r="3" fill={MINT} />
            </svg>
          </div>
        </Cell>

        <Cell label="Ticker">
          <div className="inline-flex items-center gap-3 rounded-sm border border-hairline bg-[#0a0e1a] px-3.5 py-2.5">
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ backgroundColor: CYAN }}
            />
            <span className="label text-fg">Charizard</span>
            <span className="label text-faint">Base · #4/102</span>
            <span className="label" style={{ color: MINT }}>
              &#9650; 2.4%
            </span>
          </div>
        </Cell>

        <Cell label="Status">
          <div className="flex flex-wrap gap-2">
            <Tag text="UR" tone={VIOLET} />
            <Tag text="PSA 10" tone={CYAN} />
            <Tag text="Grail" tone={AMBER} />
            <Tag text="Below avg" tone={ROSE} />
          </div>
        </Cell>
      </div>
    </Lift>
  );
}

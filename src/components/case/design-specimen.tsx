import { Lift } from "@/components/motion/reveal";

/**
 * A compact specimen of the product's visual system, kept inside the case
 * study's editorial language rather than laid out as a standalone style guide.
 * Four cells — colour, type, surface, action — each a small piece of evidence
 * for the "warm, approachable, not another dark SaaS" decision.
 */

type Swatch = { name: string; value: string };

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label text-faint">{label}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function DesignSpecimen({
  swatches,
  accent,
}: {
  swatches: Swatch[];
  accent: string;
}) {
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

        <Cell label="Type">
          <p className="font-sans text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-none tracking-tight text-fg">
            Local
          </p>
          <p className="mt-3 text-base text-muted">
            A soft serif-adjacent display over a plain interface face, sized for
            people who don&rsquo;t consider themselves technical.
          </p>
          <p className="label mt-3 text-faint">Aa &mdash; UI label / mono</p>
        </Cell>

        <Cell label="Surface">
          {/* A sample KPI block in the product's language: soft, rounded, warm. */}
          <div className="max-w-[15rem] rounded-2xl border border-hairline bg-bg p-5 shadow-[0_1px_2px_rgb(45_74_62/0.05),0_18px_40px_-30px_rgb(45_74_62/0.4)]">
            <span
              className="grid size-9 place-items-center rounded-xl"
              style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
              aria-hidden
            >
              <span className="size-3.5 rounded-[3px]" style={{ backgroundColor: accent }} />
            </span>
            <p className="label mt-4 text-faint">Coupons used</p>
            <p className="mt-1 font-sans text-3xl font-semibold leading-none text-fg">18</p>
          </div>
        </Cell>

        <Cell label="Action">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: accent, color: "var(--surface-bg)" }}
            >
              Become a Local
            </span>
            <span className="inline-flex items-center rounded-full border border-hairline-strong px-5 py-2.5 text-sm font-semibold text-fg">
              Have a key?
            </span>
          </div>
          <p className="label mt-4 text-faint">Large targets / obvious primary</p>
        </Cell>
      </div>
    </Lift>
  );
}

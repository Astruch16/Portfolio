import { Lift } from "@/components/motion/reveal";

/**
 * Two sides, one product.
 *
 * The Local and the Partner run against the same marketplace but share almost
 * nothing — different permissions, different jobs. The two columns mirror each
 * other in structure while carrying different content and a different accent, so
 * the symmetry reads without the two halves looking identical. The strip between
 * them is the marketplace they both meet at. Stacks on narrow viewports.
 */

type Side = {
  /** Two-part mono rail, e.g. ["Local", "Demand"]. */
  tag: [string, string];
  title: string;
  items: string[];
};

/** The partner column takes gold; the local column takes the project accent. */
const GOLD = "#9c7a3c";

function Column({ side, tone }: { side: Side; tone: string }) {
  const [family, role] = side.tag;
  return (
    <div>
      <p className="label text-fg">
        <span style={{ color: tone }}>{family}</span>
        <span className="text-faint"> / </span>
        {role}
      </p>
      <h3 className="display mt-4 text-[clamp(1.15rem,2vw,1.6rem)] leading-[1.15] text-fg">
        {side.title}
      </h3>
      <ul className="mt-5">
        {side.items.map((item, i) => (
          <Lift
            key={item}
            onView
            delay={i * 0.04}
            as="li"
            className="flex items-baseline gap-3 border-t border-hairline py-2.5"
          >
            <span
              className="mt-1.5 block size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: tone }}
              aria-hidden
            />
            <span className="text-base text-muted">{item}</span>
          </Lift>
        ))}
      </ul>
    </div>
  );
}

export function TwoSided({
  sides,
  accent,
}: {
  sides: [Side, Side];
  accent: string;
}) {
  return (
    <div className="grid gap-x-10 gap-y-10 md:grid-cols-[1fr_auto_1fr]">
      <Column side={sides[0]} tone={accent} />

      {/* the marketplace between them */}
      <div className="relative flex items-center justify-center max-md:hidden">
        <span aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-hairline" />
        <span className="label rotate-180 bg-bg px-2 py-3 text-faint [writing-mode:vertical-rl]">
          Marketplace
        </span>
      </div>

      {/* mobile divider between the stacked columns */}
      <div className="h-px w-full bg-hairline md:hidden" aria-hidden />

      <Column side={sides[1]} tone={GOLD} />
    </div>
  );
}

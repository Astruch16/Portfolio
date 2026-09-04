import { Lift } from "@/components/motion/reveal";

/**
 * The stack, grouped by the layer each piece sits in and read as a spec sheet
 * rather than a diagram — the right shape for a data-heavy product whose stack
 * is broad (framework, data, external sources, ops, tooling) and doesn't fork
 * like a two-sided app. Distinct from Expird's vertical pipeline and My Local
 * Loop's forked stack.
 */

type Group = { label: string; items: string[] };

export function TechStack({
  groups,
  accent,
}: {
  groups: Group[];
  accent: string;
}) {
  return (
    <ul className="border-t border-hairline">
      {groups.map((group, i) => (
        <Lift
          key={group.label}
          onView
          delay={i * 0.05}
          as="li"
          className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-hairline py-5 sm:grid-cols-[10rem_1fr]"
        >
          <span
            className="label"
            style={{ color: `color-mix(in srgb, ${accent} 70%, var(--surface-fg))` }}
          >
            {group.label}
          </span>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item}
                className="label rounded-sm border border-hairline px-2.5 py-1.5 text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </Lift>
      ))}
    </ul>
  );
}

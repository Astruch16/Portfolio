import { Lift } from "@/components/motion/reveal";

/**
 * The build, drawn as it actually stacks: two entry points that authenticate
 * through the same layer, one framework, one application layer, and the services
 * and systems that branch off it. Distinct from Expird's single vertical
 * pipeline — this one forks at the top (two users) and the bottom (many
 * systems), which is the whole architectural story of a two-sided product.
 */

type Node = { label: string; note: string };

function Chip({ label, note, accent }: Node & { accent?: string }) {
  return (
    <div className="border border-hairline p-3.5 text-center" style={accent ? { borderTopColor: accent } : undefined}>
      <span className="label block text-fg">{label}</span>
      <span className="label mt-1 block text-faint">{note}</span>
    </div>
  );
}

function Drop() {
  return <span aria-hidden className="mx-auto block h-6 w-px bg-hairline-strong" />;
}

function Caption({ children }: { children: string }) {
  return <p className="label text-center text-faint">{children}</p>;
}

export function StackDiagram({
  entries,
  core,
  infra,
  data,
  systems,
  accent,
}: {
  entries: Node[];
  core: Node[];
  infra: Node[];
  data: Node;
  systems: string[];
  accent: string;
}) {
  return (
    <Lift onView className="w-full">
      <div className="mx-auto max-w-[38rem]">
        {/* two entry points */}
        <div className="grid grid-cols-2 gap-3">
          {entries.map((entry) => (
            <Chip key={entry.label} {...entry} accent={accent} />
          ))}
        </div>
        <Drop />
        <Caption>Authenticate through one layer</Caption>

        {/* shared vertical core */}
        <div className="mt-3">
          {core.map((node, i) => (
            <div key={node.label}>
              {i > 0 ? <Drop /> : null}
              <Chip {...node} />
            </div>
          ))}
        </div>

        <Drop />
        <Caption>Services</Caption>

        {/* branching services */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          {infra.map((node) => (
            <Chip key={node.label} {...node} />
          ))}
        </div>

        <Drop />

        {/* persistence */}
        <Chip {...data} accent={accent} />
      </div>

      {/* systems that live on the application layer */}
      <div className="mt-12 border-t border-hairline pt-6">
        <p className="label text-faint">Systems on the marketplace</p>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {systems.map((system, i) => (
            <Lift
              key={system}
              onView
              delay={i * 0.03}
              className="flex items-baseline gap-3 border-t border-hairline pt-3"
            >
              <span className="label shrink-0" style={{ color: accent }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="label text-muted">{system}</span>
            </Lift>
          ))}
        </div>
      </div>
    </Lift>
  );
}

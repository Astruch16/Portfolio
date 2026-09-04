import { Lift } from "@/components/motion/reveal";

/**
 * The redemption architecture.
 *
 * One platform-controlled identity, presented two ways, validated through My
 * Local Loop rather than through the partner's POS — the whole point of the
 * drawing is that last part. A single source forks into the QR and manual code,
 * the two rejoin, and the chain that follows is the validation the platform owns
 * end to end. Built from tokens and hairline connectors; responsive by stacking.
 */

type Node = { label: string; note?: string };

function Drop() {
  return <span aria-hidden className="mx-auto block h-7 w-px bg-hairline-strong" />;
}

export function RedemptionFlow({
  source,
  branches,
  chain,
  accent,
}: {
  source: Node;
  branches: Node[];
  chain: Node[];
  accent: string;
}) {
  return (
    <Lift onView className="mx-auto w-full max-w-[34rem]">
      {/* source */}
      <div className="border border-hairline-strong p-4 text-center">
        <span
          className="mx-auto mb-2 block size-2 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <span className="label block text-fg">{source.label}</span>
        {source.note ? (
          <span className="label mt-1 block text-faint">{source.note}</span>
        ) : null}
      </div>

      <Drop />

      {/* fork */}
      <p className="label text-center text-faint">Presented as</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {branches.map((branch) => (
          <div
            key={branch.label}
            className="border border-hairline p-4 text-center"
            style={{ borderTopColor: accent }}
          >
            <span className="label block text-fg">{branch.label}</span>
            {branch.note ? (
              <span className="label mt-1 block text-faint">{branch.note}</span>
            ) : null}
          </div>
        ))}
      </div>

      <Drop />

      {/* validation chain, owned by the platform */}
      <div className="border border-hairline-strong p-5">
        <p className="label mb-1 text-faint">Validated through My Local Loop</p>
        <ol className="relative">
          <span
            aria-hidden
            className="absolute bottom-4 left-[5px] top-4 block w-px bg-hairline-strong"
          />
          {chain.map((node, i) => (
            <li
              key={node.label}
              className="flex items-start gap-5 border-t border-hairline py-3.5 first:border-t-0"
            >
              <span
                className="mt-1 block size-[11px] shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <span className="flex-1">
                <span className="label block text-fg">{node.label}</span>
                {node.note ? (
                  <span className="label mt-1 block text-faint">{node.note}</span>
                ) : null}
              </span>
              <span className="label shrink-0 text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Lift>
  );
}

import { cn } from "@/lib/utils";

/**
 * The marked gap where real content will go.
 *
 * It states what belongs there as well as that it is missing, so the page
 * doubles as the brief for filling it in — and so nobody mistakes an empty
 * section for a finished one.
 */
export function Pending({
  prompt,
  className,
}: {
  prompt?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-l border-hairline-strong py-1 pl-5", className)}>
      <p className="label text-faint">[ Content pending ]</p>
      {prompt ? (
        <p className="mt-2 max-w-[52ch] font-mono text-[0.6875rem] leading-[1.7] text-muted">
          {prompt}
        </p>
      ) : null}
    </div>
  );
}

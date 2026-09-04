"use client";

import { Popover } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";

import { Lift } from "@/components/motion/reveal";
import { stackCategories, type SnippetTone, type StackCategory } from "@/data/stack";

/**
 * A compact runtime strip sitting under the role.
 *
 * Three category triggers, each opening a terminal panel listing what is used
 * in that category with a one-line example. The panel borrows the laptop
 * terminal's palette deliberately — same dark ground, same purple keywords and
 * lime values — so the two read as the same environment rather than two
 * unrelated widgets.
 *
 * Built on a *controlled* Radix Popover rather than a HoverCard: hover opens it
 * on a pointer, and because the trigger is still a real button, a tap opens it
 * on touch and Enter opens it from the keyboard — neither of which a hover-only
 * primitive supports.
 */

/** Grace period so the cursor can cross the gap into the panel. */
const CLOSE_DELAY = 200;

const TONE: Record<SnippetTone, string> = {
  plain: "text-muted",
  keyword: "text-accent",
  muted: "text-faint",
  success: "text-signal",
};

function Category({ category }: { category: StackCategory }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const openNow = useCallback(() => {
    cancel();
    setOpen(true);
  }, [cancel]);

  const closeSoon = useCallback(() => {
    cancel();
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      {/* Same two-copy mask the navigation uses: the resting label leaves
          upward as its full-contrast twin arrives. CSS only. */}
      <Popover.Trigger
        className="group relative block cursor-pointer py-1"
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") openNow();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch") closeSoon();
        }}
      >
        <span className="relative block overflow-hidden">
          <span className="label block text-muted transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-full group-data-[state=open]:-translate-y-full">
            {category.label}
          </span>
          <span
            aria-hidden
            className="label absolute inset-0 block translate-y-full text-fg transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-data-[state=open]:translate-y-0"
          >
            {category.label}
          </span>
        </span>
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-px block h-px origin-left scale-x-0 bg-signal transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-data-[state=open]:scale-x-100"
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={10}
          collisionPadding={16}
          data-surface="dark"
          // The panel is read-only, so focus never enters it — and must not be
          // yanked back to the trigger on close either, which would re-fire
          // focus handlers and fight the hover that just dismissed it.
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerEnter={openNow}
          onPointerLeave={closeSoon}
          style={{ transformOrigin: "var(--radix-popover-content-transform-origin)" }}
          className="z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[6px] border border-hairline bg-bg shadow-[0_18px_44px_-14px_rgb(10_8_20/0.5)] data-closed:animate-[panel-out_150ms_var(--ease-out-quart)_both] data-open:animate-[panel-in_260ms_var(--ease-out-expo)_both]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-2.5">
            <span className="label text-muted">{category.path}</span>
            <span className="label flex items-center gap-2 text-faint">
              {category.entries.length} entries
              <span className="block size-1.5 rounded-full bg-signal" />
            </span>
          </div>

          <ul className="flex flex-col gap-4 px-4 py-4">
            {category.entries.map((entry) => (
              <li key={entry.name}>
                {/* The technology is the heading; the snippet is annotation
                    under it, which is why the code sits a tone back. */}
                <p className="font-mono text-[0.75rem] leading-none font-medium tracking-[0.14em] text-fg uppercase">
                  {entry.name}
                </p>
                <div className="mt-2 font-mono text-[0.6875rem] leading-[1.6] whitespace-pre">
                  {entry.lines.map((line, row) => (
                    <p key={row}>
                      {line.map((token, column) => (
                        <span key={column} className={TONE[token.tone ?? "plain"]}>
                          {token.text}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function StackRuntime({ delay }: { delay: number }) {
  return (
    <Lift delay={delay}>
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
        <span className="label text-faint">Stack.Runtime</span>
        {stackCategories.map((category) => (
          <Category key={category.id} category={category} />
        ))}
      </div>
    </Lift>
  );
}

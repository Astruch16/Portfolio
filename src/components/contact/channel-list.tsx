import { ArrowUpRight } from "lucide-react";

import { Lift } from "@/components/motion/reveal";
import { contact } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * The other places the work shows up.
 *
 * One row each: an index, the channel, the handle at reading size, and what
 * that channel is actually good for. A row with an account behind it is a link
 * that washes and steps to the right under the pointer; a row without one stays
 * flat and says so, so the list never offers a dead link — same convention the
 * rest of the site uses for content that doesn't exist yet.
 */

export function ChannelList() {
  return (
    <ol>
      {contact.channels.map((channel, i) => {
        const live = Boolean(channel.href);
        const body = (
          <>
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-0 left-[-1rem] w-[calc(100%+2rem)] origin-left scale-x-0 bg-ink/[0.04] transition-transform duration-500 ease-[var(--ease-out-expo)]",
                live && "group-hover/ch:scale-x-100",
              )}
            />
            <span
              className={cn(
                "label relative text-faint transition-colors",
                live && "group-hover/ch:text-accent",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <span className="relative min-w-0">
              <span className="label block text-faint">{channel.label}</span>
              <span
                className={cn(
                  "mt-2 block truncate font-mono text-[clamp(1rem,1.6vw,1.25rem)] tracking-[0.01em] transition-transform duration-500 ease-[var(--ease-out-expo)]",
                  live ? "text-fg group-hover/ch:translate-x-1" : "text-faint",
                )}
              >
                {channel.handle ?? (
                  <span className="label" title="Awaiting a confirmed account">
                    [ handle pending ]
                  </span>
                )}
              </span>
              <span className="label mt-2.5 block text-muted">{channel.note}</span>
            </span>

            {live ? (
              <span className="relative grid size-10 shrink-0 place-items-center self-center rounded-full border border-hairline transition-colors duration-300 group-hover/ch:border-accent">
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-4 text-muted transition-all duration-300 ease-[var(--ease-out-expo)] group-hover/ch:-translate-y-0.5 group-hover/ch:translate-x-0.5 group-hover/ch:text-fg"
                />
              </span>
            ) : (
              <span className="label self-center rounded-full border border-dashed border-hairline px-3 py-1.5 text-faint">
                Not yet
              </span>
            )}
          </>
        );

        return (
          <Lift
            key={channel.label}
            onView
            delay={0.06 + i * 0.06}
            as="li"
            className="border-t border-hairline last:border-b"
          >
            {live ? (
              <a
                href={channel.href!}
                target="_blank"
                rel="noreferrer"
                className="group/ch relative grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-4 py-6"
              >
                {body}
              </a>
            ) : (
              <div className="group/ch relative grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-4 py-6">
                {body}
              </div>
            )}
          </Lift>
        );
      })}
    </ol>
  );
}

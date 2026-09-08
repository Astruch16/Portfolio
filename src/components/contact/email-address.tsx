"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * The primary channel, and the only element on the page with real weight.
 *
 * Two affordances, because the two things a reader does with an address are
 * different jobs: the address itself opens a composer, and the button beside it
 * copies — for anyone who lives in a webmail tab and would get an empty desktop
 * client instead.
 *
 * Copy failure is real (an insecure origin, a browser that refuses without a
 * user gesture it recognises), so the button reports what actually happened
 * rather than optimistically claiming success.
 */
export function EmailAddress({
  email,
  subject,
}: {
  email: string;
  subject: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), 2400);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
        className="group relative block"
      >
        <span className="display block text-[clamp(1.5rem,4.6vw,3.25rem)] leading-[1.05] break-all text-fg lowercase">
          {email}
        </span>
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
        />
      </a>

      <button
        type="button"
        onClick={copy}
        className="label inline-flex shrink-0 items-center gap-2.5 border border-hairline-strong px-4 py-2.5 text-muted transition-colors hover:text-fg"
      >
        {state === "copied" ? (
          <Check aria-hidden strokeWidth={1.5} className="size-3.5 text-signal" />
        ) : (
          <Copy aria-hidden strokeWidth={1.5} className="size-3.5" />
        )}
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
      </button>

      {/* The button's label already changes, but a sighted-only change is not a
          change at all for anyone listening to the page. */}
      <span aria-live="polite" className="sr-only">
        {state === "copied"
          ? "Email address copied to clipboard"
          : state === "failed"
            ? "Could not copy — select the address manually"
            : ""}
      </span>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { terminalSession } from "@/lib/terminal-session";

/**
 * The prompt that drives the laptop.
 *
 * A real input, so it works with a keyboard, a screen reader and a phone's
 * on-screen keyboard; the laptop in the scene is only its display. What's typed
 * shows on the laptop as it's typed, and Enter runs it there.
 *
 * `/` focuses it from anywhere on the page (except while typing in another
 * field), and so does clicking the laptop. The quick commands underneath are
 * for anyone who would rather not type — each one runs exactly as if typed.
 *
 * Commands that go somewhere print where they're going first, and navigate a
 * beat later, so the visitor sees the laptop answer before the page changes.
 */

const QUICK = ["help", "work", "stack", "about", "contact"] as const;
const NAVIGATE_AFTER_MS = 700;

export function HeroConsole() {
  const session = useSyncExternalStore(
    terminalSession.subscribe,
    terminalSession.getSnapshot,
    terminalSession.getServerSnapshot,
  );
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Focus requests come from outside — the laptop in the scene.
  useEffect(() => {
    if (session.focusTick > 0) input.current?.focus({ preventScroll: true });
  }, [session.focusTick]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      input.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(pending.current);
    };
  }, []);

  const run = () => {
    const route = terminalSession.run();
    if (route) {
      clearTimeout(pending.current);
      pending.current = setTimeout(() => router.push(route), NAVIGATE_AFTER_MS);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <label className="group/prompt flex items-center gap-2.5 border-b border-hairline-strong pb-1.5 transition-colors focus-within:border-accent">
        <span aria-hidden className="font-mono text-[0.875rem] text-accent">
          &gt;
        </span>
        <span className="sr-only">Terminal command</span>
        <input
          ref={input}
          value={session.input}
          onFocus={() => terminalSession.activate()}
          onChange={(event) => terminalSession.setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              run();
            } else if (event.key === "Escape") {
              input.current?.blur();
            }
          }}
          placeholder="type a command"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          enterKeyHint="go"
          className="w-[17ch] bg-transparent font-mono text-[0.875rem] tracking-[0.04em] text-fg caret-accent outline-none placeholder:text-faint"
        />
        <kbd
          aria-hidden
          className="hidden border border-hairline-strong px-1.5 py-px font-mono text-[0.625rem] text-faint transition-opacity group-focus-within/prompt:opacity-0 [@media(hover:hover)]:inline"
        >
          /
        </kbd>
      </label>

      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((command) => (
          <button
            key={command}
            type="button"
            onClick={() => {
              terminalSession.setInput(command);
              run();
            }}
            className="border border-hairline px-2 py-1 font-mono text-[0.6875rem] tracking-[0.06em] text-muted transition-colors hover:border-accent hover:text-fg"
          >
            {command}
          </button>
        ))}
      </div>

      {/* The laptop is a picture; this is what a screen reader hears. */}
      <p aria-live="polite" className="sr-only">
        {session.announcement}
      </p>
    </div>
  );
}
